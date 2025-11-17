/**
 * Theme configuration for RestoreMyPhoto
 * Premium photography app aesthetic with muted gold and black accents
 */

export const colors = {
  // Primary colors
  primary: '#D4AF37', // Muted gold
  primaryLight: '#E5C158',
  primaryDark: '#B8941F',

  // Background colors
  background: '#0A0A0A', // Deep black
  backgroundLight: '#1A1A1A',
  backgroundElevated: '#2A2A2A',

  // Text colors
  text: '#FFFFFF',
  textSecondary: '#CCCCCC',
  textTertiary: '#999999',
  textMuted: '#666666',

  // Accent colors
  accent: '#D4AF37',
  accentLight: '#F5F5F5',

  // Status colors
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  info: '#2196F3',

  // UI elements
  border: '#333333',
  borderLight: '#444444',
  divider: '#2A2A2A',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(0, 0, 0, 0.5)',

  // Card backgrounds
  card: '#1A1A1A',
  cardElevated: '#252525',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  round: 9999,
};

export const typography = {
  // Font sizes
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 32,
    xxxl: 40,
  },

  // Font weights
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },

  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  gold: {
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
};

export const gradients = {
  primary: ['#1A1A1A', '#0A0A0A'],
  gold: ['#E5C158', '#D4AF37', '#B8941F'],
  dark: ['#2A2A2A', '#1A1A1A', '#0A0A0A'],
  overlay: ['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.7)'],
};

export const layout = {
  screenPadding: spacing.lg,
  cardPadding: spacing.md,
  maxContentWidth: 600,
};

export type Theme = {
  colors: typeof colors;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  typography: typeof typography;
  shadows: typeof shadows;
  gradients: typeof gradients;
  layout: typeof layout;
};

export const theme: Theme = {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
  gradients,
  layout,
};

export default theme;
