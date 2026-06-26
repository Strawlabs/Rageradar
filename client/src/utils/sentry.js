/**
 * Sentry Error Tracking for React Client
 * Captures and reports client-side errors
 */

import * as Sentry from '@sentry/react';

/**
 * Initialize Sentry for the React application
 */
export function initSentry() {
    const dsn = process.env.REACT_APP_SENTRY_DSN;

    // Only initialize if DSN is provided
    if (!dsn) {
        console.warn('⚠️  REACT_APP_SENTRY_DSN not configured. Error tracking disabled.');
        return;
    }

    Sentry.init({
        dsn,
        environment: process.env.NODE_ENV || 'development',

        // Set sample rate for performance monitoring
        tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

        // Integrations - using v10 API
        integrations: [
            Sentry.browserTracingIntegration(),
            Sentry.replayIntegration(),
        ],

        // Filter out sensitive data
        beforeSend(event, hint) {
            // Remove sensitive data from breadcrumbs
            if (event.breadcrumbs) {
                event.breadcrumbs = event.breadcrumbs.map(breadcrumb => {
                    if (breadcrumb.data) {
                        const sanitized = { ...breadcrumb.data };

                        // Remove sensitive fields
                        ['password', 'token', 'apiKey', 'email', 'creditCard'].forEach(field => {
                            if (sanitized[field]) {
                                sanitized[field] = '[REDACTED]';
                            }
                        });

                        breadcrumb.data = sanitized;
                    }
                    return breadcrumb;
                });
            }

            // Don't send events in development
            if (process.env.NODE_ENV === 'development') {
                console.error('Sentry Event (dev mode):', event);
                return null;
            }

            return event;
        },

        // Ignore certain errors
        ignoreErrors: [
            // Browser extensions
            'top.GLOBALS',
            'chrome-extension://',
            'moz-extension://',
            // Random network errors
            'NetworkError',
            'Network request failed',
            // ResizeObserver errors (harmless)
            'ResizeObserver loop limit exceeded',
            'ResizeObserver loop completed with undelivered notifications',
            // Supabase auth errors (expected)
            'auth/user-not-found',
            'auth/wrong-password',
            'auth/too-many-requests',
        ],

        // Deny URLs (don't track errors from these sources)
        denyUrls: [
            // Browser extensions
            /extensions\//i,
            /^chrome:\/\//i,
            /^moz-extension:\/\//i,
        ],
    });

    console.log('✅ Sentry error tracking initialized');
}

/**
 * Set user context for error tracking
 * @param {Object} user - User information from Supabase Auth
 */
export function setUser(user) {
    if (process.env.REACT_APP_SENTRY_DSN && user) {
        Sentry.setUser({
            id: user.uid,
            email: user.email,
            username: user.displayName || user.email,
        });
    }
}

/**
 * Clear user context (on logout)
 */
export function clearUser() {
    if (process.env.REACT_APP_SENTRY_DSN) {
        Sentry.setUser(null);
    }
}

/**
 * Manually capture an exception
 * @param {Error} error - Error to capture
 * @param {Object} context - Additional context
 */
export function captureException(error, context = {}) {
    if (process.env.REACT_APP_SENTRY_DSN) {
        Sentry.captureException(error, {
            extra: context,
        });
    } else {
        console.error('Error:', error, context);
    }
}

/**
 * Manually capture a message
 * @param {string} message - Message to capture
 * @param {string} level - Severity level
 * @param {Object} context - Additional context
 */
export function captureMessage(message, level = 'info', context = {}) {
    if (process.env.REACT_APP_SENTRY_DSN) {
        Sentry.captureMessage(message, {
            level,
            extra: context,
        });
    } else {
        console.log(`[${level}] ${message}`, context);
    }
}

/**
 * Add breadcrumb for tracking user actions
 * @param {Object} breadcrumb - Breadcrumb data
 */
export function addBreadcrumb(breadcrumb) {
    if (process.env.REACT_APP_SENTRY_DSN) {
        Sentry.addBreadcrumb(breadcrumb);
    }
}

/**
 * Create error boundary component
 */
export const ErrorBoundary = Sentry.ErrorBoundary;

export default Sentry;
