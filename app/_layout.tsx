import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { Provider, useSelector } from 'react-redux';
import { RootState, store } from '../store/store';

// Inner component that can use Redux hooks
function AppNavigator() {
  const colorScheme = useColorScheme();
  const { isAuthenticated } = useSelector((state: RootState) => state.user);

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
    <Provider store={store}>
      <AppNavigator />
    </Provider>
  );
}
