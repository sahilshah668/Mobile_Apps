import CartItemCard from '@/components/CartItemCard';
import CheckoutButton from '@/components/CheckoutButton';
import ShippingAddressCard from '@/components/ShippingAddressCard';
import WishlistItemCard from '@/components/WishlistItemCard';
import theme from '@/constants/theme';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useAuth } from '@/hooks/useAuth';

import {
    loadLocalCart,
    moveFromWishlistToCart,
    removeFromCart,
    removeFromWishlist,
    selectCartItemCount,
    selectCartItems,
    selectCartTotal,
    selectShippingAddress,
    selectWishlistItems,
    setAuthenticated,
    updateCartItemQuantity,
} from '@/store/cartSlice';
import { Product } from '@/store/productSlice';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';

// Define loadLocalCartData before its usage
const loadLocalCartData = async () => {
  try {
    // Load local cart items (will be populated with product data when available)
    dispatch(loadLocalCart());
    // TODO: Load product data for local cart items
    // This would require fetching product details for the stored IDs
  } catch (error) {
    console.error('Error loading local cart data:', error);
  }
};

const CartScreen: React.FC = () => {
  const { isAuthenticated, navigateToAuth } = useAuth();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const hasAddedSampleData = useRef(false);
  const hasLoadedLocalData = useRef(false);
  
  const cartItems = useSelector(selectCartItems);
  const wishlistItems = useSelector(selectWishlistItems);
  const shippingAddress = useSelector(selectShippingAddress);
  const cartTotal = useSelector(selectCartTotal);
  const cartItemCount = useSelector(selectCartItemCount);

  // Load local cart data when not authenticated
  useEffect(() => {
    if (!isAuthenticated && !hasLoadedLocalData.current) {
      loadLocalCartData();
      hasLoadedLocalData.current = true;
    }
    
    // Update authentication state in cart slice
    dispatch(setAuthenticated(isAuthenticated));
  }, [isAuthenticated, dispatch, loadLocalCartData]);

  // Add some sample data for demonstration (only for authenticated users)
  useEffect(() => {
    if (isAuthenticated && cartItems.length === 0 && !hasAddedSampleData.current) {
      // Add sample cart items
      const sampleProducts: Product[] = [
        {
          id: '1',
          name: 'Floral Top with Pink Skirt',
          price: 17,
          image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=200&h=200&fit=crop',
          category: 'Clothing',
        },
        {
          id: '2',
          name: 'White Off-Shoulder Top',
          price: 17,
          image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&h=200&fit=crop',
          category: 'Clothing',
        },
      ];

      sampleProducts.forEach((product) => {
        dispatch({
          type: 'cart/addToCart',
          payload: {
            product,
            quantity: 1,
            color: 'Pink',
            size: 'M',
          },
        });
      });
      hasAddedSampleData.current = true;
    }

    if (isAuthenticated && wishlistItems.length === 0 && !hasAddedSampleData.current) {
      // Add sample wishlist items
      const sampleWishlistProducts: Product[] = [
        {
          id: '3',
          name: 'Black Hat with Light Top',
          price: 17,
          image: 'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=200&h=200&fit=crop',
          category: 'Clothing',
        },
        {
          id: '4',
          name: 'Pink Top with Brown Hair',
          price: 17,
          image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=200&h=200&fit=crop',
          category: 'Clothing',
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
  }, [isAuthenticated, dispatch, cartItems.length, wishlistItems.length]);

  const handleRemoveFromCart = (id: string) => {
    dispatch(removeFromCart(id));
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    dispatch(updateCartItemQuantity({ id, quantity }));
  };

  const handleRemoveFromWishlist = (id: string) => {
    dispatch(removeFromWishlist(id));
  };

  const handleAddToCartFromWishlist = (id: string) => {
    dispatch(moveFromWishlistToCart({ wishlistId: id, quantity: 1 }));
  };

  const handleEditAddress = () => {
    // TODO: Implement address editing functionality
    console.log('Edit address pressed');
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to your cart before checkout');
      return;
    }

    // If not authenticated, prompt for sign in
    if (!isAuthenticated) {
      Alert.alert(
        'Sign In Required',
        'Please sign in to complete your purchase. Your cart items will be saved.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Sign In',
            onPress: navigateToAuth,
          },
        ]
      );
      return;
    }

    router.push('/checkout');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Cart</Text>
        <Text style={styles.itemCount}>{cartItemCount}</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {!isAuthenticated && (
          <View style={styles.authNotice}>
            <Text style={styles.authNoticeText}>
              You&apos;re shopping as a guest. Sign in to sync your cart across devices.
            </Text>
            <TouchableOpacity style={styles.signInButton} onPress={navigateToAuth}>
              <Text style={styles.signInButtonText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        )}

        {shippingAddress && isAuthenticated && (
          <ShippingAddressCard
            address={shippingAddress}
            onEdit={handleEditAddress}
          />
        )}

        {cartItems.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cart</Text>
            {cartItems.map((item) => (
              <CartItemCard
                key={item.id}
                item={item}
                onRemove={handleRemoveFromCart}
                onUpdateQuantity={handleUpdateQuantity}
              />
            ))}
          </View>
        )}

        {wishlistItems.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>From Your Wishlist</Text>
            {wishlistItems.map((item) => (
              <WishlistItemCard
                key={item.id}
                item={item}
                onRemove={handleRemoveFromWishlist}
                onAddToCart={handleAddToCartFromWishlist}
              />
            ))}
          </View>
        )}

        {cartItems.length === 0 && wishlistItems.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.emptySubtitle}>
              {isAuthenticated 
                ? 'Add some items to get started' 
                : 'Browse products and add them to your cart'
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

      {cartItems.length > 0 && (
        <CheckoutButton
          total={cartTotal}
          onCheckout={handleCheckout}
        />
      )}
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
    paddingTop: theme.spacing.md, // Add top padding to separate from header
  },
  section: {
    marginBottom: theme.spacing.lg,
    marginTop: theme.spacing.md, // Add top margin for better spacing
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.sm, // Add top margin for section titles
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
    textAlign: 'center',
    fontFamily: theme.fonts.regular,
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

export default CartScreen; 