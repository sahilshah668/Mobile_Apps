# 🎨 Theme Customization Guide
## Fashion-Saga Mobile App

This guide explains how to customize the theme and branding of the Fashion-Saga mobile app for different partners and stores.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Theme Structure](#theme-structure)
3. [Dynamic Branding](#dynamic-branding)
4. [Color System](#color-system)
5. [Component Customization](#component-customization)
6. [Partner Integration](#partner-integration)
7. [Best Practices](#best-practices)

---

## 🎯 Overview

The Fashion-Saga app now supports **100% dynamic theming** with:
- ✅ **Complete color system** - All colors are theme-driven
- ✅ **Dynamic branding** - Partner logos and app names
- ✅ **Flexible layouts** - Responsive and customizable components
- ✅ **Status colors** - Order and payment status theming
- ✅ **Shadow system** - Consistent elevation and depth

---

## 🏗️ Theme Structure

### Core Theme File: `constants/theme.ts`

```typescript
export type Theme = {
  colors: {
    // Primary colors
    primary: string;
    secondary: string;
    accent: string;
    
    // Background colors
    background: string;
    surface: string;
    card: string;
    
    // Text colors
    text: string;
    subtitle: string;
    buttonText: string;
    link: string;
    
    // Status colors
    success: string;
    warning: string;
    error: string;
    info: string;
    
    // UI colors
    border: string;
    divider: string;
    shadow: string;
    overlay: string;
    
    // Special colors
    logoBackground: string;
    flashSale: string;
    premium: string;
    discount: string;
    
    // Status-specific colors
    orderStatus: {
      pending: string;
      confirmed: string;
      processing: string;
      shipped: string;
      delivered: string;
      cancelled: string;
      returned: string;
    };
    
    paymentStatus: {
      pending: string;
      paid: string;
      failed: string;
      refunded: string;
    };
  };
  // ... fonts, spacing, shadows, etc.
};
```

### Theme Utilities: `constants/themeUtils.ts`

```typescript
// Utility functions for consistent styling
export const getStatusColor = (status: string, type: 'order' | 'payment') => { ... };
export const getShadowStyle = (size: 'small' | 'medium' | 'large') => { ... };
export const getBorderRadius = (size: 'sm' | 'md' | 'lg' | 'xl') => { ... };
export const getSpacing = (size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl') => { ... };
export const getFontSize = (size: 'title' | 'subtitle' | 'button' | 'link' | 'caption' | 'small') => { ... };

// Common style patterns
export const commonStyles = {
  card: { ... },
  button: { ... },
  input: { ... },
  // ... more patterns
};
```

---

## 🎨 Dynamic Branding

### DynamicBranding Component

The `DynamicBranding` component handles all branding elements:

```typescript
import DynamicBranding from '@/components/DynamicBranding';

// Header branding
<DynamicBranding type="header" size="medium" showAppName={true} showTagline={false} />

// Splash screen branding
<DynamicBranding type="splash" size="large" showAppName={true} showTagline={true} />

// Footer branding
<DynamicBranding type="footer" size="small" showAppName={true} showTagline={false} />

// Logo only
<DynamicBranding type="logo" size="medium" />
```

### Configuration Sources

The component reads from multiple sources in order of precedence:

1. **Store Branding** (`APP_CONFIG.store.branding`)
2. **Theme Branding** (`APP_CONFIG.theme.branding`)
3. **Default Theme** (`constants/theme.ts`)

```typescript
// Example configuration
const APP_CONFIG = {
  store: {
    name: "Fashion Store",
    branding: {
      logo: "https://example.com/logo.png",
      appName: "Fashion Store",
      colors: {
        primary: "#FF6B6B",
        secondary: "#4ECDC4",
        // ... more colors
      }
    }
  },
  theme: {
    branding: {
      logo: "https://fallback-logo.png",
      // ... fallback branding
    }
  }
};
```

---

## 🌈 Color System

### Primary Colors

```typescript
colors: {
  primary: '#156BFF',    // Main brand color
  secondary: '#111827',  // Secondary brand color
  accent: '#FF6B6B',     // Accent color for highlights
}
```

### Status Colors

```typescript
// Order Status Colors
orderStatus: {
  pending: '#FF9800',    // Orange
  confirmed: '#2196F3',  // Blue
  processing: '#9C27B0', // Purple
  shipped: '#3F51B5',    // Indigo
  delivered: '#4CAF50',  // Green
  cancelled: '#F44336',  // Red
  returned: '#FF5722',   // Deep Orange
}

// Payment Status Colors
paymentStatus: {
  pending: '#FF9800',    // Orange
  paid: '#4CAF50',       // Green
  failed: '#F44336',     // Red
  refunded: '#9E9E9E',   // Grey
}
```

### Special Colors

```typescript
colors: {
  flashSale: '#FF6B6B',    // Flash sale background
  premium: '#FFD700',      // Premium features
  discount: '#FF4444',     // Discount badges
  success: '#4CAF50',      // Success states
  warning: '#FF9800',      // Warning states
  error: '#F44336',        // Error states
  info: '#2196F3',         // Info states
}
```

---

## 🧩 Component Customization

### Using Theme Colors

```typescript
import theme from '@/constants/theme';
import { getStatusColor, getShadowStyle } from '@/constants/themeUtils';

// Instead of hardcoded colors
const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    ...getShadowStyle('medium'),
  },
  button: {
    backgroundColor: theme.colors.primary,
    color: theme.colors.buttonText,
  },
  statusBadge: {
    backgroundColor: getStatusColor('delivered', 'order'),
  },
});
```

### Common Style Patterns

```typescript
import { commonStyles } from '@/constants/themeUtils';

// Use predefined patterns
const styles = StyleSheet.create({
  card: {
    ...commonStyles.card,
    // Add custom styles
  },
  button: {
    ...commonStyles.button,
    // Override specific properties
  },
});
```

---

## 🤝 Partner Integration

### Theme Provider

The `ThemeProvider` component manages dynamic theme updates:

```typescript
import { ThemeProvider, useTheme } from '@/components/ThemeProvider';

// Wrap your app
<ThemeProvider>
  <App />
</ThemeProvider>

// Use in components
const MyComponent = () => {
  const { theme, updateTheme, isDarkMode, toggleDarkMode } = useTheme();
  
  return (
    <View style={{ backgroundColor: theme.colors.background }}>
      {/* Your component */}
    </View>
  );
};
```

### Dynamic Theme Updates

```typescript
// Update theme at runtime
const { updateTheme } = useTheme();

const updatePartnerTheme = (partnerConfig) => {
  updateTheme({
    colors: {
      primary: partnerConfig.primaryColor,
      secondary: partnerConfig.secondaryColor,
      // ... more colors
    }
  });
};
```

---

## ✅ Best Practices

### 1. Always Use Theme Colors

❌ **Don't use hardcoded colors:**
```typescript
backgroundColor: '#FF4444'
color: '#FFFFFF'
```

✅ **Use theme colors:**
```typescript
backgroundColor: theme.colors.error
color: theme.colors.buttonText
```

### 2. Use Theme Utilities

❌ **Don't repeat shadow styles:**
```typescript
shadowColor: '#000',
shadowOffset: { width: 0, height: 4 },
shadowOpacity: 0.15,
shadowRadius: 8,
elevation: 6,
```

✅ **Use shadow utilities:**
```typescript
...getShadowStyle('medium')
```

### 3. Use Status Color Functions

❌ **Don't hardcode status colors:**
```typescript
const statusColor = status === 'delivered' ? '#4CAF50' : '#FF9800';
```

✅ **Use status color functions:**
```typescript
const statusColor = getStatusColor(status, 'order');
```

### 4. Use Common Style Patterns

❌ **Don't repeat common styles:**
```typescript
const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    shadowColor: theme.colors.shadow,
    // ... more repeated styles
  },
});
```

✅ **Use common patterns:**
```typescript
const styles = StyleSheet.create({
  card: {
    ...commonStyles.card,
    // Add custom styles only
  },
});
```

### 5. Test Theme Changes

Always test your theme changes with different configurations:

```typescript
// Test with different color schemes
const testThemes = [
  { primary: '#FF6B6B', secondary: '#4ECDC4' },
  { primary: '#156BFF', secondary: '#111827' },
  { primary: '#4CAF50', secondary: '#2E7D32' },
];

testThemes.forEach(theme => {
  // Test your component with this theme
});
```

---

## 🚀 Implementation Status

### ✅ Completed (100%)

- **Enhanced Theme System**: Complete color palette with status colors
- **Theme Utilities**: Helper functions for consistent styling
- **Dynamic Branding**: Partner-specific logos and app names
- **Component Updates**: All hardcoded colors replaced with theme colors
- **Theme Provider**: Runtime theme management
- **Common Patterns**: Reusable style patterns

### 🎯 Key Improvements

1. **Removed All Hardcoded Colors**: 100% theme-driven
2. **Enhanced Color System**: Comprehensive color palette
3. **Dynamic Branding**: Partner-specific customization
4. **Flexible Layouts**: Responsive and customizable components
5. **Status Colors**: Order and payment status theming
6. **Shadow System**: Consistent elevation and depth

---

## 📱 Usage Examples

### Basic Component with Theme

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import theme from '@/constants/theme';
import { getShadowStyle, getBorderRadius } from '@/constants/themeUtils';

const MyComponent = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hello World</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.card,
    borderRadius: getBorderRadius('md'),
    padding: 16,
    ...getShadowStyle('medium'),
  },
  title: {
    color: theme.colors.text,
    fontSize: 18,
    fontFamily: theme.fonts.bold,
  },
});
```

### Dynamic Branding Component

```typescript
import React from 'react';
import { View } from 'react-native';
import DynamicBranding from '@/components/DynamicBranding';

const Header = () => {
  return (
    <View>
      <DynamicBranding 
        type="header" 
        size="medium" 
        showAppName={true} 
        showTagline={false} 
      />
    </View>
  );
};
```

---

**🎉 The Fashion-Saga app now supports 100% dynamic theming and is ready for partner customization!**
