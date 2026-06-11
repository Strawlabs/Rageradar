// RageRadar Enterprise Design System
// Modern, clean, enterprise-ready design tokens and utilities

export const designSystem = {
  // Color Palette - Professional SaaS Colors
  colors: {
    // Primary Brand Colors
    primary: {
      50: '#eff6ff',
      100: '#dbeafe', 
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#2563eb', // Primary Blue
      600: '#1d4ed8',
      700: '#1e40af',
      800: '#1e3a8a',
      900: '#1e3a8a'
    },
    
    // Secondary - Teal
    secondary: {
      50: '#f0fdfa',
      100: '#ccfbf1',
      200: '#99f6e4',
      300: '#5eead4',
      400: '#2dd4bf',
      500: '#14b8a6', // Secondary Teal
      600: '#0d9488',
      700: '#0f766e',
      800: '#115e59',
      900: '#134e4a'
    },
    
    // Semantic Colors
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e', // Success Green
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d'
    },
    
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444', // Error Red
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d'
    },
    
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b', // Warning Amber
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f'
    },
    
    // Neutral Grays
    gray: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b', // Neutral Gray
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a'
    },
    
    // Background Colors
    background: {
      primary: '#ffffff',
      secondary: '#f8fafc',
      tertiary: '#f1f5f9',
      dark: '#0f172a'
    },
    
    // Text Colors
    text: {
      primary: '#0f172a',
      secondary: '#475569',
      tertiary: '#64748b',
      inverse: '#ffffff',
      muted: '#94a3b8'
    },
    
    // Border Colors
    border: {
      light: '#e2e8f0',
      medium: '#cbd5e1',
      dark: '#94a3b8'
    }
  },
  
  // Typography Scale
  typography: {
    fontFamily: {
      sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      mono: ['JetBrains Mono', 'Monaco', 'Consolas', 'monospace']
    },
    
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem'     // 48px
    },
    
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700'
    },
    
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75'
    }
  },
  
  // Spacing Scale (8px base)
  spacing: {
    0: '0',
    1: '0.25rem',  // 4px
    2: '0.5rem',   // 8px
    3: '0.75rem',  // 12px
    4: '1rem',     // 16px
    5: '1.25rem',  // 20px
    6: '1.5rem',   // 24px
    8: '2rem',     // 32px
    10: '2.5rem',  // 40px
    12: '3rem',    // 48px
    16: '4rem',    // 64px
    20: '5rem',    // 80px
    24: '6rem'     // 96px
  },
  
  // Border Radius
  borderRadius: {
    none: '0',
    sm: '0.25rem',   // 4px
    base: '0.5rem',  // 8px
    md: '0.75rem',   // 12px
    lg: '1rem',      // 16px
    xl: '1.5rem',    // 24px
    full: '9999px'
  },
  
  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)'
  },
  
  // Animation & Transitions
  animation: {
    duration: {
      fast: '150ms',
      normal: '200ms',
      slow: '300ms'
    },
    
    easing: {
      ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)'
    }
  },
  
  // Component Variants
  components: {
    button: {
      primary: {
        background: 'var(--color-primary-500)',
        color: 'var(--color-text-inverse)',
        hover: 'var(--color-primary-600)',
        shadow: 'var(--shadow-sm)'
      },
      secondary: {
        background: 'var(--color-background-primary)',
        color: 'var(--color-text-primary)',
        border: 'var(--color-border-medium)',
        hover: 'var(--color-gray-50)'
      },
      ghost: {
        background: 'transparent',
        color: 'var(--color-text-secondary)',
        hover: 'var(--color-gray-100)'
      }
    },
    
    card: {
      default: {
        background: 'var(--color-background-primary)',
        border: 'var(--color-border-light)',
        shadow: 'var(--shadow-sm)',
        borderRadius: 'var(--radius-lg)'
      },
      elevated: {
        background: 'var(--color-background-primary)',
        shadow: 'var(--shadow-md)',
        borderRadius: 'var(--radius-lg)'
      }
    },
    
    input: {
      default: {
        background: 'var(--color-background-primary)',
        border: 'var(--color-border-medium)',
        borderRadius: 'var(--radius-base)',
        focus: 'var(--color-primary-500)'
      }
    }
  }
};

// CSS Custom Properties Generator
export const generateCSSVariables = () => {
  const cssVars = {};
  
  // Colors
  Object.entries(designSystem.colors).forEach(([category, colors]) => {
    if (typeof colors === 'object' && !Array.isArray(colors)) {
      Object.entries(colors).forEach(([shade, value]) => {
        cssVars[`--color-${category}-${shade}`] = value;
      });
    } else {
      cssVars[`--color-${category}`] = colors;
    }
  });
  
  // Typography
  Object.entries(designSystem.typography.fontSize).forEach(([size, value]) => {
    cssVars[`--font-size-${size}`] = value;
  });
  
  // Spacing
  Object.entries(designSystem.spacing).forEach(([size, value]) => {
    cssVars[`--spacing-${size}`] = value;
  });
  
  // Border Radius
  Object.entries(designSystem.borderRadius).forEach(([size, value]) => {
    cssVars[`--radius-${size}`] = value;
  });
  
  // Shadows
  Object.entries(designSystem.shadows).forEach(([size, value]) => {
    cssVars[`--shadow-${size}`] = value;
  });
  
  return cssVars;
};

