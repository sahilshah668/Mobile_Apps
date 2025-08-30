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
    selectWishlistItems,
    setAuthenticated,
    updateCartItemQuantity,
    fetchServerCart,
    addServerCartItem,
    removeServerCartItem,
} from '@/store/cartSlice';
import { 
    fetchUserAddresses, 
    selectAddresses, 
    selectDefaultAddress 
} from '@/store/addressSlice';
import { Product } from '@/store/productSlice';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';

// Define loadLocalCartData before its usage
const loadLocalCartData = async (dispatch: any) => {
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
  const hasLoadedServerData = useRef(false);
  const hasLoadedLocalData = useRef(false);
  
  const cartItems = useSelector(selectCartItems);
  const wishlistItems = useSelector(selectWishlistItems);
  const addresses = useSelector(selectAddresses);
  const defaultAddress = useSelector(selectDefaultAddress);
  const cartTotal = useSelector(selectCartTotal);
  const cartItemCount = useSelector(selectCartItemCount);
  const cartLoading = useSelector((state: any) => state.cart.loading);
  const cartError = useSelector((state: any) => state.cart.error);
  const addressesLoading = useSelector((state: any) => state.address.loading);

  // Load server cart data when authenticated, local data when not
  useEffect(() => {
    if (isAuthenticated && !hasLoadedServerData.current) {
      // Load real cart data from server for authenticated users
      dispatch(fetchServerCart());
      // Load user addresses
      dispatch(fetchUserAddresses());
      hasLoadedServerData.current = true;
    } else if (!isAuthenticated && !hasLoadedLocalData.current) {
      // Load local cart data for non-authenticated users
      loadLocalCartData(dispatch);
      hasLoadedLocalData.current = true;
    }
    
    // Update authentication state in cart slice
    dispatch(setAuthenticated(isAuthenticated));
  }, [isAuthenticated, dispatch]);

  const handleRemoveFromCart = async (cartItemId: string) => {
    if (isAuthenticated) {
      // Use server API for authenticated users
      try {
        // Find the cart item to get the product ID
        const cartItem = cartItems.find(item => item.id === cartItemId);
        if (!cartItem || !cartItem.product?.id) {
          Alert.alert('Error', 'Product not found in cart');
          return;
        }
        
        await dispatch(removeServerCartItem({ productId: cartItem.product.id })).unwrap();
      } catch (error) {
        console.error('Failed to remove from cart:', error);
        Alert.alert(
          'Error', 
          'Failed to remove item from cart. Please try again.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Retry', 
              onPress: () => handleRemoveFromCart(cartItemId) 
            }
          ]
        );
      }
    } else {
      // Use local storage for non-authenticated users
      dispatch(removeFromCart(cartItemId));
    }
  };

  const handleUpdateQuantity = async (cartItemId: string, quantity: number) => {
    if (isAuthenticated) {
      // Use server API for authenticated users
      try {
        // Find the cart item to get the product ID
        const cartItem = cartItems.find(item => item.id === cartItemId);
        if (!cartItem || !cartItem.product?.id) {
          Alert.alert('Error', 'Product not found in cart');
          return;
        }
        
        if (quantity <= 0) {
          await dispatch(removeServerCartItem({ productId: cartItem.product.id })).unwrap();
        } else {
          await dispatch(addServerCartItem({ productId: cartItem.product.id, qty: quantity })).unwrap();
        }
      } catch (error) {
        console.error('Failed to update cart quantity:', error);
        Alert.alert(
          'Error', 
          'Failed to update cart. Please try again.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Retry', 
              onPress: () => handleUpdateQuantity(cartItemId, quantity) 
            }
          ]
        );
      }
    } else {
      // Use local storage for non-authenticated users
      dispatch(updateCartItemQuantity({ id: cartItemId, quantity }));
    }
  };

  const handleRemoveFromWishlist = (id: string) => {
    dispatch(removeFromWishlist(id));
  };

  const handleAddToCartFromWishlist = async (id: string) => {
    const wishlistItem = wishlistItems.find(item => item.id === id);
    if (!wishlistItem) return;

    if (isAuthenticated) {
      // Use server API for authenticated users
      try {
        await dispatch(addServerCartItem({ 
          productId: wishlistItem.product.id, 
          qty: 1 
        })).unwrap();
        dispatch(removeFromWishlist(id));
      } catch (error) {
        Alert.alert('Error', 'Failed to add item to cart');
      }
    } else {
      // Use local storage for non-authenticated users
      dispatch(moveFromWishlistToCart({ wishlistId: id, quantity: 1 }));
    }
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

        {(cartLoading || addressesLoading) && isAuthenticated && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading your cart and addresses...</Text>
          </View>
        )}

        {cartError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{cartError}</Text>
            <TouchableOpacity 
              style={styles.retryButton} 
              onPress={() => {
                if (isAuthenticated) {
                  dispatch(fetchServerCart());
                }
              }}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {defaultAddress && isAuthenticated && (
          <View style={styles.shippingAddressContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Shipping Address</Text>
              <TouchableOpacity onPress={() => router.push('/addresses')}>
                <Text style={styles.manageText}>Manage</Text>
              </TouchableOpacity>
            </View>
            <ShippingAddressCard
              address={defaultAddress}
              onEdit={() => router.push('/addresses')}
            />
            {addresses.length > 1 && (
              <TouchableOpacity 
                style={styles.selectAddressButton}
                onPress={() => router.push('/addresses')}
              >
                <Text style={styles.selectAddressText}>Select Different Address ({addresses.length} available)</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {!defaultAddress && addresses.length > 0 && isAuthenticated && (
          <View style={styles.shippingAddressContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Shipping Address</Text>
              <TouchableOpacity onPress={() => router.push('/addresses')}>
                <Text style={styles.manageText}>Manage</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity 
              style={styles.selectAddressButton}
              onPress={() => router.push('/addresses')}
            >
              <Text style={styles.selectAddressText}>Select Address ({addresses.length} available)</Text>
            </TouchableOpacity>
          </View>
        )}

        {!defaultAddress && addresses.length === 0 && isAuthenticated && (
          <View style={styles.shippingAddressContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Shipping Address</Text>
            </View>
            <TouchableOpacity 
              style={styles.addAddressButton}
              onPress={() => router.push('/addresses')}
            >
              <Ionicons name="add-circle-outline" size={24} color={theme.colors.primary} />
              <Text style={styles.addAddressText}>Add Shipping Address</Text>
            </TouchableOpacity>
          </View>
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

        {!cartLoading && cartItems.length === 0 && wishlistItems.length === 0 && (
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 12,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  errorText: {
    fontSize: 14,
    color: '#DC2626',
    fontFamily: theme.fonts.regular,
    marginBottom: theme.spacing.sm,
  },
  retryButton: {
    backgroundColor: '#DC2626',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: theme.fonts.bold,
  },
  shippingAddressContainer: {
    marginBottom: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  addAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: theme.spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    gap: theme.spacing.sm,
  },
  addAddressText: {
    fontSize: 16,
    color: theme.colors.primary,
    fontFamily: theme.fonts.regular,
  },
  manageText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontFamily: theme.fonts.bold,
  },
  selectAddressButton: {
    backgroundColor: 'rgba(21, 107, 255, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: theme.spacing.sm,
  },
  selectAddressText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: theme.fonts.bold,
  },
});

export default CartScreen; 