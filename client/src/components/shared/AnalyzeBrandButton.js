import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Target } from 'lucide-react';

/**
 * Standardized "Analyze Brand" button component
 * Used consistently across all pages for brand analysis CTAs
 * Matches the dashboard design with orange background and target icon
 */
const AnalyzeBrandButton = ({
    text = "Analyze Your First Brand",
    onClick,
    className = "",
    icon: Icon = Target,
    size = "default" // "sm", "default", "lg"
}) => {
    const navigate = useNavigate();

    const handleClick = () => {
        if (onClick) {
            onClick();
        } else {
            navigate('/analysis');
        }
    };

    // Size variants
    const sizeClasses = {
        sm: "px-4 py-2 text-sm",
        default: "px-6 py-3 text-base",
        lg: "px-8 py-4 text-lg"
    };

    const iconSizes = {
        sm: "w-4 h-4",
        default: "w-5 h-5",
        lg: "w-6 h-6"
    };

    return (
        <button
            onClick={handleClick}
            className={`
        bg-orange-500
        hover:bg-orange-600
        text-white 
        ${sizeClasses[size]}
        rounded-lg
        font-semibold 
        shadow-md
        hover:shadow-lg 
        transition-all 
        duration-200 
        flex 
        items-center 
        gap-2
        ${className}
      `.trim().replace(/\s+/g, ' ')}
        >
            {Icon && <Icon className={iconSizes[size]} />}
            {text}
        </button>
    );
};

export default AnalyzeBrandButton;
