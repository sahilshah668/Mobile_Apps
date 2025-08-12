import { api, AppConfig, Store, Product, Category } from './api';
import * as SecureStore from 'expo-secure-store';

// Configuration Manager for dynamic theme and store data
class ConfigManager {
  private currentConfig: AppConfig | null = null;
  private storeId: string | null = null;
  private configUpdateCallbacks: ((config: AppConfig) => void)[] = [];
  private unsubscribeFromUpdates: (() => void) | null = null;

  // Initialize configuration for a specific store
  async initialize(storeId: string): Promise<AppConfig> {
    try {
      console.log(`🔧 Initializing config for store: ${storeId}`);
      this.storeId = storeId;

      // Try to load cached config first
      const cachedConfig = await this.loadCachedConfig(storeId);
      if (cachedConfig) {
        this.currentConfig = cachedConfig;
        console.log('📋 Using cached configuration');
      }

      // Fetch live configuration from backend
      const liveConfig = await api.getLiveConfig(storeId);
      this.currentConfig = liveConfig;

      // Cache the configuration
      await this.cacheConfig(storeId, liveConfig);

      // Subscribe to real-time updates
      await this.subscribeToUpdates(storeId);

      console.log('✅ Configuration initialized successfully');
      return liveConfig;
    } catch (error) {
      console.error('❌ Failed to initialize configuration:', error);
      
      // Fallback to default config
      const defaultConfig = this.getDefaultConfig(storeId);
      this.currentConfig = defaultConfig;
      return defaultConfig;
    }
  }

  // Get current configuration
  getConfig(): AppConfig | null {
    return this.currentConfig;
  }

  // Get store information
  getStore(): Store | null {
    return this.currentConfig?.store || null;
  }

  // Get theme configuration
  getTheme() {
    return this.currentConfig?.theme || {};
  }

  // Get features configuration
  getFeatures() {
    return this.currentConfig?.features || {};
  }

  // Get branding configuration
  getBranding() {
    return this.currentConfig?.branding || {};
  }

  // Check if a feature is enabled
  isFeatureEnabled(feature: string): boolean {
    return this.currentConfig?.features?.[feature] || false;
  }

  // Update configuration
  async updateConfig(updates: Partial<AppConfig>): Promise<AppConfig> {
    if (!this.storeId) {
      throw new Error('Configuration not initialized');
    }

    try {
      const updatedConfig = await api.updateStoreConfig(this.storeId, updates);
      this.currentConfig = updatedConfig;
      
      // Cache updated config
      await this.cacheConfig(this.storeId, updatedConfig);
      
      // Notify listeners
      this.notifyConfigUpdate(updatedConfig);
      
      return updatedConfig;
    } catch (error) {
      console.error('❌ Failed to update configuration:', error);
      throw error;
    }
  }

