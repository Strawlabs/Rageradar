import React from 'react';
import { AlertCircle, RefreshCw, HelpCircle } from 'lucide-react';
import { Button } from './button';

/**
 * ErrorState Component
 * Consistent error handling UI across the application
 * 
 * @param {Object} props
 * @param {string} props.title - Error title
 * @param {string} props.message - Error message/description
 * @param {function} props.onRetry - Optional retry callback
 * @param {string} props.supportLink - Optional support/help link
 * @param {string} props.variant - 'error' | 'warning' | 'info' (default: 'error')
 * @param {string} props.size - Size: 'sm' | 'md' | 'lg' (default: 'md')
 */
export function ErrorState({
    title = 'Something went wrong',
    message = 'An unexpected error occurred. Please try again.',
    onRetry,
    supportLink,
    variant = 'error',
    size = 'md'
}) {
    const sizeClasses = {
        sm: {
            container: 'py-8 px-4',
            icon: 'w-12 h-12 mb-3',
            title: 'text-base',
            message: 'text-xs max-w-xs',
            spacing: 'mb-4'
        },
        md: {
            container: 'py-12 px-4',
            icon: 'w-16 h-16 mb-4',
            title: 'text-lg',
            message: 'text-sm max-w-md',
            spacing: 'mb-6'
        },
        lg: {
            container: 'py-16 px-6',
            icon: 'w-20 h-20 mb-6',
            title: 'text-xl',
            message: 'text-base max-w-lg',
            spacing: 'mb-8'
        }
    };

    const variantStyles = {
        error: {
            icon: 'text-red-500',
            title: 'text-red-600 dark:text-red-400',
            bg: 'bg-red-50 dark:bg-red-950/20',
            border: 'border-red-200 dark:border-red-800'
        },
        warning: {
            icon: 'text-yellow-500',
            title: 'text-yellow-600 dark:text-yellow-400',
            bg: 'bg-yellow-50 dark:bg-yellow-950/20',
            border: 'border-yellow-200 dark:border-yellow-800'
        },
        info: {
            icon: 'text-blue-500',
            title: 'text-blue-600 dark:text-blue-400',
            bg: 'bg-blue-50 dark:bg-blue-950/20',
            border: 'border-blue-200 dark:border-blue-800'
        }
    };

    const classes = sizeClasses[size];
    const styles = variantStyles[variant];

    return (
        <div className={`flex flex-col items-center justify-center ${classes.container}`}>
            {/* Error Icon */}
            <div className={`${classes.icon} ${styles.icon} flex items-center justify-center`}>
                <AlertCircle className="w-full h-full" />
            </div>

            {/* Title */}
            <h3 className={`${classes.title} ${styles.title} font-semibold mb-2 text-center`}>
                {title}
            </h3>

            {/* Message */}
            <p className={`${classes.message} text-muted-foreground text-center ${classes.spacing}`}>
                {message}
            </p>

            {/* Actions */}
            <div className="flex items-center gap-3">
                {onRetry && (
                    <Button
                        onClick={onRetry}
                        variant="default"
                        size={size === 'sm' ? 'sm' : 'default'}
                        className="gap-2"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Try Again
                    </Button>
                )}

                {supportLink && (
                    <Button
                        onClick={() => window.open(supportLink, '_blank')}
                        variant="outline"
                        size={size === 'sm' ? 'sm' : 'default'}
                        className="gap-2"
                    >
                        <HelpCircle className="h-4 w-4" />
                        Get Help
                    </Button>
                )}
            </div>
        </div>
    );
}

/**
 * InlineError Component
 * Small inline error message for forms and inputs
 */
export function InlineError({ message }) {
    if (!message) return null;

    return (
        <div className="flex items-center gap-2 mt-2 text-sm text-red-600 dark:text-red-400">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{message}</span>
        </div>
    );
}

/**
 * ErrorBanner Component
 * Banner-style error for page-level errors
 */
export function ErrorBanner({ title, message, onDismiss, onRetry }) {
    return (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-1">
                        {title}
                    </h4>
                    <p className="text-sm text-red-700 dark:text-red-300">
                        {message}
                    </p>
                    {onRetry && (
                        <Button
                            onClick={onRetry}
                            variant="outline"
                            size="sm"
                            className="mt-3 gap-2"
                        >
                            <RefreshCw className="h-3 w-3" />
                            Retry
                        </Button>
                    )}
                </div>
                {onDismiss && (
                    <button
                        onClick={onDismiss}
                        className="text-red-500 hover:text-red-700 dark:hover:text-red-300"
                    >
                        ×
                    </button>
                )}
            </div>
        </div>
    );
}

export default ErrorState;
