/**
 * HTTP Request Logging Middleware
 * Logs all HTTP requests with timing and user information
 */

const logger = require('../utils/logger');

/**
 * Request logging middleware
 * Logs request details and response time
 */
function requestLogger(req, res, next) {
    const startTime = Date.now();

    // Log when response finishes
    res.on('finish', () => {
        const duration = Date.now() - startTime;

        const logData = {
            method: req.method,
            url: req.originalUrl || req.url,
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip || req.connection.remoteAddress,
            userAgent: req.get('user-agent'),
            userId: req.user?.uid || 'anonymous',
            contentLength: res.get('content-length') || 0,
        };

        // Log at different levels based on status code
        if (res.statusCode >= 500) {
            logger.error('HTTP Request - Server Error', logData);
        } else if (res.statusCode >= 400) {
            logger.warn('HTTP Request - Client Error', logData);
        } else if (res.statusCode >= 300) {
            logger.info('HTTP Request - Redirect', logData);
        } else {
            logger.http('HTTP Request - Success', logData);
        }
    });

    next();
}

/**
 * Error logging middleware
 * Logs errors with full context
 */
function errorLogger(err, req, res, next) {
    logger.error('Unhandled Error', {
        error: {
            message: err.message,
            stack: err.stack,
            name: err.name,
        },
        request: {
            method: req.method,
            url: req.originalUrl || req.url,
            headers: {
                'user-agent': req.get('user-agent'),
                'content-type': req.get('content-type'),
            },
            body: req.body,
            params: req.params,
            query: req.query,
        },
        user: req.user?.uid || 'anonymous',
        ip: req.ip || req.connection.remoteAddress,
    });

    next(err);
}

module.exports = {
    requestLogger,
    errorLogger,
};
