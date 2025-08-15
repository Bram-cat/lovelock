export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;
  textOnPrimary: string;
  textOnSecondary: string;
  border: string;
  card: string;
  error: string;
  success: string;
  warning: string;
  gradient: string[];
  accent: string;
  highlight: string;
  shadow: string;
  // Sign-out button styles
  signOutButton: {
    backgroundColor: string;
    textColor: string;
    borderColor: string;
    hoverBackgroundColor: string;
  };
  // Premium button styles
  premiumButton: {
    backgroundColor: string;
    textColor: string;
    borderColor: string;
    hoverBackgroundColor: string;
  };
}

// Light Theme (Default)
export const lightTheme: ThemeColors = {
  primary: '#667eea',
  secondary: '#764ba2',
  background: '#f8fafc',
  surface: '#ffffff',
  text: '#1f2937',
  textSecondary: '#6b7280',
  textMuted: '#9ca3af',
  textInverse: '#ffffff',
  textOnPrimary: '#ffffff',
  textOnSecondary: '#ffffff',
  border: '#e5e7eb',
  card: '#ffffff',
  error: '#ef4444',
  success: '#10b981',
  warning: '#f59e0b',
  gradient: ['#667eea', '#764ba2'],
  accent: '#f093fb',
  highlight: '#fef3c7',
  shadow: 'rgba(0, 0, 0, 0.1)',
  signOutButton: {
    backgroundColor: '#fee2e2',
    textColor: '#dc2626',
    borderColor: '#fecaca',
    hoverBackgroundColor: '#fecaca',
  },
  premiumButton: {
    backgroundColor: '#fef3c7',
    textColor: '#d97706',
    borderColor: '#fde68a',
    hoverBackgroundColor: '#fde68a',
  },
};

// Dark Theme
export const darkTheme: ThemeColors = {
  primary: '#818cf8',
  secondary: '#a78bfa',
  background: '#0f172a',
  surface: '#1e293b',
  text: '#f1f5f9',
  textSecondary: '#94a3b8',
  textMuted: '#64748b',
  textInverse: '#1f2937',
  textOnPrimary: '#ffffff',
  textOnSecondary: '#ffffff',
  border: '#334155',
  card: '#1e293b',
  error: '#f87171',
  success: '#34d399',
  warning: '#fbbf24',
  gradient: ['#818cf8', '#a78bfa'],
  accent: '#f472b6',
  highlight: '#374151',
  shadow: 'rgba(0, 0, 0, 0.3)',
  signOutButton: {
    backgroundColor: '#450a0a',
    textColor: '#f87171',
    borderColor: '#7f1d1d',
    hoverBackgroundColor: '#7f1d1d',
  },
  premiumButton: {
    backgroundColor: '#451a03',
    textColor: '#fbbf24',
    borderColor: '#92400e',
    hoverBackgroundColor: '#92400e',
  },
};

// Coffee Theme - Warm browns and creams
export const coffeeTheme: ThemeColors = {
  primary: '#8b4513',
  secondary: '#d2691e',
  background: '#faf6f2',
  surface: '#f5f0e8',
  text: '#3e2723',
  textSecondary: '#5d4037',
  textMuted: '#8d6e63',
  textInverse: '#fff8f0',
  textOnPrimary: '#ffffff',
  textOnSecondary: '#ffffff',
  border: '#d7ccc8',
  card: '#efebe9',
  error: '#d32f2f',
  success: '#388e3c',
  warning: '#f57c00',
  gradient: ['#8b4513', '#d2691e'],
  accent: '#ff8a65',
  highlight: '#fff3e0',
  shadow: 'rgba(184, 134, 11, 0.2)',
  signOutButton: {
    backgroundColor: '#fef3c7',
    textColor: '#d97706',
    borderColor: '#fde68a',
    hoverBackgroundColor: '#fde68a',
  },
  premiumButton: {
    backgroundColor: '#fef3c7',
    textColor: '#b45309',
    borderColor: '#fde68a',
    hoverBackgroundColor: '#fde68a',
  },
};

