import theme from '@/constants/theme';
import { Banner as BannerType } from '@/store/productSlice';
import React from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width, height } = Dimensions.get('window');

interface BannerProps {
  banner: BannerType;
  onPress?: () => void;
}

const Banner: React.FC<BannerProps> = ({ banner, onPress }) => {
  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: banner.backgroundColor }]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{banner.title}</Text>
          <Text style={styles.subtitle}>{banner.subtitle}</Text>
          <Text style={styles.happeningText}>Happening Now</Text>
        </View>
        <View style={styles.imageContainer}>
          <Image source={{ uri: banner.image }} style={styles.image} />
        </View>
      </View>
      
      {/* Pagination dots - matching screenshot style */}
      <View style={styles.pagination}>
        <View style={styles.dot} />
        <View style={[styles.dot, styles.dotInactive]} />
        <View style={[styles.dot, styles.dotInactive]} />
        <View style={[styles.dot, styles.dotInactive]} />
        <View style={[styles.dot, styles.dotInactive]} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width - theme.spacing.lg * 2,
    height: height * 0.22,
    marginHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.md,
    // No border radius to match screenshot
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
  },
  textContainer: {
    flex: 1,
    paddingRight: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSizes.title - 6,
    color: theme.colors.buttonText,
    fontWeight: 'bold',
    marginBottom: theme.spacing.xs,
    fontFamily: theme.fonts.bold,
  },
  subtitle: {
    fontSize: theme.fontSizes.subtitle + 2,
    color: theme.colors.buttonText,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
    fontFamily: theme.fonts.bold,
  },
  happeningText: {
    fontSize: theme.fontSizes.link,
    color: theme.colors.buttonText,
    fontWeight: '500',
    fontFamily: theme.fonts.regular,
  },
  imageContainer: {
    width: width * 0.25,
    height: height * 0.12,
    // No border radius to match screenshot
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primary, // Blue dots to match screenshot
  },
  dotInactive: {
    backgroundColor: 'rgba(21, 107, 255, 0.3)', // Lighter blue for inactive dots
  },
});

export default Banner; 