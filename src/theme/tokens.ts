/**
 * ComplianceFlow Enterprise Design System Tokens
 * Reusable theme tokens, color palettes, typography, status indicators, and component variants.
 */

export const colors = {
  // Brand Primary (Compliance Blue)
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6', // Main Primary
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },
  // Brand Secondary (Corporate Indigo)
  secondary: {
    50: '#ee2f6',
    100: '#e0e7ff',
    200: '#c7d2fe',
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#6366f1',
    600: '#4f46e5',
    700: '#4338ca',
    800: '#3730a3',
    900: '#312e81',
    950: '#1e1b4b',
  },
  // Status - Success / Compliant (Emerald)
  success: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981', // Main Success
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
    950: '#022c22',
  },
  // Status - Warning / Expiring Soon (Amber)
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b', // Main Warning
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03',
  },
  // Status - Danger / Expired / Critical (Rose)
  danger: {
    50: '#fff1f2',
    100: '#ffe4e6',
    200: '#fecdd3',
    300: '#fda4af',
    400: '#fb7185',
    500: '#f43f5e', // Main Danger
    600: '#e11d48',
    700: '#be123c',
    800: '#9f1239',
    900: '#881337',
    950: '#4c0519',
  },
  // Status - Info / System (Sky Blue)
  info: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9', // Main Info
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
    950: '#082f49',
  },
  // Neutral - Canvas & Surface (Slate)
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
    900: '#0f172a',
    950: '#020617',
  },
} as const;

export const statusColors = {
  success: {
    bgLight: 'bg-emerald-50',
    bgDark: 'dark:bg-emerald-950/60',
    borderLight: 'border-emerald-200',
    borderDark: 'dark:border-emerald-800',
    textLight: 'text-emerald-800',
    textDark: 'dark:text-emerald-300',
    icon: 'text-emerald-500',
    badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  },
  warning: {
    bgLight: 'bg-amber-50',
    bgDark: 'dark:bg-amber-950/60',
    borderLight: 'border-amber-200',
    borderDark: 'dark:border-amber-800',
    textLight: 'text-amber-800',
    textDark: 'dark:text-amber-300',
    icon: 'text-amber-500',
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  },
  danger: {
    bgLight: 'bg-rose-50',
    bgDark: 'dark:bg-rose-950/60',
    borderLight: 'border-rose-200',
    borderDark: 'dark:border-rose-800',
    textLight: 'text-rose-800',
    textDark: 'dark:text-rose-300',
    icon: 'text-rose-500',
    badge: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
  },
  info: {
    bgLight: 'bg-blue-50',
    bgDark: 'dark:bg-blue-950/60',
    borderLight: 'border-blue-200',
    borderDark: 'dark:border-blue-800',
    textLight: 'text-blue-800',
    textDark: 'dark:text-blue-300',
    icon: 'text-blue-500',
    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
  },
  neutral: {
    bgLight: 'bg-slate-50',
    bgDark: 'dark:bg-slate-800/60',
    borderLight: 'border-slate-200',
    borderDark: 'dark:border-slate-700',
    textLight: 'text-slate-800',
    textDark: 'dark:text-slate-200',
    icon: 'text-slate-500',
    badge: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
  },
} as const;

export const typography = {
  fontFamily: {
    sans: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    display: "'Plus Jakarta Sans', system-ui, sans-serif",
    mono: "'JetBrains Mono', monospace",
  },
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }], // 12px
    sm: ['0.875rem', { lineHeight: '1.25rem' }], // 14px
    base: ['1rem', { lineHeight: '1.5rem' }], // 16px
    lg: ['1.125rem', { lineHeight: '1.75rem' }], // 18px
    xl: ['1.25rem', { lineHeight: '1.75rem' }], // 20px
    '2xl': ['1.5rem', { lineHeight: '2rem' }], // 24px
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }], // 36px
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
} as const;

export const spacing = {
  xs: '0.5rem', // 8px
  sm: '0.75rem', // 12px
  md: '1rem', // 16px
  lg: '1.5rem', // 24px
  xl: '2rem', // 32px
  '2xl': '3rem', // 48px
} as const;

export const borderRadius = {
  none: '0px',
  sm: '0.375rem', // 6px
  md: '0.5rem', // 8px
  lg: '0.75rem', // 12px
  xl: '1rem', // 16px
  '2xl': '1.5rem', // 24px
  full: '9999px',
} as const;

export const shadows = {
  none: 'none',
  xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  glow: '0 0 20px -3px rgba(59, 130, 246, 0.4)',
} as const;

export const buttonVariants = {
  primary: 'bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 shadow-2xs border border-slate-900 dark:border-slate-100 transition-all font-medium rounded-lg',
  secondary: 'bg-white hover:bg-slate-50 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs transition-all font-medium rounded-lg',
  outline: 'border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 transition-all font-medium rounded-lg',
  ghost: 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 transition-all font-medium rounded-lg',
  danger: 'bg-rose-700 hover:bg-rose-800 text-white shadow-2xs border border-rose-700 transition-all font-medium rounded-lg',
  success: 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-2xs border border-emerald-700 transition-all font-medium rounded-lg',
  warning: 'bg-amber-700 hover:bg-amber-800 text-white shadow-2xs border border-amber-700 transition-all font-medium rounded-lg',
  info: 'bg-slate-800 hover:bg-slate-700 text-white shadow-2xs border border-slate-800 transition-all font-medium rounded-lg',
} as const;

export const cardVariants = {
  default: 'bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs rounded-lg',
  elevated: 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm rounded-lg',
  bordered: 'bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg',
  interactive: 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 transition-all cursor-pointer rounded-lg',
  flat: 'bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 rounded-lg',
  glass: 'bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs',
} as const;

export const inputVariants = {
  default: 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-1 focus:ring-slate-900 focus:border-slate-900 dark:focus:ring-slate-400 dark:focus:border-slate-400 shadow-2xs transition-all',
  filled: 'bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50 text-slate-900 dark:text-slate-100 rounded-lg focus:bg-white dark:focus:bg-slate-900 focus:border-slate-900 dark:focus:border-slate-400 transition-all',
  error: 'bg-white dark:bg-slate-900 border border-rose-500 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-1 focus:ring-rose-500',
  success: 'bg-white dark:bg-slate-900 border border-emerald-500 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-1 focus:ring-emerald-500',
} as const;

export const badgeVariants = {
  active: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80 font-medium rounded-md',
  pending: 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/80 font-medium rounded-md',
  expired: 'bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/80 font-medium rounded-md',
  info: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-medium rounded-md',
  neutral: 'bg-slate-50 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300 border border-slate-200 dark:border-slate-700/80 font-medium rounded-md',
  outline: 'bg-transparent text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-medium rounded-md',
} as const;

export const themeTokens = {
  colors,
  statusColors,
  typography,
  spacing,
  borderRadius,
  shadows,
  buttonVariants,
  cardVariants,
  inputVariants,
  badgeVariants,
} as const;

export default themeTokens;
