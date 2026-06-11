import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "../../lib/utils"

const cardVariants = cva(
  "rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-200",
  {
    variants: {
      variant: {
        default: "border-border hover:shadow-md",
        elevated: "shadow-lg hover:shadow-xl border-0",
        outline: "border-2 border-border hover:border-primary/50",
        ghost: "border-0 shadow-none bg-transparent",
        gradient: "bg-gradient-to-br from-card via-card to-muted/20 border-0 shadow-lg hover:shadow-xl",
      },
      padding: {
        default: "",
        none: "[&>*]:p-0",
        sm: "[&>*]:p-4",
        lg: "[&>*]:p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "default",
    },
  }
)

const Card = React.forwardRef(({ 
  className, 
  variant, 
  padding, 
  hoverable = false,
  clickable = false,
  ...props 
}, ref) => (
  <div
    ref={ref}
    className={cn(
      cardVariants({ variant, padding }),
      // Enhanced interactive states
      hoverable && 'transform-gpu transition-all duration-200 hover:scale-[1.02] hover:-translate-y-1',
      clickable && 'cursor-pointer hover:shadow-lg active:scale-[0.98]',
      (hoverable || clickable) && 'hover:shadow-md hover:shadow-primary/10',
      clickable && 'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      className
    )}
    tabIndex={clickable ? 0 : undefined}
    role={clickable ? 'button' : undefined}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef(({ className, children, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  >
    {children}
  </h3>
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }