const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const { body, validationResult } = require('express-validator');
const winston = require('winston');
const crypto = require('crypto');
const { supabase } = require('../supabase');

// Secure logger configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.printf(info => {
      // Redact sensitive information
      const sanitized = { ...info };
      if (sanitized.message) {
        sanitized.message = sanitized.message.replace(
          /(api[_-]?key|token|password|secret)([\"']?\\s*[:=]\\s*[\"']?)([^\\s\"',}]+)/gi,
          '$1$2[REDACTED]'
        );
      }
      return JSON.stringify(sanitized);
    })
  ),
  transports: [
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 5242880,
      maxFiles: 10
    })
  ]
});

// Security event logging
function logSecurityEvent(event, userId, details = {}) {
  logger.warn('SECURITY_EVENT', {
    event,
    userId: userId ? crypto.createHash('sha256').update(userId).digest('hex').substring(0, 16) : null,
    timestamp: new Date().toISOString(),
    ip: details.ip,
    userAgent: details.userAgent,
    details: details.sanitizedDetails
  });
}

// Suspicious activity detection
const suspiciousActivity = new Map();

async function detectSuspiciousActivity(userId, ip) {
  const key = `${userId}-${ip}`;
  const now = Date.now();
  const activity = suspiciousActivity.get(key) || { requests: [], failedLogins: 0 };
  
  // Clean old requests (older than 1 hour)
  activity.requests = activity.requests.filter(time => now - time < 3600000);
  
  // Check for too many requests
  if (activity.requests.length > 100) {
    return true;
  }
  
  // Check for too many failed logins
  if (activity.failedLogins > 5) {
    return true;
  }
  
  activity.requests.push(now);
  suspiciousActivity.set(key, activity);
  
  return false;
}

// Security middleware setup
const setupSecurityMiddleware = (app) => {
  // Helmet for security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'"],
        connectSrc: [
          "'self'", 
          "https://api.huggingface.co",
          "https://www.googleapis.com",
          "https://accounts.google.com",
          "https://slack.com",
          "https://twitter.com"
        ]
      }
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    },
    crossOriginEmbedderPolicy: false // Allow embedding for OAuth popups
  }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: 15 * 60 // seconds
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logSecurityEvent('RATE_LIMIT_EXCEEDED', null, {
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });
      res.status(429).json({
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: 15 * 60
      });
    }
  });

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5, // limit each IP to 5 auth requests per windowMs
    skipSuccessfulRequests: true,
    handler: (req, res) => {
      logSecurityEvent('AUTH_RATE_LIMIT_EXCEEDED', null, {
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });
      res.status(429).json({
        error: 'Too many authentication attempts, please try again later.',
        retryAfter: 15 * 60
      });
    }
  });

  app.use('/api/', limiter);
  app.use('/api/auth', authLimiter);

  // Input sanitization


  // Request logging
  app.use((req, res, next) => {
    logger.info('REQUEST', {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      timestamp: new Date().toISOString()
    });
    next();
  });
};

