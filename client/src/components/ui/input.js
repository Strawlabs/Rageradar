import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "../../lib/utils"
import { Check, X, Loader2 } from "lucide-react"

const inputVariants = cva(
  "flex w-full rounded-xl border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-input hover:border-ring/50 focus-visible:border-ring",
        error: "border-destructive hover:border-destructive/80 focus-visible:border-destructive focus-visible:ring-destructive",
        success: "border-positive-500 hover:border-positive-600 focus-visible:border-positive-500 focus-visible:ring-positive-500",
        ghost: "border-0 bg-muted hover:bg-muted/80 focus-visible:bg-background focus-visible:ring-ring",
      },
      size: {
        default: "h-10",
        sm: "h-8 px-2 text-xs rounded-lg",
        lg: "h-12 px-4 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Input = React.forwardRef(({ className, type, variant, size, error, success, ...props }, ref) => {
  // Determine variant based on props
  const computedVariant = error ? "error" : success ? "success" : variant

  return (
    <input
      type={type}
      className={cn(inputVariants({ variant: computedVariant, size }), className)}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = "Input"

// Input with label and error message
const InputGroup = React.forwardRef(({ 
  label, 
  error, 
  success, 
  helperText, 
  required, 
  className,
  children,
  ...props 
}, ref) => {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      {children || <Input ref={ref} error={error} success={success} {...props} />}
      {(error || success || helperText) && (
        <p className={cn(
          "text-xs",
          error && "text-destructive",
          success && "text-positive-600",
          !error && !success && "text-muted-foreground"
        )}>
          {error || (success && "Valid") || helperText}
        </p>
      )}
    </div>
  )
})
InputGroup.displayName = "InputGroup"

export { Input, InputGroup, inputVariants }