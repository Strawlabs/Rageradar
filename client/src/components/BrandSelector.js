import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBrand } from '../contexts/BrandContext';

const BrandSelector = () => {
  const navigate = useNavigate();
  const { analyzedBrands, currentBrand, selectBrand, removeBrand } = useBrand();
  const [isOpen, setIsOpen] = useState(false);

  const handleBrandSelect = (brand) => {
    selectBrand(brand);
    setIsOpen(false);
    // Navigate to dashboard with selected brand
    navigate(`/dashboard?brand=${encodeURIComponent(brand.brandName)}`);
  };

  const handleRemoveBrand = (e, brandName) => {
    e.stopPropagation();
    removeBrand(brandName);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (analyzedBrands.length === 0) {
    return (
      <button
        onClick={() => navigate('/analysis')}
        className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <span className="text-sm font-medium">Analyze Your First Brand</span>
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-600 transition-all duration-200"
      >
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">
              {currentBrand?.brandName?.charAt(0)?.toUpperCase() || '?'}
            </span>
          </div>
          <div className="text-left">
            <div className="text-white font-medium text-sm">
              {currentBrand?.brandName || 'Select Brand'}
            </div>
            <div className="text-slate-400 text-xs">
              {currentBrand ? `${currentBrand.totalMentions || 0} mentions` : 'No brand selected'}
            </div>
          </div>
        </div>
        <svg 
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute top-full left-0 mt-2 w-80 bg-slate-800 rounded-xl border border-slate-600 shadow-xl z-20 max-h-96 overflow-y-auto">
            <div className="p-3 border-b border-slate-600">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-medium text-sm">Analyzed Brands</h3>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    navigate('/analysis');
                  }}
                  className="text-orange-400 hover:text-orange-300 text-sm font-medium"
                >
                  + Analyze New
                </button>
              </div>
            </div>
            
            <div className="py-2">
              {analyzedBrands.map((brand) => (
                <div
                  key={brand.brandName}
                  onClick={() => handleBrandSelect(brand)}
                  className={`flex items-center justify-between px-4 py-3 hover:bg-slate-700 cursor-pointer transition-colors ${
                    currentBrand?.brandName === brand.brandName ? 'bg-slate-700/50' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold">
                        {brand.brandName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="text-white font-medium text-sm">
                        {brand.brandName}
                      </div>
                      <div className="text-slate-400 text-xs">
                        {brand.totalMentions || 0} mentions • {formatDate(brand.createdAt)}
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className={`w-2 h-2 rounded-full ${
                          (brand.rageIndex || 0) > 60 ? 'bg-red-400' : 
                          (brand.rageIndex || 0) > 30 ? 'bg-yellow-400' : 'bg-green-400'
                        }`}></div>
                        <span className="text-xs text-slate-500">
                          Rage Index: {Math.round(brand.rageIndex || 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {currentBrand?.brandName === brand.brandName && (
                      <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                    )}
                    <button
                      onClick={(e) => handleRemoveBrand(e, brand.brandName)}
                      className="text-slate-500 hover:text-red-400 transition-colors p-1"
                      title="Remove brand"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BrandSelector;