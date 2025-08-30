import theme from '@/constants/theme';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { fetchCategoryDetails, setSelectedCategory } from '@/store/productSlice';
import { RootState } from '@/store/store';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    FlatList,
    RefreshControl,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSelector } from 'react-redux';

import ProductCard from '@/components/ProductCard';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useAuth } from '@/hooks/useAuth';

const { width } = Dimensions.get('window');

const CategoryDetailScreen: React.FC = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isAuthenticated, navigateToAuth } = useAuth();
  const { exploreData, loading, categoryDetails } = useSelector((state: RootState) => state.products);
  
  // Use static theme and features
  const hasReviews = true;
  const hasWishlist = true;
  const hasSocialSharing = false;
  
  const [sortBy, setSortBy] = useState<'popular' | 'price' | 'newest' | 'rating'>('popular');
  const [sortOrder] = useState<'asc' | 'desc'>('desc');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  console.log('categoryDetails', categoryDetails);
  // Use real category data from API or fallback to explore data
  const category = categoryDetails?.data?.category || exploreData?.categories.find(cat => cat.id === id) || {
    id: id || '1',
    name: 'Loading...',
    image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=200&fit=crop',
    productCount: 0,
    description: 'Loading category...',
  };

  // Use real products from API
  const categoryProducts = categoryDetails?.products || [];

  // Add debugging for the fixed data access
  useEffect(() => {
    console.log('🔍 Category page - Fixed data access:', {
      categoryId: id,
      categoryName: category?.name,
      categoryProductCount: category?.productCount,
      actualProductsLength: categoryProducts.length,
      hasCategoryDetails: !!categoryDetails,
      categoryDetailsKeys: categoryDetails ? Object.keys(categoryDetails) : [],
      firstProductId: categoryProducts[0]?.id || 'No product'
    });
  }, [id, category, categoryProducts, categoryDetails]);

  useEffect(() => {
    if (id) {
      dispatch(setSelectedCategory(id));
      dispatch(fetchCategoryDetails(id));
    }
  }, [id, dispatch]);

  const handleBackPress = () => {
    router.back();
  };

  const handleProductPress = (productId: string) => {
    console.log('productId::::', productId);

    router.push(`/product/${productId}` as any);
  };

  const handleSortPress = () => {
    setShowSortMenu(!showSortMenu);
  };

  const handleSortOptionPress = (option: 'popular' | 'price' | 'newest' | 'rating') => {
    setSortBy(option);
    setShowSortMenu(false);
  };

  const handleViewModePress = () => {
    setViewMode(viewMode === 'grid' ? 'list' : 'grid');
  };

  const getSortedProducts = () => {
    const sorted = [...categoryProducts];
    
    sorted.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'rating':
          comparison = (a.rating || 0) - (b.rating || 0);
          break;
        case 'newest':
          comparison = a.id.localeCompare(b.id);
          break;
        case 'popular':
        default:
          comparison = (a.reviews || 0) - (b.reviews || 0);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return sorted;
  };

  const sortedProducts = getSortedProducts();

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primary]}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
              <BlurView intensity={20} style={styles.backButtonBlur}>
                <IconSymbol name="arrow-back" size={20} color="white" />
              </BlurView>
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>{category.name}</Text>
              <Text style={styles.itemCount}>{categoryDetails?.pagination?.total || category.productCount || 0} items</Text>
            </View>
            {!isAuthenticated && (
              <TouchableOpacity style={styles.signInButton} onPress={navigateToAuth}>
                <BlurView intensity={20} style={styles.signInBlur}>
                  <Text style={styles.signInText}>Sign In</Text>
                </BlurView>
              </TouchableOpacity>
            )}
          </View>
          {category.description && (
            <Text style={styles.categoryDescription}>{category.description}</Text>
          )}
        </View>
      </LinearGradient>
    </View>
  );

  const renderToolbar = () => (
    <View style={styles.toolbar}>
      <View style={styles.toolbarLeft}>
        <Text style={styles.resultsText}>
          {categoryDetails?.pagination?.total || sortedProducts.length} products
        </Text>
      </View>
      <View style={styles.toolbarRight}>
        <TouchableOpacity style={styles.toolbarButton} onPress={handleSortPress}>
          <IconSymbol name="funnel" size={18} color={theme.colors.subtitle} />
          <Text style={styles.toolbarButtonText}>Sort</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolbarButton} onPress={handleViewModePress}>
          <IconSymbol 
            name={viewMode === 'grid' ? 'list' : 'grid'} 
            size={18} 
            color={theme.colors.subtitle} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSortMenu = () => (
    showSortMenu && (
      <View style={styles.sortMenu}>
        <BlurView intensity={20} style={styles.sortMenuBlur}>
          {[
            { id: 'popular', label: 'Most Popular', icon: 'trending-up' as const },
            { id: 'price', label: 'Price', icon: 'price-tag' as const },
            { id: 'newest', label: 'Newest', icon: 'newspaper' as const },
            { id: 'rating', label: 'Highest Rated', icon: 'star' as const },
          ].map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.sortOption,
                sortBy === option.id && styles.sortOptionActive
              ]}
              onPress={() => handleSortOptionPress(option.id as any)}
            >
              <IconSymbol 
                name={option.icon} 
                size={16} 
                color={sortBy === option.id ? theme.colors.primary : theme.colors.subtitle} 
              />
              <Text style={[
                styles.sortOptionText,
                sortBy === option.id && styles.sortOptionTextActive
              ]}>
                {option.label}
              </Text>
              {sortBy === option.id && (
                <IconSymbol name="checkmark" size={16} color={theme.colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </BlurView>
      </View>
    )
  );



  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {renderHeader()}
      
      <View style={styles.content}>
        {renderToolbar()}
        {renderSortMenu()}
        
        {loading && categoryProducts.length === 0 ? (
          <View style={styles.loadingContainer}>
            <IconSymbol name="search" size={40} color={theme.colors.primary} />
            <Text style={styles.loadingText}>Loading products...</Text>
          </View>
        ) : categoryProducts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <IconSymbol name="search" size={48} color={theme.colors.subtitle} />
            <Text style={styles.emptyText}>No products found in this category</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => dispatch(fetchCategoryDetails(id))}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={sortedProducts}
            key={viewMode} // Add key prop to force re-render when viewMode changes
            renderItem={({ item, index }) => (
              <View 
                style={[
                  viewMode === 'grid' ? styles.productWrapper : styles.productWrapperList,
                  { animationDelay: index * 50 }
                ]}
              >
                <ProductCard
                  product={item}
                  onPress={() => handleProductPress(item.id)}
                  showAddToCart={true}
                  size={viewMode === 'list' ? 'large' : 'medium'}
                />
              </View>
            )}
            keyExtractor={(item) => item.id}
            numColumns={viewMode === 'grid' ? 2 : 1}
            columnWrapperStyle={viewMode === 'grid' ? styles.productRow : undefined}
            contentContainerStyle={styles.productsList}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl 
                refreshing={loading} 
                onRefresh={() => dispatch(fetchCategoryDetails(id))}
                tintColor={theme.colors.primary}
                colors={[theme.colors.primary]}
              />
            }
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: theme.spacing.lg,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  backButton: {
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: theme.spacing.md,
  },
  backButtonBlur: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    color: 'white',
    fontWeight: '700',
    fontFamily: theme.fonts.bold,
    letterSpacing: -0.5,
  },
  itemCount: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: theme.fonts.regular,
    marginTop: 2,
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
  categoryDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: theme.fonts.regular,
    lineHeight: 22,
  },
  content: {
    flex: 1,
    marginTop: 180,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    backgroundColor: theme.colors.background,
  },
  toolbarLeft: {
    flex: 1,
  },
  resultsText: {
    fontSize: 14,
    color: theme.colors.subtitle,
    fontFamily: theme.fonts.regular,
  },
  toolbarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  toolbarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(21, 107, 255, 0.1)',
    gap: 6,
  },
  toolbarButtonText: {
    fontSize: 14,
    color: theme.colors.subtitle,
    fontWeight: '600',
    fontFamily: theme.fonts.bold,
  },
  sortMenu: {
    position: 'absolute',
    top: 60,
    right: theme.spacing.lg,
    zIndex: 1000,
    borderRadius: 12,
    overflow: 'hidden',
  },
  sortMenuBlur: {
    padding: theme.spacing.sm,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: theme.spacing.sm,
    minWidth: 160,
  },
  sortOptionActive: {
    backgroundColor: 'rgba(21, 107, 255, 0.1)',
  },
  sortOptionText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.subtitle,
    fontWeight: '600',
    fontFamily: theme.fonts.bold,
  },
  sortOptionTextActive: {
    color: theme.colors.primary,
  },
  productsList: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: 100,
  },
  productRow: {
    justifyContent: 'space-between',
  },
  productsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  productsContainerList: {
    flexDirection: 'column',
  },
  productWrapper: {
    width: (width - theme.spacing.lg * 2 - theme.spacing.sm) / 2,
    marginBottom: theme.spacing.sm,
  },
  productWrapperList: {
    width: '100%',
    marginBottom: theme.spacing.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  loadingText: {
    fontSize: theme.fontSizes.subtitle,
    color: theme.colors.subtitle,
    fontFamily: theme.fonts.regular,
    marginTop: theme.spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  emptyText: {
    fontSize: theme.fontSizes.subtitle,
    color: theme.colors.subtitle,
    fontFamily: theme.fonts.regular,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: theme.spacing.lg,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
    fontFamily: theme.fonts.bold,
  },
});

export default CategoryDetailScreen; 