import React from 'react';
import { Text as RNText, StyleSheet, TextStyle, TextProps as RNTextProps } from 'react-native';
import theme from '../../src/theme';
import { fontStyles } from '../../src/utils/fontLoader';

export interface TextProps extends RNTextProps {
  variant?: 'heading1' | 'heading2' | 'heading3' | 'heading4' | 'body1' | 'body2' | 'caption' | 'button' | 'input';
  color?: 'primary' | 'secondary' | 'text' | 'textSecondary' | 'success' | 'warning' | 'error' | 'accent';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  align?: 'left' | 'center' | 'right' | 'justify';
  style?: TextStyle;
  children: React.ReactNode;
}

export const Text: React.FC<TextProps> = ({
  variant = 'body1',
  color = 'text',
  weight,
  align = 'left',
  style,
  children,
  ...props
}) => {
  const textStyle = [
    styles.base,
    styles[variant],
    styles[color],
    weight && styles[weight],
    styles[align],
    style,
  ];

  return (
    <RNText style={textStyle} {...props}>
      {children}
    </RNText>
  );
};

const styles = StyleSheet.create({
  base: {
    fontFamily: theme.typography.fontFamily.primary,
    color: theme.colors.text,
  },
  
  // Variants
  heading1: {
    ...fontStyles.heading1,
  },
  heading2: {
    ...fontStyles.heading2,
  },
  heading3: {
    ...fontStyles.heading3,
  },
  heading4: {
    ...fontStyles.heading4,
  },
  body1: {
    ...fontStyles.body1,
  },
  body2: {
    ...fontStyles.body2,
  },
  caption: {
    ...fontStyles.caption,
  },
  button: {
    ...fontStyles.button,
  },
  input: {
    ...fontStyles.input,
  },
  
  // Colors
  primary: {
    color: theme.colors.primary,
  },
  secondary: {
    color: theme.colors.secondary,
  },
  text: {
    color: theme.colors.text,
  },
  textSecondary: {
    color: theme.colors.textSecondary,
  },
  success: {
    color: theme.colors.success,
  },
  warning: {
    color: theme.colors.warning,
  },
  error: {
    color: theme.colors.error,
  },
  accent: {
    color: theme.colors.accent,
  },
  
  // Weights
  normal: {
    fontWeight: theme.typography.fontWeight.normal,
  },
  medium: {
    fontWeight: theme.typography.fontWeight.medium,
  },
  semibold: {
    fontWeight: theme.typography.fontWeight.semibold,
  },
  bold: {
    fontWeight: theme.typography.fontWeight.bold,
  },
  
  // Alignment
  left: {
    textAlign: 'left',
  },
  center: {
    textAlign: 'center',
  },
  right: {
    textAlign: 'right',
  },
  justify: {
    textAlign: 'justify',
  },
});

export default Text;
