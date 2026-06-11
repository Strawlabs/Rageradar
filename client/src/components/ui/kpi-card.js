import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "../../lib/utils"
import { Card, CardContent, CardHeader } from "./card"
import { Badge } from "./badge"
import { Progress, SentimentProgress } from "./progress"
import { Skeleton } from "./skeleton"

const kpiCardVariants = cva(
  "group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02]",
  {
    variants: {
      variant: {
        default: "border-border hover:border-primary/50",
        sentiment: "border-border hover:border-primary/50",
        gradient: "bg-gradient-to-br from-card via-card to-muted/20 border-0 shadow-lg hover:shadow-xl",
        elevated: "shadow-lg hover:shadow-xl border-0",
      },
      status: {
        default: "",
        positive: "hover:border-positive-300 hover:shadow-positive-100/50",
        negative: "hover:border-negative-300 hover:shadow-negative-100/50",
        neutral: "hover:border-neutral-300 hover:shadow-neutral-100/50",
        warning: "hover:border-yellow-300 hover:shadow-yellow-100/50",
      },
    },
    defaultVariants: {
      variant: "default",
      status: "default",
    },
  }
)

const KPICard = React.forwardRef(({ 
  className, 
  variant, 
  status,
  title,
  value,
  description,
  icon,
  trend,
  trendValue,
  badge,
  progress,
  loading = false,
  onClick,
  children,
  ...props 
}, ref) => {
  if (loading) {
    return (
      <Card ref={ref} className={cn("p-6", className)} {...props}>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-2 w-full" />
        </div>
      </Card>
    )
  }

  const getTrendColor = (trend) => {
    if (!trend) return "text-muted-foreground"
    switch (trend) {
      case 'up':
        return status === 'negative' ? 'text-negative-600' : 'text-positive-600'
      case 'down':
        return status === 'negative' ? 'text-positive-600' : 'text-negative-600'
      default:
        return 'text-muted-foreground'
    }
  }

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return '↗'
      case 'down':
        return '↘'
      default:
        return '→'
    }
  }

  return (
    <Card
      ref={ref}
      className={cn(kpiCardVariants({ variant, status }), className)}
      onClick={onClick}
      {...props}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon && (
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-2xl text-lg transition-colors",
                status === 'positive' && "bg-positive-100 text-positive-600",
                status === 'negative' && "bg-negative-100 text-negative-600",
                status === 'neutral' && "bg-neutral-100 text-neutral-600",
                status === 'warning' && "bg-yellow-100 text-yellow-600",
                status === 'default' && "bg-muted text-muted-foreground"
              )}>
                {typeof icon === 'string' ? <span>{icon}</span> : icon}
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              {description && (
                <p className="text-xs text-muted-foreground/80">{description}</p>
              )}
            </div>
          </div>
          {badge && (
            <Badge variant={badge.variant || status} size="sm">
              {badge.content}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pb-4">
        <div className="space-y-3">
          {/* Main Value */}
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">{value}</span>
              {trend && trendValue && (
                <div className={cn("flex items-center gap-1 text-sm font-medium", getTrendColor(trend))}>
                  <span className="text-base">{getTrendIcon(trend)}</span>
                  <span>{trendValue}</span>
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          {progress && (
            <div className="space-y-1">
              {progress.type === 'sentiment' ? (
                <SentimentProgress
                  positive={progress.positive || 0}
                  negative={progress.negative || 0}
                  neutral={progress.neutral || 0}
                  showLabels={false}
                />
              ) : (
                <Progress
                  value={progress.value || 0}
                  variant={progress.variant || status}
                  size="sm"
                />
              )}
              {progress.label && (
                <p className="text-xs text-muted-foreground">{progress.label}</p>
              )}
            </div>
          )}

          {/* Custom Content */}
          {children}
        </div>
      </CardContent>

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </Card>
  )
})
KPICard.displayName = "KPICard"

// Sentiment KPI Card specifically for RageRadar
const SentimentKPICard = React.forwardRef(({ 
  title,
  rageIndex,
  sentimentScore,
  mentions,
  trend,
  trendValue,
  lastUpdate,
  loading = false,
  className,
  ...props 
}, ref) => {
  const getSentimentStatus = (score) => {
    if (score >= 0.7) return 'positive'
    if (score <= 0.3) return 'negative'
    return 'neutral'
  }

  const getRageStatus = (index) => {
    if (index >= 70) return 'negative'
    if (index >= 40) return 'warning'
    return 'positive'
  }

  const status = rageIndex !== undefined ? getRageStatus(rageIndex) : getSentimentStatus(sentimentScore)

  return (
    <KPICard
      ref={ref}
      variant="sentiment"
      status={status}
      title={title}
      value={rageIndex !== undefined ? rageIndex : Math.round((sentimentScore || 0) * 100)}
      description={mentions ? `${mentions.toLocaleString()} mentions` : undefined}
      icon={rageIndex !== undefined ? "🔥" : (status === 'positive' ? "😊" : status === 'negative' ? "😠" : "😐")}
      trend={trend}
      trendValue={trendValue}
      badge={lastUpdate ? { content: lastUpdate, variant: 'outline' } : undefined}
      progress={
        rageIndex !== undefined 
          ? { 
              value: rageIndex, 
              variant: status,
              label: `Rage Index: ${rageIndex}/100`
            }
          : sentimentScore !== undefined
          ? {
              type: 'sentiment',
              positive: sentimentScore > 0.5 ? sentimentScore * 100 : 0,
              negative: sentimentScore < 0.5 ? (1 - sentimentScore) * 100 : 0,
              neutral: Math.abs(sentimentScore - 0.5) < 0.1 ? 50 : 0,
              label: `Sentiment: ${Math.round(sentimentScore * 100)}%`
            }
          : undefined
      }
      loading={loading}
      className={className}
      {...props}
    />
  )
})
SentimentKPICard.displayName = "SentimentKPICard"

// Metric KPI Card for general metrics
const MetricKPICard = React.forwardRef(({ 
  title,
  value,
  target,
  unit,
  icon,
  trend,
  trendValue,
  description,
  loading = false,
  className,
  ...props 
}, ref) => {
  const getStatus = () => {
    if (!target || !value) return 'default'
    const numValue = typeof value === 'string' ? parseFloat(value) : value
    const numTarget = typeof target === 'string' ? parseFloat(target) : target
    
    if (numValue >= numTarget) return 'positive'
    if (numValue >= numTarget * 0.8) return 'warning'
    return 'negative'
  }

  const status = getStatus()
  const progressValue = target ? Math.min((parseFloat(value) / parseFloat(target)) * 100, 100) : 0

  return (
    <KPICard
      ref={ref}
      variant="default"
      status={status}
      title={title}
      value={`${value}${unit || ''}`}
      description={description}
      icon={icon}
      trend={trend}
      trendValue={trendValue}
      progress={target ? {
        value: progressValue,
        variant: status,
        label: `Target: ${target}${unit || ''}`
      } : undefined}
      loading={loading}
      className={className}
      {...props}
    />
  )
})
MetricKPICard.displayName = "MetricKPICard"

export { 
  KPICard, 
  SentimentKPICard, 
  MetricKPICard,
  kpiCardVariants 
}