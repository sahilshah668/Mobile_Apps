import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { apiFetch, json } from '../services/api';
import { CartItem } from './cartSlice';

export interface OrderItem extends CartItem {
  orderId: string;
}

export interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  shippingAddress: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: string;
  orderDate: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
  notes?: string;
}

interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  loading: boolean;
  error: string | null;
}

const initialState: OrderState = {
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,
};

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    createOrder: (state, action: PayloadAction<{
      items: CartItem[];
      total: number;
      shippingAddress: any;
      paymentMethod: string;
    }>) => {
      const { items, total, shippingAddress, paymentMethod } = action.payload;
      const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const order: Order = {
        id: orderId,
        items: items.map(item => ({
          ...item,
          orderId,
        })),
        total,
        status: 'pending',
        paymentStatus: 'pending',
        shippingAddress,
        paymentMethod,
        orderDate: new Date().toISOString(),
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      };

      state.orders.unshift(order); // Add to beginning of array
      state.currentOrder = order;
    },

    updateOrderStatus: (state, action: PayloadAction<{
      orderId: string;
      status: Order['status'];
    }>) => {
      const { orderId, status } = action.payload;
      const order = state.orders.find(o => o.id === orderId);
      if (order) {
        order.status = status;
        
        // Update tracking number when shipped
        if (status === 'shipped' && !order.trackingNumber) {
          order.trackingNumber = `TRK-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        }
      }
    },

    updatePaymentStatus: (state, action: PayloadAction<{
      orderId: string;
      paymentStatus: Order['paymentStatus'];
    }>) => {
      const { orderId, paymentStatus } = action.payload;
      const order = state.orders.find(o => o.id === orderId);
      if (order) {
        order.paymentStatus = paymentStatus;
        
        // Update order status when payment is confirmed
        if (paymentStatus === 'paid' && order.status === 'pending') {
          order.status = 'confirmed';
        }
      }
    },

    setCurrentOrder: (state, action: PayloadAction<Order | null>) => {
      state.currentOrder = action.payload;
    },

    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true; state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false; state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false; state.error = action.payload as string;
      })
      .addCase(fetchOrderDetails.pending, (state) => {
        state.loading = true; state.error = null;
      })
      .addCase(fetchOrderDetails.fulfilled, (state, action) => {
        state.loading = false; state.currentOrder = action.payload;
      })
      .addCase(fetchOrderDetails.rejected, (state, action) => {
        state.loading = false; state.error = action.payload as string;
      });
  }
});

export const {
  createOrder,
  updateOrderStatus,
  updatePaymentStatus,
  setCurrentOrder,
  clearCurrentOrder,
  setLoading,
  setError,
} = orderSlice.actions;

// Selectors
export const selectOrders = (state: { orders: OrderState }) => state.orders.orders;
export const selectCurrentOrder = (state: { orders: OrderState }) => state.orders.currentOrder;
export const selectOrderById = (state: { orders: OrderState }, orderId: string) => 
  state.orders.orders.find(order => order.id === orderId);
export const selectOrdersByStatus = (state: { orders: OrderState }, status: Order['status']) =>
  state.orders.orders.filter(order => order.status === status);

export default orderSlice.reducer; 

// Thunks (after reducer for hoisting clarity)
export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiFetch('/api/public/orders', {}, false);
      const data: any = await json(res);
      return (data?.data || data || []) as Order[];
    } catch (e: any) {
      return rejectWithValue(e.message || 'Failed to fetch orders');
    }
  }
);

export const fetchOrderDetails = createAsyncThunk(
  'orders/fetchOrderDetails',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await apiFetch(`/api/public/orders/${id}`, {}, false);
      const data: any = await json(res);
      return (data?.data || data || null) as Order | null;
    } catch (e: any) {
      return rejectWithValue(e.message || 'Failed to fetch order');
    }
  }
);