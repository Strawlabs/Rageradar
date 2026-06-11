import React from 'react';

const ColorfulWidget = ({
  title,
  value,
  icon,
  color = 'blue',
  className = '',
  size = 'medium'
}) => {

  // Colors matching the screenshot - solid colors with proper contrast
  const colorSchemes = {
    blue: {
      bg: 'bg-blue-500',
      iconBg: 'bg-blue-600',
      text: 'text-white',
      hover: 'hover:bg-blue-600'
    },
    purple: {
      bg: 'bg-purple-500',
      iconBg: 'bg-purple-600',
      text: 'text-white',
      hover: 'hover:bg-purple-600'
    },
    green: {
      bg: 'bg-green-500',
      iconBg: 'bg-green-600',
      text: 'text-white',
      hover: 'hover:bg-green-600'
    },
    red: {
      bg: 'bg-red-500',
      iconBg: 'bg-red-600',
      text: 'text-white',
      hover: 'hover:bg-red-600'
    },
    orange: {
      bg: 'bg-orange-500',
      iconBg: 'bg-orange-600',
      text: 'text-white',
      hover: 'hover:bg-orange-600'
    },
    teal: {
      bg: 'bg-teal-500',
      iconBg: 'bg-teal-600',
      text: 'text-white',
      hover: 'hover:bg-teal-600'
    }
  };

  const sizeClasses = {
    small: 'p-3 min-h-[70px]',
    medium: 'p-4 min-h-[90px]',
    large: 'p-6 min-h-[110px]'
  };

  const textSizes = {
    small: { value: 'text-xl', title: 'text-xs' },
    medium: { value: 'text-2xl', title: 'text-sm' },
    large: { value: 'text-3xl', title: 'text-base' }
  };

  const scheme = colorSchemes[color] || colorSchemes.blue;

  return (
    <div
      className={`
        rounded-xl shadow-lg transition-all duration-300 
        hover:shadow-xl relative overflow-hidden
        ${scheme.bg} ${scheme.text}
        ${sizeClasses[size]} ${className}
      `}
    >
      <div className="flex items-center justify-between h-full">
        <div className="flex items-center space-x-3">
          {icon && (
            <div className="flex-shrink-0">
              <div className={`w-8 h-8 flex items-center justify-center ${scheme.iconBg} rounded-lg`}>
                {typeof icon === 'string' ? (
                  <span className="text-lg">{icon}</span>
                ) : (
                  icon
                )}
              </div>
            </div>
          )}

          <div className="flex flex-col">
            <div className={`font-bold ${textSizes[size].value} leading-tight`}>
              {value}
            </div>
            <div className={`${textSizes[size].title} opacity-90 font-medium`}>
              {title}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorfulWidget;