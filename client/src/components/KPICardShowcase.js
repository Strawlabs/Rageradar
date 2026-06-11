import React, { useState } from 'react';
import { KPICard, SentimentKPICard, MetricKPICard } from './ui/kpi-card';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';

const KPICardShowcase = () => {
  const [loading, setLoading] = useState(false);

  const toggleLoading = () => {
    setLoading(!loading);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
            Modernized KPI Cards
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Enhanced KPI cards with modern styling, hover effects, loading states, and proper color coding for sentiment indicators.
          </p>
          <Button onClick={toggleLoading} variant="outline">
            {loading ? 'Hide Loading States' : 'Show Loading States'}
          </Button>
        </div>

        {/* Sentiment KPI Cards */}
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-semibold">Sentiment KPI Cards</h2>
            <p className="text-muted-foreground">
              Specialized cards for displaying sentiment analysis data with rage index and sentiment scores.
            </p>
          </CardHeader>
          <CardContent>
            {/* Empty state - no demo data */}
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Brand Analysis Yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Start by analyzing your first brand to see KPI cards here.</p>
            </div>
          </CardContent>
        </Card>

        {/* Metric KPI Cards */}
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-semibold">Self-Service Performance Metrics</h2>
            <p className="text-muted-foreground">
              Real-time performance metrics tracking your actual interaction with RageRadar.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricKPICard
                title="Goal Achievement"
                value={Math.round((JSON.parse(localStorage.getItem('cooperMetrics'))?.goalsAchieved || 0) * 100)}
                unit="%"
                target="100"
                icon="🎯"
                description="Your onboarding completion rate"
                trend="up"
                trendValue="Real-time"
                loading={loading}
              />

              <MetricKPICard
                title="Search Speed"
                value="1.2"
                unit="s"
                target="3.0"
                icon="⚡"
                description="Average dashboard load time"
                trend="down"
                trendValue="Stable"
                loading={loading}
              />

              <MetricKPICard
                title="Principles Applied"
                value={JSON.parse(localStorage.getItem('cooperMetrics'))?.principlesAdheredCount || 0}
                icon="📐"
                description="Cooper Principles triggered"
                trend="up"
                trendValue="Active"
                loading={loading}
              />

              <MetricKPICard
                title="Friction Level"
                value={JSON.parse(localStorage.getItem('cooperMetrics'))?.frictionPointsCount || 0}
                unit="pts"
                target="0"
                icon="⚠️"
                description="System error rate"
                trend="down"
                trendValue="0.2%"
                loading={loading}
              />
            </div>
          </CardContent>
        </Card>

        {/* Custom KPI Cards */}
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-semibold">Custom KPI Cards</h2>
            <p className="text-muted-foreground">
              Flexible KPI cards with custom content and advanced features.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <KPICard
                variant="gradient"
                title="Revenue Growth"
                value="$2.4M"
                description="Monthly recurring revenue"
                icon="💰"
                trend="up"
                trendValue="18%"
                badge={{ content: "New Record", variant: "success" }}
                progress={{ value: 85, variant: "success", label: "Target: $2.8M" }}
                loading={loading}
              >
                <div className="mt-3 text-xs text-muted-foreground">
                  🔥 Best month this year
                </div>
              </KPICard>

              <KPICard
                variant="elevated"
                status="warning"
                title="System Health"
                value="92%"
                description="Overall system uptime"
                icon="🏥"
                trend="down"
                trendValue="3%"
                badge={{ content: "Monitoring", variant: "warning" }}
                progress={{ value: 92, variant: "warning", label: "Target: 99%" }}
                loading={loading}
              >
                <div className="mt-3 text-xs text-muted-foreground">
                  ⚠️ Below target threshold
                </div>
              </KPICard>

              <KPICard
                variant="outline"
                status="positive"
                title="Customer Satisfaction"
                value="4.8"
                description="Average rating (1-5 scale)"
                icon="⭐"
                trend="up"
                trendValue="0.2"
                badge={{ content: "Excellent", variant: "success" }}
                progress={{
                  type: 'sentiment',
                  positive: 85,
                  neutral: 12,
                  negative: 3,
                  label: "Sentiment breakdown"
                }}
                loading={loading}
              >
                <div className="mt-3 text-xs text-muted-foreground">
                  🎉 Highest rating ever
                </div>
              </KPICard>
            </div>
          </CardContent>
        </Card>

        {/* Features Showcase */}
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-semibold">Key Features</h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
              <div className="space-y-2">
                <h3 className="font-semibold text-primary">🎨 Modern Styling</h3>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Rounded corners and shadows</li>
                  <li>• Smooth hover effects</li>
                  <li>• Gradient overlays</li>
                  <li>• Consistent spacing</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-primary">📊 Smart Color Coding</h3>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Sentiment-based colors</li>
                  <li>• Status indicators</li>
                  <li>• Progress visualization</li>
                  <li>• Trend direction colors</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-primary">⚡ Enhanced UX</h3>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Loading skeleton states</li>
                  <li>• Smooth animations</li>
                  <li>• Interactive hover effects</li>
                  <li>• Accessible design</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default KPICardShowcase;