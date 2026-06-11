/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#2563eb',
          600: '#1d4ed8',
          700: '#1e40af',
          800: '#1e3a8a',
          900: '#1e3a8a'
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a'
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        
        // ===== SENTIMENT ANALYSIS COLORS =====
        // CSS Variable-based sentiment colors for theme switching
        sentiment: {
          positive: {
            DEFAULT: "hsl(var(--sentiment-positive))",
            foreground: "hsl(var(--sentiment-positive-foreground))",
            light: "hsl(var(--sentiment-positive-light))",
            bg: "hsl(var(--sentiment-positive-bg))",
            border: "hsl(var(--sentiment-positive-border))",
          },
          negative: {
            DEFAULT: "hsl(var(--sentiment-negative))",
            foreground: "hsl(var(--sentiment-negative-foreground))",
            light: "hsl(var(--sentiment-negative-light))",
            bg: "hsl(var(--sentiment-negative-bg))",
            border: "hsl(var(--sentiment-negative-border))",
          },
          neutral: {
            DEFAULT: "hsl(var(--sentiment-neutral))",
            foreground: "hsl(var(--sentiment-neutral-foreground))",
            light: "hsl(var(--sentiment-neutral-light))",
            bg: "hsl(var(--sentiment-neutral-bg))",
            border: "hsl(var(--sentiment-neutral-border))",
          },
          mixed: {
            DEFAULT: "hsl(var(--sentiment-mixed))",
            foreground: "hsl(var(--sentiment-mixed-foreground))",
            light: "hsl(var(--sentiment-mixed-light))",
            bg: "hsl(var(--sentiment-mixed-bg))",
            border: "hsl(var(--sentiment-mixed-border))",
          },
        },
        
        // Legacy sentiment colors for backward compatibility
        positive: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d'
        },
        
        negative: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d'
        },
        
        neutral: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a'
        },
        
        // High contrast colors for accessibility
        contrast: {
          high: '#000000',
          medium: '#374151',
          low: '#6b7280',
        },
        // Accessible color combinations
        accessible: {
          'red-bg': '#dc2626',
          'red-text': '#ffffff',
          'gray-bg': '#f3f4f6',
          'gray-text': '#111827',
        }
      },
      // Improved focus ring utilities
      ringWidth: {
        '3': '3px',
      },
      ringOffsetWidth: {
        '3': '3px',
      },
      // Performance optimized transitions
      transitionDuration: {
        '200': '200ms',
        '250': '250ms',
        '350': '350ms',
        'theme': 'var(--theme-transition-duration)',
      },
      transitionTimingFunction: {
        'theme': 'var(--theme-transition-easing)',
      },
      // Accessibility-friendly font sizes
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1.5' }],
        'sm': ['0.875rem', { lineHeight: '1.5' }],
        'base': ['1rem', { lineHeight: '1.6' }],
        'lg': ['1.125rem', { lineHeight: '1.6' }],
        'xl': ['1.25rem', { lineHeight: '1.6' }],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-in-from-top": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(0)" },
        },
        "slide-in-from-bottom": {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        "slide-in-from-left": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "slide-in-from-right": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
        "slide-in-from-top": "slide-in-from-top 0.3s ease-out",
        "slide-in-from-bottom": "slide-in-from-bottom 0.3s ease-out",
        "slide-in-from-left": "slide-in-from-left 0.3s ease-out",
        "slide-in-from-right": "slide-in-from-right 0.3s ease-out",
        "shimmer": "shimmer 2s infinite",
      },
    },
  },
  plugins: [
    // Custom plugin for sentiment analysis and theme utilities
    function({ addUtilities, addComponents, theme }) {
      // Theme transition utilities
      const themeUtilities = {
        '.theme-transition': {
          transition: 'background-color var(--theme-transition-duration) var(--theme-transition-easing), border-color var(--theme-transition-duration) var(--theme-transition-easing), color var(--theme-transition-duration) var(--theme-transition-easing)',
        },
        '.theme-transition-all': {
          transition: 'all var(--theme-transition-duration) var(--theme-transition-easing)',
        },
        '.theme-transition-colors': {
          transition: 'background-color var(--theme-transition-duration) var(--theme-transition-easing), border-color var(--theme-transition-duration) var(--theme-transition-easing), color var(--theme-transition-duration) var(--theme-transition-easing), fill var(--theme-transition-duration) var(--theme-transition-easing), stroke var(--theme-transition-duration) var(--theme-transition-easing)',
        },
      }

      // Accessibility utilities
      const accessibilityUtilities = {
        '.focus-visible-ring': {
          '&:focus-visible': {
            outline: '2px solid hsl(var(--focus-ring-color))',
            outlineOffset: 'var(--focus-ring-offset)',
            borderRadius: 'calc(var(--radius) * 0.5)',
          }
        },
        '.focus-ring-sentiment-positive': {
          '&:focus-visible': {
            outline: '2px solid hsl(var(--sentiment-positive))',
            outlineOffset: 'var(--focus-ring-offset)',
          }
        },
        '.focus-ring-sentiment-negative': {
          '&:focus-visible': {
            outline: '2px solid hsl(var(--sentiment-negative))',
            outlineOffset: 'var(--focus-ring-offset)',
          }
        },
        '.focus-ring-sentiment-neutral': {
          '&:focus-visible': {
            outline: '2px solid hsl(var(--sentiment-neutral))',
            outlineOffset: 'var(--focus-ring-offset)',
          }
        },
        '.high-contrast': {
          filter: 'contrast(1.2)',
        },
        '.reduced-motion': {
          '@media (prefers-reduced-motion: reduce)': {
            animation: 'none !important',
            transition: 'none !important',
          }
        },
        '.screen-reader-only': {
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: '0',
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: '0',
        },
      }

      // Sentiment indicator utilities
      const sentimentUtilities = {
        '.sentiment-indicator': {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '0.75rem',
          height: '0.75rem',
          borderRadius: '50%',
          transition: 'all var(--theme-transition-duration) var(--theme-transition-easing)',
        },
        '.sentiment-indicator-positive': {
          backgroundColor: 'hsl(var(--sentiment-positive))',
        },
        '.sentiment-indicator-negative': {
          backgroundColor: 'hsl(var(--sentiment-negative))',
        },
        '.sentiment-indicator-neutral': {
          backgroundColor: 'hsl(var(--sentiment-neutral))',
        },
        '.sentiment-indicator-mixed': {
          backgroundColor: 'hsl(var(--sentiment-mixed))',
        },
      }

      // Sentiment card components
      const sentimentComponents = {
        '.sentiment-card': {
          padding: '1rem',
          borderRadius: 'var(--radius)',
          border: '1px solid',
          transition: 'all var(--theme-transition-duration) var(--theme-transition-easing)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          },
        },
        '.sentiment-card-positive': {
          backgroundColor: 'hsl(var(--sentiment-positive-bg))',
          borderColor: 'hsl(var(--sentiment-positive-border))',
          color: 'hsl(var(--sentiment-positive))',
        },
        '.sentiment-card-negative': {
          backgroundColor: 'hsl(var(--sentiment-negative-bg))',
          borderColor: 'hsl(var(--sentiment-negative-border))',
          color: 'hsl(var(--sentiment-negative))',
        },
        '.sentiment-card-neutral': {
          backgroundColor: 'hsl(var(--sentiment-neutral-bg))',
          borderColor: 'hsl(var(--sentiment-neutral-border))',
          color: 'hsl(var(--sentiment-neutral))',
        },
        '.sentiment-card-mixed': {
          backgroundColor: 'hsl(var(--sentiment-mixed-bg))',
          borderColor: 'hsl(var(--sentiment-mixed-border))',
          color: 'hsl(var(--sentiment-mixed))',
        },
      }

      addUtilities({
        ...themeUtilities,
        ...accessibilityUtilities,
        ...sentimentUtilities,
      })

      addComponents(sentimentComponents)
    }
  ],
}