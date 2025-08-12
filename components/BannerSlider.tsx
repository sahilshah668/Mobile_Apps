import theme from '@/constants/theme';
import { Banner } from '@/store/productSlice';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');

interface BannerSliderProps {
  banners: Banner[];
  onBannerPress?: (bannerId: string) => void;
  autoScrollInterval?: number;
}

const BannerSlider: React.FC<BannerSliderProps> = ({
  banners,
  onBannerPress,
  autoScrollInterval = 4000,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % banners.length;
      setCurrentIndex(nextIndex);
      scrollViewRef.current?.scrollTo({
        x: nextIndex * width,
        animated: true,
      });
    }, autoScrollInterval);

    return () => clearInterval(interval);
  }, [currentIndex, banners.length, autoScrollInterval]);

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / width);
    setCurrentIndex(index);
  };

  const handleDotPress = (index: number) => {
    setCurrentIndex(index);
    scrollViewRef.current?.scrollTo({
      x: index * width,
      animated: true,
    });
  };

  if (!banners.length) return null;

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {banners.map((banner, index) => (
          <TouchableOpacity
            key={banner.id}
            style={styles.bannerContainer}
            onPress={() => onBannerPress?.(banner.id)}
            activeOpacity={0.9}
          >
            <Image source={{ uri: banner.image }} style={styles.bannerImage} />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.3)']}
              style={styles.bannerGradient}
            />
            <View style={styles.bannerContent}>
              <BlurView intensity={30} style={styles.bannerBlur}>
                <Text style={styles.bannerTitle}>{banner.title}</Text>
                <Text style={styles.bannerSubtitle}>{banner.subtitle}</Text>
              </BlurView>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Enhanced Pagination Dots */}
      <View style={styles.paginationContainer}>
        {banners.map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.paginationDot,
              index === currentIndex && styles.paginationDotActive,
            ]}
            onPress={() => handleDotPress(index)}
          >
            <View style={[
              styles.dotInner,
              index === currentIndex && styles.dotInnerActive,
            ]} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 200,
    position: 'relative',
  },
  scrollView: {
    flex: 1,
  },
  bannerContainer: {
    width: width - theme.spacing.lg * 2,
    height: 200,
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  bannerContent: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  bannerBlur: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  bannerTitle: {
    fontSize: theme.fontSizes.title - 4,
    color: 'white',
    fontWeight: 'bold',
    fontFamily: theme.fonts.bold,
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: theme.fontSizes.subtitle,
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: theme.fonts.regular,
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  paginationDot: {
    width: 32,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationDotActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  dotInner: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'transparent',
  },
  dotInnerActive: {
    backgroundColor: theme.colors.primary,
  },
});

export default BannerSlider; 