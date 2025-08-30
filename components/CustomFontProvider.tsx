import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AssetLoader } from '../services/assetLoader';
import { FeatureManager } from '../services/featureManager';
import { APP_CONFIG } from '../config/appConfig';

interface CustomFontProviderProps {
  children: React.ReactNode;
  onFontsLoaded?: () => void;
  onError?: (error: string) => void;
}

export const CustomFontProvider: React.FC<CustomFontProviderProps> = ({
  children,
  onFontsLoaded,
  onError
}) => {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCustomFonts();
  }, []);

  const loadCustomFonts = async () => {
    // Check if custom fonts are enabled
    if (!FeatureManager.isCustomFontsEnabled()) {
      console.log('🔤 Custom fonts not enabled');
      setFontsLoaded(true);
      onFontsLoaded?.();
      return;
    }

    const fonts = APP_CONFIG.appRequest?.fonts;
    if (!fonts || fonts.length === 0) {
      console.log('🔤 No custom fonts configured');
      setFontsLoaded(true);
      onFontsLoaded?.();
      return;
    }

    setLoading(true);
    try {
      console.log('🔤 Loading custom fonts:', fonts.length);
      await AssetLoader.loadCustomFonts(fonts);
      setFontsLoaded(true);
      onFontsLoaded?.();
      console.log('✅ Custom fonts loaded successfully');
    } catch (error) {
      console.error('❌ Error loading custom fonts:', error);
      onError?.('Failed to load custom fonts');
      // Still set as loaded to not block the app
      setFontsLoaded(true);
      onFontsLoaded?.();
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while fonts are being loaded
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading custom fonts...</Text>
      </View>
    );
  }

  // Render children once fonts are loaded (or if fonts are not enabled)
  return <>{children}</>;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
});

// Utility function to get custom font family
export const getCustomFontFamily = (baseName: string, weight: number = 400): string => {
  if (!FeatureManager.isCustomFontsEnabled()) {
    return 'System'; // Fallback to system font
  }

  const fontFamily = AssetLoader.getCustomFontFamily(baseName, weight);
  
  // Check if the custom font is loaded
  if (AssetLoader.isCustomFontLoaded(fontFamily)) {
    return fontFamily;
  }

  // Fallback to system font if custom font is not loaded
  return 'System';
};

// Hook to use custom fonts in components
export const useCustomFont = (baseName: string, weight: number = 400) => {
  const [fontFamily, setFontFamily] = useState('System');

  useEffect(() => {
    if (FeatureManager.isCustomFontsEnabled()) {
      const customFont = getCustomFontFamily(baseName, weight);
      setFontFamily(customFont);
    }
  }, [baseName, weight]);

  return fontFamily;
};
