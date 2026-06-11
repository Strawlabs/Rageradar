# 📊 Monitoring & Logging Setup Guide

## Overview

RageRadar now includes production-grade monitoring and logging infrastructure for visibility into application health and debugging.

## Components

### 1. Structured Logging (Winston)

**Server-side logging** with daily log rotation and sensitive data redaction.

#### Features
- **Daily Log Rotation:** Logs rotate daily, keeping 14 days of history
- **Multiple Log Levels:** error, warn, info, http, debug
- **Sensitive Data Redaction:** Automatically redacts API keys, tokens, passwords
- **Structured JSON Format:** Easy to parse and analyze
- **Separate Log Files:**
  - `error-YYYY-MM-DD.log` - Error logs only
  - `combined-YYYY-MM-DD.log` - All logs
  - `http-YYYY-MM-DD.log` - HTTP request logs
  - `exceptions-YYYY-MM-DD.log` - Uncaught exceptions
  - `rejections-YYYY-MM-DD.log` - Unhandled promise rejections

#### Log Location
```
server/logs/
├── error-2025-11-24.log
├── combined-2025-11-24.log
├── http-2025-11-24.log
├── exceptions-2025-11-24.log
└── rejections-2025-11-24.log
```

#### Usage in Code
```javascript
const logger = require('./utils/logger');

// Basic logging
logger.info('User logged in', { userId: '123' });
logger.error('Payment failed', { error: err.message });
logger.warn('API quota low', { remaining: 10 });

// Helper methods
logger.logRequest(req, res, duration);
logger.logError(error, { context: 'payment' });
logger.logSecurity('failed_login', userId, { ip: req.ip });
logger.logAnalysis(brandName, userId, result);
logger.logPayment('subscription_created', userId, { plan: 'pro' });
```

### 2. Error Tracking (Sentry)

**Real-time error monitoring** for both server and client applications.

#### Server Configuration
- **Location:** `server/utils/sentry.js`
- **Features:**
  - Automatic error capture
  - Performance monitoring
  - Request tracing
  - Sensitive data filtering
  - User context tracking

#### Client Configuration
- **Location:** `client/src/utils/sentry.js`
- **Features:**
  - Browser error tracking
  - React error boundaries
  - Performance monitoring
  - Route change tracking
  - User session replay (optional)

#### Setup Sentry

1. **Create Sentry Account**
   ```bash
   # Go to https://sentry.io and create account
   # Create new project for Node.js (server)
   # Create new project for React (client)
   ```

2. **Get DSN Keys**
   - Server DSN: Settings → Projects → Your Server Project → Client Keys
   - Client DSN: Settings → Projects → Your Client Project → Client Keys

3. **Add to Environment Variables**
   ```bash
   # server/.env
   SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
   
   # client/.env
   REACT_APP_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
   ```

4. **Test Error Tracking**
   ```javascript
   // Server
   const { captureException } = require('./utils/sentry');
   captureException(new Error('Test error'));
   
   // Client
   import { captureException } from './utils/sentry';
   captureException(new Error('Test error'));
   ```

### 3. Request Logging

**HTTP request/response logging** with timing and user context.

#### Features
- Request method, URL, status code
- Response time in milliseconds
- User ID (if authenticated)
- IP address and user agent
- Content length
- Automatic log level based on status code:
  - 2xx: `http` level
  - 3xx: `info` level
  - 4xx: `warn` level
  - 5xx: `error` level

#### Example Log Output
```json
{
  "level": "http",
  "message": "HTTP Request - Success",
  "method": "POST",
  "url": "/api/analyze",
  "status": 200,
  "duration": "1234ms",
  "ip": "192.168.1.1",
  "userAgent": "Mozilla/5.0...",
  "userId": "abc123",
  "timestamp": "2025-11-24T15:30:00.000Z"
}
```

## Monitoring Setup

### 1. UptimeRobot (Uptime Monitoring)

**Free service** to monitor if your application is online.

#### Setup Steps
1. Go to https://uptimerobot.com
2. Create free account
3. Add new monitor:
   - **Type:** HTTP(s)
   - **URL:** `https://yourdomain.com/api/health`
   - **Interval:** 5 minutes
   - **Alert Contacts:** Your email

4. Add alerts:
   - Email notification when down
   - Email notification when back up

### 2. API Quota Monitoring

Monitor Google Custom Search API usage to avoid hitting limits.

#### Manual Monitoring
1. Go to Google Cloud Console
2. Navigate to APIs & Services → Dashboard
3. Click on Custom Search API
4. View quota usage

