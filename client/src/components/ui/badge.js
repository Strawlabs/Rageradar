import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "../../lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80 shadow-sm",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80 shadow-sm",
        outline: "text-foreground border-border hover:bg-accent",
        ghost: "border-transparent hover:bg-accent hover:text-accent-foreground",
        
        // Sentiment variants for RageRadar
        positive:
          "border-transparent bg-positive-100 text-positive-800 hover:bg-positive-200 dark:bg-positive-900/20 dark:text-positive-400",
        negative:
          "border-transparent bg-negative-100 text-negative-800 hover:bg-negative-200 dark:bg-negative-900/20 dark:text-negative-400",
        neutral:
          "border-transparent bg-neutral-100 text-neutral-800 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300",
        
        // Status variants
        success:
          "border-transparent bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400",
        warning:
          "border-transparent bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400",
        info:
          "border-transparent bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400",
        
        // Gradient variants
        gradient:
          "border-transparent bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 shadow-sm",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "px-2 py-0.5 text-xs rounded-md",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Badge = React.forwardRef(({ className, variant, size, ...props }, ref) => {
  return (
    <div 
      ref={ref}
      className={cn(badgeVariants({ variant, size }), className)} 
      {...props} 
    />
  )
})
Badge.displayName = "Badge"

// Sentiment Badge with icon support
const SentimentBadge = React.forwardRef(({ 
  sentiment, 
  score, 
  showScore = true, 
  className, 
  ...props 
}, ref) => {
  const getVariant = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive':
        return 'positive'
      case 'negative':
        return 'negative'
      case 'neutral':
        return 'neutral'
      default:
        return 'neutral'
    }
  }

  const getEmoji = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive':
        return '😊'
      case 'negative':
        return '😠'
      case 'neutral':
        return '😐'
      default:
        return '😐'
    }
  }

  return (
    <Badge 
      ref={ref}
      variant={getVariant(sentiment)} 
      className={cn("gap-1", className)}
      {...props}
    >
      <span>{getEmoji(sentiment)}</span>
      <span className="capitalize">{sentiment}</span>
      {showScore && score !== undefined && (
        <span className="ml-1 font-mono">({Math.round(score * 100)}%)</span>
      )}
    </Badge>
  )
})
SentimentBadge.displayName = "SentimentBadge"

// Status Badge for notifications and alerts
const StatusBadge = React.forwardRef(({ 
  status, 
  count, 
  showCount = true, 
  className, 
  ...props 
}, ref) => {
  const getVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'online':
      case 'active':
      case 'success':
        return 'success'
      case 'warning':
      case 'pending':
        return 'warning'
      case 'error':
      case 'offline':
      case 'failed':
        return 'destructive'
      case 'info':
        return 'info'
      default:
        return 'secondary'
    }
  }

  return (
    <Badge 
      ref={ref}
      variant={getVariant(status)} 
      className={cn("gap-1", className)}
      {...props}
    >
      <span className="capitalize">{status}</span>
      {showCount && count !== undefined && count > 0 && (
        <span className="ml-1 bg-white/20 rounded-full px-1.5 py-0.5 text-xs font-mono">
          {count}
        </span>
      )}
    </Badge>
  )
})
StatusBadge.displayName = "StatusBadge"

export { Badge, SentimentBadge, StatusBadge, badgeVariants }