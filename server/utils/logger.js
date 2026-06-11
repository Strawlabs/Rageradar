/**
 * Production Logger Configuration
 * Uses Winston for structured logging with daily rotation
 */

const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

// Define log levels
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

// Define colors for each level
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
};

winston.addColors(colors);

// Determine log level based on environment
const level = () => {
    const env = process.env.NODE_ENV || 'development';
    const isDevelopment = env === 'development';
    return isDevelopment ? 'debug' : 'info';
};

// Custom format for console output (development)
const consoleFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.colorize({ all: true }),
    winston.format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}`
    )
);

// Custom format for file output (production)
const fileFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json(),
    // Redact sensitive information
    winston.format((info) => {
        const sanitized = { ...info };

        // Redact common sensitive patterns
        if (sanitized.message && typeof sanitized.message === 'string') {
            sanitized.message = sanitized.message
                .replace(/(api[_-]?key|token|password|secret|authorization)(["\']?\s*[:=]\s*["\']?)([^\s"',}]+)/gi, '$1$2[REDACTED]')
                .replace(/Bearer\s+[A-Za-z0-9\-._~+/]+=*/g, 'Bearer [REDACTED]')
                .replace(/sk_live_[A-Za-z0-9]+/g, 'sk_live_[REDACTED]')
                .replace(/sk_test_[A-Za-z0-9]+/g, 'sk_test_[REDACTED]');
        }

        return sanitized;
    })()
);

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');

// Daily rotate file transport for errors
const errorFileRotateTransport = new DailyRotateFile({
    filename: path.join(logsDir, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    maxSize: '20m',
    maxFiles: '14d', // Keep logs for 14 days
    format: fileFormat,
});

// Daily rotate file transport for all logs
const combinedFileRotateTransport = new DailyRotateFile({
    filename: path.join(logsDir, 'combined-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '14d',
    format: fileFormat,
});

// Daily rotate file transport for HTTP requests
const httpFileRotateTransport = new DailyRotateFile({
    filename: path.join(logsDir, 'http-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'http',
    maxSize: '20m',
    maxFiles: '7d', // Keep HTTP logs for 7 days
    format: fileFormat,
});

// Create the logger
const logger = winston.createLogger({
    level: level(),
    levels,
    transports: [
        // Console transport for development
        new winston.transports.Console({
            format: consoleFormat,
        }),
        // File transports for production
        errorFileRotateTransport,
        combinedFileRotateTransport,
        httpFileRotateTransport,
    ],
    // Handle exceptions and rejections
    exceptionHandlers: [
        new DailyRotateFile({
            filename: path.join(logsDir, 'exceptions-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            maxSize: '20m',
            maxFiles: '14d',
            format: fileFormat,
        }),
    ],
    rejectionHandlers: [
        new DailyRotateFile({
            filename: path.join(logsDir, 'rejections-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            maxSize: '20m',
            maxFiles: '14d',
            format: fileFormat,
        }),
    ],
});

// Create a stream object for Morgan HTTP logger
logger.stream = {
    write: (message) => {
        logger.http(message.trim());
    },
};

// Helper methods for common logging patterns
logger.logRequest = (req, res, duration) => {
    logger.http('HTTP Request', {
        method: req.method,
        url: req.url,
        status: res.statusCode,
        duration: `${duration}ms`,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        userId: req.user?.uid || 'anonymous',
    });
};

logger.logError = (error, context = {}) => {
    logger.error('Error occurred', {
        message: error.message,
        stack: error.stack,
        ...context,
    });
};

logger.logSecurity = (event, userId, details = {}) => {
    logger.warn('Security Event', {
        event,
        userId: userId || 'anonymous',
        timestamp: new Date().toISOString(),
        ...details,
    });
};

logger.logAnalysis = (brandName, userId, result) => {
    logger.info('Brand Analysis', {
        brandName,
        userId,
        totalMentions: result.totalMentions,
        positivePercentage: result.positivePercentage,
        negativePercentage: result.negativePercentage,
        rageIndex: result.rageIndex,
        timestamp: new Date().toISOString(),
    });
};

logger.logPayment = (event, userId, details = {}) => {
    logger.info('Payment Event', {
        event,
        userId,
        ...details,
        timestamp: new Date().toISOString(),
    });
};

// In production, suppress console.log but keep logger
if (process.env.NODE_ENV === 'production') {
    console.log = (...args) => logger.info(args.join(' '));
    console.error = (...args) => logger.error(args.join(' '));
    console.warn = (...args) => logger.warn(args.join(' '));
}

module.exports = logger;
