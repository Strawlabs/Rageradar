import React, { useState, useEffect } from 'react';
import { fetchBrandLogo, getBrandInitials, getBrandColor } from '../../utils/brandLogoService';

/**
 * BrandLogo Component
 * Displays brand logo with intelligent fallbacks
 */
const BrandLogo = ({
    brandName,
    size = 'md',
    className = '',
    showFallback = true
}) => {
    const [logoUrl, setLogoUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // Size mappings
    const sizeClasses = {
        xs: 'w-4 h-4 text-[8px]',
        sm: 'w-5 h-5 text-xs',
        md: 'w-8 h-8 text-sm',
        lg: 'w-12 h-12 text-base',
        xl: 'w-16 h-16 text-lg',
        '2xl': 'w-24 h-24 text-2xl',
    };

    const sizeClass = sizeClasses[size] || sizeClasses.md;

    useEffect(() => {
        let isMounted = true;

        const loadLogo = async () => {
            if (!brandName) {
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(false);

            try {
                const url = await fetchBrandLogo(brandName);
                if (isMounted) {
                    if (url) {
                        setLogoUrl(url);
                    } else {
                        setError(true);
                    }
                    setLoading(false);
                }
            } catch (err) {
                if (isMounted) {
                    setError(true);
                    setLoading(false);
                }
            }
        };

        loadLogo();

        return () => {
            isMounted = false;
        };
    }, [brandName]);

    // Loading state
    if (loading) {
        return (
            <div className={`${sizeClass} ${className} rounded bg-gray-200 dark:bg-gray-700 animate-pulse`} />
        );
    }

    // Success: Show logo
    if (logoUrl && !error) {
        return (
            <img
                src={logoUrl}
                alt={`${brandName} logo`}
                className={`${sizeClass} ${className} rounded object-contain bg-white`}
                onError={() => setError(true)}
            />
        );
    }

    // Fallback: Show initials with brand color
    if (showFallback) {
        const initials = getBrandInitials(brandName);
        const bgColor = getBrandColor(brandName);

        return (
            <div
                className={`${sizeClass} ${className} rounded flex items-center justify-center font-bold text-white`}
                style={{ backgroundColor: bgColor }}
                title={brandName}
            >
                {initials}
            </div>
        );
    }

    // No fallback: Return null
    return null;
};

export default BrandLogo;
