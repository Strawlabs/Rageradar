import React from 'react';
import { Button } from './button';

/**
 * EmptyState Component
 * Consistent empty state UI across the application
 * 
 * @param {Object} props
 * @param {ReactNode} props.icon - Icon to display
 * @param {string} props.title - Main heading
 * @param {string} props.description - Descriptive text
 * @param {Object} props.action - Optional CTA button
 * @param {string} props.action.label - Button text
 * @param {function} props.action.onClick - Button click handler
 * @param {string} props.action.variant - Button variant (default: 'default')
 * @param {string} props.size - Size variant: 'sm' | 'md' | 'lg' (default: 'md')
 */
export function EmptyState({
    icon,
    title,
    description,
    action,
    size = 'md'
}) {
    const sizeClasses = {
        sm: {
            container: 'py-8 px-4',
            icon: 'w-12 h-12 mb-3',
            title: 'text-base',
            description: 'text-xs max-w-xs',
            spacing: 'mb-4'
        },
        md: {
            container: 'py-12 px-4',
            icon: 'w-16 h-16 mb-4',
            title: 'text-lg',
            description: 'text-sm max-w-md',
            spacing: 'mb-6'
        },
        lg: {
            container: 'py-16 px-6',
            icon: 'w-20 h-20 mb-6',
            title: 'text-xl',
            description: 'text-base max-w-lg',
            spacing: 'mb-8'
        }
    };

    const classes = sizeClasses[size];

    return (
        <div className={`flex flex-col items-center justify-center ${classes.container}`}>
            {/* Icon */}
            {icon && (
                <div className={`${classes.icon} text-muted-foreground flex items-center justify-center`}>
                    {icon}
                </div>
            )}

            {/* Title */}
            <h3 className={`${classes.title} font-semibold text-foreground mb-2 text-center`}>
                {title}
            </h3>

            {/* Description */}
            <p className={`${classes.description} text-muted-foreground text-center ${classes.spacing}`}>
                {description}
            </p>

            {/* Action Button */}
            {action && (
                <Button
                    onClick={action.onClick}
                    variant={action.variant || 'default'}
                    size={size === 'sm' ? 'sm' : 'default'}
                >
                    {action.label}
                </Button>
            )}
        </div>
    );
}

export default EmptyState;
