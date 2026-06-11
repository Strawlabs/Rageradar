import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "../../lib/utils"

const skeletonVariants = cva(
  "animate-pulse rounded-xl bg-muted",
  {
    variants: {
      variant: {
        default: "bg-muted",
        shimmer: "bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%] animate-[shimmer_2s_infinite]",
        pulse: "bg-muted animate-pulse",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Skeleton = React.forwardRef(({ className, variant, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(skeletonVariants({ variant }), className)}
      {...props}
    />
  )
})
Skeleton.displayName = "Skeleton"

// Pre-built skeleton components for common use cases
const SkeletonCard = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("space-y-3 p-6", className)} {...props}>
    <Skeleton className="h-4 w-2/3" />
    <Skeleton className="h-4 w-1/2" />
    <Skeleton className="h-20 w-full" />
    <div className="flex space-x-2">
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-8 w-16" />
    </div>
  </div>
))
SkeletonCard.displayName = "SkeletonCard"

const SkeletonChart = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("space-y-3", className)} {...props}>
    <div className="flex justify-between items-center">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-8 w-20" />
    </div>
    <Skeleton className="h-64 w-full" />
    <div className="flex justify-center space-x-4">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-4 w-16" />
    </div>
  </div>
))
SkeletonChart.displayName = "SkeletonChart"

const SkeletonTable = React.forwardRef(({ rows = 5, columns = 4, className, ...props }, ref) => (
  <div ref={ref} className={cn("space-y-2", className)} {...props}>
    {/* Header */}
    <div className="flex space-x-4">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className="h-8 flex-1" />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex space-x-4">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton key={colIndex} className="h-6 flex-1" />
        ))}
      </div>
    ))}
  </div>
))
SkeletonTable.displayName = "SkeletonTable"

const SkeletonAvatar = React.forwardRef(({ className, ...props }, ref) => (
  <Skeleton ref={ref} className={cn("h-10 w-10 rounded-full", className)} {...props} />
))
SkeletonAvatar.displayName = "SkeletonAvatar"

const SkeletonText = React.forwardRef(({ lines = 3, className, ...props }, ref) => (
  <div ref={ref} className={cn("space-y-2", className)} {...props}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton 
        key={i} 
        className={cn(
          "h-4",
          i === lines - 1 ? "w-3/4" : "w-full"
        )} 
      />
    ))}
  </div>
))
SkeletonText.displayName = "SkeletonText"

export { 
  Skeleton, 
  SkeletonCard, 
  SkeletonChart, 
  SkeletonTable, 
  SkeletonAvatar, 
  SkeletonText,
  skeletonVariants 
}