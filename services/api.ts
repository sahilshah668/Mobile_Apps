import { APP_CONFIG } from '../config/appConfig';
import { getAccessToken, getRefreshToken, setTokens, clearTokens, isJwtExpired } from './token';

const BASE_URL = (process.env.EXPO_PUBLIC_API_URL as string) || 'http://192.168.0.104:4000';
// 192.168.0.182
// 192.168.0.104
function withStore(path: string) {
  const storeId = APP_CONFIG?.store?.id || '';
  const u = new URL(path, BASE_URL);
  if (storeId && !u.searchParams.get('store')) u.searchParams.set('store', storeId);
  return u.toString();
}

async function refreshAccessToken(): Promise<string | null> {
  try {
    const rt = await getRefreshToken();
    if (!rt) {
      console.log('No refresh token available');
      return null;
    }

    console.log('Attempting token refresh...');
    const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ refreshToken: rt }),
    });

    console.log('Token refresh response status:', res.status);
    
    if (!res.ok) {
      console.log('Token refresh failed:', res.status);
      const errorText = await res.text();
      console.log('Token refresh error response:', errorText);
      await clearTokens(); // Clear invalid tokens
      return null;
    }

    const data = await res.json();
    console.log('Token refresh response data:', data);
    
    const newToken = data?.accessToken || data?.data?.token;
    
    if (newToken) {
      await setTokens(newToken, rt);
      console.log('Token refreshed successfully');
      return newToken;
    }
    
    console.log('No new token received from refresh');
    return null;
  } catch (error) {
    console.error('Token refresh error:', error);
    await clearTokens();
    return null;
  }
}

export async function apiFetch(path: string, init: RequestInit = {}, isPublic = true): Promise<Response> {
  let url = isPublic ? withStore(path) : new URL(path, BASE_URL).toString();
  console.log('apiFetch URL:', url);
  console.log('apiFetch BASE_URL:', BASE_URL);
  
  let headers: Record<string, string> = { 'Content-Type': 'application/json', ...(init.headers as any) };
  const token = await getAccessToken();
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
    console.log('Using existing token for request');
  } else {
    console.log('No token available for request');
  }

  // Refresh proactively if expired
  if (token && isJwtExpired(token)) {
    console.log('Token expired, refreshing before request');
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers.Authorization = `Bearer ${newToken}`;
      console.log('Using refreshed token for request');
    } else {
      console.log('Token refresh failed, proceeding without token');
    }
  }

  console.log('Making fetch request to:', url);
  console.log('Request headers:', headers);
  
  const res = await fetch(url, { ...init, headers });
  console.log('Fetch response status:', res.status);
  
  if (res.status === 401) {
    console.log('Received 401, attempting token refresh');
    // try refresh once
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers.Authorization = `Bearer ${newToken}`;
      console.log('Retrying request with refreshed token');
      return fetch(url, { ...init, headers });
    } else {
      console.log('Token refresh failed, clearing tokens');
      await clearTokens();
    }
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
  console.log('Mobile app login attempt:', { email, password: password ? '***' : 'empty' });
  
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });
  
  console.log('Login response status:', res.status);
  const data = await res.json();
  console.log('Login response data:', data);
  
  const accessToken = data?.accessToken || data?.data?.token;
  // If server returns refresh token in body for mobile, save it; else rely on cookie
  if (accessToken) await setTokens(accessToken, data?.refreshToken);
  return data;
}

// Registration API
export async function register(userData: { 
  name: string; 
  email: string; 
  password: string; 
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
}) {
  const storeId = APP_CONFIG?.store?.id;
  const registrationData = {
    ...userData,
    storeId,
    role: 'Customer' // Mobile app users are always customers
  };

  console.log('Mobile app registration attempt:', { 
    ...registrationData, 
    password: registrationData.password ? '***' : 'empty',
    storeId 
  });

  const res = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(registrationData),
  });
  
  console.log('Registration response status:', res.status);
  const data = await res.json();
  console.log('Registration response data:', data);
  
  const accessToken = data?.accessToken || data?.data?.token;
  // If server returns refresh token in body for mobile, save it; else rely on cookie
  if (accessToken) await setTokens(accessToken, data?.refreshToken);
  return data;
}