// Tangy Theme - Vibrant oranges and yellows
export const tangyTheme: ThemeColors = {
  primary: '#ff6b35',
  secondary: '#f7931e',
  background: '#fffbf5',
  surface: '#fff8f0',
  text: '#2d1b14',
  textSecondary: '#8d4e2a',
  textMuted: '#bf7c3f',
  textInverse: '#fff8f0',
  textOnPrimary: '#ffffff',
  textOnSecondary: '#ffffff',
  border: '#ffcc80',
  card: '#fff3e0',
  error: '#e53e3e',
  success: '#38a169',
  warning: '#dd6b20',
  gradient: ['#ff6b35', '#f7931e'],
  accent: '#ff9500',
  highlight: '#fed7aa',
  shadow: 'rgba(255, 165, 0, 0.2)',
  signOutButton: {
    backgroundColor: '#fed7aa',
    textColor: '#ea580c',
    borderColor: '#fdba74',
    hoverBackgroundColor: '#fdba74',
  },
  premiumButton: {
    backgroundColor: '#fef3c7',
    textColor: '#d97706',
    borderColor: '#fde68a',
    hoverBackgroundColor: '#fde68a',
  },
};

// Ocean Theme - Blues and teals
export const oceanTheme: ThemeColors = {
  primary: '#0891b2',
  secondary: '#06b6d4',
  background: '#f0f9ff',
  surface: '#e0f7fa',
  text: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#64748b',
  textInverse: '#e0f7fa',
  textOnPrimary: '#ffffff',
  textOnSecondary: '#ffffff',
  border: '#b0e7f5',
  card: '#e6fffa',
  error: '#dc2626',
  success: '#059669',
  warning: '#d97706',
  gradient: ['#0891b2', '#06b6d4'],
  accent: '#14b8a6',
  highlight: '#cffafe',
  shadow: 'rgba(34, 139, 34, 0.2)',
  signOutButton: {
    backgroundColor: '#dcfce7',
    textColor: '#16a34a',
    borderColor: '#bbf7d0',
    hoverBackgroundColor: '#bbf7d0',
  },
  premiumButton: {
    backgroundColor: '#fef3c7',
    textColor: '#ca8a04',
    borderColor: '#fde68a',
    hoverBackgroundColor: '#fde68a',
  },
};

// Forest Theme - Greens and earth tones
export const forestTheme: ThemeColors = {
  primary: '#16a34a',
  secondary: '#22c55e',
  background: '#f0fdf4',
  surface: '#ecfdf5',
  text: '#14532d',
  textSecondary: '#166534',
  textMuted: '#4ade80',
  textInverse: '#ecfdf5',
  textOnPrimary: '#ffffff',
  textOnSecondary: '#ffffff',
  border: '#bbf7d0',
  card: '#dcfce7',
  error: '#dc2626',
  success: '#059669',
  warning: '#d97706',
  gradient: ['#8b5cf6', '#a78bfa'],
  accent: '#06b6d4',
  highlight: '#e9d5ff',
  shadow: 'rgba(147, 51, 234, 0.2)',
  signOutButton: {
    backgroundColor: '#f3e8ff',
    textColor: '#9333ea',
    borderColor: '#e9d5ff',
    hoverBackgroundColor: '#e9d5ff',
  },
  premiumButton: {
    backgroundColor: '#fef3c7',
    textColor: '#d97706',
    borderColor: '#fde68a',
    hoverBackgroundColor: '#fde68a',
  },
};

// Sunset Theme - Warm pinks and purples
export const sunsetTheme: ThemeColors = {
  primary: '#ec4899',
  secondary: '#f97316',
  background: '#fdf2f8',
  surface: '#fce7f3',
  text: '#831843',
  textSecondary: '#be185d',
  textMuted: '#f472b6',
  textInverse: '#fce7f3',
  textOnPrimary: '#ffffff',
  textOnSecondary: '#ffffff',
  border: '#fbcfe8',
  card: '#fce7f3',
  error: '#dc2626',
  success: '#059669',
  warning: '#d97706',
  gradient: ['#ec4899', '#f97316'],
  accent: '#a855f7',
  highlight: '#fde68a',
  shadow: 'rgba(236, 72, 153, 0.2)',
  signOutButton: {
    backgroundColor: '#fdf2f8',
    textColor: '#be185d',
    borderColor: '#fbcfe8',
    hoverBackgroundColor: '#fbcfe8',
  },
  premiumButton: {
    backgroundColor: '#fef3c7',
    textColor: '#d97706',
    borderColor: '#fde68a',
    hoverBackgroundColor: '#fde68a',
  },
};

// Midnight Theme - Deep blues and purples
export const midnightTheme: ThemeColors = {
  primary: '#3730a3',
  secondary: '#6366f1',
  background: '#0c0a1a',
  surface: '#1e1b3a',
  text: '#e0e7ff',
  textSecondary: '#a5b4fc',
  textMuted: '#6366f1',
  textInverse: '#0c0a1a',
  textOnPrimary: '#ffffff',
  textOnSecondary: '#ffffff',
  border: '#312e81',
  card: '#1e1b3a',
  error: '#f87171',
  success: '#34d399',
  warning: '#fbbf24',
  gradient: ['#3730a3', '#6366f1'],
  accent: '#8b5cf6',
  highlight: '#312e81',
  shadow: 'rgba(55, 48, 163, 0.3)',
  signOutButton: {
    backgroundColor: '#1e1b4b',
    textColor: '#a78bfa',
    borderColor: '#4c1d95',
    hoverBackgroundColor: '#4c1d95',
  },
  premiumButton: {
    backgroundColor: '#451a03',
    textColor: '#fbbf24',
    borderColor: '#92400e',
    hoverBackgroundColor: '#92400e',
  },
};

