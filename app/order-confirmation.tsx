import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useSelector } from 'react-redux';

import { IconSymbol } from '@/components/ui/IconSymbol';
import theme from '@/constants/theme';
import { selectCurrentOrder } from '@/store/orderSlice';
import { selectCartItems } from '@/store/cartSlice';
import { 
  initializeRazorpayPayment, 
  handlePaymentSuccess, 
  showPaymentError,
  showPaymentSuccess,
  isRazorpayAvailable,
  mockPayment
} from '@/services/razorpayService';
import { APP_CONFIG } from '@/config/appConfig';

const OrderConfirmationScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const currentOrder = useSelector(selectCurrentOrder);
  const cartItems = useSelector(selectCartItems);
  
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'success' | 'failed'>('pending');

  // Extract payment details from params
  const orderId = params.orderId as string;
  const paymentOrderId = params.paymentOrderId as string;
  const amount = params.amount as string;
  const key = params.key as string;

  useEffect(() => {
    if (paymentOrderId && key) {
      // Initialize payment processing
      handlePaymentProcessing();
    }
  }, [paymentOrderId, key]);

  const handlePaymentProcessing = async () => {
    if (!paymentOrderId || !key) {
      setPaymentStatus('failed');
      return;
    }

    setIsProcessingPayment(true);
    setPaymentStatus('processing');

    try {
      // Get store ID from app config
      const storeId = APP_CONFIG?.store?.id;
      if (!storeId) {
        throw new Error('Store ID not found in app configuration');
      }

      console.log('🔍 Starting payment processing...');
      console.log('🔍 Payment Order ID:', paymentOrderId);
      console.log('🔍 Amount:', amount);
      console.log('🔍 Store ID:', storeId);

      // Check Razorpay availability first
      const razorpayAvailable = isRazorpayAvailable();
      console.log('🔍 Razorpay available:', razorpayAvailable);

      if (!razorpayAvailable) {
        console.log('🔍 Using mock payment for emulator/development');
        // Use mock payment directly for emulator
        const mockResponse = await mockPayment({
          key: key,
          amount: parseInt(amount),
          currency: 'INR',
          order_id: paymentOrderId,
          name: APP_CONFIG?.store?.name || 'Store',
          description: 'Payment for your order',
          prefill: {
            name: 'Customer Name',
            email: 'customer@example.com',
            contact: '9999999999',
          },
          notes: {
            orderId: orderId,
            storeId: storeId,
          },
          theme: {
            color: APP_CONFIG?.theme?.colors?.primary || '#eb2424',
          },
        });

        console.log('🔍 Mock payment completed:', mockResponse);
        setPaymentStatus('success');
        showPaymentSuccess(orderId);
        return;
      }

      console.log('🔍 Using real Razorpay payment');
      // Initialize real Razorpay payment
      const paymentResponse = await initializeRazorpayPayment({
        key: key,
        amount: parseInt(amount),
        currency: 'INR',
        order_id: paymentOrderId,
        name: APP_CONFIG?.store?.name || 'Store',
        description: 'Payment for your order',
        prefill: {
          name: 'Customer Name', // You can get this from user profile
          email: 'customer@example.com', // You can get this from user profile
          contact: '9999999999', // You can get this from user profile
        },
        notes: {
          orderId: orderId,
          storeId: storeId,
        },
        theme: {
          color: APP_CONFIG?.theme?.colors?.primary || '#eb2424',
        },
      });

      console.log('🔍 Payment response received:', paymentResponse);

      // Check if this is a mock payment (for development)
      if (paymentResponse.razorpay_payment_id.startsWith('pay_mock_')) {
        console.log('🔍 Mock payment completed, skipping verification');
        setPaymentStatus('success');
        showPaymentSuccess(orderId);
        return;
      }

      // Verify real payment with backend
      console.log('🔍 Verifying real payment with backend...');
      const verificationResult = await handlePaymentSuccess(paymentResponse, storeId);

      // Payment successful
      setPaymentStatus('success');
      showPaymentSuccess(orderId);
      
      console.log('🔍 Payment verification result:', verificationResult);
      
    } catch (error: any) {
      console.error('❌ Payment processing error:', error);
      setPaymentStatus('failed');
      showPaymentError(error);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '#4CAF50';
      case 'processing':
        return '#FF9800';
      case 'shipped':
        return '#2196F3';
      case 'delivered':
        return '#4CAF50';
      default:
        return '#9E9E9E';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'checkmark';
      case 'processing':
        return 'time';
      case 'shipped':
        return 'car';
      case 'delivered':
        return 'checkmark';
      default:
        return 'ellipse';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleTrackOrder = () => {
    // TODO: Navigate to order tracking screen
    router.push(`/order-tracking/${orderId || currentOrder?.id}`);
  };

  const handleContinueShopping = () => {
    router.push('/(tabs)/home');
  };

  const handleViewOrders = () => {
    router.push('/(tabs)/profile');
  };

  const handleRetryPayment = () => {
    setPaymentStatus('pending');
    handlePaymentProcessing();
  };

  const handleTestMockPayment = async () => {
    console.log('🧪 Testing mock payment directly...');
    setIsProcessingPayment(true);
    setPaymentStatus('processing');
    
    try {
      const mockResponse = await mockPayment({
        key: 'test_key',
        amount: 100,
        currency: 'INR',
        order_id: 'test_order_' + Date.now(),
        name: 'Test Store',
        description: 'Test payment',
        prefill: {
          name: 'Test User',
          email: 'test@example.com',
          contact: '9999999999',
        },
        notes: {
          test: 'true',
        },
        theme: {
          color: '#eb2424',
        },
      });
      
      console.log('🧪 Mock payment test successful:', mockResponse);
      setPaymentStatus('success');
      showPaymentSuccess('test_order');
    } catch (error: any) {
      console.error('🧪 Mock payment test failed:', error);
      setPaymentStatus('failed');
      showPaymentError(error);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Show payment processing state
  if (isProcessingPayment || paymentStatus === 'processing') {
    return (
      <View style={styles.container}>
        <View style={styles.processingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.processingTitle}>Processing Payment...</Text>
          <Text style={styles.processingSubtitle}>
            Please wait while we process your payment securely
          </Text>
        </View>
      </View>
    );
  }

  // Show payment failed state
  if (paymentStatus === 'failed') {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <IconSymbol name="close-circle" size={80} color="#FF5252" />
          <Text style={styles.errorTitle}>Payment Failed</Text>
          <Text style={styles.errorSubtitle}>
            There was an issue processing your payment. Please try again.
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetryPayment}>
            <Text style={styles.retryButtonText}>Retry Payment</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.testButton} onPress={handleTestMockPayment}>
            <Text style={styles.testButtonText}>Test Mock Payment</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Back to Checkout</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Show order confirmation (payment successful or pending)
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Success Header */}
        <View style={styles.successHeader}>
          <LinearGradient
            colors={['#4CAF50', '#45A049']}
            style={styles.successGradient}
          >
            <View style={styles.successIconContainer}>
              <IconSymbol name="checkmark" size={60} color="white" />
            </View>
            <Text style={styles.successTitle}>
              {paymentStatus === 'success' ? 'Payment Successful!' : 'Order Confirmed!'}
            </Text>
            <Text style={styles.successSubtitle}>
              {paymentStatus === 'success' 
                ? 'Your payment has been processed successfully. We\'ll send you updates on your order.'
                : 'Thank you for your purchase. We\'ll send you updates on your order.'
              }
            </Text>
          </LinearGradient>
        </View>

        {/* Payment Details */}
        {paymentStatus === 'success' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Details</Text>
            <View style={styles.paymentCard}>
              <View style={styles.paymentInfo}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Payment ID:</Text>
                  <Text style={styles.infoValue}>{paymentOrderId}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Amount:</Text>
                  <Text style={styles.infoValue}>₹{(parseInt(amount) / 100).toFixed(2)}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Status:</Text>
                  <View style={styles.statusBadge}>
                    <IconSymbol name="checkmark-circle" size={16} color="white" />
                    <Text style={styles.statusText}>Paid</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Order Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Details</Text>
          <View style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <Text style={styles.orderId}>Order #{orderId || currentOrder?.id}</Text>
              <View style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(currentOrder?.status || 'pending') }
              ]}>
                <IconSymbol 
                  name={getStatusIcon(currentOrder?.status || 'pending')} 
                  size={16} 
                  color="white" 
                />
                <Text style={styles.statusText}>
                  {(currentOrder?.status || 'pending').charAt(0).toUpperCase() + (currentOrder?.status || 'pending').slice(1)}
                </Text>
              </View>
            </View>
            
            <View style={styles.orderInfo}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Order Date:</Text>
                <Text style={styles.infoValue}>{formatDate(currentOrder?.orderDate || new Date().toISOString())}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Payment Method:</Text>
                <Text style={styles.infoValue}>{currentOrder?.paymentMethod || 'Razorpay'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Total Amount:</Text>
                <Text style={styles.infoValue}>₹{(parseInt(amount) / 100).toFixed(2)}</Text>
              </View>
              {currentOrder?.estimatedDelivery && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Estimated Delivery:</Text>
                  <Text style={styles.infoValue}>{formatDate(currentOrder.estimatedDelivery)}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items Ordered</Text>
          <View style={styles.itemsCard}>
            {(currentOrder?.items || cartItems).map((item: any, index: number) => (
              <View key={item.id || index} style={styles.orderItem}>
                <Image 
                  source={{ uri: item.product?.image || item.product?.images?.[0] }} 
                  style={styles.itemImage} 
                />
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{item.product?.name || 'Product'}</Text>
                  <Text style={styles.itemSpecs}>
                    Qty: {item.quantity}
                    {item.selectedSize && ` • Size: ${item.selectedSize}`}
                    {item.selectedColor && ` • Color: ${item.selectedColor}`}
                  </Text>
                  <Text style={styles.itemPrice}>
                    ₹{((item.product?.price || 0) * item.quantity).toFixed(2)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Shipping Address */}
        {currentOrder?.shippingAddress && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Shipping Address</Text>
            <View style={styles.addressCard}>
              <IconSymbol name="location" size={20} color={theme.colors.primary} />
              <View style={styles.addressDetails}>
                <Text style={styles.addressText}>{currentOrder.shippingAddress.fullName}</Text>
                <Text style={styles.addressText}>{currentOrder.shippingAddress.address}</Text>
                {currentOrder.shippingAddress.addressLine2 && (
                  <Text style={styles.addressText}>{currentOrder.shippingAddress.addressLine2}</Text>
                )}
                <Text style={styles.addressText}>
                  {currentOrder.shippingAddress.city}, {currentOrder.shippingAddress.state} {currentOrder.shippingAddress.zipCode}
                </Text>
                <Text style={styles.addressText}>{currentOrder.shippingAddress.country}</Text>
                <Text style={styles.addressText}>{currentOrder.shippingAddress.phone}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Next Steps */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What's Next?</Text>
          <View style={styles.nextStepsCard}>
            <View style={styles.stepItem}>
              <View style={styles.stepIcon}>
                <IconSymbol name="mail" size={20} color={theme.colors.primary} />
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Order Confirmation Email</Text>
                <Text style={styles.stepDescription}>
                  You'll receive a confirmation email with order details
                </Text>
              </View>
            </View>
            
            <View style={styles.stepItem}>
              <View style={styles.stepIcon}>
                <IconSymbol name="notifications" size={20} color={theme.colors.primary} />
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Order Updates</Text>
                <Text style={styles.stepDescription}>
                  We'll notify you about order status changes
                </Text>
              </View>
            </View>
            
            <View style={styles.stepItem}>
              <View style={styles.stepIcon}>
                <IconSymbol name="car" size={20} color={theme.colors.primary} />
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Shipping & Delivery</Text>
                <Text style={styles.stepDescription}>
                  Track your package once it ships
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.trackButton} onPress={handleTrackOrder}>
          <LinearGradient
            colors={[theme.colors.primary, '#0056CC']}
            style={styles.trackButtonGradient}
          >
            <IconSymbol name="car" size={20} color="white" />
            <Text style={styles.trackButtonText}>Track Order</Text>
          </LinearGradient>
        </TouchableOpacity>
        
        <View style={styles.secondaryButtons}>
          <TouchableOpacity style={styles.secondaryButton} onPress={handleContinueShopping}>
            <Text style={styles.secondaryButtonText}>Continue Shopping</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.secondaryButton} onPress={handleViewOrders}>
            <Text style={styles.secondaryButtonText}>View All Orders</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  processingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  processingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    fontFamily: theme.fonts.bold,
  },
  processingSubtitle: {
    fontSize: 16,
    color: theme.colors.subtitle,
    textAlign: 'center',
    fontFamily: theme.fonts.regular,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF5252',
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    fontFamily: theme.fonts.bold,
  },
  errorSubtitle: {
    fontSize: 16,
    color: theme.colors.subtitle,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    fontFamily: theme.fonts.regular,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: 12,
    marginBottom: theme.spacing.md,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: theme.fonts.bold,
  },
  testButton: {
    backgroundColor: '#FF9800',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: 12,
    marginBottom: theme.spacing.md,
  },
  testButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: theme.fonts.bold,
  },
  successHeader: {
    marginBottom: theme.spacing.lg,
  },
  successGradient: {
    paddingVertical: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
  },
  successIconContainer: {
    marginBottom: theme.spacing.md,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: theme.fonts.bold,
    marginBottom: theme.spacing.sm,
  },
  successSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontFamily: theme.fonts.regular,
    lineHeight: 22,
  },
  section: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
    marginBottom: theme.spacing.md,
  },
  paymentCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: theme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: theme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: 16,
    gap: 4,
    backgroundColor: '#4CAF50',
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: theme.fonts.bold,
  },
  paymentInfo: {
    gap: theme.spacing.sm,
  },
  orderInfo: {
    gap: theme.spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: theme.colors.subtitle,
    fontFamily: theme.fonts.regular,
  },
  infoValue: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '600',
    fontFamily: theme.fonts.bold,
  },
  itemsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: theme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  orderItem: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: theme.spacing.md,
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
    marginBottom: 4,
  },
  itemSpecs: {
    fontSize: 14,
    color: theme.colors.subtitle,
    fontFamily: theme.fonts.regular,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
    fontFamily: theme.fonts.bold,
  },
  addressCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: theme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'flex-start',
  },
  addressDetails: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  addressText: {
    fontSize: 16,
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
    marginBottom: 2,
  },
  nextStepsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: theme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.lg,
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(21, 107, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: theme.colors.subtitle,
    fontFamily: theme.fonts.regular,
    lineHeight: 20,
  },
  footer: {
    backgroundColor: 'white',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  trackButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: theme.spacing.md,
  },
  trackButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  trackButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: theme.fonts.bold,
  },
  secondaryButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: theme.fonts.bold,
  },
  backButton: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    alignItems: 'center',
  },
  backButtonText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: theme.fonts.bold,
  },
});

export default OrderConfirmationScreen; 