export async function getMe() {
  console.log('Mobile app getMe attempt');
  try {
    const result = await json(await apiFetch('/api/auth/me', {}, false));
    console.log('getMe response:', result);
    return result;
  } catch (error) {
    console.error('getMe error:', error);
    throw error;
  }
}

// Profile Management API functions
export async function getProfile() {
  console.log('Getting user profile');
  try {
    const result = await json(await apiFetch('/api/profile/profile', {}, false));
    console.log('getProfile response:', result);
    return result;
  } catch (error) {
    console.error('getProfile error:', error);
    throw error;
  }
}

export async function updateProfile(profileData: any) {
  console.log('Updating user profile:', profileData);
  try {
    const result = await json(await apiFetch('/api/profile/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    }, false));
    console.log('updateProfile response:', result);
    return result;
  } catch (error) {
    console.error('updateProfile error:', error);
    throw error;
  }
}

export async function changePassword(passwordData: {
  currentPassword: string;
  newPassword: string;
}) {
  console.log('Changing password');
  try {
    const result = await json(await apiFetch('/api/profile/profile/password', {
      method: 'PUT',
      body: JSON.stringify(passwordData)
    }, false));
    console.log('changePassword response:', result);
    return result;
  } catch (error) {
    console.error('changePassword error:', error);
    throw error;
  }
}

export async function getOrderHistory(params?: {
  page?: number;
  limit?: number;
  status?: string;
}) {
  console.log('Getting order history:', params);
  try {
    const queryParams = params ? '?' + new URLSearchParams(params as any).toString() : '';
    const result = await json(await apiFetch(`/api/profile/orders${queryParams}`, {}, false));
    console.log('getOrderHistory response:', result);
    return result;
  } catch (error) {
    console.error('getOrderHistory error:', error);
    throw error;
  }
}

export async function getWishlist(params?: {
  page?: number;
  limit?: number;
}) {
  console.log('Getting wishlist:', params);
  try {
    const queryParams = params ? '?' + new URLSearchParams(params as any).toString() : '';
    const result = await json(await apiFetch(`/api/profile/wishlist${queryParams}`, {}, false));
    console.log('getWishlist response:', result);
    return result;
  } catch (error) {
    console.error('getWishlist error:', error);
    throw error;
  }
}

export async function getNotifications(params?: {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}) {
  console.log('Getting notifications:', params);
  try {
    const queryParams = params ? '?' + new URLSearchParams(params as any).toString() : '';
    const result = await json(await apiFetch(`/api/profile/notifications${queryParams}`, {}, false));
    console.log('getNotifications response:', result);
    return result;
  } catch (error) {
    console.error('getNotifications error:', error);
    throw error;
  }
}

export async function markNotificationRead(notificationId: string) {
  console.log('Marking notification as read:', notificationId);
  try {
    const result = await json(await apiFetch(`/api/profile/notifications/${notificationId}/read`, {
      method: 'PUT'
    }, false));
    console.log('markNotificationRead response:', result);
    return result;
  } catch (error) {
    console.error('markNotificationRead error:', error);
    throw error;
  }
}

export async function getPreferences() {
  console.log('Getting user preferences');
  try {
    const result = await json(await apiFetch('/api/profile/preferences', {}, false));
    console.log('getPreferences response:', result);
    return result;
  } catch (error) {
    console.error('getPreferences error:', error);
    throw error;
  }
}

export async function updatePreferences(preferencesData: any) {
  console.log('Updating user preferences:', preferencesData);
  try {
    const result = await json(await apiFetch('/api/profile/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferencesData)
    }, false));
    console.log('updatePreferences response:', result);
    return result;
  } catch (error) {
    console.error('updatePreferences error:', error);
    throw error;
  }
}

// Return/Refund API functions
export async function requestReturnReplace(orderId: string, data: {
  type: 'return' | 'replace';
  reason: string;
}) {
  try {
    const result = await json(await apiFetch(`/api/orders/${orderId}/return-replace`, {
      method: 'POST',
      body: JSON.stringify(data)
    }, false));
    return result;
  } catch (error) {
    console.error('requestReturnReplace error:', error);
    throw error;
  }
}

export async function getReturnReplaceStatus(orderId: string) {
  try {
    const result = await json(await apiFetch(`/api/orders/${orderId}/return-replace`, {
      method: 'GET'
    }, false));
    return result;
  } catch (error) {
    console.error('getReturnReplaceStatus error:', error);
    throw error;
  }
}

export async function cancelReturnReplace(orderId: string) {
  try {
    const result = await json(await apiFetch(`/api/orders/${orderId}/return-replace/cancel`, {
      method: 'POST'
    }, false));
    return result;
  } catch (error) {
    console.error('cancelReturnReplace error:', error);
    throw error;
  }
}

export async function requestRefund(orderId: string, data: {
  refundAmount: number;
  reason: string;
}) {
  try {
    const result = await json(await apiFetch(`/api/mobile/payments/refund/${orderId}`, {
      method: 'POST',
      body: JSON.stringify(data)
    }, false));
    return result;
  } catch (error) {
    console.error('requestRefund error:', error);
    throw error;
  }
}

export async function getOrderDetails(orderId: string) {
  try {
    const result = await json(await apiFetch(`/api/profile/orders/${orderId}`, {
      method: 'GET'
    }, false));
    return result;
  } catch (error) {
    console.error('getOrderDetails error:', error);
    throw error;
  }
}

export async function cancelOrder(orderId: string, data: { reason: string; description?: string }) {
  try {
    const result = await json(await apiFetch(`/api/profile/orders/${orderId}/cancel`, {
      method: 'POST',
      body: JSON.stringify(data)
    }, false));
    return result;
  } catch (error) {
    console.error('cancelOrder error:', error);
    throw error;
  }
}

// Catalog endpoints
export async function getCategories() {
  console.log('fetching categories');
  return json(await apiFetch('/api/public/categories'));
}

export async function getCategoryProducts(categoryId: string, params?: Record<string, any>) {
  console.log('fetching category products for:', categoryId);
  console.log('categoryId type:', typeof categoryId);
  console.log('categoryId value:', categoryId);
  
  const qs = params ? '?' + new URLSearchParams(params as any).toString() : '';
  const url = `/api/public/categories/${categoryId}/products${qs}`;
  console.log('API URL:', url);
  
  try {
    const result = await json(await apiFetch(url));
    return result?.data;
  } catch (error) {
    console.error('Error in getCategoryProducts:', error);
    throw error;
  }
}
export async function getProducts(params?: Record<string, any>) {
  console.log('fetching products');
  const qs = params ? '?' + new URLSearchParams(params as any).toString() : '';
  return json(await apiFetch(`/api/public/products${qs}`));
}
export async function getProduct(id: string) {
  console.log('fetching product with ID:', id);
  const storeId = APP_CONFIG?.store?.id;
  if (!storeId) {
    throw new Error('Store ID not found in app configuration');
  }
  const url = `/api/public/products/${id}?store=${storeId}`;
  console.log('getProduct URL:', url);
  const result = await json(await apiFetch(url));
  console.log('getProduct result:', result);
  return result;
}

// Banner API functions
export async function getBanners(storeId: string) {
  console.log('fetching banners');
  return json(await apiFetch(`/api/stores/${storeId}/banners/active`));
}

export async function trackBannerClick(bannerId: string) {
  const storeId = APP_CONFIG?.store?.id;
  if (!storeId) {
    throw new Error('Store ID not found in app configuration');
  }
  return json(await apiFetch(`/api/stores/${storeId}/banners/${bannerId}/click`, {
    method: 'POST'
  }));
}

// Cart/Wishlist/Orders (authenticated)
export async function getCart() { return json(await apiFetch('/api/public/cart', {}, false)); }
export async function addToCart(productId: string, qty = 1) {
  return json(await apiFetch('/api/public/cart', { method: 'POST', body: JSON.stringify({ productId, qty }) }, false));
}
export async function removeFromCart(productId: string) {
  return json(await apiFetch('/api/public/cart', { method: 'DELETE', body: JSON.stringify({ productId }) }, false));
}

// Search API
export async function searchProducts(query: string, filters?: any) {
  console.log('searching products');
  const params = new URLSearchParams();
  params.append('q', query);
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
      }
    });
  }
  return json(await apiFetch(`/api/public/products/search?${params.toString()}`));
}

import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// API Configuration
const API_BASE_URL = __DEV__ 
  ? 'http://192.168.0.104:4000/api' 
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
  async getProductReviews(productId: string): Promise<any[]> {
    return this.request(`/public/reviews/${productId}`);
  }

  async createReview(reviewData: any): Promise<any> {
    return this.request(`/public/reviews`, {
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

// Types are already exported as interfaces above 