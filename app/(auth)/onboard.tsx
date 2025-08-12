import { IconSymbol } from '@/components/ui/IconSymbol';
import theme from '@/constants/theme';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

const OnBoardPage = () => {
  const router = useRouter();
  
  const handleBrowseAsGuest = () => {
    router.push('/(tabs)/home');
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoCircle}>
        <IconSymbol name="shopping-bag" size={width * 0.13} color={theme.colors.primary} />
      </View>
      <Text style={styles.title}>Shoppe</Text>
      <Text style={styles.subtitle}>Beautiful eCommerce UI Kit{"\n"}for your online store</Text>
      
      <TouchableOpacity style={styles.button} onPress={() => router.push('/signup')}>
        <Text style={styles.buttonText}>Let's get started</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.secondaryAction} onPress={() => router.push('/login')}>
        <Text style={styles.secondaryText}>I already have an account</Text>
        <IconSymbol name="chevron-right" size={16} color={theme.colors.primary} />
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.guestAction} onPress={handleBrowseAsGuest}>
        <Text style={styles.guestText}>Browse as Guest</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  logoCircle: {
    width: width * 0.28,
    height: width * 0.28,
    borderRadius: (width * 0.28) / 2,
    backgroundColor: theme.colors.logoBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  logoIcon: {
    fontSize: width * 0.13,
  },
  title: {
    fontSize: theme.fontSizes.title,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
    fontFamily: theme.fonts.bold,
  },
  subtitle: {
    fontSize: theme.fontSizes.subtitle,
    color: theme.colors.subtitle,
    marginBottom: theme.spacing.xxl,
    textAlign: 'center',
    lineHeight: theme.fontSizes.subtitle * 1.6,
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    width: '100%',
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  buttonText: {
    color: theme.colors.buttonText,
    fontSize: theme.fontSizes.button,
    fontWeight: 'bold',
    fontFamily: theme.fonts.bold,
  },
  secondaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  secondaryText: {
    color: theme.colors.subtitle,
    fontSize: theme.fontSizes.link,
    marginRight: theme.spacing.xs,
    fontFamily: theme.fonts.regular,
  },
  arrowIcon: {
    color: theme.colors.primary,
    fontSize: theme.fontSizes.link + 2,
    fontWeight: 'bold',
  },
  guestAction: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  guestText: {
    color: theme.colors.primary,
    fontSize: theme.fontSizes.link,
    textDecorationLine: 'underline',
    fontFamily: theme.fonts.regular,
  },
});

export default OnBoardPage; 