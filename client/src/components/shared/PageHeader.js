import React from 'react';

const PageHeader = ({ 
  title, 
  subtitle, 
  icon, 
  iconColor = 'text-blue-600',
  iconBg = 'from-blue-500 to-purple-500',
  children,
  action,
  className = ''
}) => {
  return (
    <div className={`bg-slate-800 rounded-xl p-6 mb-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {icon && (
            <div className="flex-shrink-0">
              <div className={`w-12 h-12 bg-gradient-to-br ${iconBg} rounded-xl flex items-center justify-center`}>
                <div className="w-7 h-7 text-white">
                  {icon}
                </div>
              </div>
            </div>
          )}
          
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {title}
            </h1>
            {subtitle && (
              <p className="text-slate-300">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        
        {(children || action) && (
          <div className="flex-shrink-0">
            {action || children}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;