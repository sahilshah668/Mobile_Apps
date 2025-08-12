import { APP_CONFIG } from '../config/appConfig';
import { getAccessToken, getRefreshToken, setTokens, clearTokens, isJwtExpired } from './token';

const BASE_URL = (process.env.EXPO_PUBLIC_API_URL as string) || 'http://localhost:4000';

function withStore(path: string) {
  const storeId = APP_CONFIG?.store?.id || '';
  const u = new URL(path, BASE_URL);
  if (storeId && !u.searchParams.get('store')) u.searchParams.set('store', storeId);
  return u.toString();
}

async function refreshAccessToken(): Promise<string | null> {
  try {
    // Prefer cookie-based refresh on native if server is configured accordingly; fall back to body-based
    const rt = await getRefreshToken();
    const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // If server requires cookie, set credentials: 'include' and ensure SameSite=None, Secure
      credentials: 'include',
      body: rt ? JSON.stringify({ refreshToken: rt }) : undefined,
    });
    if (!res.ok) return null;
    const data = await res.json();
    const newToken = data?.accessToken || data?.data?.token;
    if (newToken) await setTokens(newToken, rt || undefined);
    return newToken || null;
  } catch {
    return null;
  }
}

export async function apiFetch(path: string, init: RequestInit = {}, isPublic = true): Promise<Response> {
  let url = isPublic ? withStore(path) : new URL(path, BASE_URL).toString();
  let headers: Record<string, string> = { 'Content-Type': 'application/json', ...(init.headers as any) };
  const token = await getAccessToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  // Refresh proactively if expired
  if (token && isJwtExpired(token)) {
    const newToken = await refreshAccessToken();
    if (newToken) headers.Authorization = `Bearer ${newToken}`;
  }

  const res = await fetch(url, { ...init, headers });
  if (res.status === 401) {
    // try refresh once
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers.Authorization = `Bearer ${newToken}`;
      return fetch(url, { ...init, headers });
    }
    await clearTokens();
  }
  return res;
}

export async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// Auth endpoints
export async function login(email: string, password: string) {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  const accessToken = data?.accessToken || data?.data?.token;
  // If server returns refresh token in body for mobile, save it; else rely on cookie
  if (accessToken) await setTokens(accessToken, data?.refreshToken);
  return data;
}

export async function getMe() {
  return json(await apiFetch('/api/auth/me', {}, false));
}

// Catalog endpoints
export async function getCategories() {
  return json(await apiFetch('/api/public/categories'));
}
export async function getProducts(params?: Record<string, any>) {
  const qs = params ? '?' + new URLSearchParams(params as any).toString() : '';
  return json(await apiFetch(`/api/public/products${qs}`));
}
export async function getProduct(id: string) {
  return json(await apiFetch(`/api/public/products/${id}`));
}

// Cart/Wishlist/Orders (authenticated)
export async function getCart() { return json(await apiFetch('/api/public/cart', {}, false)); }
export async function addToCart(productId: string, qty = 1) {
  return json(await apiFetch('/api/public/cart', { method: 'POST', body: JSON.stringify({ productId, qty }) }, false));
}
export async function removeFromCart(productId: string) {
  return json(await apiFetch('/api/public/cart', { method: 'DELETE', body: JSON.stringify({ productId }) }, false));
}

import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// API Configuration
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:4000/api' 
  : 'https://storesa2z-backend.onrender.com/api';

// Types
export interface Store {
  id: string;
  name: string;
  description: string;
  logo?: string;
  banner?: string;
  theme?: any;
  features?: any;
  branding?: any;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  subcategory?: string;
  brand?: string;
  sizes?: string[];
  colors?: string[];
  inStock: boolean;
  rating?: number;
  reviews?: number;
  isNew?: boolean;
  isHot?: boolean;
  isSale?: boolean;
  discount?: number;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
  parentId?: string;
  children?: Category[];
  productCount: number;
}

export interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    success: string;
    warning: string;
    error: string;
    [key: string]: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      xs: number;
      sm: number;
      base: number;
      lg: number;
      xl: number;
      '2xl': number;
      '3xl': number;
      '4xl': number;
    };
    fontWeight: {
      light: number;
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    '2xl': number;
  };
  layout: {
    container: {
      maxWidth: number;
      padding: number;
    };
    grid: {
      columns: number;
      gap: number;
    };
  };
}

export interface AppConfig {
  store: Store;
  theme: ThemeConfig;
  features: {
    productCatalog: boolean;
    shoppingCart: boolean;
    userAuthentication: boolean;
    paymentIntegration: boolean;
    orderManagement: boolean;
    reviews: boolean;
    wishlist: boolean;
    socialSharing: boolean;
    pushNotifications: boolean;
    analytics: boolean;
    multiLanguage: boolean;
    darkMode: boolean;
    offlineSupport: boolean;
    realTimeUpdates: boolean;
    searchFilters: boolean;
    recommendations: boolean;
    loyalty: boolean;
    [key: string]: boolean;
  };
  branding: {
    logo?: string;
    favicon?: string;
    primaryColor?: string;
    secondaryColor?: string;
    [key: string]: any;
  };
}

