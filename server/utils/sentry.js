/**
 * Sentry Error Tracking Configuration
 * Captures and reports errors to Sentry for monitoring
 */

const Sentry = require('@sentry/node');

/**
 * Initialize Sentry for error tracking
 * @param {Express} app - Express application instance
 */
function initSentry(app) {
    const dsn = process.env.SENTRY_DSN;

    // Only initialize if DSN is provided
    if (!dsn) {
        console.warn('⚠️  SENTRY_DSN not configured. Error tracking disabled.');
        return;
    }

    Sentry.init({
        dsn,
        environment: process.env.NODE_ENV || 'development',

        // Set sample rate for performance monitoring
        tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

        // Enable performance monitoring
        integrations: [
            // HTTP integration for tracing
            new Sentry.Integrations.Http({ tracing: true }),
            // Express integration
            new Sentry.Integrations.Express({ app }),
        ],

        // Filter out sensitive data
        beforeSend(event, hint) {
            // Remove sensitive headers
            if (event.request?.headers) {
                delete event.request.headers.authorization;
                delete event.request.headers.cookie;
            }

            // Redact sensitive data from breadcrumbs
            if (event.breadcrumbs) {
                event.breadcrumbs = event.breadcrumbs.map(breadcrumb => {
                    if (breadcrumb.data) {
                        const sanitized = { ...breadcrumb.data };

                        // Remove common sensitive fields
                        ['password', 'token', 'apiKey', 'secret', 'authorization'].forEach(field => {
                            if (sanitized[field]) {
                                sanitized[field] = '[REDACTED]';
                            }
                        });

                        breadcrumb.data = sanitized;
                    }
                    return breadcrumb;
                });
            }

            return event;
        },

        // Ignore certain errors
        ignoreErrors: [
            // Browser errors that shouldn't be tracked
            'ResizeObserver loop limit exceeded',
            'Non-Error promise rejection captured',
            // Network errors
            'NetworkError',
            'Network request failed',
            // Expected errors
            'Invalid token',
            'No token provided',
        ],
    });

    console.log('✅ Sentry error tracking initialized');
}

/**
 * Get Sentry request handler middleware
 * Must be used before any other middleware
 */
function getSentryRequestHandler() {
    if (!process.env.SENTRY_DSN) {
        return (req, res, next) => next();
    }
    return Sentry.Handlers.requestHandler();
}

/**
 * Get Sentry tracing handler middleware
 * Must be used before any other middleware
 */
function getSentryTracingHandler() {
    if (!process.env.SENTRY_DSN) {
        return (req, res, next) => next();
    }
    return Sentry.Handlers.tracingHandler();
}

/**
 * Get Sentry error handler middleware
 * Must be used after all routes and before other error handlers
 */
function getSentryErrorHandler() {
    if (!process.env.SENTRY_DSN) {
        return (err, req, res, next) => next(err);
    }
    return Sentry.Handlers.errorHandler({
        shouldHandleError(error) {
            // Capture all errors with status code >= 500
            if (error.status >= 500) {
                return true;
            }
            // Also capture specific error types
            return error.name === 'UnhandledPromiseRejection';
        },
    });
}

/**
 * Manually capture an exception
 * @param {Error} error - Error to capture
 * @param {Object} context - Additional context
 */
function captureException(error, context = {}) {
    if (process.env.SENTRY_DSN) {
        Sentry.captureException(error, {
            extra: context,
        });
    }
}

/**
 * Manually capture a message
 * @param {string} message - Message to capture
 * @param {string} level - Severity level (fatal, error, warning, info, debug)
 * @param {Object} context - Additional context
 */
function captureMessage(message, level = 'info', context = {}) {
    if (process.env.SENTRY_DSN) {
        Sentry.captureMessage(message, {
            level,
            extra: context,
        });
    }
}

/**
 * Set user context for error tracking
 * @param {Object} user - User information
 */
function setUser(user) {
    if (process.env.SENTRY_DSN && user) {
        Sentry.setUser({
            id: user.uid,
            email: user.email,
            username: user.displayName,
        });
    }
}

/**
 * Clear user context
 */
function clearUser() {
    if (process.env.SENTRY_DSN) {
        Sentry.setUser(null);
    }
}

/**
 * Add breadcrumb for tracking user actions
 * @param {Object} breadcrumb - Breadcrumb data
 */
function addBreadcrumb(breadcrumb) {
    if (process.env.SENTRY_DSN) {
        Sentry.addBreadcrumb(breadcrumb);
    }
}

module.exports = {
    initSentry,
    getSentryRequestHandler,
    getSentryTracingHandler,
    getSentryErrorHandler,
    captureException,
    captureMessage,
    setUser,
    clearUser,
    addBreadcrumb,
};
