// RageRadar Enterprise Design System
// Modern, clean, enterprise-ready design following Notion x Tableau x Sprinklr standards

export const enterpriseDesign = {
  // Typography - Inter/IBM Plex Sans
  typography: {
    fontFamily: {
      sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      mono: ['IBM Plex Mono', 'Menlo', 'Monaco', 'Consolas', 'monospace']
    },
    
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],      // 12px
      sm: ['0.875rem', { lineHeight: '1.25rem' }],  // 14px - Body text
      base: ['1rem', { lineHeight: '1.5rem' }],     // 16px - Body text
      lg: ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
      xl: ['1.25rem', { lineHeight: '1.75rem' }],   // 20px - Headings
      '2xl': ['1.5rem', { lineHeight: '2rem' }],    // 24px - Headings
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }]  // 36px
    },
    
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700'
    }
  },

  // Enterprise Color Palette
  colors: {
    // Primary Blue (#2563EB)
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#2563eb', // Main Primary
      600: '#1d4ed8',
      700: '#1e40af',
      800: '#1e3a8a',
      900: '#1e3a8a'
    },
    
    // Secondary Teal (#14B8A6)
    secondary: {
      50: '#f0fdfa',
      100: '#ccfbf1',
      200: '#99f6e4',
      300: '#5eead4',
      400: '#2dd4bf',
      500: '#14b8a6', // Main Secondary
      600: '#0d9488',
      700: '#0f766e',
      800: '#115e59',
      900: '#134e4a'
    },
    
    // Positive Green (#22C55E)
    positive: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e', // Main Positive
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d'
    },
    
    // Negative Red (#EF4444)
    negative: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444', // Main Negative
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d'
    },
    
    // Neutral Gray/Slate (#64748B)
    neutral: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b', // Main Neutral
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a'
    },
    
    // Background colors
    background: {
      primary: '#ffffff',
      secondary: '#f8fafc',
      tertiary: '#f1f5f9'
    }
  },

  // Spacing System - 8/16/24px rhythm
  spacing: {
    0: '0px',
    1: '0.25rem',  // 4px
    2: '0.5rem',   // 8px  - Base unit
    3: '0.75rem',  // 12px
    4: '1rem',     // 16px - Double unit
    5: '1.25rem',  // 20px
    6: '1.5rem',   // 24px - Triple unit
    8: '2rem',     // 32px
    10: '2.5rem',  // 40px
    12: '3rem',    // 48px
    16: '4rem',    // 64px
    20: '5rem',    // 80px
    24: '6rem'     // 96px
  },

  // Border Radius - Rounded corners (8-16px)
  borderRadius: {
    none: '0px',
    sm: '0.25rem',   // 4px
    base: '0.5rem',  // 8px  - Standard
    md: '0.75rem',   // 12px
    lg: '1rem',      // 16px - Cards/buttons
    xl: '1.5rem',    // 24px
    '2xl': '2rem',   // 32px
    full: '9999px'   // Pills
  },

  // Shadows - Subtle layering
  shadows: {
    xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    base: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    md: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    lg: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    xl: '0 25px 50px -12px rgb(0 0 0 / 0.25)'
  },

  // Component Styles
  components: {
    // KPI Cards
    kpiCard: {
      base: 'bg-white rounded-lg p-6 shadow-sm border border-neutral-200 hover:shadow-md transition-all duration-200',
      trend: {
        up: 'text-positive-600',
        down: 'text-negative-600',
        neutral: 'text-neutral-500'
      }
    },
    
    // Navigation
    nav: {
      sidebar: 'w-64 bg-white border-r border-neutral-200 flex flex-col h-full',
      sidebarCollapsed: 'w-16',
      menuItem: 'flex items-center px-3 py-2.5 text-sm font-medium rounded-lg mx-2 transition-all duration-200',
      menuItemActive: 'bg-primary-50 text-primary-700 border-r-2 border-primary-500',
      menuItemInactive: 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50',
      pillHighlight: 'bg-primary-500 text-white rounded-full px-3 py-1 text-xs font-medium'
    },
    
    // Buttons
    button: {
      primary: 'bg-primary-500 hover:bg-primary-600 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200 shadow-sm',
      secondary: 'bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-medium px-4 py-2 rounded-lg transition-colors duration-200',
      ghost: 'hover:bg-neutral-100 text-neutral-700 font-medium px-4 py-2 rounded-lg transition-colors duration-200',
      pill: 'bg-primary-500 hover:bg-primary-600 text-white font-medium px-6 py-2 rounded-full transition-colors duration-200 shadow-sm'
    },
    
    // Input Fields
    input: {
      base: 'w-full px-4 py-2.5 border border-neutral-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200',
      search: 'w-full px-4 py-2.5 pl-10 border border-neutral-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200'
    },
    
    // Charts
    chart: {
      container: 'bg-white rounded-lg p-6 shadow-sm border border-neutral-200',
      grid: 'stroke-neutral-200',
      tooltip: 'bg-neutral-900 text-white px-3 py-2 rounded-lg text-sm shadow-lg'
    },
    
    // Tables
    table: {
      container: 'bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden',
      header: 'bg-neutral-50 px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider',
      row: 'px-6 py-4 whitespace-nowrap text-sm text-neutral-900 hover:bg-neutral-50 transition-colors duration-150',
      rowAlternate: 'bg-neutral-25'
    }
  },

  // Animation & Transitions
  animation: {
    transition: {
      fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
      base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
      slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)'
    },
    
    hover: {
      scale: 'transform hover:scale-105 transition-transform duration-200',
      lift: 'hover:shadow-md transition-shadow duration-200'
    }
  }
};

// Modern Icon Library (Feather/Lucide style - thin, modern)
export const modernIcons = {
  // Navigation
  dashboard: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z',
  reports: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  analysis: 'M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
  mentions: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
  sites: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9',
  settings: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
  
  // Actions
  search: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  filter: 'M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z',
  download: 'M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  export: 'M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  share: 'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z',
  
  // Trends & Stats
  trendingUp: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
  trendingDown: 'M13 17h8m0 0V9m0 8l-8-8-4 4-6-6',
  activity: 'M22 12h-4l-3 9L9 3l-3 9H2',
  
  // UI Elements
  chevronDown: 'M19 9l-7 7-7-7',
  chevronRight: 'M9 5l7 7-7 7',
  chevronLeft: 'M15 19l-7-7 7-7',
  plus: 'M12 6v6m0 0v6m0-6h6m-6 0H6',
  x: 'M6 18L18 6M6 6l12 12',
  check: 'M5 13l4 4L19 7',
  
  // Notifications
  bell: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
  
  // User
  user: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  users: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z',
  
  // Theme
  sun: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z',
  moon: 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z'
};

// Icon Component Builder
export const ModernIcon = ({ name, className = 'w-5 h-5', strokeWidth = 1.5 }) => {
  const path = modernIcons[name];
  if (!path) return null;
  
  return (
    <svg 
      className={className} 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
      strokeWidth={strokeWidth}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
};

// Utility Functions
export const getEnterpriseColor = (colorPath) => {
  const keys = colorPath.split('.');
  let result = enterpriseDesign.colors;
  
  for (const key of keys) {
    result = result[key];
    if (!result) return null;
  }
  
  return result;
};

export const buildEnterpriseClasses = (component, variant = 'base') => {
  return enterpriseDesign.components[component]?.[variant] || '';
};

export default enterpriseDesign;