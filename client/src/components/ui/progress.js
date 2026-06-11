import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { cva } from "class-variance-authority"
import { cn } from "../../lib/utils"

const progressVariants = cva(
  "relative w-full overflow-hidden rounded-full bg-secondary transition-all duration-300",
  {
    variants: {
      size: {
        default: "h-2",
        sm: "h-1",
        lg: "h-3",
        xl: "h-4",
      },
      variant: {
        default: "bg-secondary",
        success: "bg-positive-100",
        warning: "bg-yellow-100",
        error: "bg-negative-100",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  }
)

const indicatorVariants = cva(
  "h-full w-full flex-1 transition-all duration-500 ease-out",
  {
    variants: {
      variant: {
        default: "bg-primary",
        success: "bg-positive-500",
        warning: "bg-yellow-500",
        error: "bg-negative-500",
        gradient: "bg-gradient-to-r from-primary via-primary/90 to-primary/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Progress = React.forwardRef(({ 
  className, 
  value, 
  size, 
  variant, 
  showValue = false,
  animated = false,
  ...props 
}, ref) => (
  <div className="space-y-1">
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(progressVariants({ size, variant }), className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          indicatorVariants({ variant }),
          animated && "animate-pulse"
        )}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
    {showValue && (
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{Math.round(value || 0)}%</span>
        <span>100%</span>
      </div>
    )}
  </div>
))
Progress.displayName = ProgressPrimitive.Root.displayName

// Sentiment Progress for RageRadar
const SentimentProgress = React.forwardRef(({ 
  positive = 0, 
  negative = 0, 
  neutral = 0, 
  className,
  showLabels = true,
  ...props 
}, ref) => {
  const total = positive + negative + neutral
  const positivePercent = total > 0 ? (positive / total) * 100 : 0
  const negativePercent = total > 0 ? (negative / total) * 100 : 0
  const neutralPercent = total > 0 ? (neutral / total) * 100 : 0

  return (
    <div className={cn("space-y-2", className)} ref={ref} {...props}>
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div 
          className="bg-positive-500 transition-all duration-500"
          style={{ width: `${positivePercent}%` }}
        />
        <div 
          className="bg-neutral-400 transition-all duration-500"
          style={{ width: `${neutralPercent}%` }}
        />
        <div 
          className="bg-negative-500 transition-all duration-500"
          style={{ width: `${negativePercent}%` }}
        />
      </div>
      {showLabels && (
        <div className="flex justify-between text-xs">
          <span className="flex items-center gap-1 text-positive-600">
            <div className="w-2 h-2 rounded-full bg-positive-500" />
            Positive ({Math.round(positivePercent)}%)
          </span>
          <span className="flex items-center gap-1 text-neutral-600">
            <div className="w-2 h-2 rounded-full bg-neutral-400" />
            Neutral ({Math.round(neutralPercent)}%)
          </span>
          <span className="flex items-center gap-1 text-negative-600">
            <div className="w-2 h-2 rounded-full bg-negative-500" />
            Negative ({Math.round(negativePercent)}%)
          </span>
        </div>
      )}
    </div>
  )
})
SentimentProgress.displayName = "SentimentProgress"

export { Progress, SentimentProgress, progressVariants }