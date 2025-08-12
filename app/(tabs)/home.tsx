import theme from '@/constants/theme';
import { APP_CONFIG } from '../../config/appConfig';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { fetchHomeData } from '@/store/productSlice';
import { RootState } from '@/store/store';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import {
    Dimensions,
    FlatList,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSelector } from 'react-redux';

// Components
import BannerSlider from '@/components/BannerSlider';
import CategoryCard from '@/components/CategoryCard';
import ProductCard from '@/components/ProductCard';
import SearchBar from '@/components/SearchBar';
import SectionHeader from '@/components/SectionHeader';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useAuth } from '@/hooks/useAuth';

const { width, height } = Dimensions.get('window');

// Responsive values
const isSmallScreen = width < 375;
const headerPaddingTop = height * 0.06;
const headerPaddingBottom = isSmallScreen ? 16 : 20;

const HomeScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { homeData, loading } = useSelector((state: RootState) => state.products);
  const { isAuthenticated, navigateToAuth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    dispatch(fetchHomeData());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchHomeData());
  };



  const handleCameraPress = () => {
    console.log('Camera pressed');
  };

  const handleGiftPress = () => {
    // Navigate to VIP/Offers screen
    router.push('/vip-offers' as any);
  };

  const handleNotificationPress = () => {
    // Navigate to notifications screen
    router.push('/notifications' as any);
  };

  const handleCategoryPress = (categoryId: string) => {
    router.push(`/category/${categoryId}` as any);
  };

  const handleProductPress = (productId: string) => {
    router.push(`/product/${productId}` as any);
  };

  const handleBannerPress = (bannerId: string) => {
    console.log('Banner pressed:', bannerId);
  };

  const handleSeeAllPress = (section: string) => {
    switch (section) {
      case 'categories':
        router.push('/explore' as any);
        break;
      case 'new-items':
        router.push('/explore' as any);
        break;
      case 'most-popular':
        router.push('/explore' as any);
        break;
      case 'flash-sale':
        router.push('/vip-offers' as any);
        break;
      case 'just-for-you':
        router.push('/explore' as any);
        break;
      default:
        router.push('/explore' as any);
    }
  };

  if (loading && !homeData) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingSpinner}>
          <IconSymbol name="shopping-bag" size={40} color={theme.colors.primary} />
        </View>
        <Text style={styles.loadingText}>Loading amazing products...</Text>
      </View>
    );
  }

  if (!homeData) {
    return (
      <View style={styles.errorContainer}>
        <IconSymbol name="error" size={48} color={theme.colors.subtitle} />
        <Text style={styles.errorText}>Failed to load data</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Premium Header with Gradient */}
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={['rgba(21, 107, 255, 0.95)', 'rgba(21, 107, 255, 0.8)']}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View style={styles.headerTitleContainer}>
                <Text style={styles.headerTitle}>{APP_CONFIG?.store?.name || 'Fashion Saga'}</Text>
                <View style={styles.premiumBadge}>
                  <IconSymbol name="star" size={12} color="#FFD700" />
                  <Text style={styles.premiumText}>Premium</Text>
                </View>
              </View>
              {!isAuthenticated && (
                <TouchableOpacity style={styles.signInButton} onPress={navigateToAuth}>
                  <BlurView intensity={20} style={styles.signInBlur}>
                    <Text style={styles.signInText}>Sign In</Text>
                  </BlurView>
                </TouchableOpacity>
              )}
            </View>
            <SearchBar
              onCameraPress={handleCameraPress}
            />
          </View>
        </LinearGradient>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
        }
      >
        {/* Floating Quick Actions */}
        <View style={styles.floatingActions}>
          <TouchableOpacity style={styles.floatingButton} onPress={handleGiftPress}>
            <IconSymbol name="gift" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.floatingButton} onPress={handleNotificationPress}>
            <IconSymbol name="notification" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Banner Section with Enhanced Design */}
        {homeData?.banners && homeData.banners.length > 0 && (
          <View style={styles.bannerContainer}>
            <BannerSlider
              banners={homeData.banners}
              onBannerPress={handleBannerPress}
              autoScrollInterval={4000}
            />
          </View>
        )}

        {/* Categories Section with Premium Design */}
        {homeData?.categories && homeData.categories.length > 0 && (
          <View style={styles.sectionContainer}>
            <SectionHeader
              title="Explore Categories"
              showSeeAll
              onSeeAllPress={() => handleSeeAllPress('categories')}
            />
            <View style={styles.categoriesContainer}>
              {homeData.categories.slice(0, 4).map((category, index) => (
                <View key={category.id} style={[styles.categoryWrapper, { animationDelay: index * 100 }]}>
                  <CategoryCard
                    category={category}
                    onPress={() => handleCategoryPress(category.id)}
                  />
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Top Products with Premium Layout */}
        {homeData?.featuredProducts && homeData.featuredProducts.length > 0 && (
          <View style={styles.sectionContainer}>
            <SectionHeader 
              title="Trending Now" 
              customIcon={<IconSymbol name="star" size={16} color="#FFD700" />}
            />
            <FlatList
              data={homeData.featuredProducts}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
              renderItem={({ item, index }) => (
                <View style={[styles.productWrapper, { marginLeft: index === 0 ? 0 : 12 }]}>
                  <ProductCard
                    product={item}
                    variant="circular"
                    onPress={() => handleProductPress(item.id)}
                  />
                </View>
              )}
              keyExtractor={(item) => item.id}
            />
          </View>
        )}

        {/* New Items with Enhanced Design */}
        {homeData?.newArrivals && homeData.newArrivals.length > 0 && (
          <View style={styles.sectionContainer}>
            <SectionHeader
              title="Fresh Arrivals"
              showSeeAll
              onSeeAllPress={() => handleSeeAllPress('new-items')}
            />
            <View style={styles.horizontalListContainer}>
              <FlatList
                data={homeData.newArrivals}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalList}
                renderItem={({ item, index }) => (
                  <View style={[styles.productWrapper, { marginLeft: index === 0 ? 0 : 12 }]}>
                    <ProductCard
                      product={item}
                      onPress={() => handleProductPress(item.id)}
                    />
                  </View>
                )}
                keyExtractor={(item) => item.id}
              />
            </View>
          </View>
        )}

        {/* Flash Sale with Premium Design */}
        {homeData?.flashSale && homeData.flashSale.length > 0 && (
          <View style={styles.flashSaleContainer}>
            <View style={styles.flashSaleHeader}>
              <Text style={styles.flashSaleTitle}>Flash Sale</Text>
              <View style={styles.timerContainer}>
                <IconSymbol name="clock" size={16} color="#FF4444" />
                <Text style={styles.timerText}>23 59 58</Text>
              </View>
            </View>
            <FlatList
              data={homeData.flashSale}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.flashSaleList}
              renderItem={({ item }) => (
                <ProductCard
                  product={item}
                  variant="flashSale"
                  onPress={() => handleProductPress(item.id)}
                />
              )}
              keyExtractor={(item) => item.id}
            />
          </View>
        )}

        {/* Just For You with Premium Design */}
        {homeData?.recommendations && homeData.recommendations.length > 0 && (
          <View style={styles.sectionContainer}>
            <SectionHeader 
              title="Just For You" 
              customIcon={<IconSymbol name="star" size={16} color={theme.colors.primary} />}
            />
            <View style={styles.justForYouGrid}>
              {homeData.recommendations.slice(0, 4).map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  variant="justForYou"
                  onPress={() => handleProductPress(product.id)}
                />
              ))}
            </View>
          </View>
        )}

        {/* Most Popular with Enhanced Design */}
        {homeData?.mostPopular && homeData.mostPopular.length > 0 && (
          <View style={styles.sectionContainer}>
            <SectionHeader
              title="Most Popular"
              showSeeAll
              onSeeAllPress={() => handleSeeAllPress('most-popular')}
            />
            <FlatList
              data={homeData.mostPopular}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
              renderItem={({ item, index }) => (
                <View style={[styles.productWrapper, { marginLeft: index === 0 ? 0 : 12 }]}>
                  <ProductCard
                    product={item}
                    onPress={() => handleProductPress(item.id)}
                  />
                </View>
              )}
              keyExtractor={(item) => item.id}
            />
          </View>
        )}

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingSpinner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(21, 107, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  loadingText: {
    fontSize: theme.fontSizes.subtitle,
    color: theme.colors.subtitle,
    fontFamily: theme.fonts.regular,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  errorText: {
    fontSize: theme.fontSizes.subtitle,
    color: theme.colors.subtitle,
    marginTop: 16,
    fontFamily: theme.fonts.regular,
  },
  headerContainer: {
    position: 'relative',
    zIndex: 10,
  },
  headerGradient: {
    paddingTop: headerPaddingTop,
    paddingBottom: headerPaddingBottom,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: isSmallScreen ? 16 : 20,
    flexWrap: 'wrap',
    gap: 8,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    minWidth: 0,
  },
  headerTitle: {
    fontSize: isSmallScreen ? 20 : Math.min(theme.fontSizes.title + 4, 24),
    color: 'white',
    fontWeight: 'bold',
    fontFamily: theme.fonts.bold,
    flexShrink: 1,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: isSmallScreen ? 6 : 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    flexShrink: 0,
  },
  premiumText: {
    fontSize: isSmallScreen ? 9 : 10,
    color: '#FFD700',
    fontWeight: 'bold',
    fontFamily: theme.fonts.bold,
  },
  signInButton: {
    borderRadius: 20,
    overflow: 'hidden',
    flexShrink: 0,
    minWidth: isSmallScreen ? 70 : 80,
  },
  signInBlur: {
    paddingHorizontal: isSmallScreen ? 12 : 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
  },
  signInText: {
    color: 'white',
    fontSize: isSmallScreen ? 13 : Math.min(theme.fontSizes.link, 14),
    fontWeight: '600',
    fontFamily: theme.fonts.bold,
  },
  scrollView: {
    flex: 1,
  },
  floatingActions: {
    position: 'absolute',
    top: 140,
    right: 20,
    zIndex: 20,
    gap: 12,
  },
  floatingButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  bannerContainer: {
    marginTop: 20,
    marginHorizontal: theme.spacing.lg,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  sectionContainer: {
    marginTop: 32,
    marginBottom: 16,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 8,
  },
  categoryWrapper: {
    width: (width - theme.spacing.lg * 2 - 8) / 2,
  },
  horizontalListContainer: {
    marginTop: 8,
  },
  horizontalList: {
    paddingLeft: theme.spacing.lg,
    paddingRight: theme.spacing.lg,
    paddingBottom: 8,
  },
  productWrapper: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 8,
  },
  flashSaleContainer: {
    marginTop: 32,
    marginHorizontal: theme.spacing.lg,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#FF6B6B',
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  flashSaleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: 20,
    paddingBottom: 16,
  },
  flashSaleTitle: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
    fontFamily: theme.fonts.bold,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 4,
  },
  timerText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
    fontFamily: theme.fonts.bold,
  },
  flashSaleList: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: 20,
  },
  justForYouGrid: {
    flexDirection: 'column',
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: 20,
    gap: 16,
  },
  bottomSpacing: {
    height: 100,
  },
});

export default HomeScreen;