// API Client Class
class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  // Token Management
  async getToken(): Promise<string | null> {
    if (this.token) return this.token;
    
    try {
      this.token = await SecureStore.getItemAsync('auth_token');
      return this.token;
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  async setToken(token: string): Promise<void> {
    this.token = token;
    await SecureStore.setItemAsync('auth_token', token);
  }

  async clearToken(): Promise<void> {
    this.token = null;
    await SecureStore.deleteItemAsync('auth_token');
  }

  // Request Helper
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.getToken();
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // Store Configuration
  async getStoreConfig(storeId: string): Promise<AppConfig> {
    return this.request<AppConfig>(`/stores/${storeId}/config`);
  }

  async getLiveConfig(storeId: string): Promise<AppConfig> {
    return this.request<AppConfig>(`/stores/${storeId}/live-config`);
  }

  async updateStoreConfig(storeId: string, config: Partial<AppConfig>): Promise<AppConfig> {
    return this.request<AppConfig>(`/stores/${storeId}/config`, {
      method: 'PUT',
      body: JSON.stringify(config),
    });
  }

  // Store Data
  async getStore(storeId: string): Promise<Store> {
    return this.request<Store>(`/stores/${storeId}`);
  }

  async getStoreProducts(storeId: string, params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    sort?: string;
    filters?: any;
  }): Promise<{ products: Product[]; total: number; page: number; limit: number }> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
        }
      });
    }
    
    const query = searchParams.toString();
    return this.request(`/stores/${storeId}/products${query ? `?${query}` : ''}`);
  }

  async getStoreCategories(storeId: string): Promise<Category[]> {
    return this.request<Category[]>(`/stores/${storeId}/categories`);
  }

  async getProduct(storeId: string, productId: string): Promise<Product> {
    return this.request<Product>(`/stores/${storeId}/products/${productId}`);
  }

  async getCategory(storeId: string, categoryId: string): Promise<Category> {
    return this.request<Category>(`/stores/${storeId}/categories/${categoryId}`);
  }

  // Theme & Configuration
  async getThemeConfig(storeId: string): Promise<ThemeConfig> {
    return this.request<ThemeConfig>(`/stores/${storeId}/theme`);
  }

  async updateThemeConfig(storeId: string, theme: Partial<ThemeConfig>): Promise<ThemeConfig> {
    return this.request<ThemeConfig>(`/stores/${storeId}/theme`, {
      method: 'PUT',
      body: JSON.stringify(theme),
    });
  }

  // Search & Analytics
  async searchProducts(storeId: string, query: string, filters?: any): Promise<{
    products: Product[];
    total: number;
    suggestions: string[];
  }> {
    const searchParams = new URLSearchParams();
    searchParams.append('q', query);
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
        }
      });
    }
    
    const queryString = searchParams.toString();
    return this.request(`/stores/${storeId}/search?${queryString}`);
  }

  async getHomeData(storeId: string): Promise<{
    banners: any[];
    categories: Category[];
    featuredProducts: Product[];
    newArrivals: Product[];
    flashSale: Product[];
    mostPopular: Product[];
    recommendations: Product[];
  }> {
    return this.request(`/stores/${storeId}/home-data`);
  }

  // User Authentication
  async login(email: string, password: string): Promise<{ token: string; user: any }> {
    const response = await this.request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    await this.setToken(response.token);
    return response;
  }

  async register(userData: {
    name: string;
    email: string;
    password: string;
    storeId?: string;
  }): Promise<{ token: string; user: any }> {
    const response = await this.request<{ token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    await this.setToken(response.token);
    return response;
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      await this.clearToken();
    }
  }

  async getCurrentUser(): Promise<any> {
    return this.request('/auth/me');
  }

  // Orders & Cart
  async createOrder(storeId: string, orderData: any): Promise<any> {
    return this.request(`/stores/${storeId}/orders`, {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getOrders(storeId: string): Promise<any[]> {
    return this.request(`/stores/${storeId}/orders`);
  }

  async getOrder(storeId: string, orderId: string): Promise<any> {
    return this.request(`/stores/${storeId}/orders/${orderId}`);
  }

  // Reviews
  async getProductReviews(storeId: string, productId: string): Promise<any[]> {
    return this.request(`/stores/${storeId}/products/${productId}/reviews`);
  }

  async createReview(storeId: string, productId: string, reviewData: any): Promise<any> {
    return this.request(`/stores/${storeId}/products/${productId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  }

  // Notifications
  async getNotifications(): Promise<any[]> {
    return this.request('/notifications');
  }

  async markNotificationRead(notificationId: string): Promise<void> {
    return this.request(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  }

  // Real-time Configuration Updates
  async subscribeToConfigUpdates(storeId: string, callback: (config: AppConfig) => void): Promise<() => void> {
    // In a real implementation, this would use WebSockets
    // For now, we'll use polling
    const interval = setInterval(async () => {
      try {
        const config = await this.getLiveConfig(storeId);
        callback(config);
      } catch (error) {
        console.error('Error fetching config updates:', error);
      }
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }
}

// Create and export API instance
export const api = new ApiClient(API_BASE_URL);

// Export types
export type { Store, Product, Category, ThemeConfig, AppConfig }; 