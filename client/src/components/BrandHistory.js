import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBrand } from '../contexts/BrandContext';
import { capitalizeBrandName } from '../utils/brandUtils';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Search, 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  ChevronRight,
  Calendar,
  MessageSquare
} from 'lucide-react';

const BrandHistory = ({ compact = false }) => {
  const navigate = useNavigate();
  const { analyzedBrands, loading } = useBrand();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBrands = analyzedBrands.filter(brand =>
    brand.brandName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleBrandClick = (brand) => {
    navigate(`/dashboard?brand=${encodeURIComponent(brand.brandName)}`);
  };

  const getSentimentColor = (positivePercentage) => {
    if (positivePercentage >= 70) return 'bg-green-100 text-green-800';
    if (positivePercentage >= 50) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getSentimentIcon = (positivePercentage) => {
    if (positivePercentage >= 70) return TrendingUp;
    if (positivePercentage >= 50) return Minus;
    return TrendingDown;
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-sm text-muted-foreground">Loading brand history...</p>
      </div>
    );
  }

  if (analyzedBrands.length === 0) {
    return (
      <Card className="p-6 text-center">
        <div className="mb-4">
          <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
          <h3 className="font-semibold text-foreground mb-1">No Analysis History</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Start by analyzing your first brand to see results here
          </p>
          <Button 
            onClick={() => navigate('/analyze')}
            className="bg-gradient-to-r from-primary to-orange-500 text-white"
          >
            Analyze Your First Brand
          </Button>
        </div>
      </Card>
    );
  }

  if (compact) {
    return (
      <div className="space-y-2">
        {filteredBrands.slice(0, 5).map((brand, index) => (
          <button
            key={`${brand.brandName}-${index}`}
            onClick={() => handleBrandClick(brand)}
            className="w-full p-3 text-left bg-card hover:bg-muted rounded-lg border transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="font-medium text-foreground group-hover:text-primary transition-colors">
                  {capitalizeBrandName(brand.brandName)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatDate(brand.analyzedAt)} • {brand.totalMentions || 0} mentions
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={`text-xs ${getSentimentColor(brand.positivePercentage || 0)}`}>
                  {Math.round(brand.positivePercentage || 0)}%
                </Badge>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </div>
          </button>
        ))}
        
        {analyzedBrands.length > 5 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/dashboard/history')}
            className="w-full"
          >
            View All ({analyzedBrands.length})
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search analyzed brands..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      {/* Brand List */}
      <div className="space-y-3">
        {filteredBrands.map((brand, index) => {
          const SentimentIcon = getSentimentIcon(brand.positivePercentage || 0);
          
          return (
            <Card 
              key={`${brand.brandName}-${index}`}
              className="cursor-pointer hover:shadow-md transition-all duration-200 group"
              onClick={() => handleBrandClick(brand)}
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-primary to-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      {capitalizeBrandName(brand.brandName).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {capitalizeBrandName(brand.brandName)}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>Analyzed {formatDate(brand.analyzedAt)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={getSentimentColor(brand.positivePercentage || 0)}>
                      <SentimentIcon className="w-3 h-3 mr-1" />
                      {Math.round(brand.positivePercentage || 0)}%
                    </Badge>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                      <MessageSquare className="w-3 h-3" />
                      <span>Mentions</span>
                    </div>
                    <div className="font-semibold text-foreground">
                      {(brand.totalMentions || 0).toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-muted-foreground mb-1">Positive</div>
                    <div className="font-semibold text-green-600">
                      {Math.round(brand.positivePercentage || 0)}%
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-muted-foreground mb-1">Negative</div>
                    <div className="font-semibold text-red-600">
                      {Math.round(brand.negativePercentage || 0)}%
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredBrands.length === 0 && searchTerm && (
        <Card className="p-6 text-center">
          <div className="text-muted-foreground">
            <Search className="w-8 h-8 mx-auto mb-2" />
            <p>No brands found matching "{searchTerm}"</p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default BrandHistory;