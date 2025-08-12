import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/IconSymbol';
import theme from '@/constants/theme';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { searchProducts } from '@/store/productSlice';



interface SearchSuggestion {
  id: string;
  text: string;
  type: 'recent' | 'popular' | 'category';
  icon?: string;
}

const SearchScreen: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const insets = useSafeAreaInsets();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSort, setSelectedSort] = useState('popular');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  
  const searchInputRef = useRef<TextInput>(null);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const categories = ['Clothing', 'Shoes', 'Bags', 'Accessories', 'Jewelry', 'Watches', 'Sunglasses'];
  const brands = ['Luxury Brand', 'Fashion Co', 'Elegance', 'Athletic Pro', 'Timepiece', 'Vision', 'Summer Style', 'Leather Craft'];

  const sortOptions = [
    { id: 'popular', label: 'Most Popular', icon: 'trending-up' },
    { id: 'newest', label: 'Newest First', icon: 'time' },
    { id: 'price_asc', label: 'Price: Low to High', icon: 'arrow-up' },
    { id: 'price_desc', label: 'Price: High to Low', icon: 'arrow-down' },
    { id: 'rating', label: 'Highest Rated', icon: 'star' },
    { id: 'name', label: 'Name A-Z', icon: 'text' },
  ];

  const searchSuggestions: SearchSuggestion[] = [
    // Recent searches
    { id: '1', text: 'leather handbag', type: 'recent', icon: 'time' },
    { id: '2', text: 'running shoes', type: 'recent', icon: 'time' },
    { id: '3', text: 'summer dress', type: 'recent', icon: 'time' },
    
    // Popular searches
    { id: '4', text: 'denim jacket', type: 'popular', icon: 'trending-up' },
    { id: '5', text: 'sneakers', type: 'popular', icon: 'trending-up' },
    { id: '6', text: 'evening dress', type: 'popular', icon: 'trending-up' },
    { id: '7', text: 'sunglasses', type: 'popular', icon: 'trending-up' },
    
    // Categories
    { id: '8', text: 'Clothing', type: 'category', icon: 'shirt' },
    { id: '9', text: 'Shoes', type: 'category', icon: 'footsteps' },
    { id: '10', text: 'Bags', type: 'category', icon: 'bag' },
    { id: '11', text: 'Accessories', type: 'category', icon: 'watch' },
  ];

  useEffect(() => {
    // Focus the search input when the screen loads
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
  }, []);

  useEffect(() => {
    if (showFilters) {
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [showFilters, slideAnim]);

  const handleBackPress = () => {
    router.back();
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setShowSuggestions(false);
    
    if (query.trim()) {
      const filters = {
        priceRange,
        categories: selectedCategories,
        brands: selectedBrands,
        sizes: selectedSizes,
        colors: selectedColors,
        sortBy: selectedSort as any,
        sortOrder: selectedSort.includes('price_desc') ? 'desc' : 'asc',
      };
      
      dispatch(searchProducts({ query, filters, page: 1 }));
      router.push(`/search-results?query=${encodeURIComponent(query)}`);
    }
  };

  const handleSuggestionPress = (suggestion: SearchSuggestion) => {
    handleSearch(suggestion.text);
  };

  const handleFilterToggle = () => {
    setShowFilters(!showFilters);
  };

  const handleSortChange = (sortId: string) => {
    setSelectedSort(sortId);
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
    if (searchQuery.trim()) {
      handleSearch(searchQuery);
    }
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setPriceRange([0, 1000]);
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSelectedSizes([]);
    setSelectedColors([]);
    setSelectedSort('popular');
  };

  const renderHeader = () => (
    <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
      <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
        <IconSymbol name="arrow-back" size={24} color={theme.colors.text} />
      </TouchableOpacity>
      
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <IconSymbol name="search" size={20} color={theme.colors.subtitle} />
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              setShowSuggestions(text.length === 0);
            }}
            onSubmitEditing={() => handleSearch(searchQuery)}
            placeholder="Search for products..."
            placeholderTextColor={theme.colors.subtitle}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => {
              setSearchQuery('');
              setShowSuggestions(true);
            }}>
              <IconSymbol name="close" size={20} color={theme.colors.subtitle} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <TouchableOpacity style={styles.filterButton} onPress={handleFilterToggle}>
        <IconSymbol name="options" size={24} color={theme.colors.primary} />
      </TouchableOpacity>
    </View>
  );

  const renderSearchSuggestions = () => (
    showSuggestions && (
      <View style={styles.suggestionsContainer}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Recent Searches */}
          <View style={styles.suggestionSection}>
            <Text style={styles.suggestionSectionTitle}>Recent Searches</Text>
            {searchSuggestions.filter(s => s.type === 'recent').map((suggestion) => (
              <TouchableOpacity
                key={suggestion.id}
                style={styles.suggestionItem}
                onPress={() => handleSuggestionPress(suggestion)}
              >
                <IconSymbol 
                  name={suggestion.icon || 'search'} 
                  size={18} 
                  color={theme.colors.subtitle} 
                />
                <Text style={styles.suggestionText}>{suggestion.text}</Text>
                <View style={[styles.suggestionBadge, { backgroundColor: '#E3F2FD' }]}>
                  <Text style={[styles.suggestionBadgeText, { color: '#1976D2' }]}>Recent</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Popular Searches */}
          <View style={styles.suggestionSection}>
            <Text style={styles.suggestionSectionTitle}>Popular Searches</Text>
            {searchSuggestions.filter(s => s.type === 'popular').map((suggestion) => (
              <TouchableOpacity
                key={suggestion.id}
                style={styles.suggestionItem}
                onPress={() => handleSuggestionPress(suggestion)}
              >
                <IconSymbol 
                  name={suggestion.icon || 'search'} 
                  size={18} 
                  color={theme.colors.subtitle} 
                />
                <Text style={styles.suggestionText}>{suggestion.text}</Text>
                <View style={[styles.suggestionBadge, { backgroundColor: '#FFF3E0' }]}>
                  <Text style={[styles.suggestionBadgeText, { color: '#F57C00' }]}>Popular</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Categories */}
          <View style={styles.suggestionSection}>
            <Text style={styles.suggestionSectionTitle}>Browse Categories</Text>
            {searchSuggestions.filter(s => s.type === 'category').map((suggestion) => (
              <TouchableOpacity
                key={suggestion.id}
                style={styles.suggestionItem}
                onPress={() => handleSuggestionPress(suggestion)}
              >
                <IconSymbol 
                  name={suggestion.icon || 'search'} 
                  size={18} 
                  color={theme.colors.subtitle} 
                />
                <Text style={styles.suggestionText}>{suggestion.text}</Text>
                <View style={[styles.suggestionBadge, { backgroundColor: '#E8F5E8' }]}>
                  <Text style={[styles.suggestionBadgeText, { color: '#388E3C' }]}>Category</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    )
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
              {/* Sort Options */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Sort By</Text>
                <View style={styles.sortOptions}>
                  {sortOptions.map((option) => (
                    <TouchableOpacity
                      key={option.id}
                      style={[
                        styles.sortOption,
                        selectedSort === option.id && styles.sortOptionActive
                      ]}
                      onPress={() => handleSortChange(option.id)}
                    >
                      <IconSymbol 
                        name={option.icon} 
                        size={16} 
                        color={selectedSort === option.id ? 'white' : theme.colors.subtitle} 
                      />
                      <Text style={[
                        styles.sortOptionText,
                        selectedSort === option.id && styles.sortOptionTextActive
                      ]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      {renderHeader()}
      {renderSearchSuggestions()}
      {renderFilters()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  searchContainer: {
    flex: 1,
    marginHorizontal: theme.spacing.md,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 25,
    paddingHorizontal: theme.spacing.md,
    height: 44,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
    fontFamily: theme.fonts.regular,
  },
  filterButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  suggestionsContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  suggestionSection: {
    marginBottom: theme.spacing.lg,
  },
  suggestionSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.md,
    fontFamily: theme.fonts.bold,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  suggestionText: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
    marginLeft: theme.spacing.md,
    fontFamily: theme.fonts.regular,
  },
  suggestionBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  suggestionBadgeText: {
    fontSize: 12,
    fontWeight: '500',
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
  sortOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 22,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    minWidth: 100,
  },
  sortOptionActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  sortOptionText: {
    fontSize: 14,
    color: theme.colors.subtitle,
    marginLeft: 8,
    fontFamily: theme.fonts.regular,
  },
  sortOptionTextActive: {
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
  bottomSpacing: {
    height: theme.spacing.lg,
  },
});

export default SearchScreen; 