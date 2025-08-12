import { Redirect } from 'expo-router';

export default function Index() {
  // For window shopping experience, redirect directly to home
  // Users can access auth screens later when they need to perform authenticated actions
  return <Redirect href="/(tabs)/home" />;
} 