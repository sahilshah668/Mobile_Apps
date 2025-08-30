import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, Dimensions, useColorScheme } from 'react-native';
import { AssetLoader } from '../services/assetLoader';
import { FeatureManager } from '../services/featureManager';
import { APP_CONFIG } from '../config/appConfig';
import * as FileSystem from 'expo-file-system';

interface DynamicSplashScreenProps {
  children: React.ReactNode;
  onSplashComplete?: () => void;
  duration?: number; // How long to show splash screen in ms
}

const { width, height } = Dimensions.get('window');

export const DynamicSplashScreen: React.FC<DynamicSplashScreenProps> = ({
  children,
  onSplashComplete,
  duration = 2000
}) => {
  const [showSplash, setShowSplash] = useState(true);
  const [splashImage, setSplashImage] = useState<string | null>(null);
  const [splashBackgroundColor, setSplashBackgroundColor] = useState<string>('#ffffff');
  const colorScheme = useColorScheme();

  useEffect(() => {
    loadSplashScreen();
  }, []);

  const loadSplashScreen = async () => {
    // Check if custom splash screen is enabled
    if (!FeatureManager.isCustomSplashEnabled()) {
      console.log('🖼️ Custom splash screen not enabled');
      setTimeout(() => {
        setShowSplash(false);
        onSplashComplete?.();
      }, duration);
      return;
    }

    const splash = APP_CONFIG.appRequest?.splash;
    if (!splash) {
      console.log('🖼️ No splash screen configuration');
      setTimeout(() => {
        setShowSplash(false);
        onSplashComplete?.();
      }, duration);
      return;
    }

    try {
      // Set background color
      if (colorScheme === 'dark' && splash.darkBackgroundColor) {
        setSplashBackgroundColor(splash.darkBackgroundColor);
      } else if (splash.backgroundColor) {
        setSplashBackgroundColor(splash.backgroundColor);
      }

      // Load splash image
      const imageUrl = colorScheme === 'dark' && splash.darkImageUrl 
        ? splash.darkImageUrl 
        : splash.imageUrl;

      if (imageUrl) {
        // Check if image is already cached
        const splashDir = `${FileSystem.documentDirectory}splash/`;
        const imageName = colorScheme === 'dark' ? 'splash-dark.png' : 'splash.png';
        const cachedImagePath = `${splashDir}${imageName}`;

        const fileInfo = await FileSystem.getInfoAsync(cachedImagePath);
        if (fileInfo.exists) {
          setSplashImage(cachedImagePath);
        } else {
          // Download and cache the image
          await AssetLoader.loadSplashScreens(splash);
          setSplashImage(cachedImagePath);
        }
      }

      console.log('✅ Splash screen loaded');
    } catch (error) {
      console.error('❌ Error loading splash screen:', error);
    }

    // Hide splash screen after duration
    setTimeout(() => {
      setShowSplash(false);
      onSplashComplete?.();
    }, duration);
  };

  if (!showSplash) {
    return <>{children}</>;
  }

  return (
    <View style={[styles.container, { backgroundColor: splashBackgroundColor }]}>
      {splashImage ? (
        <Image
          source={{ uri: splashImage }}
          style={styles.splashImage}
          resizeMode={APP_CONFIG.appRequest?.splash?.resizeMode || 'contain'}
        />
      ) : (
        <View style={styles.fallbackContainer}>
          {/* Fallback content when no custom splash image */}
          <View style={styles.logoContainer}>
            {APP_CONFIG.store.branding.logo && (
              <Image
                source={{ uri: APP_CONFIG.store.branding.logo }}
                style={styles.logo}
                resizeMode="contain"
              />
            )}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: width,
    height: height,
  },
  splashImage: {
    width: width * 0.8,
    height: height * 0.6,
    maxWidth: 400,
    maxHeight: 600,
  },
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 100,
  },
});

// Hook to use splash screen in components
export const useSplashScreen = () => {
  const [isSplashVisible, setIsSplashVisible] = useState(true);

  const hideSplash = () => {
    setIsSplashVisible(false);
  };

  return {
    isSplashVisible,
    hideSplash,
  };
};
