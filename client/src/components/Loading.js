import React from 'react';

const Loading = ({ 
  message = "Loading...", 
  subMessage = "",
  size = "base",
  className = ""
}) => {
  const sizeClasses = {
    sm: "w-6 h-6",
    base: "w-8 h-8", 
    lg: "w-12 h-12"
  };

  const Spinner = () => (
    <div className={`animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 ${sizeClasses[size]}`}></div>
  );

  return (
    <div className={`flex items-center justify-center min-h-screen bg-gray-50 ${className}`}>
      <div className="text-center">
        <Spinner />
        <div className="mt-4">
          <h3 className="text-lg font-medium text-gray-900">{message}</h3>
          {subMessage && (
            <p className="text-sm text-gray-600 mt-1">{subMessage}</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Inline loading component for smaller spaces
export const InlineLoading = ({ 
  message = "Loading...", 
  size = "sm",
  className = ""
}) => {
  const sizeClasses = {
    xs: "w-4 h-4",
    sm: "w-5 h-5",
    base: "w-6 h-6"
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`animate-spin rounded-full border-2 border-gray-200 border-t-blue-600 ${sizeClasses[size]}`}></div>
      <span className="text-sm text-gray-600">{message}</span>
    </div>
  );
};

// Button loading state
export const ButtonLoading = ({ className = "" }) => (
  <div className={`animate-spin rounded-full border-2 border-white border-t-transparent w-4 h-4 ${className}`}></div>
);

export default Loading;