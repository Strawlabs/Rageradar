import React from 'react'
import { useTheme } from './theme-provider'

// Icons for theme toggle
const SunIcon = ({ className = "h-4 w-4" }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="5" />
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
  </svg>
)

const MoonIcon = ({ className = "h-4 w-4" }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
)

const SystemIcon = ({ className = "h-4 w-4" }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
)

// Simple theme toggle button
export function ThemeToggle({ className = "", size = "default" }) {
  const { theme, setTheme, actualTheme } = useTheme()

  const sizeClasses = {
    sm: "h-8 w-8",
    default: "h-9 w-9",
    lg: "h-10 w-10"
  }

  const iconSizeClasses = {
    sm: "h-3 w-3",
    default: "h-4 w-4",
    lg: "h-5 w-5"
  }

  const handleToggle = () => {
    if (theme === 'light') {
      setTheme('dark')
    } else if (theme === 'dark') {
      setTheme('system')
    } else {
      setTheme('light')
    }
  }

  const getIcon = () => {
    if (theme === 'system') {
      return <SystemIcon className={iconSizeClasses[size]} />
    }
    return actualTheme === 'dark' 
      ? <MoonIcon className={iconSizeClasses[size]} />
      : <SunIcon className={iconSizeClasses[size]} />
  }

  const getLabel = () => {
    if (theme === 'system') return 'System theme'
    return actualTheme === 'dark' ? 'Dark theme' : 'Light theme'
  }

  return (
    <button
      onClick={handleToggle}
      className={`
        inline-flex items-center justify-center rounded-lg
        border border-input bg-background
        hover:bg-accent hover:text-accent-foreground
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
        disabled:pointer-events-none disabled:opacity-50
        theme-transition-colors
        ${sizeClasses[size]}
        ${className}
      `}
      title={getLabel()}
      aria-label={getLabel()}
    >
      {getIcon()}
    </button>
  )
}

// Dropdown theme selector
export function ThemeSelector({ className = "" }) {
  const { theme, setTheme, actualTheme } = useTheme()

  const themes = [
    { value: 'light', label: 'Light', icon: SunIcon },
    { value: 'dark', label: 'Dark', icon: MoonIcon },
    { value: 'system', label: 'System', icon: SystemIcon },
  ]

  return (
    <div className={`relative inline-block text-left ${className}`}>
      <select
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
        className="
          appearance-none bg-background border border-input rounded-lg
          px-3 py-2 pr-8 text-sm
          focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
          theme-transition-colors
        "
        aria-label="Select theme"
      >
        {themes.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
        <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  )
}

// Theme status indicator
export function ThemeIndicator({ showLabel = false, className = "" }) {
  const { theme, actualTheme, systemTheme } = useTheme()

  const getStatusText = () => {
    if (theme === 'system') {
      return `System (${systemTheme})`
    }
    return theme.charAt(0).toUpperCase() + theme.slice(1)
  }

  const getIndicatorColor = () => {
    if (actualTheme === 'dark') return 'bg-blue-500'
    return 'bg-yellow-500'
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`w-2 h-2 rounded-full ${getIndicatorColor()} theme-transition`} />
      {showLabel && (
        <span className="text-xs text-muted-foreground">
          {getStatusText()}
        </span>
      )}
    </div>
  )
}

// Hook for theme-aware styling
export function useThemeAwareStyle() {
  const { actualTheme, isDark, isLight } = useTheme()
  
  return {
    actualTheme,
    isDark,
    isLight,
    // Helper functions for conditional styling
    themeClass: (lightClass, darkClass) => isDark ? darkClass : lightClass,
    themeValue: (lightValue, darkValue) => isDark ? darkValue : lightValue,
    // CSS custom properties
    cssVars: {
      '--current-theme': actualTheme,
    }
  }
}