import theme from './theme';

// Theme utility functions for consistent styling
export const getStatusColor = (status: string, type: 'order' | 'payment' = 'order') => {
  if (type === 'order') {
    return theme.colors.orderStatus[status as keyof typeof theme.colors.orderStatus] || theme.colors.warning;
  }
  return theme.colors.paymentStatus[status as keyof typeof theme.colors.paymentStatus] || theme.colors.warning;
};

export const getShadowStyle = (size: 'small' | 'medium' | 'large' = 'medium') => {
  return theme.shadows[size];
};

export const getBorderRadius = (size: 'sm' | 'md' | 'lg' | 'xl' = 'md') => {
  return theme.borderRadius[size];
};

export const getSpacing = (size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' = 'md') => {
  return theme.spacing[size];
};

export const getFontSize = (size: 'title' | 'subtitle' | 'button' | 'link' | 'caption' | 'small' = 'subtitle') => {
  return theme.fontSizes[size];
};

// Common style patterns
export const commonStyles = {
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: getBorderRadius('md'),
    ...getShadowStyle('medium'),
  },
  
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: getBorderRadius('md'),
    paddingVertical: getSpacing('sm'),
    paddingHorizontal: getSpacing('md'),
  },
  
  buttonText: {
    color: theme.colors.buttonText,
    fontSize: getFontSize('button'),
    fontFamily: theme.fonts.bold,
    textAlign: 'center' as const,
  },
  
  input: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: getBorderRadius('sm'),
    paddingHorizontal: getSpacing('md'),
    paddingVertical: getSpacing('sm'),
    fontSize: getFontSize('subtitle'),
    color: theme.colors.text,
  },
  
  sectionHeader: {
    fontSize: getFontSize('title'),
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
    marginBottom: getSpacing('sm'),
  },
  
  subtitle: {
    fontSize: getFontSize('subtitle'),
    color: theme.colors.subtitle,
    fontFamily: theme.fonts.regular,
  },
  
  divider: {
    height: 1,
    backgroundColor: theme.colors.divider,
    marginVertical: getSpacing('md'),
  },
  
  badge: {
    paddingHorizontal: getSpacing('sm'),
    paddingVertical: getSpacing('xs'),
    borderRadius: getBorderRadius('lg'),
    alignSelf: 'flex-start' as const,
  },
  
  badgeText: {
    fontSize: getFontSize('caption'),
    fontFamily: theme.fonts.bold,
  },
};

// Color utility functions
export const getBadgeColor = (type: 'success' | 'warning' | 'error' | 'info' | 'default') => {
  switch (type) {
    case 'success':
      return { backgroundColor: theme.colors.success, color: theme.colors.buttonText };
    case 'warning':
      return { backgroundColor: theme.colors.warning, color: theme.colors.buttonText };
    case 'error':
      return { backgroundColor: theme.colors.error, color: theme.colors.buttonText };
    case 'info':
      return { backgroundColor: theme.colors.info, color: theme.colors.buttonText };
    default:
      return { backgroundColor: theme.colors.surface, color: theme.colors.text };
  }
};

export const getGradientColors = (type: 'primary' | 'success' | 'warning' | 'error' | 'flashSale' | 'premium') => {
  switch (type) {
    case 'primary':
      return [theme.colors.primary, theme.colors.secondary];
    case 'success':
      return [theme.colors.success, '#2E7D32'];
    case 'warning':
      return [theme.colors.warning, '#F57C00'];
    case 'error':
      return [theme.colors.error, '#D32F2F'];
    case 'flashSale':
      return [theme.colors.flashSale, '#FF5252'];
    case 'premium':
      return [theme.colors.premium, '#FFC107'];
    default:
      return [theme.colors.primary, theme.colors.secondary];
  }
};

export default theme;
