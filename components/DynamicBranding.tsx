import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { APP_CONFIG } from '../config/appConfig';
import theme from '../constants/theme';
import { getSpacing, getBorderRadius } from '../constants/themeUtils';

interface DynamicBrandingProps {
  type: 'header' | 'footer' | 'splash' | 'logo';
  size?: 'small' | 'medium' | 'large';
  showAppName?: boolean;
  showTagline?: boolean;
}

const DynamicBranding: React.FC<DynamicBrandingProps> = ({
  type,
  size = 'medium',
  showAppName = true,
  showTagline = false,
}) => {
  const branding = APP_CONFIG?.store?.branding || {};
  const storeName = APP_CONFIG?.store?.name || 'StoresA2Z';
  const logoUrl = branding.logo || APP_CONFIG?.theme?.branding?.logo;
  const appName = branding.appName || storeName;
  const colors = branding.colors || theme.colors;

  const getSize = () => {
    switch (size) {
      case 'small':
        return { logoSize: 24, fontSize: 14 };
      case 'large':
        return { logoSize: 48, fontSize: 20 };
      default:
        return { logoSize: 32, fontSize: 16 };
    }
  };

  const { logoSize, fontSize } = getSize();

  const renderLogo = () => {
    if (logoUrl) {
      return (
        <Image
          source={{ uri: logoUrl }}
          style={[
            styles.logo,
            {
              width: logoSize,
              height: logoSize,
              borderRadius: getBorderRadius('sm'),
            },
          ]}
          resizeMode="contain"
        />
      );
    }

    // Fallback to text logo
    return (
      <View
        style={[
          styles.textLogo,
          {
            width: logoSize,
            height: logoSize,
            backgroundColor: colors.primary,
            borderRadius: getBorderRadius('sm'),
          },
        ]}
      >
        <Text
          style={[
            styles.textLogoText,
            {
              fontSize: fontSize * 0.6,
              color: colors.buttonText,
            },
          ]}
        >
          {appName.charAt(0).toUpperCase()}
        </Text>
      </View>
    );
  };

  const renderAppName = () => {
    if (!showAppName) return null;

    return (
      <Text
        style={[
          styles.appName,
          {
            fontSize,
            color: colors.text,
            fontFamily: theme.fonts.bold,
          },
        ]}
      >
        {appName}
      </Text>
    );
  };

  const renderTagline = () => {
    if (!showTagline) return null;

    return (
      <Text
        style={[
          styles.tagline,
          {
            fontSize: fontSize * 0.8,
            color: colors.subtitle,
            fontFamily: theme.fonts.regular,
          },
        ]}
      >
        Powered by StoresA2Z
      </Text>
    );
  };

  const renderContent = () => {
    switch (type) {
      case 'header':
        return (
          <View style={styles.headerContainer}>
            {renderLogo()}
            <View style={styles.textContainer}>
              {renderAppName()}
              {renderTagline()}
            </View>
          </View>
        );

      case 'footer':
        return (
          <View style={styles.footerContainer}>
            {renderLogo()}
            {renderAppName()}
          </View>
        );

      case 'splash':
        return (
          <View style={styles.splashContainer}>
            {renderLogo()}
            {renderAppName()}
            {renderTagline()}
          </View>
        );

      case 'logo':
        return renderLogo();

      default:
        return null;
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: type === 'splash' ? colors.background : 'transparent',
        },
      ]}
    >
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: getSpacing('md'),
  },
  footerContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: getSpacing('md'),
  },
  splashContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  logo: {
    marginRight: getSpacing('sm'),
  },
  textLogo: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: getSpacing('sm'),
  },
  textLogoText: {
    fontFamily: theme.fonts.bold,
    fontWeight: 'bold',
  },
  textContainer: {
    flex: 1,
  },
  appName: {
    marginBottom: getSpacing('xs'),
  },
  tagline: {
    opacity: 0.7,
  },
});

export default DynamicBranding;
