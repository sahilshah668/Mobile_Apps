import { RootState } from '@/store/store';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';

export const useAuth = () => {
  const router = useRouter();
  const { isAuthenticated } = useSelector((state: RootState) => state.user);

  const requireAuth = (action: string) => {
    if (!isAuthenticated) {
      // Navigate to login screen when user tries to perform authenticated actions
      router.push('/(auth)/login');
      return false;
    }
    return true;
  };

  const navigateToAuth = () => {
    router.push('/(auth)/login');
  };

  const navigateToHome = () => {
    router.push('/(tabs)/home');
  };

  return {
    isAuthenticated,
    requireAuth,
    navigateToAuth,
    navigateToHome,
  };
}; 