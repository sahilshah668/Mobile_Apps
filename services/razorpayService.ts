import { Alert, Platform } from 'react-native';
import { apiFetch, json } from './api';

// Conditional import for Razorpay - only available on native platforms
let RazorpayCheckout: any = null;

// Try to import Razorpay SDK
const loadRazorpaySDK = () => {
  if (Platform.OS === 'web') {
    console.log('Razorpay not available on web platform');
    return false;
  }
  
  try {
    // Use dynamic import to avoid bundling issues
    const RazorpayModule = require('react-native-razorpay');
    RazorpayCheckout = RazorpayModule.default || RazorpayModule;
    console.log('Razorpay SDK loaded successfully');
    return true;
  } catch (error) {
    console.warn('Failed to load Razorpay SDK:', error);
    return false;
  }
};

// Load SDK on module initialization
const isSDKLoaded = loadRazorpaySDK();

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
}

export interface PaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface PaymentError {
  code: string;
  description: string;
  source: string;
  step: string;
  reason: string;
  metadata: Record<string, any>;
}

/**
 * Check if Razorpay is available
 */
export const isRazorpayAvailable = (): boolean => {
  return Platform.OS !== 'web' && isSDKLoaded && RazorpayCheckout !== null;
};

/**
 * Initialize Razorpay payment
 */
export const initializeRazorpayPayment = (options: RazorpayOptions): Promise<PaymentResponse> => {
  return new Promise((resolve, reject) => {
    // Check if Razorpay is available
    if (!isRazorpayAvailable()) {
      console.log('Razorpay not available, falling back to mock payment');
      // Fall back to mock payment
      mockPayment(options)
        .then(resolve)
        .catch(reject);
      return;
    }

    console.log('Initializing Razorpay payment with options:', options);

    const razorpayOptions = {
      key: options.key,
      amount: options.amount,
      currency: options.currency,
      order_id: options.order_id,
      name: options.name,
      description: options.description || 'Payment for your order',
      prefill: options.prefill || {},
      notes: options.notes || {},
      theme: {
        color: options.theme?.color || '#eb2424',
      },
      modal: {
        ondismiss: () => {
          reject(new Error('Payment cancelled by user'));
        },
      },
    };

    console.log('Opening Razorpay checkout with options:', razorpayOptions);

    RazorpayCheckout.open(razorpayOptions)
      .then((data: PaymentResponse) => {
        console.log('Razorpay payment successful:', data);
        resolve(data);
      })
      .catch((error: PaymentError) => {
        console.error('Razorpay payment failed:', error);
        
        // Handle specific error cases
        if (error.code === 'PAYMENT_CANCELLED') {
          reject(new Error('Payment was cancelled'));
        } else if (error.code === 'NETWORK_ERROR') {
          reject(new Error('Network error. Please check your connection.'));
        } else if (error.code === 'INVALID_PAYMENT_METHOD') {
          reject(new Error('Invalid payment method. Please try another option.'));
        } else {
          reject(new Error(error.description || 'Payment failed. Please try again.'));
        }
      });
  });
};

/**
 * Verify payment with backend
 */
export const verifyPayment = async (
  paymentId: string,
  orderId: string,
  signature: string,
  storeId: string
): Promise<any> => {
  try {
    const response = await apiFetch('/api/mobile/payments/verify', {
      method: 'POST',
      body: JSON.stringify({
        paymentId,
        orderId,
        signature,
        storeId,
      }),
    });

    const data = await json(response);
    
    if (!data.success) {
      throw new Error(data.message || 'Payment verification failed');
    }

    return data.data;
  } catch (error) {
    console.error('Payment verification error:', error);
    throw error;
  }
};

/**
 * Get payment status
 */
export const getPaymentStatus = async (orderId: string, storeId: string): Promise<any> => {
  try {
    const response = await apiFetch(`/api/mobile/payments/status/${orderId}?store=${storeId}`, {
      method: 'GET',
    });

    const data = await json(response);
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to get payment status');
    }

    return data.data;
  } catch (error) {
    console.error('Get payment status error:', error);
    throw error;
  }
};

/**
 * Handle payment success
 */
export const handlePaymentSuccess = async (
  paymentResponse: PaymentResponse,
  storeId: string
): Promise<any> => {
  try {
    // Verify payment with backend
    const verificationResult = await verifyPayment(
      paymentResponse.razorpay_payment_id,
      paymentResponse.razorpay_order_id,
      paymentResponse.razorpay_signature,
      storeId
    );

    console.log('Payment verification successful:', verificationResult);
    return verificationResult;
  } catch (error) {
    console.error('Payment verification failed:', error);
    throw error;
  }
};

/**
 * Show payment error alert
 */
export const showPaymentError = (error: Error) => {
  Alert.alert(
    'Payment Failed',
    error.message || 'There was an issue processing your payment. Please try again.',
    [
      {
        text: 'OK',
        style: 'default',
      },
    ]
  );
};

/**
 * Show payment success alert
 */
export const showPaymentSuccess = (orderId: string) => {
  Alert.alert(
    'Payment Successful!',
    `Your payment has been processed successfully. Order ID: ${orderId}`,
    [
      {
        text: 'OK',
        style: 'default',
      },
    ]
  );
};

/**
 * Mock payment for development/testing (when Razorpay is not available)
 */
export const mockPayment = (options: RazorpayOptions): Promise<PaymentResponse> => {
  return new Promise((resolve, reject) => {
    console.log('Using mock payment for development/testing');
    
    // Simulate payment processing
    setTimeout(() => {
      const mockResponse: PaymentResponse = {
        razorpay_payment_id: 'pay_mock_' + Math.random().toString(36).substr(2, 9),
        razorpay_order_id: options.order_id,
        razorpay_signature: 'mock_signature_' + Math.random().toString(36).substr(2, 9),
      };
      
      console.log('Mock payment successful:', mockResponse);
      resolve(mockResponse);
    }, 2000);
  });
};
