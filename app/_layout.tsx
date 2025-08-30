import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

import { useColorScheme } from '@/hooks/useColorScheme';
import { Provider, useSelector } from 'react-redux';
import { RootState, store } from '../store/store';
import { getAccessToken } from '../services/token';
import { APP_CONFIG } from '../config/appConfig';
import { useDispatch } from 'react-redux';
import { clearUser } from '../store/userSlice';
import ErrorBoundary from '../components/ErrorBoundary';

// Inner component that can use Redux hooks
function AppNavigator() {
  const colorScheme = useColorScheme();
  const { isAuthenticated, loading } = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const [isInitializing, setIsInitializing] = useState(true);

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('🔍 Starting app initialization...');
        console.log('🔍 APP_CONFIG available:', !!APP_CONFIG);
        console.log('🔍 Store ID:', APP_CONFIG?.store?.id);
        
        const token = await getAccessToken();
        console.log('🔍 Token found:', !!token);
        console.log('🔍 Token length:', token ? token.length : 0);
        
        if (token) {
          // Token exists, try to validate it
          try {
            // You can add token validation here if needed
            console.log('🔍 Token validation successful');
          } catch (error) {
            console.log('🔍 Token validation failed, clearing token');
            console.error('🔍 Token validation error:', error);
            // Token is invalid, clear it
            // dispatch(clearUser());
          }
        } else {
          console.log('🔍 No token found, user needs to login');
        }
        
        console.log('🔍 Initialization completed successfully');
              } catch (error: any) {
          console.error('🔍 Auth initialization error:', error);
          console.error('🔍 Error details:', {
            message: error?.message || 'Unknown error',
            stack: error?.stack || 'No stack trace',
            name: error?.name || 'Unknown error type'
          });
      } finally {
        console.log('🔍 Setting initialization complete');
        setIsInitializing(false);
      }
    };

    initializeAuth();
  }, [dispatch]);

  // Show loading screen while initializing
  if (isInitializing || loading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: '#ffffff'
      }}>
        <ActivityIndicator size="large" color="#156BFF" />
        <Text style={{ 
          marginTop: 16, 
          fontSize: 16, 
          color: '#666',
          textAlign: 'center'
        }}>
          Loading...
        </Text>
      </View>
    );
  }

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
            <Stack.Screen 
              name="order-confirmation" 
              options={{ 
                headerShown: false,
                header: () => null,
                presentation: 'modal',
              }} 
            />
            <Stack.Screen 
              name="order-tracking" 
              options={{ 
                headerShown: false,
                header: () => null,
                presentation: 'modal',
              }} 
            />
            <Stack.Screen 
              name="checkout" 
              options={{ 
                headerShown: false,
                header: () => null,
                presentation: 'modal',
              }} 
            />
            <Stack.Screen 
              name="addresses" 
              options={{ 
                headerShown: false,
                header: () => null,
                presentation: 'modal',
              }} 
            />
            <Stack.Screen 
              name="profile-edit" 
              options={{ 
                headerShown: false,
                header: () => null,
                presentation: 'modal',
              }} 
            />
            <Stack.Screen 
              name="change-password" 
              options={{ 
                headerShown: false,
                header: () => null,
                presentation: 'modal',
              }} 
            />
            <Stack.Screen 
              name="order-history" 
              options={{ 
                headerShown: false,
                header: () => null,
                presentation: 'modal',
              }} 
            />
                    <Stack.Screen 
          name="return-refund-request" 
          options={{ 
            headerShown: false,
            header: () => null,
            presentation: 'modal',
          }} 
        />
        <Stack.Screen 
          name="cancel-order" 
          options={{ 
            headerShown: false,
            header: () => null,
            presentation: 'modal',
          }} 
        />
            <Stack.Screen 
              name="order-details" 
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
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    return null;
  }

  return (
    <ErrorBoundary>
      <Provider store={store}>
        <AppNavigator />
      </Provider>
    </ErrorBoundary>
  );
}
