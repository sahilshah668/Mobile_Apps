import theme from '@/constants/theme';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useAuth } from '@/hooks/useAuth';
import { setUser } from '@/store/userSlice';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width, height } = Dimensions.get('window');

const LetsStartScreen = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { navigateToHome } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleLetsStart = async () => {
    setIsLoading(true);
    
    try {
      // Simulate a brief loading state for better UX
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Set user as authenticated with mock data
      dispatch(setUser({
        name: 'Fashion Lover',
        phone: '+1234567890',
        token: 'mock-auth-token-' + Date.now(),
      }));
      
      // Navigate to home page
      navigateToHome();
    } catch (error) {
      console.error('Error starting app:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Background Shapes */}
      <View style={styles.bgCircleTopLeft} />
      <View style={styles.bgCircleBottomRight} />

      {/* Card */}
      <View style={styles.card}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80' }}
          style={styles.cardImage}
          resizeMode="cover"
        />
        <Text style={styles.cardTitle}>Ready to Explore?</Text>
        <Text style={styles.cardSubtitle}>
          Discover amazing fashion products, browse categories, and find your perfect style with Fashion Saga.
        </Text>
        <TouchableOpacity 
          style={[styles.cardButton, isLoading && styles.cardButtonDisabled]} 
          onPress={handleLetsStart}
          disabled={isLoading}
        >
          <LinearGradient
            colors={[theme.colors.primary, '#0056CC']}
            style={styles.cardButtonGradient}
          >
            <Text style={styles.cardButtonText}>
              {isLoading ? 'Getting Started...' : "Let's Start"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Features Preview */}
      <View style={styles.featuresContainer}>
        <Text style={styles.featuresTitle}>What you'll get:</Text>
        <View style={styles.featuresList}>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🛍️</Text>
            <Text style={styles.featureText}>Browse Categories</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🔍</Text>
            <Text style={styles.featureText}>Advanced Search</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>❤️</Text>
            <Text style={styles.featureText}>Save Favorites</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🛒</Text>
            <Text style={styles.featureText}>Shopping Cart</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const CIRCLE_TOP_LEFT = width * 1.1;
const CIRCLE_BOTTOM_RIGHT = width * 0.7;

const CARD_WIDTH = width * 0.88;
const CARD_RADIUS = 32;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bgCircleTopLeft: {
    position: 'absolute',
    top: -CIRCLE_TOP_LEFT * 0.25,
    left: -CIRCLE_TOP_LEFT * 0.25,
    width: CIRCLE_TOP_LEFT,
    height: CIRCLE_TOP_LEFT,
    backgroundColor: theme.colors.primary,
    borderRadius: CIRCLE_TOP_LEFT / 2,
    zIndex: 0,
    opacity: 0.95,
  },
  bgCircleBottomRight: {
    position: 'absolute',
    bottom: -CIRCLE_BOTTOM_RIGHT * 0.25,
    right: -CIRCLE_BOTTOM_RIGHT * 0.18,
    width: CIRCLE_BOTTOM_RIGHT,
    height: CIRCLE_BOTTOM_RIGHT,
    backgroundColor: theme.colors.logoBackground,
    borderRadius: CIRCLE_BOTTOM_RIGHT / 2,
    zIndex: 0,
    opacity: 0.5,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: CARD_RADIUS,
    alignItems: 'center',
    paddingBottom: theme.spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
    zIndex: 1,
  },
  cardImage: {
    width: '100%',
    height: width * 0.48,
    borderTopLeftRadius: CARD_RADIUS,
    borderTopRightRadius: CARD_RADIUS,
  },
  cardTitle: {
    fontSize: theme.fontSizes.title * 0.7,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    fontFamily: theme.fonts.bold,
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.md,
  },
  cardSubtitle: {
    fontSize: theme.fontSizes.subtitle,
    color: theme.colors.subtitle,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
    lineHeight: 22,
  },
  cardButton: {
    borderRadius: theme.borderRadius.md,
    width: '70%',
    overflow: 'hidden',
    marginTop: theme.spacing.md,
  },
  cardButtonDisabled: {
    opacity: 0.7,
  },
  cardButtonGradient: {
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
  },
  cardButtonText: {
    color: theme.colors.buttonText,
    fontSize: theme.fontSizes.button,
    fontWeight: 'bold',
    fontFamily: theme.fonts.bold,
  },
  featuresContainer: {
    marginTop: theme.spacing.xl,
    alignItems: 'center',
    zIndex: 1,
  },
  featuresTitle: {
    fontSize: 18,
    color: theme.colors.text,
    fontWeight: '600',
    fontFamily: theme.fonts.bold,
    marginBottom: theme.spacing.md,
  },
  featuresList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: theme.spacing.md,
  },
  featureItem: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: 16,
    minWidth: 80,
  },
  featureIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  featureText: {
    fontSize: 12,
    color: theme.colors.subtitle,
    fontWeight: '500',
    fontFamily: theme.fonts.regular,
    textAlign: 'center',
  },
});

export default LetsStartScreen; 