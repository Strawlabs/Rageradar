import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm hover:shadow-md",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground shadow-sm hover:shadow-md",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm hover:shadow-md",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        gradient: "bg-gradient-to-r from-primary via-primary/90 to-primary/80 text-primary-foreground hover:from-primary/90 hover:via-primary/80 hover:to-primary/70 shadow-lg hover:shadow-xl",
        success: "bg-positive-500 text-white hover:bg-positive-600 shadow-sm hover:shadow-md",
        warning: "bg-yellow-500 text-white hover:bg-yellow-600 shadow-sm hover:shadow-md",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8 rounded-lg",
        "icon-lg": "h-12 w-12 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ 
  className, 
  variant, 
  size, 
  asChild = false, 
  loading = false,
  success = false,
  error = false,
  ...props 
}, ref) => {
  const Comp = asChild ? Slot : "button"
  
  // Enhanced button states
  const getButtonState = () => {
    if (loading) return 'loading';
    if (success) return 'success';
    if (error) return 'error';
    return 'default';
  };

  const buttonState = getButtonState();
  
  return (
    <Comp
      className={cn(
        buttonVariants({ variant, size }),
        // Enhanced interactive states
        'transform-gpu transition-all duration-200',
        'hover:scale-105 active:scale-95',
        'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        'disabled:hover:scale-100 disabled:active:scale-100',
        // State-specific styles
        buttonState === 'success' && 'bg-green-500 hover:bg-green-600 text-white border-green-500',
        buttonState === 'error' && 'bg-red-500 hover:bg-red-600 text-white border-red-500',
        buttonState === 'loading' && 'cursor-not-allowed opacity-80',
        className
      )}
      ref={ref}
      disabled={loading || props.disabled}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button, buttonVariants }