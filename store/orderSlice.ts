import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { apiFetch, json } from '../services/api';
import { CartItem } from './cartSlice';
import { APP_CONFIG } from '../config/appConfig';
import { 
  requestReturnReplace, 
  getReturnReplaceStatus, 
  cancelReturnReplace, 
  requestRefund,
  getOrderDetails,
  cancelOrder
} from '../services/api';

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

// New async thunk for mobile payment order creation
export const createMobilePaymentOrder = createAsyncThunk(
  'orders/createMobilePaymentOrder',
  async (orderData: {
    cart: CartItem[];
    shippingAddress: any;
    paymentMethod: string;
    shippingCost?: number;
  }, { rejectWithValue, getState }) => {
    try {
      // Get store ID from app config
      const storeId = APP_CONFIG?.store?.id;

      console.log('APP_CONFIG:', APP_CONFIG);
      console.log('Store ID from config:', storeId);

      if (!storeId) {
        throw new Error('Store ID not found in app configuration. Please try again.');
      }

      // Map cart items to backend expected format
      const backendCart = orderData.cart.map(item => ({
        product: item.product.id,
        quantity: item.quantity,
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor
      }));

      // Map address fields to backend expected format
      const backendAddress = {
        address: orderData.shippingAddress.address, // Backend expects 'address' not 'addressLine1'
        city: orderData.shippingAddress.city,
        state: orderData.shippingAddress.state,
        postalCode: orderData.shippingAddress.zipCode, // Backend expects postalCode
        country: orderData.shippingAddress.country,
        phone: orderData.shippingAddress.phone,
        fullName: orderData.shippingAddress.fullName
      };

      const payload = {
        storeId: storeId,
        cart: backendCart,
        shippingAddress: backendAddress,
        billingAddress: backendAddress, // Use shipping address as billing for now
        paymentMethod: orderData.paymentMethod || 'razorpay',
        shippingCost: orderData.shippingCost || 0,
        userAgent: 'mobile_app'
      };

      console.log('Creating mobile payment order with payload:', payload);

      const res = await apiFetch('/api/mobile/payments/create-order', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      const data: any = await json(res);
      console.log('Mobile payment order response:', data);

      if (!data.success) {
        throw new Error(data.message || 'Failed to create payment order');
      }

      return data.data;
    } catch (e: any) {
      console.error('Mobile payment order error:', e);
      return rejectWithValue(e.message || 'Failed to create payment order');
    }
  }
);

// New async thunk for payment verification
export const verifyPayment = createAsyncThunk(
  'orders/verifyPayment',
  async (paymentData: {
    paymentId: string;
    orderId: string;
    signature: string;
  }, { rejectWithValue, getState }) => {
    try {
      // Get store ID from app config
      const storeId = APP_CONFIG?.store?.id;

      if (!storeId) {
        throw new Error('Store ID not found in app configuration.');
      }

      const payload = {
        paymentId: paymentData.paymentId,
        orderId: paymentData.orderId,
        signature: paymentData.signature,
        storeId: storeId
      };

      console.log('Verifying payment with payload:', payload);

      const res = await apiFetch('/api/mobile/payments/verify', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      const data: any = await json(res);
      console.log('Payment verification response:', data);

      if (!data.success) {
        throw new Error(data.message || 'Payment verification failed');
      }

      return data.data;
    } catch (e: any) {
      console.error('Payment verification error:', e);
      return rejectWithValue(e.message || 'Payment verification failed');
    }
  }
);

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
      // Mobile Payment Order Creation
      .addCase(createMobilePaymentOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createMobilePaymentOrder.fulfilled, (state, action) => {
        state.loading = false;
        // Store the payment order data for processing
        state.currentOrder = {
          id: action.payload.orderId || `ORD-${Date.now()}`,
          items: [], // Will be populated from cart
          total: action.payload.amount / 100, // Convert from paise
          status: 'pending',
          paymentStatus: 'pending',
          shippingAddress: action.payload.shippingAddress || {},
          paymentMethod: action.payload.paymentMethod || 'razorpay',
          orderDate: new Date().toISOString(),
        };
      })
      .addCase(createMobilePaymentOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Payment verification cases
      .addCase(verifyPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyPayment.fulfilled, (state, action) => {
        state.loading = false;
        // Update current order with payment verification result
        if (state.currentOrder) {
          state.currentOrder.paymentStatus = 'paid';
          state.currentOrder.status = 'confirmed';
        }
      })
      .addCase(verifyPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Existing cases
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
      const result: any = await getOrderDetails(id);
      console.log('Order details API response:', result);
      return (result?.data || result || null) as Order | null;
    } catch (e: any) {
      return rejectWithValue(e.message || 'Failed to fetch order details');
    }
  }
);

// Return/Refund thunks
export const requestReturnReplaceThunk = createAsyncThunk(
  'orders/requestReturnReplace',
  async (data: { orderId: string; type: 'return' | 'replace'; reason: string }, { rejectWithValue }) => {
    try {
      const result = await requestReturnReplace(data.orderId, {
        type: data.type,
        reason: data.reason
      });
      return result;
    } catch (e: any) {
      return rejectWithValue(e.message || 'Failed to request return/replace');
    }
  }
);

export const getReturnReplaceStatusThunk = createAsyncThunk(
  'orders/getReturnReplaceStatus',
  async (orderId: string, { rejectWithValue }) => {
    try {
      const result = await getReturnReplaceStatus(orderId);
      return result;
    } catch (e: any) {
      return rejectWithValue(e.message || 'Failed to get return/replace status');
    }
  }
);

export const cancelReturnReplaceThunk = createAsyncThunk(
  'orders/cancelReturnReplace',
  async (orderId: string, { rejectWithValue }) => {
    try {
      const result = await cancelReturnReplace(orderId);
      return result;
    } catch (e: any) {
      return rejectWithValue(e.message || 'Failed to cancel return/replace');
    }
  }
);

export const requestRefundThunk = createAsyncThunk(
  'orders/requestRefund',
  async (data: { orderId: string; refundAmount: number; reason: string }, { rejectWithValue }) => {
    try {
      const result = await requestRefund(data.orderId, {
        refundAmount: data.refundAmount,
        reason: data.reason
      });
      return result;
    } catch (e: any) {
      return rejectWithValue(e.message || 'Failed to request refund');
    }
  }
);

export const cancelOrderThunk = createAsyncThunk(
  'orders/cancelOrder',
  async (data: { orderId: string; data: { reason: string; description?: string } }, { rejectWithValue }) => {
    try {
      const result = await cancelOrder(data.orderId, data.data);
      return result;
    } catch (e: any) {
      return rejectWithValue(e.message || 'Failed to cancel order');
    }
  }
);