// Rose Gold Theme - Elegant pinks and golds
export const roseGoldTheme: ThemeColors = {
  primary: '#e11d48',
  secondary: '#f59e0b',
  background: '#fef7f0',
  surface: '#fdf2f8',
  text: '#881337',
  textSecondary: '#be123c',
  textMuted: '#f472b6',
  textInverse: '#fdf2f8',
  textOnPrimary: '#ffffff',
  textOnSecondary: '#ffffff',
  border: '#fecaca',
  card: '#fef2f2',
  error: '#dc2626',
  success: '#059669',
  warning: '#d97706',
  gradient: ['#e11d48', '#f59e0b'],
  accent: '#f472b6',
  highlight: '#fed7d7',
  shadow: 'rgba(225, 29, 72, 0.15)',
  signOutButton: {
    backgroundColor: '#fef3c7',
    textColor: '#d97706',
    borderColor: '#fde68a',
    hoverBackgroundColor: '#fde68a',
  },
  premiumButton: {
    backgroundColor: '#fef3c7',
    textColor: '#b45309',
    borderColor: '#fde68a',
    hoverBackgroundColor: '#fde68a',
  },
};

// Lavender Theme - Soft purples and blues
export const lavenderTheme: ThemeColors = {
  primary: '#8b5cf6',
  secondary: '#a78bfa',
  background: '#faf5ff',
  surface: '#f3e8ff',
  text: '#581c87',
  textSecondary: '#7c3aed',
  textMuted: '#a78bfa',
  textInverse: '#f3e8ff',
  textOnPrimary: '#ffffff',
  textOnSecondary: '#ffffff',
  border: '#d8b4fe',
  card: '#f3e8ff',
  error: '#dc2626',
  success: '#059669',
  warning: '#d97706',
  gradient: ['#8b5cf6', '#a78bfa'],
  accent: '#06b6d4',
  highlight: '#e9d5ff',
  shadow: 'rgba(139, 92, 246, 0.15)',
  signOutButton: {
    backgroundColor: '#f3e8ff',
    textColor: '#9333ea',
    borderColor: '#e9d5ff',
    hoverBackgroundColor: '#e9d5ff',
  },
  premiumButton: {
    backgroundColor: '#fef3c7',
    textColor: '#d97706',
    borderColor: '#fde68a',
    hoverBackgroundColor: '#fde68a',
  },
};

// All available themes
export const themes = {
  light: lightTheme,
  dark: darkTheme,
  coffee: coffeeTheme,
  tangy: tangyTheme,
  ocean: oceanTheme,
  forest: forestTheme,
  sunset: sunsetTheme,
  midnight: midnightTheme,
  roseGold: roseGoldTheme,
  lavender: lavenderTheme,
};

export type ThemeName = keyof typeof themes;

// Theme metadata for UI display
export const themeMetadata: Record<ThemeName, { name: string; description: string; icon: string }> = {
  light: {
    name: 'Light',
    description: 'Clean and bright',
    icon: 'sunny',
  },
  dark: {
    name: 'Dark',
    description: 'Easy on the eyes',
    icon: 'moon',
  },
  coffee: {
    name: 'Coffee',
    description: 'Warm and cozy',
    icon: 'cafe',
  },
  tangy: {
    name: 'Tangy',
    description: 'Vibrant and energetic',
    icon: 'flame',
  },
  ocean: {
    name: 'Ocean',
    description: 'Cool and refreshing',
    icon: 'water',
  },
  forest: {
    name: 'Forest',
    description: 'Natural and calming',
    icon: 'leaf',
  },
  sunset: {
    name: 'Sunset',
    description: 'Romantic and warm',
    icon: 'heart',
  },
  midnight: {
    name: 'Midnight',
    description: 'Deep and mysterious',
    icon: 'star',
  },
  roseGold: {
    name: 'Rose Gold',
    description: 'Elegant and luxurious',
    icon: 'diamond',
  },
  lavender: {
    name: 'Lavender',
    description: 'Soft and dreamy',
    icon: 'flower',
  },
};
