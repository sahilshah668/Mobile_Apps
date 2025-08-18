import APP_CONFIG from '../config/appConfig';

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  card: string;
  cardBorder: string;
  input: string;
  inputBorder: string;
  button: {
    primary: string;
    secondary: string;
    disabled: string;
  };
  status: {
    online: string;
    offline: string;
    pending: string;
  };
}

export interface ThemeTypography {
  fontFamily: {
    primary: string;
    secondary: string;
    mono: string;
  };
  fontSize: {
    xs: number;
    sm: number;
    base: number;
    lg: number;
    xl: number;
    '2xl': number;
    '3xl': number;
    '4xl': number;
  };
  fontWeight: {
    normal: string;
    medium: string;
    semibold: string;
    bold: string;
  };
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
  };
}

export interface ThemeSpacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
  '3xl': number;
}

export interface ThemeBorderRadius {
  none: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  full: number;
}

export interface Theme {
  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  borderRadius: ThemeBorderRadius;
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

export const createTheme = (): Theme => {
  const primaryColor = APP_CONFIG.store.branding?.colors?.primary || '#156BFF';
  const secondaryColor = APP_CONFIG.store.branding?.colors?.secondary || '#111827';
  const primaryFont = APP_CONFIG.fonts?.[0]?.familyName || 'System';

  return {
    colors: {
      primary: primaryColor,
      secondary: secondaryColor,
      accent: APP_CONFIG.store.branding?.colors?.accent || '#F59E0B',
      success: APP_CONFIG.store.branding?.colors?.success || '#10B981',
      warning: APP_CONFIG.store.branding?.colors?.warning || '#F59E0B',
      error: APP_CONFIG.store.branding?.colors?.error || '#EF4444',
      background: APP_CONFIG.store.branding?.colors?.background || '#FFFFFF',
      surface: APP_CONFIG.store.branding?.colors?.surface || '#F8FAFC',
      text: APP_CONFIG.store.branding?.colors?.text || '#1F2937',
      textSecondary: APP_CONFIG.store.branding?.colors?.textSecondary || '#6B7280',
      border: APP_CONFIG.store.branding?.colors?.border || '#E5E7EB',
      card: '#FFFFFF',
      cardBorder: '#E5E7EB',
      input: '#FFFFFF',
      inputBorder: '#D1D5DB',
      button: {
        primary: primaryColor,
        secondary: secondaryColor,
        disabled: '#9CA3AF',
      },
      status: {
        online: '#10B981',
        offline: '#EF4444',
        pending: '#F59E0B',
      },
    },
    typography: {
      fontFamily: {
        primary: primaryFont,
        secondary: 'System',
        mono: 'Courier',
      },
      fontSize: {
        xs: 12,
        sm: 14,
        base: 16,
        lg: 18,
        xl: 20,
        '2xl': 24,
        '3xl': 30,
        '4xl': 36,
      },
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
      lineHeight: {
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.75,
      },
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      '2xl': 48,
      '3xl': 64,
    },
    borderRadius: {
      none: 0,
      sm: 4,
      md: 8,
      lg: 12,
      xl: 16,
      full: 9999,
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    },
  };
};

export const theme = createTheme();

export default theme;
