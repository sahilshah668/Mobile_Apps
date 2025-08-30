import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useDispatch } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';

import theme from '@/constants/theme';
import { fetchOrderDetails } from '@/store/orderSlice';
import { cancelOrderThunk } from '@/store/orderSlice';
import { IconSymbol } from '@/components/ui/IconSymbol';

const CancelOrderScreen: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');

  const cancelReasons = [
    'Changed my mind',
    'Found better price elsewhere',
    'Ordered by mistake',
    'Delivery time too long',
    'Product no longer needed',
    'Payment issues',
    'Other'
  ];

  useEffect(() => {
    if (orderId) {
      loadOrderDetails();
    }
  }, [orderId]);

  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      const result = await dispatch(fetchOrderDetails(orderId!)).unwrap();
      setOrder(result);
      
      // Check if order can be cancelled
      if (result.status !== 'pending') {
        Alert.alert(
          'Cannot Cancel Order',
          'This order cannot be cancelled as it is no longer in pending status.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      }
    } catch (err: any) {
      console.error('Failed to load order details:', err);
      Alert.alert('Error', 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const getOrderItems = () => {
    if (order?.items) {
      return order.items;
    }
    if (order?.products) {
      return order.products.map((item: any) => {
        const product = Array.isArray(item.product) ? item.product[0] : item.product;
        return {
          ...item,
          product: product || {}
        };
      });
    }
    return [];
  };

  const formatPrice = (price: number) => {
    if (!price || isNaN(price)) return '$0.00';
    return `$${price.toFixed(2)}`;
  };

  const handleCancelOrder = async () => {
    if (!reason.trim()) {
      Alert.alert('Error', 'Please select a reason for cancellation');
      return;
    }

    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order? This action cannot be undone.',
      [
        { text: 'No, Keep Order', style: 'cancel' },
        {
          text: 'Yes, Cancel Order',
          style: 'destructive',
          onPress: async () => {
            try {
              setSubmitting(true);
              
              const result = await dispatch(cancelOrderThunk({
                orderId: orderId!,
                data: {
                  reason: reason,
                  description: description.trim() || undefined
                }
              })).unwrap();

              Alert.alert(
                'Order Cancelled',
                'Your order has been cancelled successfully. If you made a payment, it will be refunded within 3-5 business days.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      // Go back and refresh the order details
                      router.back();
                    }
                  }
                ]
              );
            } catch (err: any) {
              console.error('Failed to cancel order:', err);
              Alert.alert('Error', err.message || 'Failed to cancel order');
            } finally {
              setSubmitting(false);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cancel Order</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading order details...</Text>
        </View>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cancel Order</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <IconSymbol name="alert-circle" size={64} color={theme.colors.subtitle} />
          <Text style={styles.errorTitle}>Order Not Found</Text>
          <Text style={styles.errorSubtitle}>
            Unable to load order details. Please try again.
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadOrderDetails}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (order.status !== 'pending') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cancel Order</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <IconSymbol name="close-circle" size={64} color="#F44336" />
          <Text style={styles.errorTitle}>Cannot Cancel Order</Text>
          <Text style={styles.errorSubtitle}>
            This order cannot be cancelled as it is no longer in pending status.
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cancel Order</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Warning Message */}
        <View style={styles.warningContainer}>
          <IconSymbol name="warning" size={32} color="#FF9800" />
          <Text style={styles.warningTitle}>Cancel Order</Text>
          <Text style={styles.warningText}>
            You are about to cancel your order. This action cannot be undone. If you made a payment, it will be refunded within 3-5 business days.
          </Text>
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.orderCard}>
            <Text style={styles.orderNumber}>Order #{order._id || order.id}</Text>
            <Text style={styles.orderDate}>
              {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
            </Text>
            <Text style={styles.orderTotal}>Total: {formatPrice(order.totalAmount || 0)}</Text>
            <Text style={styles.orderStatus}>Status: {order.status}</Text>
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items to Cancel ({getOrderItems().length})</Text>
          <View style={styles.itemsContainer}>
            {getOrderItems().map((item: any, index: number) => {
              const product = item.product || {};
              
              return (
                <View key={index} style={styles.itemCard}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>
                      {product.name || 'Product Name Not Available'}
                    </Text>
                    <Text style={styles.itemDetails}>
                      Qty: {item.quantity} • {formatPrice((product.price || 0) * (item.quantity || 1))}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Cancellation Reason */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cancellation Reason *</Text>
          <View style={styles.reasonsContainer}>
            {cancelReasons.map((reasonOption) => (
              <TouchableOpacity
                key={reasonOption}
                style={[
                  styles.reasonButton,
                  reason === reasonOption && styles.reasonButtonActive
                ]}
                onPress={() => setReason(reasonOption)}
              >
                <Text style={[
                  styles.reasonButtonText,
                  reason === reasonOption && styles.reasonButtonTextActive
                ]}>
                  {reasonOption}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Additional Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Details (Optional)</Text>
          <TextInput
            style={styles.descriptionInput}
            placeholder="Please provide any additional details about why you're cancelling..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            placeholderTextColor={theme.colors.subtitle}
          />
        </View>
      </ScrollView>

      {/* Cancel Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleCancelOrder}
          disabled={submitting}
        >
          <LinearGradient
            colors={['#F44336', '#D32F2F']}
            style={styles.cancelButtonGradient}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <IconSymbol name="close-circle" size={20} color="white" />
                <Text style={styles.cancelButtonText}>Cancel Order</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: 60,
    paddingBottom: theme.spacing.md,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: theme.spacing.sm,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.subtitle,
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
    color: theme.colors.text,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    fontFamily: theme.fonts.bold,
  },
  errorSubtitle: {
    fontSize: 16,
    color: theme.colors.subtitle,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    fontFamily: theme.fonts.regular,
  },
  retryButton: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    borderRadius: 25,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: theme.fonts.bold,
  },
  scrollView: {
    flex: 1,
  },
  warningContainer: {
    backgroundColor: '#FFF3E0',
    margin: theme.spacing.lg,
    padding: theme.spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E65100',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    fontFamily: theme.fonts.bold,
  },
  warningText: {
    fontSize: 14,
    color: '#BF360C',
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: theme.fonts.regular,
  },
  section: {
    padding: theme.spacing.lg,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    fontFamily: theme.fonts.bold,
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
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
    fontFamily: theme.fonts.bold,
  },
  orderDate: {
    fontSize: 14,
    color: theme.colors.subtitle,
    marginBottom: 4,
    fontFamily: theme.fonts.regular,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
    marginBottom: 4,
    fontFamily: theme.fonts.bold,
  },
  orderStatus: {
    fontSize: 14,
    color: theme.colors.subtitle,
    fontFamily: theme.fonts.regular,
  },
  itemsContainer: {
    gap: theme.spacing.sm,
  },
  itemCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
    fontFamily: theme.fonts.bold,
  },
  itemDetails: {
    fontSize: 14,
    color: theme.colors.subtitle,
    fontFamily: theme.fonts.regular,
  },
  reasonsContainer: {
    gap: theme.spacing.sm,
  },
  reasonButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: theme.spacing.md,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  reasonButtonActive: {
    borderColor: '#F44336',
    backgroundColor: '#FFEBEE',
  },
  reasonButtonText: {
    fontSize: 16,
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
  },
  reasonButtonTextActive: {
    color: '#F44336',
    fontWeight: '600',
    fontFamily: theme.fonts.bold,
  },
  descriptionInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    fontSize: 16,
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
    minHeight: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  footer: {
    backgroundColor: 'white',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  cancelButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  cancelButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: theme.fonts.bold,
  },
});

export default CancelOrderScreen;