// Enhanced authentication middleware with security logging
const authenticateUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const clientIP = req.ip || req.connection.remoteAddress;
    
    if (!token) {
      logSecurityEvent('AUTH_MISSING_TOKEN', null, { ip: clientIP });
      return res.status(401).json({ error: 'No token provided' });
    }

    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
      throw new Error('Invalid token');
    }

    const decodedToken = {
      uid: data.user.id,
      email: data.user.email,
      role: data.user.role || 'user',
      ...data.user
    };
    
    // Check for suspicious activity
    if (await detectSuspiciousActivity(decodedToken.uid, clientIP)) {
      logSecurityEvent('SUSPICIOUS_ACTIVITY', decodedToken.uid, { ip: clientIP });
      return res.status(403).json({ error: 'Account temporarily restricted due to suspicious activity' });
    }
    
    // Get user plan info
    const { data: userRow } = await supabase
      .from('users')
      .select('*')
      .eq('id', decodedToken.uid)
      .single();

    req.userPlan = userRow ? {
      plan: userRow.plan,
      maxBrands: userRow.max_brands,
      brandsUsed: userRow.brands_used,
      role: userRow.role,
      ...userRow
    } : null;
    
    // Check if user is admin
    if (decodedToken.admin || decodedToken.role === 'admin' || (req.userPlan && req.userPlan.role === 'admin')) {
      req.user = { ...decodedToken, isAdmin: true, unlimited: true };
      req.userPlan = { ...req.userPlan, unlimited: true, maxBrands: -1, maxAnalyses: -1 };
    } else {
      req.user = decodedToken;
    }
    
    req.clientIP = clientIP;
    
    // Log successful authentication
    logger.info('AUTH_SUCCESS', {
      userId: crypto.createHash('sha256').update(decodedToken.uid).digest('hex').substring(0, 16),
      ip: clientIP,
      userAgent: req.headers['user-agent']
    });
    
    next();
  } catch (error) {
    const clientIP = req.ip || req.connection.remoteAddress;
    
    // Track failed login attempts
    if (req.headers.authorization) {
      const key = `failed-${clientIP}`;
      const activity = suspiciousActivity.get(key) || { failedLogins: 0, lastAttempt: 0 };
      activity.failedLogins++;
      activity.lastAttempt = Date.now();
      suspiciousActivity.set(key, activity);
    }
    
    logSecurityEvent('AUTH_FAILED', null, { 
      ip: clientIP,
      error: error.message,
      userAgent: req.headers['user-agent']
    });
    
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Input validation middleware
const validateBrandAnalysis = [
  body('brandName')
    .isLength({ min: 1, max: 100 })
    .matches(/^[a-zA-Z0-9\s\-\.\_\@\:]+$/)
    .withMessage('Invalid brand name format')
    .customSanitizer(value => {
      // Additional sanitization
      return value.trim().replace(/[<>"']/g, '');
    }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logSecurityEvent('INVALID_INPUT', req.user?.uid, {
        ip: req.clientIP,
        errors: errors.array(),
        input: req.body
      });
      return res.status(400).json({ 
        error: 'Invalid input data',
        details: errors.array()
      });
    }
    next();
  }
];

// Role-based access control
class AccessControl {
  constructor() {
    this.roles = {
      super_admin: {
        permissions: ['*'] // All permissions
      },
      admin: {
        permissions: [
          'read:own_data', 'create:analysis', 'update:own_profile', 'read:own_analyses',
          'read:all_users', 'update:user_role', 'update:user_plan',
          'read:audit_logs', 'manage:blog',
          'export:csv', 'export:pdf',
          'api:access'
        ]
      },
      enterprise_user: {
        permissions: [
          'read:own_data', 'create:analysis', 'update:own_profile', 'read:own_analyses',
          'api:access', 'export:all_formats', 'create:team',
          'export:csv', 'export:pdf', 'export:json', 'export:xlsx'
        ]
      },
      user: {
        permissions: ['read:own_data', 'create:analysis', 'update:own_profile', 'read:own_analyses']
      }
    };
  }

  hasPermission(userRole, permission) {
    const role = this.roles[userRole];
    if (!role) return false;
    
    return role.permissions.includes('*') || role.permissions.includes(permission);
  }

  requirePermission(permission) {
    return (req, res, next) => {
      const userRole = req.userPlan?.role || 'user';
      
      if (!this.hasPermission(userRole, permission)) {
        logSecurityEvent('ACCESS_DENIED', req.user?.uid, {
          permission,
          userRole,
          ip: req.clientIP,
          endpoint: req.originalUrl
        });
        
        return res.status(403).json({
          error: 'Insufficient permissions',
          code: 'PERMISSION_DENIED'
        });
      }
      
      next();
    };
  }

  /**
   * Convenience: require one of the specified roles (delegates to roleGuard for full logic).
   */
  requireRole(...allowedRoles) {
    return (req, res, next) => {
      const userRole = req.userPlan?.role || 'user';
      if (!allowedRoles.includes(userRole)) {
        logSecurityEvent('ACCESS_DENIED', req.user?.uid, {
          requiredRoles: allowedRoles,
          userRole,
          ip: req.clientIP,
          endpoint: req.originalUrl
        });
        return res.status(403).json({
          error: 'Insufficient permissions',
          code: 'ROLE_ACCESS_DENIED'
        });
      }
      next();
    };
  }
}

const accessControl = new AccessControl();

module.exports = {
  setupSecurityMiddleware,
  authenticateUser,
  validateBrandAnalysis,
  accessControl,
  logSecurityEvent,
  logger
};