#### Automated Alerts (Recommended)
```javascript
// Add to server/utils/apiQuotaMonitor.js
const logger = require('./logger');

let dailyQuotaUsed = 0;
const DAILY_QUOTA_LIMIT = 10000; // Adjust based on your plan
const WARNING_THRESHOLD = 0.8; // 80%

function trackApiCall() {
  dailyQuotaUsed++;
  
  const percentageUsed = dailyQuotaUsed / DAILY_QUOTA_LIMIT;
  
  if (percentageUsed >= WARNING_THRESHOLD) {
    logger.warn('API Quota Warning', {
      used: dailyQuotaUsed,
      limit: DAILY_QUOTA_LIMIT,
      percentage: `${(percentageUsed * 100).toFixed(1)}%`
    });
  }
}

// Reset daily at midnight
setInterval(() => {
  dailyQuotaUsed = 0;
  logger.info('API quota counter reset');
}, 24 * 60 * 60 * 1000);
```

### 3. Log Aggregation (Optional)

For production, consider using a log aggregation service:

#### Logtail (Recommended)
- **Cost:** Free tier available
- **Features:** Real-time log viewing, search, alerts
- **Setup:**
  ```bash
  npm install winston-logtail
  ```
  
  ```javascript
  // Add to logger.js
  const { Logtail } = require('@logtail/node');
  const { LogtailTransport } = require('@logtail/winston');
  
  const logtail = new Logtail(process.env.LOGTAIL_TOKEN);
  
  logger.add(new LogtailTransport(logtail));
  ```

#### Papertrail
- **Cost:** Free tier: 50MB/month
- **Features:** Live tail, search, alerts
- **Setup:** Similar to Logtail

## Dashboard & Alerts

### Sentry Dashboard

Access at https://sentry.io/organizations/your-org/issues/

**Key Metrics:**
- Error frequency
- Affected users
- Error trends
- Performance metrics
- Release tracking

### Alert Configuration

#### Sentry Alerts
1. Go to Alerts → Create Alert Rule
2. Configure conditions:
   - Error count > 10 in 1 hour
   - New error type detected
   - Performance degradation

#### Email Alerts
- UptimeRobot: Downtime notifications
- Sentry: Error spikes
- Google Cloud: API quota warnings

## Log Analysis

### Viewing Logs Locally

```bash
# View latest logs
tail -f server/logs/combined-$(date +%Y-%m-%d).log

# View errors only
tail -f server/logs/error-$(date +%Y-%m-%d).log

# Search logs
grep "payment" server/logs/combined-*.log

# View HTTP requests
tail -f server/logs/http-$(date +%Y-%m-d).log
```

### Log Queries

```bash
# Find all errors for a specific user
grep "userId.*abc123" server/logs/error-*.log

# Find slow requests (>2 seconds)
grep "duration.*[2-9][0-9][0-9][0-9]ms" server/logs/http-*.log

# Find failed payments
grep "payment.*failed" server/logs/combined-*.log
```

## Best Practices

### 1. Log Levels
- **error:** Errors that need immediate attention
- **warn:** Warning conditions (API quota low, deprecated features)
- **info:** General informational messages (user actions, system events)
- **http:** HTTP request/response logs
- **debug:** Detailed debugging information (development only)

### 2. Sensitive Data
Never log:
- Passwords
- API keys
- Credit card numbers
- Personal identification numbers
- Authentication tokens

The logger automatically redacts common patterns, but be careful with custom logging.

### 3. Performance
- Use appropriate log levels (avoid debug in production)
- Don't log inside tight loops
- Use async logging for high-traffic endpoints
- Rotate logs to prevent disk space issues

### 4. Error Context
Always include context when logging errors:
```javascript
logger.error('Payment processing failed', {
  userId: user.id,
  amount: payment.amount,
  paymentMethod: payment.method,
  error: error.message,
  stack: error.stack
});
```

## Troubleshooting

### Logs Not Appearing
```bash
# Check if logs directory exists
ls -la server/logs/

# Check file permissions
chmod 755 server/logs/

# Check logger configuration
node -e "require('./server/utils/logger').info('test')"
```

### Sentry Not Capturing Errors
```bash
# Verify DSN is set
echo $SENTRY_DSN

# Test Sentry connection
node -e "require('./server/utils/sentry').captureMessage('test')"

# Check Sentry dashboard for events
```

### High Log Volume
```bash
# Check log file sizes
du -sh server/logs/*

# Adjust rotation settings in logger.js
# Reduce maxFiles or maxSize
```

## Cost Optimization

### Free Tier Limits
- **Sentry:** 5,000 events/month
- **UptimeRobot:** 50 monitors, 5-minute intervals
- **Logtail:** 1GB/month
- **Papertrail:** 50MB/month

### Recommendations
1. Start with free tiers
2. Monitor usage in first month
3. Upgrade only if needed
4. Use sampling for high-traffic apps (already configured)

## Next Steps

1. ✅ Set up Sentry account and add DSN to environment variables
2. ✅ Configure UptimeRobot for uptime monitoring
3. ✅ Test error tracking with sample errors
4. ✅ Review logs daily for first week
5. ✅ Set up alerts for critical errors
6. ✅ Consider log aggregation service for production

## Support

- **Sentry Docs:** https://docs.sentry.io/
- **Winston Docs:** https://github.com/winstonjs/winston
- **UptimeRobot:** https://uptimerobot.com/help

---

**Your application now has production-grade monitoring! 🎉**
