import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Linking } from 'expo-linking';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { Provider, useSelector } from 'react-redux';
import { RootState, store } from '../store/store';

// Import our new services
import analytics from '../src/services/analytics';
import notifications from '../src/services/notifications';
import deepLinking from '../src/services/deepLinking';
import { loadCustomFonts } from '../src/utils/fontLoader';
import APP_CONFIG from '../src/config/appConfig';

// Inner component that can use Redux hooks
function AppNavigator() {
  const colorScheme = useColorScheme();
  const { isAuthenticated } = useSelector((state: RootState) => state.user);

  // Initialize services when app starts
  useEffect(() => {
    const initializeServices = async () => {
      try {
        // Initialize analytics
        await analytics.initialize();
        
        // Initialize notifications
        await notifications.initialize();
        
        // Initialize deep linking
        await deepLinking.initialize();
        
        console.log('All services initialized successfully');
      } catch (error) {
        console.error('Failed to initialize services:', error);
      }
    };

    initializeServices();
  }, []);

  // Handle deep links
  useEffect(() => {
    const handleDeepLink = (url: string) => {
      console.log('Received deep link:', url);
      deepLinking.handleDeepLink(url);
    };

    // Handle initial URL
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    // Handle URL changes
    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  // Track screen views for analytics
  useEffect(() => {
    if (isAuthenticated) {
      analytics.trackScreenView('Main App');
    } else {
      analytics.trackScreenView('Auth');
    }
  }, [isAuthenticated]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack 
        screenOptions={{ 
          headerShown: false,
          header: () => null,
          headerTitle: '',
          headerBackTitle: '',
          headerBackVisible: false,
          headerLeft: () => null,
          headerRight: () => null,
          presentation: 'modal',
        }}
      >
        {!isAuthenticated ? (
          // Auth screens when not authenticated
          <Stack.Screen 
            name="(auth)" 
            options={{ 
              headerShown: false,
              header: () => null,
              presentation: 'modal',
            }} 
          />
        ) : (
          // Main app screens when authenticated
          <>
            <Stack.Screen 
              name="(tabs)" 
              options={{ 
                headerShown: false,
                header: () => null,
                presentation: 'modal',
              }} 
            />
            <Stack.Screen 
              name="product" 
              options={{ 
                headerShown: false,
                header: () => null,
                presentation: 'modal',
              }} 
            />
            <Stack.Screen 
              name="category" 
              options={{ 
                headerShown: false,
                header: () => null,
                presentation: 'modal',
              }} 
            />
            <Stack.Screen 
              name="search-results" 
              options={{ 
                headerShown: false,
                header: () => null,
                presentation: 'modal',
              }} 
            />
            <Stack.Screen 
              name="notifications" 
              options={{ 
                headerShown: false,
                header: () => null,
                presentation: 'modal',
              }} 
            />
            <Stack.Screen 
              name="vip-offers" 
              options={{ 
                headerShown: false,
                header: () => null,
                presentation: 'modal',
              }} 
            />
            {/* Legal pages */}
            <Stack.Screen 
              name="legal" 
              options={{ 
                headerShown: false,
                header: () => null,
                presentation: 'modal',
              }} 
            />
          </>
        )}
        <Stack.Screen 
          name="+not-found" 
          options={{ 
            headerShown: false,
            header: () => null,
            presentation: 'modal',
          }} 
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  // Load custom fonts from APP_CONFIG
  const [customFontsLoaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    // Add custom fonts from APP_CONFIG here when they're properly downloaded
    // The builder will inject the actual font loading here
  });

  // Load system fonts
  const [systemFontsLoaded] = useFonts({
    // System fonts are loaded automatically
  });

  // Initialize custom font loading
  useEffect(() => {
    const loadFonts = async () => {
      try {
        await loadCustomFonts();
      } catch (error) {
        console.error('Failed to load custom fonts:', error);
      }
    };

    loadFonts();
  }, []);

  if (!customFontsLoaded || !systemFontsLoaded) {
    return null;
  }

  return (
    <Provider store={store}>
      <AppNavigator />
    </Provider>
  );
}
