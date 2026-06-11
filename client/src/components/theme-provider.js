import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'

const ThemeProviderContext = createContext({
  theme: 'system',
  setTheme: () => null,
  actualTheme: 'light',
  systemTheme: 'light',
  toggleTheme: () => null,
})

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'rageradar-ui-theme',
  enableSystem = true,
  disableTransitionOnChange = false,
  ...props
}) {
  const [theme, setTheme] = useState(
    () => (typeof window !== 'undefined' && localStorage.getItem(storageKey)) || defaultTheme
  )
  const [systemTheme, setSystemTheme] = useState('light')
  const [actualTheme, setActualTheme] = useState('light')

  // Listen for system theme changes
  useEffect(() => {
    if (!enableSystem) return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e) => {
      setSystemTheme(e.matches ? 'dark' : 'light')
    }

    // Set initial system theme
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light')
    
    // Listen for changes
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [enableSystem])

  // Apply theme to DOM
  useEffect(() => {
    const root = window.document.documentElement

    // Disable transitions temporarily if requested
    if (disableTransitionOnChange) {
      const css = document.createElement('style')
      css.appendChild(
        document.createTextNode(
          `*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}`
        )
      )
      document.head.appendChild(css)

      // Re-enable transitions after a brief delay
      setTimeout(() => {
        document.head.removeChild(css)
      }, 1)
    }

    // Remove existing theme classes and attributes
    root.classList.remove('light', 'dark')
    root.removeAttribute('data-theme')

    let resolvedTheme = theme
    if (theme === 'system') {
      resolvedTheme = systemTheme
      // Don't set data-theme for system preference to allow CSS media queries
    } else {
      // Set explicit data-theme attribute for forced themes
      root.setAttribute('data-theme', theme)
    }

    // Add theme class for compatibility
    root.classList.add(resolvedTheme)
    
    // Set color-scheme for browser UI
    root.style.colorScheme = resolvedTheme

    // Update actual theme state
    setActualTheme(resolvedTheme)

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content',
        resolvedTheme === 'dark' ? '#0f172a' : '#ffffff'
      )
    }

  }, [theme, systemTheme, disableTransitionOnChange])

  const setThemeWithStorage = useCallback((newTheme) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, newTheme)
    }
    setTheme(newTheme)
  }, [storageKey])

  // Toggle between light and dark (skips system)
  const toggleTheme = useCallback(() => {
    if (theme === 'system') {
      // If currently system, toggle to opposite of current system theme
      setThemeWithStorage(systemTheme === 'dark' ? 'light' : 'dark')
    } else {
      // Toggle between light and dark
      setThemeWithStorage(theme === 'dark' ? 'light' : 'dark')
    }
  }, [theme, systemTheme, setThemeWithStorage])

  const value = {
    theme,
    setTheme: setThemeWithStorage,
    actualTheme,
    systemTheme,
    toggleTheme,
    // Helper methods
    isDark: actualTheme === 'dark',
    isLight: actualTheme === 'light',
    isSystem: theme === 'system',
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider')

  return context
}

// Hook for getting sentiment colors based on current theme
export const useSentimentColors = () => {
  const { actualTheme } = useTheme()
  
  return {
    positive: actualTheme === 'dark' ? 'hsl(142 69% 58%)' : 'hsl(142 76% 36%)',
    negative: actualTheme === 'dark' ? 'hsl(0 84% 70%)' : 'hsl(0 84% 60%)',
    neutral: actualTheme === 'dark' ? 'hsl(215 20% 65%)' : 'hsl(215 25% 27%)',
    mixed: actualTheme === 'dark' ? 'hsl(217 91% 70%)' : 'hsl(217 91% 60%)',
  }
}

// Hook for theme-aware CSS custom properties
export const useThemeCSS = () => {
  const { actualTheme } = useTheme()
  
  return {
    '--current-theme': actualTheme,
    '--theme-transition': 'var(--theme-transition-duration) var(--theme-transition-easing)',
  }
}