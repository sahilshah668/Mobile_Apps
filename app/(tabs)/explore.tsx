import theme from '@/constants/theme';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { fetchExploreData } from '@/store/productSlice';
import { RootState } from '@/store/store';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    Platform,
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

const ExploreScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { exploreData, loading } = useSelector((state: RootState) => state.products);
  const { isAuthenticated, navigateToAuth } = useAuth();
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<string>('all');

  useEffect(() => {
    dispatch(fetchExploreData());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchExploreData());
  };



  const handleCategoryPress = (categoryId: string) => {
    router.push(`/category/${categoryId}` as any);
  };

  const handleProductPress = (productId: string) => {
    router.push(`/product/${productId}` as any);
  };

  const handleFilterPress = (filter: string) => {
    setActiveFilter(filter);
  };

  const handleSeeAllPress = (section: string) => {
    console.log('See all pressed:', section);
  };

  const getFilteredProducts = () => {
    if (!exploreData) return [];
    
    switch (activeFilter) {
      case 'featured':
        return exploreData.featuredProducts;
      case 'trending':
        return exploreData.trendingProducts;
      case 'new':
        return exploreData.newArrivals;
      case 'sale':
        return exploreData.saleProducts;
      default:
        return [
          ...exploreData.featuredProducts,
          ...exploreData.trendingProducts,
          ...exploreData.newArrivals,
          ...exploreData.saleProducts
        ];
    }
  };

  if (loading && !exploreData) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingSpinner}>
          <IconSymbol name="search" size={40} color={theme.colors.primary} />
        </View>
        <Text style={styles.loadingText}>Discovering amazing products...</Text>
      </View>
    );
  }

  if (!exploreData) {
    return (
      <View style={styles.errorContainer}>
        <IconSymbol name="error" size={48} color={theme.colors.subtitle} />
        <Text style={styles.errorText}>Failed to load explore data</Text>
      </View>
    );
  }

  const filteredProducts = getFilteredProducts();

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
                <Text style={styles.headerTitle}>Explore</Text>
                <View style={styles.premiumBadge}>
                  <IconSymbol name="star" size={12} color="#FFD700" />
                  <Text style={styles.premiumText}>Discover</Text>
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
              placeholder="Search products, categories, brands..."
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
        {/* Categories Grid */}
        <View style={styles.sectionContainer}>
          <SectionHeader
            title="Browse Categories"
            showSeeAll
            onSeeAllPress={() => handleSeeAllPress('categories')}
          />
          <View style={styles.categoriesGrid}>
            {exploreData.categories.map((category, index) => (
              <View key={category.id} style={[styles.categoryWrapper, { animationDelay: index * 100 }]}>
                <CategoryCard
                  category={category}
                  onPress={() => handleCategoryPress(category.id)}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {[
              { id: 'all', label: 'All', icon: 'grid' },
              { id: 'featured', label: 'Featured', icon: 'star' },
              { id: 'trending', label: 'Trending', icon: 'trending-up' },
              { id: 'new', label: 'New', icon: 'newspaper' },
              { id: 'sale', label: 'Sale', icon: 'pricetag' },
            ].map((filter) => (
              <TouchableOpacity
                key={filter.id}
                style={[
                  styles.filterTab,
                  activeFilter === filter.id && styles.filterTabActive
                ]}
                onPress={() => handleFilterPress(filter.id)}
              >
                <IconSymbol 
                  name={filter.icon} 
                  size={16} 
                  color={activeFilter === filter.id ? 'white' : theme.colors.subtitle} 
                />
                <Text style={[
                  styles.filterText,
                  activeFilter === filter.id && styles.filterTextActive
                ]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Products Grid */}
        <View style={styles.sectionContainer}>
          <SectionHeader
            title={activeFilter === 'all' ? 'All Products' : 
                  activeFilter === 'featured' ? 'Featured Products' :
                  activeFilter === 'trending' ? 'Trending Now' :
                  activeFilter === 'new' ? 'New Arrivals' : 'Sale Items'}
            showSeeAll
            onSeeAllPress={() => handleSeeAllPress(activeFilter)}
          />
          <View style={styles.productsGrid}>
            {filteredProducts.map((product, index) => (
              <View key={product.id} style={[styles.productWrapper, { animationDelay: index * 50 }]}>
                <ProductCard
                  product={product}
                  onPress={() => handleProductPress(product.id)}
                  showAddToCart={true}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity style={styles.quickActionButton} onPress={() => router.push('/search-results' as any)}>
            <IconSymbol name="search" size={20} color={theme.colors.primary} />
            <Text style={styles.quickActionText}>Advanced Search</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionButton} onPress={() => router.push('/filters' as any)}>
            <IconSymbol name="options" size={20} color={theme.colors.primary} />
            <Text style={styles.quickActionText}>Filters</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
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
    marginBottom: theme.spacing.lg,
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
    fontFamily: theme.fonts.regular,
    marginTop: theme.spacing.md,
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
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
    marginBottom: theme.spacing.md,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  headerTitle: {
    fontSize: 28,
    color: 'white',
    fontWeight: '700',
    fontFamily: theme.fonts.bold,
    letterSpacing: -0.5,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  premiumText: {
    fontSize: 12,
    color: '#FFD700',
    fontWeight: '600',
    fontFamily: theme.fonts.bold,
  },
  signInButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  signInBlur: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  signInText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
    fontFamily: theme.fonts.bold,
  },
  scrollView: {
    flex: 1,
    marginTop: Platform.OS === 'web' ? headerPaddingTop + 30 : headerPaddingTop + 120,
  },
  sectionContainer: {
    marginBottom: theme.spacing.xl,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  categoryWrapper: {
    width: (width - theme.spacing.lg * 2 - theme.spacing.sm) / 2,
    marginBottom: theme.spacing.sm,
  },
  filterContainer: {
    marginBottom: theme.spacing.lg,
  },
  filterScroll: {
    paddingHorizontal: theme.spacing.lg,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(21, 107, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: theme.spacing.sm,
    gap: 6,
  },
  filterTabActive: {
    backgroundColor: theme.colors.primary,
  },
  filterText: {
    fontSize: 14,
    color: theme.colors.subtitle,
    fontWeight: '600',
    fontFamily: theme.fonts.bold,
  },
  filterTextActive: {
    color: 'white',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  productWrapper: {
    width: (width - theme.spacing.lg * 2 - theme.spacing.sm) / 2,
    marginBottom: theme.spacing.sm,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(21, 107, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    gap: 8,
  },
  quickActionText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '600',
    fontFamily: theme.fonts.bold,
  },
  bottomPadding: {
    height: 100,
  },
});

export default ExploreScreen; 