  // Subscribe to configuration updates
  onConfigUpdate(callback: (config: AppConfig) => void): () => void {
    this.configUpdateCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.configUpdateCallbacks.indexOf(callback);
      if (index > -1) {
        this.configUpdateCallbacks.splice(index, 1);
      }
    };
  }

  // Fetch store data
  async getStoreData(): Promise<{
    store: Store;
    categories: Category[];
    featuredProducts: Product[];
  }> {
    if (!this.storeId) {
      throw new Error('Configuration not initialized');
    }

    try {
      const homeData = await api.getHomeData(this.storeId);
      
      return {
        store: homeData.store || { id: this.storeId, name: 'Store', description: '' },
        categories: homeData.categories || [],
        featuredProducts: homeData.featuredProducts || [],
      };
    } catch (error) {
      console.error('❌ Failed to fetch store data:', error);
      throw error;
    }
  }

  // Fetch products with filters
  async getProducts(params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    sort?: string;
    filters?: any;
  }) {
    if (!this.storeId) {
      throw new Error('Configuration not initialized');
    }

    return api.getStoreProducts(this.storeId, params);
  }

  // Search products
  async searchProducts(query: string, filters?: any) {
    if (!this.storeId) {
      throw new Error('Configuration not initialized');
    }

    return api.searchProducts(this.storeId, query, filters);
  }

  // Get product details
  async getProduct(productId: string): Promise<Product> {
    if (!this.storeId) {
      throw new Error('Configuration not initialized');
    }

    return api.getProduct(this.storeId, productId);
  }

  // Get category details
  async getCategory(categoryId: string): Promise<Category> {
    if (!this.storeId) {
      throw new Error('Configuration not initialized');
    }

    return api.getCategory(this.storeId, categoryId);
  }

  // Cache configuration
  private async cacheConfig(storeId: string, config: AppConfig): Promise<void> {
    try {
      const cacheKey = `store_config_${storeId}`;
      await SecureStore.setItemAsync(cacheKey, JSON.stringify({
        config,
        timestamp: Date.now(),
      }));
    } catch (error) {
      console.error('❌ Failed to cache configuration:', error);
    }
  }

  // Load cached configuration
  private async loadCachedConfig(storeId: string): Promise<AppConfig | null> {
    try {
      const cacheKey = `store_config_${storeId}`;
      const cached = await SecureStore.getItemAsync(cacheKey);
      
      if (cached) {
        const { config, timestamp } = JSON.parse(cached);
        const cacheAge = Date.now() - timestamp;
        
        // Cache is valid for 5 minutes
        if (cacheAge < 5 * 60 * 1000) {
          return config;
        }
      }
      
      return null;
    } catch (error) {
      console.error('❌ Failed to load cached configuration:', error);
      return null;
    }
  }

  // Subscribe to real-time updates
  private async subscribeToUpdates(storeId: string): Promise<void> {
    try {
      this.unsubscribeFromUpdates = await api.subscribeToConfigUpdates(
        storeId,
        (config) => {
          this.currentConfig = config;
          this.cacheConfig(storeId, config);
          this.notifyConfigUpdate(config);
        }
      );
    } catch (error) {
      console.error('❌ Failed to subscribe to config updates:', error);
    }
  }

  // Notify configuration update listeners
  private notifyConfigUpdate(config: AppConfig): void {
    this.configUpdateCallbacks.forEach(callback => {
      try {
        callback(config);
      } catch (error) {
        console.error('❌ Error in config update callback:', error);
      }
    });
  }

  // Get default configuration
  private getDefaultConfig(storeId: string): AppConfig {
    return {
      store: {
        id: storeId,
        name: 'Fashion Store',
        description: 'Your fashion destination',
        logo: undefined,
        banner: undefined,
        theme: {},
        features: {},
        branding: {},
      },
      theme: {
        colors: {
          primary: '#156BFF',
          secondary: '#4A90E2',
          background: '#FFFFFF',
          surface: '#F8FAFF',
          text: '#222222',
          textSecondary: '#666666',
          success: '#2ECC71',
          warning: '#FF9500',
          error: '#FF4444',
        },
        typography: {
          fontFamily: 'System',
          fontSize: {
            xs: 12,
            sm: 14,
            base: 16,
            lg: 18,
            xl: 20,
            '2xl': 24,
            '3xl': 30,
            '4xl': 36,
          },
          fontWeight: {
            light: 300,
            normal: 400,
            medium: 500,
            semibold: 600,
            bold: 700,
          },
        },
        spacing: {
          xs: 8,
          sm: 12,
          md: 16,
          lg: 24,
          xl: 32,
          '2xl': 48,
        },
        layout: {
          container: {
            maxWidth: 1200,
            padding: 16,
          },
          grid: {
            columns: 2,
            gap: 16,
          },
        },
      },
      features: {
        productCatalog: true,
        shoppingCart: true,
        userAuthentication: true,
        paymentIntegration: false,
        orderManagement: true,
        reviews: true,
        wishlist: true,
        socialSharing: false,
        pushNotifications: false,
        analytics: false,
        multiLanguage: false,
        darkMode: true,
        offlineSupport: false,
        realTimeUpdates: true,
        searchFilters: true,
        recommendations: false,
        loyalty: false,
      },
      branding: {
        logo: undefined,
        favicon: undefined,
        primaryColor: '#156BFF',
        secondaryColor: '#4A90E2',
      },
    };
  }

  // Cleanup
  cleanup(): void {
    if (this.unsubscribeFromUpdates) {
      this.unsubscribeFromUpdates();
      this.unsubscribeFromUpdates = null;
    }
    this.configUpdateCallbacks = [];
    this.currentConfig = null;
    this.storeId = null;
  }
}

// Create and export singleton instance
export const configManager = new ConfigManager();

// Export types
export type { AppConfig, Store, Product, Category }; 