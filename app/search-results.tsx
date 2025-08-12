import theme from '@/constants/theme';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { searchProducts, updateSearchFilters } from '@/store/productSlice';
import { RootState } from '@/store/store';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    FlatList,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSelector } from 'react-redux';

import ProductCard from '@/components/ProductCard';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useAuth } from '@/hooks/useAuth';

const { width, height } = Dimensions.get('window');

const SearchResultsScreen: React.FC = () => {
  const { query } = useLocalSearchParams<{ query: string }>();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isAuthenticated, navigateToAuth } = useAuth();
  const { searchFilters, loading } = useSelector((state: RootState) => state.products);
  
  const [searchQuery, setSearchQuery] = useState(query || '');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);

  const categories = ['Clothing', 'Shoes', 'Bags', 'Accessories', 'Jewelry', 'Watches', 'Sunglasses'];
  const brands = ['Luxury Brand', 'Fashion Co', 'Elegance', 'Athletic Pro', 'Timepiece', 'Vision', 'Summer Style', 'Leather Craft'];

  useEffect(() => {
    if (query) {
      setSearchQuery(query);
      performSearch();
    }
  }, [query]);

  const performSearch = () => {
    const filters = {
      ...searchFilters.filters,
      priceRange,
      categories: selectedCategories,
      brands: selectedBrands,
    };
    
    const searchTerm = query || searchQuery;
    if (searchTerm) {
      dispatch(searchProducts({ query: searchTerm, filters, page: 1 }));
    }
  };

  const handleBackPress = () => {
    router.back();
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      performSearch();
    }
  };

  const handleProductPress = (productId: string) => {
    router.push(`/product/${productId}` as any);
  };

  const handleFilterToggle = () => {
    setShowFilters(!showFilters);
  };

  const handleViewModePress = () => {
    setViewMode(viewMode === 'grid' ? 'list' : 'grid');
  };

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleBrandToggle = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand) 
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

  const handleApplyFilters = () => {
    performSearch();
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setPriceRange([0, 1000]);
    setSelectedCategories([]);
    setSelectedBrands([]);
    dispatch(updateSearchFilters({
      priceRange: [0, 1000],
      categories: [],
      brands: [],
    }));
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <LinearGradient
        colors={['rgba(21, 107, 255, 0.95)', 'rgba(21, 107, 255, 0.8)']}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
              <BlurView intensity={20} style={styles.backButtonBlur}>
                <IconSymbol name="arrow-back" size={20} color="white" />
              </BlurView>
            </TouchableOpacity>
            <View style={styles.searchContainer}>
              <View style={styles.searchInputContainer}>
                <IconSymbol name="search" size={18} color="rgba(255, 255, 255, 0.7)" />
                <TextInput
                  style={styles.searchInput}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  onSubmitEditing={handleSearchSubmit}
                  placeholder="Search products..."
                  placeholderTextColor="rgba(255, 255, 255, 0.7)"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <IconSymbol name="close" size={18} color="rgba(255, 255, 255, 0.7)" />
                  </TouchableOpacity>
                )}
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
        </View>
      </LinearGradient>
    </View>
  );

  const renderToolbar = () => (
    <View style={styles.toolbar}>
      <View style={styles.toolbarLeft}>
        <Text style={styles.resultsText}>
          {searchFilters.totalResults} results for "{searchQuery}"
        </Text>
      </View>
      <View style={styles.toolbarRight}>
        <TouchableOpacity style={styles.toolbarButton} onPress={handleFilterToggle}>
          <IconSymbol name="options" size={18} color={theme.colors.subtitle} />
          <Text style={styles.toolbarButtonText}>Filters</Text>
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

  const renderFilters = () => (
    showFilters && (
      <View style={styles.filtersContainer}>
        <View style={styles.filtersOverlay}>
          <View style={styles.filtersContent}>
            {/* Header */}
            <View style={styles.filtersHeader}>
              <Text style={styles.filtersTitle}>Filters & Sort</Text>
              <TouchableOpacity style={styles.closeButton} onPress={handleFilterToggle}>
                <IconSymbol name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.filtersScroll}>
              {/* Price Range */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Price Range</Text>
                <View style={styles.priceRangeContainer}>
                  <View style={styles.priceRangeHeader}>
                    <Text style={styles.priceRangeLabel}>${priceRange[0]} - ${priceRange[1]}</Text>
                    <TouchableOpacity onPress={() => setPriceRange([0, 1000])}>
                      <Text style={styles.resetText}>Reset</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.priceSliderContainer}>
                    <View style={styles.priceSlider}>
                      <View style={[styles.priceSliderFill, { width: `${(priceRange[1] / 1000) * 100}%` }]} />
                      <View style={[styles.priceSliderThumb, { left: `${(priceRange[1] / 1000) * 100}%` }]} />
                    </View>
                    <View style={styles.priceRangeLabels}>
                      <Text style={styles.priceRangeMin}>$0</Text>
                      <Text style={styles.priceRangeMax}>$1000</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Categories */}
              <View style={styles.filterSection}>
                <View style={styles.filterSectionHeader}>
                  <Text style={styles.filterSectionTitle}>Categories</Text>
                  <Text style={styles.filterCount}>{selectedCategories.length} selected</Text>
                </View>
                <View style={styles.filterOptions}>
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.filterOption,
                        selectedCategories.includes(category) && styles.filterOptionActive
                      ]}
                      onPress={() => handleCategoryToggle(category)}
                    >
                      <Text style={[
                        styles.filterOptionText,
                        selectedCategories.includes(category) && styles.filterOptionTextActive
                      ]}>
                        {category}
                      </Text>
                      {selectedCategories.includes(category) && (
                        <IconSymbol name="checkmark" size={16} color="white" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Brands */}
              <View style={styles.filterSection}>
                <View style={styles.filterSectionHeader}>
                  <Text style={styles.filterSectionTitle}>Brands</Text>
                  <Text style={styles.filterCount}>{selectedBrands.length} selected</Text>
                </View>
                <View style={styles.filterOptions}>
                  {brands.map((brand) => (
                    <TouchableOpacity
                      key={brand}
                      style={[
                        styles.filterOption,
                        selectedBrands.includes(brand) && styles.filterOptionActive
                      ]}
                      onPress={() => handleBrandToggle(brand)}
                    >
                      <Text style={[
                        styles.filterOptionText,
                        selectedBrands.includes(brand) && styles.filterOptionTextActive
                      ]}>
                        {brand}
                      </Text>
                      {selectedBrands.includes(brand) && (
                        <IconSymbol name="checkmark" size={16} color="white" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Bottom Spacing */}
              <View style={styles.bottomSpacing} />
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.filterActions}>
              <TouchableOpacity style={styles.clearButton} onPress={handleClearFilters}>
                <Text style={styles.clearButtonText}>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyButton} onPress={handleApplyFilters}>
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    )
  );

  const renderProducts = () => (
    <FlatList
      data={searchFilters.results}
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
        <RefreshControl refreshing={loading} onRefresh={performSearch} />
      }
      ListEmptyComponent={
        !loading && (
          <View style={styles.emptyContainer}>
            <IconSymbol name="search" size={48} color={theme.colors.subtitle} />
            <Text style={styles.emptyTitle}>No results found</Text>
            <Text style={styles.emptyText}>
              Try adjusting your search terms or filters to find what you're looking for.
            </Text>
          </View>
        )
      }
    />
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {renderHeader()}
      
      <View style={styles.content}>
        {renderToolbar()}
        {renderFilters()}
        {renderProducts()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
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
    gap: theme.spacing.md,
  },
  backButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  backButtonBlur: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flex: 1,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    paddingHorizontal: 16,
    height: 44,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: 'white',
    fontFamily: theme.fonts.regular,
    paddingVertical: 0,
    minHeight: 0,
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
  content: {
    flex: 1,
    marginTop: 120,
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
  filtersContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 1000,
  },
  filtersOverlay: {
    flex: 1,
    marginTop: 80,
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  filtersContent: {
    flex: 1,
    paddingTop: theme.spacing.lg,
  },
  filtersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  filtersTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersScroll: {
    flex: 1,
  },
  filterSection: {
    marginBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
  },
  filterSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  filterSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
  },
  filterCount: {
    fontSize: 13,
    color: theme.colors.subtitle,
    fontFamily: theme.fonts.regular,
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 22,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    minWidth: 80,
  },
  filterOptionActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  filterOptionText: {
    fontSize: 14,
    color: theme.colors.subtitle,
    marginRight: 8,
    fontFamily: theme.fonts.regular,
  },
  filterOptionTextActive: {
    color: 'white',
    fontFamily: theme.fonts.bold,
  },
  priceRangeContainer: {
    marginBottom: theme.spacing.md,
  },
  priceRangeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  priceRangeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
  },
  resetText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontFamily: theme.fonts.bold,
  },
  priceSliderContainer: {
    position: 'relative',
    height: 40,
    justifyContent: 'center',
  },
  priceSlider: {
    height: 6,
    backgroundColor: '#E9ECEF',
    borderRadius: 3,
    position: 'relative',
  },
  priceSliderFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 3,
  },
  priceSliderThumb: {
    position: 'absolute',
    top: -8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'white',
    borderWidth: 3,
    borderColor: theme.colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  priceRangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  priceRangeMin: {
    fontSize: 12,
    color: theme.colors.subtitle,
    fontFamily: theme.fonts.regular,
  },
  priceRangeMax: {
    fontSize: 12,
    color: theme.colors.subtitle,
    fontFamily: theme.fonts.regular,
  },
  bottomSpacing: {
    height: theme.spacing.lg,
  },
  filterActions: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    gap: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: theme.colors.background,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 25,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  clearButtonText: {
    fontSize: 16,
    color: theme.colors.subtitle,
    fontFamily: theme.fonts.bold,
  },
  applyButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 25,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  applyButtonText: {
    fontSize: 16,
    color: 'white',
    fontFamily: theme.fonts.bold,
  },
  productsList: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: 100,
  },
  productRow: {
    justifyContent: 'space-between',
  },
  productWrapper: {
    width: (width - theme.spacing.lg * 2 - theme.spacing.sm) / 2,
    marginBottom: theme.spacing.sm,
  },
  productWrapperList: {
    width: '100%',
    marginBottom: theme.spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyTitle: {
    fontSize: 20,
    color: theme.colors.text,
    fontWeight: '600',
    fontFamily: theme.fonts.bold,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.subtitle,
    textAlign: 'center',
    fontFamily: theme.fonts.regular,
    lineHeight: 24,
    paddingHorizontal: theme.spacing.lg,
  },
});

export default SearchResultsScreen; 