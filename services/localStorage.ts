import * as SecureStore from 'expo-secure-store';

export interface LocalCartItem {
  id: string;
  quantity: number;
  addedAt: number;
}

export interface LocalFavorites {
  productIds: string[];
}

class LocalStorageService {
  private static instance: LocalStorageService;
  
  // Storage keys
  private readonly CART_KEY = 'fashion_saga_local_cart';
  private readonly FAVORITES_KEY = 'fashion_saga_local_favorites';
  private readonly USER_PREFERENCES_KEY = 'fashion_saga_user_preferences';

  private constructor() {}

  public static getInstance(): LocalStorageService {
    if (!LocalStorageService.instance) {
      LocalStorageService.instance = new LocalStorageService();
    }
    return LocalStorageService.instance;
  }

  // Cart Management
  async getLocalCart(): Promise<LocalCartItem[]> {
    try {
      const cartData = await SecureStore.getItemAsync(this.CART_KEY);
      return cartData ? JSON.parse(cartData) : [];
    } catch (error) {
      console.error('Error getting local cart:', error);
      return [];
    }
  }

  async saveLocalCart(cartItems: LocalCartItem[]): Promise<void> {
    try {
      await SecureStore.setItemAsync(this.CART_KEY, JSON.stringify(cartItems));
    } catch (error) {
      console.error('Error saving local cart:', error);
    }
  }

  async addToLocalCart(productId: string, quantity: number = 1): Promise<void> {
    try {
      const currentCart = await this.getLocalCart();
      const existingItemIndex = currentCart.findIndex(item => item.id === productId);
      
      if (existingItemIndex >= 0) {
        currentCart[existingItemIndex].quantity += quantity;
      } else {
        currentCart.push({
          id: productId,
          quantity,
          addedAt: Date.now()
        });
      }
      
      await this.saveLocalCart(currentCart);
    } catch (error) {
      console.error('Error adding to local cart:', error);
    }
  }

  async removeFromLocalCart(productId: string): Promise<void> {
    try {
      const currentCart = await this.getLocalCart();
      const updatedCart = currentCart.filter(item => item.id !== productId);
      await this.saveLocalCart(updatedCart);
    } catch (error) {
      console.error('Error removing from local cart:', error);
    }
  }

  async updateLocalCartItemQuantity(productId: string, quantity: number): Promise<void> {
    try {
      const currentCart = await this.getLocalCart();
      const itemIndex = currentCart.findIndex(item => item.id === productId);
      
      if (itemIndex >= 0) {
        if (quantity <= 0) {
          currentCart.splice(itemIndex, 1);
        } else {
          currentCart[itemIndex].quantity = quantity;
        }
        await this.saveLocalCart(currentCart);
      }
    } catch (error) {
      console.error('Error updating local cart item quantity:', error);
    }
  }

  async clearLocalCart(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(this.CART_KEY);
    } catch (error) {
      console.error('Error clearing local cart:', error);
    }
  }

  // Favorites Management
  async getLocalFavorites(): Promise<LocalFavorites> {
    try {
      const favoritesData = await SecureStore.getItemAsync(this.FAVORITES_KEY);
      return favoritesData ? JSON.parse(favoritesData) : { productIds: [] };
    } catch (error) {
      console.error('Error getting local favorites:', error);
      return { productIds: [] };
    }
  }

  async saveLocalFavorites(favorites: LocalFavorites): Promise<void> {
    try {
      await SecureStore.setItemAsync(this.FAVORITES_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.error('Error saving local favorites:', error);
    }
  }

  async addToLocalFavorites(productId: string): Promise<void> {
    try {
      const currentFavorites = await this.getLocalFavorites();
      if (!currentFavorites.productIds.includes(productId)) {
        currentFavorites.productIds.push(productId);
        await this.saveLocalFavorites(currentFavorites);
      }
    } catch (error) {
      console.error('Error adding to local favorites:', error);
    }
  }

  async removeFromLocalFavorites(productId: string): Promise<void> {
    try {
      const currentFavorites = await this.getLocalFavorites();
      currentFavorites.productIds = currentFavorites.productIds.filter(id => id !== productId);
      await this.saveLocalFavorites(currentFavorites);
    } catch (error) {
      console.error('Error removing from local favorites:', error);
    }
  }

  async isInLocalFavorites(productId: string): Promise<boolean> {
    try {
      const currentFavorites = await this.getLocalFavorites();
      return currentFavorites.productIds.includes(productId);
    } catch (error) {
      console.error('Error checking local favorites:', error);
      return false;
    }
  }

  // User Preferences
  async getUserPreferences(): Promise<any> {
    try {
      const preferencesData = await SecureStore.getItemAsync(this.USER_PREFERENCES_KEY);
      return preferencesData ? JSON.parse(preferencesData) : {};
    } catch (error) {
      console.error('Error getting user preferences:', error);
      return {};
    }
  }

  async saveUserPreferences(preferences: any): Promise<void> {
    try {
      await SecureStore.setItemAsync(this.USER_PREFERENCES_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving user preferences:', error);
    }
  }

  // Migration helpers for when user signs in
  async migrateLocalCartToServer(): Promise<LocalCartItem[]> {
    try {
      const localCart = await this.getLocalCart();
      // Clear local cart after migration
      await this.clearLocalCart();
      return localCart;
    } catch (error) {
      console.error('Error migrating local cart:', error);
      return [];
    }
  }

  async migrateLocalFavoritesToServer(): Promise<string[]> {
    try {
      const localFavorites = await this.getLocalFavorites();
      // Clear local favorites after migration
      await this.saveLocalFavorites({ productIds: [] });
      return localFavorites.productIds;
    } catch (error) {
      console.error('Error migrating local favorites:', error);
      return [];
    }
  }

  // Utility methods
  async clearAllLocalData(): Promise<void> {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(this.CART_KEY),
        SecureStore.deleteItemAsync(this.FAVORITES_KEY),
        SecureStore.deleteItemAsync(this.USER_PREFERENCES_KEY)
      ]);
    } catch (error) {
      console.error('Error clearing all local data:', error);
    }
  }
}

export default LocalStorageService.getInstance(); 