// Utility Classes
export const utilityClasses = {
  // Layout
  container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  
  // Flexbox
  flexCenter: 'flex items-center justify-center',
  flexBetween: 'flex items-center justify-between',
  flexCol: 'flex flex-col',
  
  // Grid
  gridCols2: 'grid grid-cols-1 md:grid-cols-2 gap-6',
  gridCols3: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
  gridCols4: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6',
  
  // Text
  textPrimary: 'text-gray-900',
  textSecondary: 'text-gray-600',
  textMuted: 'text-gray-500',
  
  // Backgrounds
  bgPrimary: 'bg-white',
  bgSecondary: 'bg-gray-50',
  bgTertiary: 'bg-gray-100',
  
  // Borders
  borderLight: 'border border-gray-200',
  borderMedium: 'border border-gray-300',
  
  // Shadows
  shadowSm: 'shadow-sm',
  shadowMd: 'shadow-md',
  shadowLg: 'shadow-lg',
  
  // Border Radius
  roundedSm: 'rounded-lg',
  roundedMd: 'rounded-xl',
  roundedLg: 'rounded-2xl',
  
  // Transitions
  transition: 'transition-all duration-200 ease-in-out',
  transitionFast: 'transition-all duration-150 ease-in-out',
  transitionSlow: 'transition-all duration-300 ease-in-out'
};

// Icon Components (using Lucide React icons)
export const iconComponents = {
  // Navigation Icons
  dashboard: 'BarChart3',
  reports: 'FileText',
  analysis: 'TrendingUp',
  mentions: 'MessageSquare',
  sites: 'Globe',
  settings: 'Settings',
  
  // Action Icons
  search: 'Search',
  filter: 'Filter',
  export: 'Download',
  share: 'Share2',
  edit: 'Edit2',
  delete: 'Trash2',
  add: 'Plus',
  
  // Status Icons
  success: 'CheckCircle',
  error: 'XCircle',
  warning: 'AlertTriangle',
  info: 'Info',
  
  // Data Icons
  trending_up: 'TrendingUp',
  trending_down: 'TrendingDown',
  activity: 'Activity',
  users: 'Users',
  
  // UI Icons
  chevron_down: 'ChevronDown',
  chevron_right: 'ChevronRight',
  chevron_left: 'ChevronLeft',
  chevron_up: 'ChevronUp',
  external_link: 'ExternalLink',
  close: 'X'
};

// Component Class Builders
export const buildButtonClasses = (variant = 'primary', size = 'base') => {
  // Base button classes
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  // Variant classes
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-sm',
    secondary: 'bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 focus:ring-blue-500 shadow-sm',
    ghost: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:ring-blue-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 shadow-sm'
  };
  
  // Size variations
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    base: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };
  
  const selectedVariant = variantClasses[variant] || variantClasses.primary;
  const selectedSize = sizeClasses[size] || sizeClasses.base;
  
  return `${baseClasses} ${selectedVariant} ${selectedSize}`;
};

export const buildCardClasses = (variant = 'default', hover = true) => {
  const baseClasses = 'bg-white rounded-lg border transition-all duration-200';
  
  const variantClasses = {
    default: 'border-gray-200 shadow-sm',
    base: 'border-gray-200 shadow-sm',
    elevated: 'border-gray-200 shadow-md',
    flat: 'border-gray-200',
    interactive: 'border-gray-200 shadow-sm cursor-pointer'
  };
  
  const hoverClasses = hover ? 'hover:shadow-md hover:border-gray-300' : '';
  
  return `${baseClasses} ${variantClasses[variant] || variantClasses.default} ${hoverClasses}`;
};

export const buildInputClasses = (variant = 'default', hasError = false) => {
  const baseClasses = 'block w-full rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0';
  
  const variantClasses = {
    default: 'px-3 py-2 text-sm',
    large: 'px-4 py-3 text-base'
  };
  
  const stateClasses = hasError 
    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500';
  
  return `${baseClasses} ${variantClasses[variant] || variantClasses.default} ${stateClasses}`;
};

export const buildBadgeClasses = (variant = 'info') => {
  const baseClasses = 'inline-flex items-center rounded-full font-medium';
  
  const variantClasses = {
    info: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    neutral: 'bg-gray-100 text-gray-800'
  };
  
  return `${baseClasses} ${variantClasses[variant] || variantClasses.info}`;
};

export default designSystem;