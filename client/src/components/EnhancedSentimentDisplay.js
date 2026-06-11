import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  AlertTriangle,
  CheckCircle,
  Info,
  Zap
} from 'lucide-react';

const EnhancedSentimentDisplay = ({ brandData }) => {
  if (!brandData) return null;

  const getTrendIcon = (direction) => {
    switch (direction) {
      case 'improving': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'declining': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getConfidenceColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getInsightIcon = (type) => {
    switch (type) {
      case 'sarcasm': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'brand_context': return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'confidence': return <Info className="w-4 h-4 text-gray-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Weighted Sentiment Score */}
        {brandData.weightedSentimentScore && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Weighted Score</p>
                  <p className="text-2xl font-bold text-foreground">
                    {Math.round(brandData.weightedSentimentScore)}%
                  </p>
                </div>
                <Zap className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Confidence Score */}
        {brandData.confidenceScore && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Confidence</p>
                  <p className={`text-2xl font-bold ${getConfidenceColor(brandData.confidenceScore)}`}>
                    {Math.round(brandData.confidenceScore)}%
                  </p>
                </div>
                <Activity className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Rage Index */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rage Index</p>
                <p className="text-2xl font-bold text-red-600">
                  {Math.round(brandData.rageIndex || 0)}%
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trend Analysis */}
      {brandData.trendAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getTrendIcon(brandData.trendAnalysis.direction)}
              Sentiment Trend Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Direction:</span>
                <Badge variant={brandData.trendAnalysis.direction === 'improving' ? 'default' : 'destructive'}>
                  {brandData.trendAnalysis.direction}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Strength:</span>
                <span className="text-sm">{brandData.trendAnalysis.strength?.toFixed(1)} points</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {brandData.trendAnalysis.summary}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Context Insights */}
      {brandData.contextInsights && brandData.contextInsights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              Context Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {brandData.contextInsights.map((insight, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                  {getInsightIcon(insight.type)}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {insight.message}
                    </p>
                    <Badge variant="outline" className="mt-1 text-xs">
                      {insight.severity}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Brand-Specific Analysis */}
      {brandData.brandSpecificAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Brand-Specific Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {brandData.brandSpecificAnalysis.topProducts && (
                <div>
                  <h4 className="font-medium mb-2">Top Product Mentions</h4>
                  <div className="flex flex-wrap gap-2">
                    {brandData.brandSpecificAnalysis.topProducts.map((product, index) => (
                      <Badge key={index} variant="secondary">
                        {product.product} ({product.count})
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedSentimentDisplay;