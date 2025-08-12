import WishlistItemCard from '@/components/WishlistItemCard';
import theme from '@/constants/theme';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useAuth } from '@/hooks/useAuth';

import {
    moveFromWishlistToCart,
    removeFromWishlist,
    selectWishlistItemCount,
    selectWishlistItems,
    setAuthenticated,
} from '@/store/cartSlice';
import { Product } from '@/store/productSlice';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';

// Define loadLocalFavoritesData before its usage
const loadLocalFavoritesData = async () => {
  try {
    // TODO: Load product data for local favorites
    // This would require fetching product details for the stored IDs
  } catch (error) {
    console.error('Error loading local favorites data:', error);
  }
};

const FavoritesScreen: React.FC = () => {
  const { isAuthenticated, navigateToAuth } = useAuth();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const hasAddedSampleData = useRef(false);
  const hasLoadedLocalData = useRef(false);
  
  const wishlistItems = useSelector(selectWishlistItems);
  const wishlistItemCount = useSelector(selectWishlistItemCount);

  // Load local favorites data when not authenticated
  useEffect(() => {
    if (!isAuthenticated && !hasLoadedLocalData.current) {
      loadLocalFavoritesData();
      hasLoadedLocalData.current = true;
    }
    
    // Update authentication state in cart slice
    dispatch(setAuthenticated(isAuthenticated));
  }, [isAuthenticated, dispatch, loadLocalFavoritesData]);

  // Add some sample data for demonstration (only for authenticated users)
  useEffect(() => {
    if (isAuthenticated && wishlistItems.length === 0 && !hasAddedSampleData.current) {
      // Add sample wishlist items
      const sampleWishlistProducts: Product[] = [
        {
          id: '1',
          name: 'Premium Leather Handbag',
          price: 89,
          image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=200&h=200&fit=crop',
          category: 'Bags',
          brand: 'Luxury Brand',
          rating: 4.8,
          reviews: 124,
          inStock: true,
        },
        {
          id: '2',
          name: 'Classic Denim Jacket',
          price: 65,
          image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=200&h=200&fit=crop',
          category: 'Clothing',
          brand: 'Fashion Co',
          rating: 4.6,
          reviews: 89,
          inStock: true,
        },
        {
          id: '3',
          name: 'Elegant Evening Dress',
          price: 120,
          image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=200&h=200&fit=crop',
          category: 'Clothing',
          brand: 'Elegance',
          rating: 4.9,
          reviews: 156,
          inStock: true,
        },
        {
          id: '4',
          name: 'Sporty Running Shoes',
          price: 95,
          image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=200&h=200&fit=crop',
          category: 'Shoes',
          brand: 'Athletic Pro',
          rating: 4.7,
          reviews: 203,
          inStock: true,
        },
      ];

      sampleWishlistProducts.forEach((product) => {
        dispatch({
          type: 'cart/addToWishlist',
          payload: {
            product,
            color: 'Pink',
            size: 'M',
          },
        });
      });
      hasAddedSampleData.current = true;
    }
  }, [isAuthenticated, dispatch, wishlistItems.length]);

  const handleRemoveFromWishlist = (id: string) => {
    dispatch(removeFromWishlist(id));
  };

  const handleAddToCartFromWishlist = (id: string) => {
    dispatch(moveFromWishlistToCart({ wishlistId: id, quantity: 1 }));
    // Success feedback is handled by the UI state changes
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Favorites</Text>
        <Text style={styles.itemCount}>{wishlistItemCount}</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {!isAuthenticated && (
          <View style={styles.authNotice}>
            <Text style={styles.authNoticeText}>
              You&apos;re viewing favorites as a guest. Sign in to sync your favorites across devices.
            </Text>
            <TouchableOpacity style={styles.signInButton} onPress={navigateToAuth}>
              <Text style={styles.signInButtonText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        )}

        {wishlistItems.length > 0 ? (
          wishlistItems.map((item) => (
            <WishlistItemCard
              key={item.id}
              item={item}
              onRemove={handleRemoveFromWishlist}
              onAddToCart={handleAddToCartFromWishlist}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
            <Text style={styles.emptySubtitle}>
              {isAuthenticated 
                ? 'Start adding items to your favorites' 
                : 'Browse products and add them to your favorites'
              }
            </Text>
            <TouchableOpacity 
              style={styles.browseButton} 
              onPress={() => router.push('/(tabs)/explore' as any)}
            >
              <Text style={styles.browseButtonText}>Browse Products</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    paddingTop: theme.spacing.lg + 20, // Add extra padding for notch
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: theme.colors.background,
  },
  title: {
    fontSize: 24,
    color: theme.colors.text,
    fontWeight: 'bold',
    fontFamily: theme.fonts.bold,
  },
  itemCount: {
    fontSize: 14,
    color: theme.colors.subtitle,
    fontFamily: theme.fonts.regular,
  },
  authNotice: {
    backgroundColor: '#F8F9FA',
    padding: theme.spacing.md,
    borderRadius: 12,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  authNoticeText: {
    fontSize: 14,
    color: theme.colors.subtitle,
    fontFamily: theme.fonts.regular,
    marginBottom: theme.spacing.sm,
  },
  signInButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  signInButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: theme.fonts.bold,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
    marginBottom: theme.spacing.sm,
  },
  emptySubtitle: {
    fontSize: 16,
    color: theme.colors.subtitle,
    fontFamily: theme.fonts.regular,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  browseButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  browseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: theme.fonts.bold,
  },
});

export default FavoritesScreen; 