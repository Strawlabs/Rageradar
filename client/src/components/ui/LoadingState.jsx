import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * LoadingState Component
 * Consistent loading states across the application
 * 
 * @param {Object} props
 * @param {string} props.variant - 'spinner' | 'skeleton' | 'page' (default: 'spinner')
 * @param {string} props.message - Optional loading message
 * @param {number} props.rows - Number of skeleton rows (for skeleton variant)
 * @param {string} props.size - Size: 'sm' | 'md' | 'lg' (default: 'md')
 */
export function LoadingState({
    variant = 'spinner',
    message,
    rows = 3,
    size = 'md'
}) {
    // Spinner variant
    if (variant === 'spinner') {
        const spinnerSizes = {
            sm: 'h-4 w-4',
            md: 'h-8 w-8',
            lg: 'h-12 w-12'
        };

        return (
            <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className={`${spinnerSizes[size]} animate-spin text-primary`} />
                {message && (
                    <p className="mt-4 text-sm text-muted-foreground">{message}</p>
                )}
            </div>
        );
    }

    // Page variant (full page loading)
    if (variant === 'page') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-lg font-medium text-foreground">
                    {message || 'Loading...'}
                </p>
            </div>
        );
    }

    // Skeleton variant
    if (variant === 'skeleton') {
        return (
            <div className="space-y-4 py-4">
                {Array.from({ length: rows }).map((_, index) => (
                    <div key={index} className="space-y-3">
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-3/4" />
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-1/2" />
                    </div>
                ))}
            </div>
        );
    }

    return null;
}

/**
 * SkeletonCard Component
 * Skeleton loader for card-based content
 */
export function SkeletonCard() {
    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
            <div className="space-y-4">
                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-1/3" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-full" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-5/6" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-4/6" />
            </div>
        </div>
    );
}

/**
 * SkeletonTable Component
 * Skeleton loader for table content
 */
export function SkeletonTable({ rows = 5 }) {
    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="flex gap-4 pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-1/4" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-1/4" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-1/4" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-1/4" />
            </div>

            {/* Rows */}
            {Array.from({ length: rows }).map((_, index) => (
                <div key={index} className="flex gap-4 py-3">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-1/4" />
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-1/4" />
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-1/4" />
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-1/4" />
                </div>
            ))}
        </div>
    );
}

export default LoadingState;
