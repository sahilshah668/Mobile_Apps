import localStorageService, { LocalCartItem } from '@/services/localStorage';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { apiFetch, json } from '../services/api';
import { Product } from './productSlice';

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}

export interface WishlistItem {
  id: string;
  product: Product;
  selectedColor?: string;
  selectedSize?: string;
}

export interface ShippingAddress {
  id: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

interface CartState {
  items: CartItem[];
  wishlist: WishlistItem[];
  shippingAddress: ShippingAddress | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

const initialState: CartState = {
  items: [],
  wishlist: [],
  shippingAddress: {
    id: '1',
    address: '26, Duong So 2, Thao Dien Ward, An Phu, District 2, Ho Chi Minh city',
    city: 'Ho Chi Minh',
    state: 'District 2',
    zipCode: '700000',
    country: 'Vietnam',
    isDefault: true,
  },
  loading: false,
  error: null,
  isAuthenticated: false,
};

// Async thunks for server cart
export const fetchServerCart = createAsyncThunk('cart/fetchServerCart', async (_, { rejectWithValue }) => {
  try {
    const res = await apiFetch('/api/public/cart', {}, false);
    return json<any>(res);
  } catch (e: any) {
    return rejectWithValue(e.message || 'Failed to load cart');
  }
});

export const addServerCartItem = createAsyncThunk('cart/addServerCartItem', async (payload: { productId: string; qty?: number }, { rejectWithValue }) => {
  try {
    const res = await apiFetch('/api/public/cart', { method: 'POST', body: JSON.stringify(payload) }, false);
    return json<any>(res);
  } catch (e: any) {
    return rejectWithValue(e.message || 'Failed to add to cart');
  }
});

export const removeServerCartItem = createAsyncThunk('cart/removeServerCartItem', async (payload: { productId: string }, { rejectWithValue }) => {
  try {
    const res = await apiFetch('/api/public/cart', { method: 'DELETE', body: JSON.stringify(payload) }, false);
    return json<any>(res);
  } catch (e: any) {
    return rejectWithValue(e.message || 'Failed to remove from cart');
  }
});

// Async thunks for local storage operations
export const loadLocalCart = createAsyncThunk(
  'cart/loadLocalCart',
  async () => {
    const localCart = await localStorageService.getLocalCart();
    return localCart;
  }
);

export const saveLocalCart = createAsyncThunk(
  'cart/saveLocalCart',
  async (cartItems: LocalCartItem[]) => {
    await localStorageService.saveLocalCart(cartItems);
  }
);

export const migrateLocalCartToServer = createAsyncThunk(
  'cart/migrateLocalCartToServer',
  async () => {
    const localCart = await localStorageService.migrateLocalCartToServer();
    return localCart;
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<{ product: Product; quantity?: number; color?: string; size?: string }>) => {
      const { product, quantity = 1, color, size } = action.payload;
      const existingItem = state.items.find(item => 
        item.product.id === product.id && 
        item.selectedColor === color && 
        item.selectedSize === size
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({
          id: `${product.id}-${color || 'default'}-${size || 'default'}`,
          product,
          quantity,
          selectedColor: color,
          selectedSize: size,
        });
      }

      // If not authenticated, save to local storage
      if (!state.isAuthenticated) {
        const localCartItem: LocalCartItem = {
          id: product.id,
          quantity: existingItem ? existingItem.quantity + quantity : quantity,
          addedAt: Date.now()
        };
        localStorageService.addToLocalCart(product.id, quantity);
      }
    },

    removeFromCart: (state, action: PayloadAction<string>) => {
      const itemId = action.payload;
      const item = state.items.find(item => item.id === itemId);
      
      state.items = state.items.filter(item => item.id !== itemId);
      
      // If not authenticated, remove from local storage
      if (!state.isAuthenticated && item) {
        localStorageService.removeFromLocalCart(item.product.id);
      }
    },

    updateCartItemQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const { id, quantity } = action.payload;
      const item = state.items.find(item => item.id === id);
      
      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter(item => item.id !== id);
          // If not authenticated, remove from local storage
          if (!state.isAuthenticated) {
            localStorageService.removeFromLocalCart(item.product.id);
          }
        } else {
          item.quantity = quantity;
          // If not authenticated, update local storage
          if (!state.isAuthenticated) {
            localStorageService.updateLocalCartItemQuantity(item.product.id, quantity);
          }
        }
      }
    },

    clearCart: (state) => {
      state.items = [];
      // If not authenticated, clear local storage
      if (!state.isAuthenticated) {
        localStorageService.clearLocalCart();
      }
    },

    addToWishlist: (state, action: PayloadAction<{ product: Product; color?: string; size?: string }>) => {
      const { product, color, size } = action.payload;
      const existingItem = state.wishlist.find(item => 
        item.product.id === product.id && 
        item.selectedColor === color && 
        item.selectedSize === size
      );

      if (!existingItem) {
        state.wishlist.push({
          id: `${product.id}-${color || 'default'}-${size || 'default'}`,
          product,
          selectedColor: color,
          selectedSize: size,
        });
      }

      // If not authenticated, save to local storage
      if (!state.isAuthenticated) {
        localStorageService.addToLocalFavorites(product.id);
      }
    },

    removeFromWishlist: (state, action: PayloadAction<string>) => {
      const itemId = action.payload;
      const item = state.wishlist.find(item => item.id === itemId);
      
      state.wishlist = state.wishlist.filter(item => item.id !== itemId);
      
      // If not authenticated, remove from local storage
      if (!state.isAuthenticated && item) {
        localStorageService.removeFromLocalFavorites(item.product.id);
      }
    },

    moveFromWishlistToCart: (state, action: PayloadAction<{ wishlistId: string; quantity?: number }>) => {
      const { wishlistId, quantity = 1 } = action.payload;
      const wishlistItem = state.wishlist.find(item => item.id === wishlistId);
      
      if (wishlistItem) {
        // Add to cart
        const existingCartItem = state.items.find(item => 
          item.product.id === wishlistItem.product.id && 
          item.selectedColor === wishlistItem.selectedColor && 
          item.selectedSize === wishlistItem.selectedSize
        );

        if (existingCartItem) {
          existingCartItem.quantity += quantity;
        } else {
          state.items.push({
            id: wishlistItem.id,
            product: wishlistItem.product,
            quantity,
            selectedColor: wishlistItem.selectedColor,
            selectedSize: wishlistItem.selectedSize,
          });
        }

        // Remove from wishlist
        state.wishlist = state.wishlist.filter(item => item.id !== wishlistId);

        // If not authenticated, update local storage
        if (!state.isAuthenticated) {
          localStorageService.addToLocalCart(wishlistItem.product.id, quantity);
          localStorageService.removeFromLocalFavorites(wishlistItem.product.id);
        }
      }
    },

    updateShippingAddress: (state, action: PayloadAction<ShippingAddress>) => {
      state.shippingAddress = action.payload;
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },

    // Load local cart items (for non-authenticated users)
    loadLocalCartItems: (state, action: PayloadAction<LocalCartItem[]>) => {
      // This will be populated with actual product data when needed
      state.items = action.payload.map(item => ({
        id: item.id,
        product: {} as Product, // Will be populated when product data is available
        quantity: item.quantity,
        selectedColor: undefined,
        selectedSize: undefined,
      }));
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadLocalCart.fulfilled, (state, action) => {
        // Handle loading local cart
      })
      .addCase(migrateLocalCartToServer.fulfilled, (state, action) => {
        // Handle migration - items will be added to server cart
        state.items = [];
      });
  },
});

export const {
  addToCart,
  removeFromCart,
  updateCartItemQuantity,
  clearCart,
  addToWishlist,
  removeFromWishlist,
  moveFromWishlistToCart,
  updateShippingAddress,
  setLoading,
  setError,
  setAuthenticated,
  loadLocalCartItems,
} = cartSlice.actions;

// Selectors
export const selectCartItems = (state: { cart: CartState }) => state.cart.items;
export const selectWishlistItems = (state: { cart: CartState }) => state.cart.wishlist;
export const selectShippingAddress = (state: { cart: CartState }) => state.cart.shippingAddress;
export const selectCartTotal = (state: { cart: CartState }) => 
  state.cart.items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
export const selectCartItemCount = (state: { cart: CartState }) => 
  state.cart.items.reduce((count, item) => count + item.quantity, 0);
export const selectWishlistItemCount = (state: { cart: CartState }) => state.cart.wishlist.length;
export const selectIsAuthenticated = (state: { cart: CartState }) => state.cart.isAuthenticated;

export default cartSlice.reducer; 