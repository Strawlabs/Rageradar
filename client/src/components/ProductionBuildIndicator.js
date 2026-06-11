import React, { useState } from 'react';
import { PRODUCTION_BUILD, getProductionFeatures, getDevelopmentFeatures } from '../config/features';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

const ProductionBuildIndicator = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const productionFeatures = getProductionFeatures();
  const developmentFeatures = getDevelopmentFeatures();
  const isProduction = process.env.NODE_ENV === 'production';

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Toggle Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 p-3 w-full text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
          <div className={`w-3 h-3 rounded-full ${isProduction ? 'bg-green-500' : 'bg-blue-500'}`}></div>
          <span className="text-sm font-medium text-slate-900 dark:text-white">
            {isProduction ? 'Production Build' : 'Development Build'}
          </span>
          <Info className="w-4 h-4 text-slate-500" />
        </button>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="border-t border-slate-200 dark:border-slate-700 p-4 max-w-sm">
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
                Build Information
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Version: {PRODUCTION_BUILD.version}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Built: {new Date(PRODUCTION_BUILD.buildDate).toLocaleDateString()}
              </p>
            </div>

            <div className="mb-3">
              <h4 className="text-xs font-semibold text-green-700 dark:text-green-400 mb-2 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Production Ready ({productionFeatures.length})
              </h4>
              <div className="space-y-1">
                {productionFeatures.slice(0, 5).map((feature) => (
                  <div key={feature} className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                    {feature.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                  </div>
                ))}
                {productionFeatures.length > 5 && (
                  <div className="text-xs text-slate-500 dark:text-slate-500">
                    +{productionFeatures.length - 5} more...
                  </div>
                )}
              </div>
            </div>

            {!isProduction && developmentFeatures.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-orange-700 dark:text-orange-400 mb-2 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  In Development ({developmentFeatures.length})
                </h4>
                <div className="space-y-1">
                  {developmentFeatures.slice(0, 3).map((feature) => (
                    <div key={feature} className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
                      <div className="w-1 h-1 bg-orange-500 rounded-full"></div>
                      {feature.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                    </div>
                  ))}
                  {developmentFeatures.length > 3 && (
                    <div className="text-xs text-slate-500 dark:text-slate-500">
                      +{developmentFeatures.length - 3} more...
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-500 dark:text-slate-500">
                {PRODUCTION_BUILD.description}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductionBuildIndicator;