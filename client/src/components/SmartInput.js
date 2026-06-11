import React, { useState, useRef, useEffect } from 'react';

const SmartInput = ({ onAnalyze, className = "" }) => {
  const [brandName, setBrandName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);

  // Auto-focus removed to prevent unwanted page scrolling

  // Handle input changes
  const handleInputChange = (e) => {
    setBrandName(e.target.value);
  };

  // Handle analysis
  const handleAnalyze = async () => {
    if (!brandName.trim()) return;
    
    setIsLoading(true);
    try {
      if (onAnalyze) {
        await onAnalyze(brandName.trim());
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle keyboard
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && brandName.trim()) {
      e.preventDefault();
      handleAnalyze();
    }
  };

  return (
    <div style={{ position: 'relative', maxWidth: '400px', margin: '0 auto' }}>
      <input
        ref={inputRef}
        type="text"
        value={brandName}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="Search: Apple, Tesla, Netflix, iPhone, CES 2024..."
        disabled={isLoading}
        className="no-focus-outline"
        style={{
          width: '100%',
          height: '60px',
          padding: '0 70px 0 20px',
          margin: '0',
          borderRadius: '30px',
          border: '3px solid #FF0000',
          backgroundColor: '#FFFFFF',
          color: '#000000',
          fontSize: '18px',
          fontWeight: '900',
          fontFamily: 'Arial, sans-serif',
          textAlign: 'center',
          caretColor: '#FF0000',
          boxSizing: 'border-box',
          outline: 'none !important',
          boxShadow: 'none !important',
          WebkitAppearance: 'none',
          MozAppearance: 'none'
        }}
        onFocus={(e) => {
          e.target.style.outline = 'none';
          e.target.style.boxShadow = 'none';
          e.target.style.border = '3px solid #FF0000';
          e.target.style.webkitAppearance = 'none';
          e.target.style.mozAppearance = 'none';
        }}
        onBlur={(e) => {
          e.target.style.outline = 'none';
          e.target.style.boxShadow = 'none';
        }}
      />
      
      <button
        onClick={handleAnalyze}
        disabled={!brandName.trim() || isLoading}
        style={{
          position: 'absolute',
          right: '5px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '50px',
          height: '50px',
          borderRadius: '25px',
          border: 'none',
          backgroundColor: '#FF0000',
          color: '#FFFFFF',
          fontSize: '20px',
          fontWeight: 'bold',
          cursor: 'pointer'
        }}
      >
        {isLoading ? '...' : '→'}
      </button>
    </div>
  );
};

export default SmartInput;