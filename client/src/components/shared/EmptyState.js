import React from 'react';
import AnalyzeBrandButton from './AnalyzeBrandButton';

/**
 * Standardized Empty State Component
 * Used across all dashboard pages when no data is available
 */
const EmptyState = ({
    title = "No Data Available",
    message = "Analyze your first brand to see insights here",
    showButton = true,
    buttonText,
    onButtonClick,
    className = ""
}) => {
    return (
        <div className={`flex items-center justify-center min-h-[400px] ${className}`}>
            <div className="text-center space-y-6 max-w-md">
                {/* RageRadar Logo */}
                <div className="flex justify-center">
                    <img
                        src="/Rageradarlogo.png"
                        alt="RageRadar logo"
                        className="w-48 h-auto"
                    />
                </div>

                {/* Title */}
                {title && (
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {title}
                    </h3>
                )}

                {/* Message */}
                {message && (
                    <p className="text-gray-600 dark:text-gray-400">
                        {message}
                    </p>
                )}

                {/* CTA Button */}
                {showButton && (
                    <div className="flex justify-center pt-2">
                        <AnalyzeBrandButton
                            text={buttonText}
                            onClick={onButtonClick}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmptyState;
