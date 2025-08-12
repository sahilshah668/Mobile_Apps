import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'price_drop' | 'new_product' | 'promotion' | 'system';
  isRead: boolean;
  timestamp: string;
  data?: {
    orderId?: string;
    productId?: string;
    price?: number;
    oldPrice?: number;
    category?: string;
  };
}

export interface NotificationSettings {
  orderUpdates: boolean;
  priceDrops: boolean;
  newProducts: boolean;
  promotions: boolean;
  systemNotifications: boolean;
  quietHours: {
    enabled: boolean;
    startTime: string; // HH:mm format
    endTime: string; // HH:mm format
  };
}

interface NotificationState {
  notifications: Notification[];
  settings: NotificationSettings;
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

const initialState: NotificationState = {
  notifications: [
    {
      id: '1',
      title: 'Order Confirmed!',
      message: 'Your order #ORD-123456 has been confirmed and is being processed.',
      type: 'order',
      isRead: false,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      data: {
        orderId: 'ORD-123456',
      },
    },
    {
      id: '2',
      title: 'Price Drop Alert!',
      message: 'Premium Leather Handbag is now 25% off! Don\'t miss this deal.',
      type: 'price_drop',
      isRead: false,
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
      data: {
        productId: '1',
        price: 67,
        oldPrice: 89,
      },
    },
    {
      id: '3',
      title: 'New Collection Arrived!',
      message: 'Check out our latest summer collection with trendy new styles.',
      type: 'new_product',
      isRead: true,
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      data: {
        category: 'Clothing',
      },
    },
    {
      id: '4',
      title: 'Flash Sale Alert!',
      message: 'Up to 50% off on selected items. Limited time offer!',
      type: 'promotion',
      isRead: true,
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    },
    {
      id: '5',
      title: 'Order Shipped!',
      message: 'Your order #ORD-123456 has been shipped and is on its way.',
      type: 'order',
      isRead: true,
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      data: {
        orderId: 'ORD-123456',
      },
    },
  ],
  settings: {
    orderUpdates: true,
    priceDrops: true,
    newProducts: true,
    promotions: true,
    systemNotifications: true,
    quietHours: {
      enabled: false,
      startTime: '22:00',
      endTime: '08:00',
    },
  },
  unreadCount: 2,
  loading: false,
  error: null,
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'timestamp'>>) => {
      const notification: Notification = {
        ...action.payload,
        id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
      };
      
      state.notifications.unshift(notification);
      
      if (!notification.isRead) {
        state.unreadCount += 1;
      }
    },

    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.isRead) {
        notification.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },

    markAllAsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.isRead = true;
      });
      state.unreadCount = 0;
    },

    removeNotification: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.isRead) {
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },

    clearAllNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },

    updateNotificationSettings: (state, action: PayloadAction<Partial<NotificationSettings>>) => {
      state.settings = { ...state.settings, ...action.payload };
    },

    // Simulate receiving a new notification
    simulateNewNotification: (state) => {
      const notificationTypes: Notification['type'][] = ['order', 'price_drop', 'new_product', 'promotion'];
      const randomType = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
      
      let notification: Omit<Notification, 'id' | 'timestamp'>;
      
      switch (randomType) {
        case 'order':
          notification = {
            title: 'Order Update',
            message: 'Your order status has been updated.',
            type: 'order',
            isRead: false,
            data: {
              orderId: `ORD-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
            },
          };
          break;
        case 'price_drop':
          notification = {
            title: 'Price Drop Alert!',
            message: 'A product in your wishlist has dropped in price.',
            type: 'price_drop',
            isRead: false,
            data: {
              productId: Math.random().toString(36).substr(2, 6),
              price: Math.floor(Math.random() * 50) + 20,
              oldPrice: Math.floor(Math.random() * 50) + 70,
            },
          };
          break;
        case 'new_product':
          notification = {
            title: 'New Arrivals',
            message: 'New products have been added to your favorite category.',
            type: 'new_product',
            isRead: false,
            data: {
              category: 'Clothing',
            },
          };
          break;
        default:
          notification = {
            title: 'Special Offer',
            message: 'Limited time offer on selected items.',
            type: 'promotion',
            isRead: false,
          };
      }
      
      state.notifications.unshift({
        ...notification,
        id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
      });
      
      state.unreadCount += 1;
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  addNotification,
  markAsRead,
  markAllAsRead,
  removeNotification,
  clearAllNotifications,
  updateNotificationSettings,
  simulateNewNotification,
  setLoading,
  setError,
} = notificationSlice.actions;

// Selectors
export const selectNotifications = (state: { notifications: NotificationState }) => 
  state.notifications.notifications;
export const selectUnreadNotifications = (state: { notifications: NotificationState }) => 
  state.notifications.notifications.filter(n => !n.isRead);
export const selectUnreadCount = (state: { notifications: NotificationState }) => 
  state.notifications.unreadCount;
export const selectNotificationSettings = (state: { notifications: NotificationState }) => 
  state.notifications.settings;
export const selectNotificationsByType = (state: { notifications: NotificationState }, type: Notification['type']) =>
  state.notifications.notifications.filter(n => n.type === type);

export default notificationSlice.reducer; 