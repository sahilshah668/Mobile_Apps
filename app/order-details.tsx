import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
  Linking,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';

import theme from '@/constants/theme';
import { fetchOrderDetails } from '@/store/orderSlice';
import { IconSymbol } from '@/components/ui/IconSymbol';

const OrderDetailsScreen: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('OrderDetailsScreen: useEffect triggered with orderId:', orderId);
    if (orderId) {
      loadOrderDetails();
    }
  }, [orderId]);

  const loadOrderDetails = async () => {
    try {
      console.log('OrderDetailsScreen: Starting to load order details for:', orderId);
      setLoading(true);
      setError(null);
      
      const result = await dispatch(fetchOrderDetails(orderId!)).unwrap();
      console.log('OrderDetailsScreen: Order details loaded successfully:', result);
      setOrder(result);
    } catch (err: any) {
      console.error('OrderDetailsScreen: Failed to load order details:', err);
      setError(err.message || 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  console.log('OrderDetailsScreen: Rendering with loading:', loading, 'error:', error, 'order:', order);

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

  const getOrderStatusTimeline = () => {
    const statuses = [
      { status: 'pending', label: 'Order Placed', icon: 'checkmark-circle' },
      { status: 'confirmed', label: 'Order Confirmed', icon: 'checkmark-circle' },
      { status: 'processing', label: 'Processing', icon: 'sync' },
      { status: 'shipped', label: 'Shipped', icon: 'car' },
      { status: 'delivered', label: 'Delivered', icon: 'checkmark-done-circle' }
    ];

    // Handle cancelled orders
    if (order?.status === 'cancelled') {
      return [
        { status: 'pending', label: 'Order Placed', icon: 'checkmark-circle', isCompleted: true, isCurrent: false },
        { status: 'cancelled', label: 'Order Cancelled', icon: 'close-circle', isCompleted: true, isCurrent: true }
      ];
    }

    const currentStatusIndex = statuses.findIndex(s => s.status === order?.status);
    
    return statuses.map((status, index) => ({
      ...status,
      isCompleted: index <= currentStatusIndex,
      isCurrent: index === currentStatusIndex
    }));
  };

  const formatPrice = (price: number) => {
    if (!price || isNaN(price)) return '$0.00';
    return `$${price.toFixed(2)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#FF9800';
      case 'confirmed':
        return '#2196F3';
      case 'processing':
        return '#9C27B0';
      case 'shipped':
        return '#3F51B5';
      case 'delivered':
        return '#4CAF50';
      case 'cancelled':
        return '#F44336';
      case 'refunded':
        return '#FF5722';
      default:
        return '#9E9E9E';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'PENDING';
      case 'confirmed':
        return 'CONFIRMED';
      case 'processing':
        return 'PROCESSING';
      case 'shipped':
        return 'SHIPPED';
      case 'delivered':
        return 'DELIVERED';
      case 'cancelled':
        return 'CANCELLED';
      case 'refunded':
        return 'REFUNDED';
      default:
        return status?.toUpperCase() || 'UNKNOWN';
    }
  };

  const handleTrackOrder = () => {
    if (order?.trackingUrl) {
      Linking.openURL(order.trackingUrl);
    } else if (order?.trackingNumber) {
      const trackingUrl = `https://www.google.com/search?q=${order.trackingNumber}`;
      Linking.openURL(trackingUrl);
    } else {
      Alert.alert('No Tracking', 'Tracking information is not available for this order.');
    }
  };

  const handleCancelOrder = () => {
    router.push(`/cancel-order?orderId=${order?.id || order?._id}`);
  };

  // Refresh order details when returning from cancel order screen
  useFocusEffect(
    React.useCallback(() => {
      if (orderId) {
        loadOrderDetails();
      }
    }, [orderId])
  );

  const handleRequestReturn = () => {
    router.push(`/return-refund-request?orderId=${order?.id || order?._id}`);
  };

  const handleContactSupport = () => {
    Alert.alert(
      'Contact Support',
      'For order-related inquiries, please contact our support team.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Email Support', onPress: () => Linking.openURL('mailto:support@example.com') },
        { text: 'Call Support', onPress: () => Linking.openURL('tel:+1234567890') }
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
          <Text style={styles.headerTitle}>Order Details</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading order details...</Text>
        </View>
      </View>
    );
  }

  if (error || !order) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Details</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <IconSymbol name="alert-circle" size={64} color={theme.colors.subtitle} />
          <Text style={styles.errorTitle}>Order Not Found</Text>
          <Text style={styles.errorSubtitle}>
            {error || 'Unable to load order details. Please try again.'}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadOrderDetails}>
            <Text style={styles.retryButtonText}>Retry</Text>
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
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.orderSummary}>
            <Text style={styles.orderNumber}>Order #{order._id || order.id || 'N/A'}</Text>
            <View style={styles.statusContainer}>
              <Text style={styles.statusLabel}>Status:</Text>
              <View style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(order.status || 'pending') }
              ]}>
                <Text style={styles.statusText}>
                  {getStatusText(order.status || 'pending')}
                </Text>
              </View>
            </View>
            <Text style={styles.orderDate}>Date: {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</Text>
            <Text style={styles.orderTotal}>Total: ${order.totalAmount || 0}</Text>
          </View>

          {/* Order Items */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Items ({getOrderItems().length})</Text>
            <View style={styles.itemsContainer}>
              {getOrderItems().map((item, index) => {
                const product = item.product || {};
                const image = product.images?.[0] || product.image || '';
                const itemId = item.id || `item-${index}`;
                
                return (
                  <View key={itemId} style={styles.orderItem}>
                    <Image source={{ uri: image }} style={styles.itemImage} />
                    <View style={styles.itemDetails}>
                      <Text style={styles.itemName} numberOfLines={2}>
                        {product.name || 'Product Name Not Available'}
                      </Text>
                      <Text style={styles.itemSpecs}>
                        Qty: {item.quantity || 1}
                        {item.selectedSize && ` • Size: ${item.selectedSize}`}
                      </Text>
                      <Text style={styles.itemPrice}>
                        {formatPrice((product.price || 0) * (item.quantity || 1))}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Shipping Address</Text>
              <View style={styles.addressCard}>
                <IconSymbol name="location" size={20} color={theme.colors.primary} />
                <View style={styles.addressDetails}>
                  <Text style={styles.addressName}>{order.shippingAddress.fullName || 'N/A'}</Text>
                  <Text style={styles.addressText}>{order.shippingAddress.address || 'N/A'}</Text>
                  <Text style={styles.addressText}>
                    {order.shippingAddress.city || 'N/A'}, {order.shippingAddress.state || 'N/A'} {order.shippingAddress.zipCode || order.shippingAddress.postalCode || 'N/A'}
                  </Text>
                  <Text style={styles.addressText}>{order.shippingAddress.country || 'N/A'}</Text>
                  {order.shippingAddress.phone && (
                    <Text style={styles.addressText}>Phone: {order.shippingAddress.phone}</Text>
                  )}
                </View>
              </View>
            </View>
          )}

          {/* Payment Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Information</Text>
            <View style={styles.paymentCard}>
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Payment Method:</Text>
                <Text style={styles.paymentValue}>
                  {order.paymentMethod ? order.paymentMethod.toUpperCase() : 'N/A'}
                </Text>
              </View>
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Payment Status:</Text>
                <Text style={[
                  styles.paymentValue,
                  { color: order.paymentStatus === 'paid' ? '#4CAF50' : '#FF9800' }
                ]}>
                  {order.paymentStatus ? order.paymentStatus.toUpperCase() : 'PENDING'}
                </Text>
              </View>
            </View>
          </View>

          {/* Order Status Timeline */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Status</Text>
            <View style={styles.timelineCard}>
              {getOrderStatusTimeline().map((status, index) => (
                <View key={status.status} style={styles.timelineItem}>
                  <View style={styles.timelineDotContainer}>
                    <View style={[
                      styles.timelineDot,
                      { 
                        backgroundColor: status.status === 'cancelled' 
                          ? '#F44336' 
                          : status.isCompleted 
                            ? theme.colors.primary 
                            : '#E0E0E0' 
                      }
                    ]}>
                      {status.isCompleted && (
                        <IconSymbol name={status.icon} size={12} color="white" />
                      )}
                    </View>
                    {index < getOrderStatusTimeline().length - 1 && (
                      <View style={[
                        styles.timelineLine,
                        { 
                          backgroundColor: status.status === 'cancelled' 
                            ? '#F44336' 
                            : status.isCompleted 
                              ? theme.colors.primary 
                              : '#E0E0E0' 
                        }
                      ]} />
                    )}
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={[
                      styles.timelineLabel,
                      { 
                        color: status.status === 'cancelled' 
                          ? '#F44336' 
                          : status.isCompleted 
                            ? theme.colors.text 
                            : theme.colors.subtitle 
                      }
                    ]}>
                      {status.label}
                    </Text>
                    {status.isCurrent && (
                      <Text style={[
                        styles.timelineCurrent,
                        { color: status.status === 'cancelled' ? '#F44336' : theme.colors.primary }
                      ]}>
                        {status.status === 'cancelled' ? 'Order Cancelled' : 'Current Status'}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>

                    {/* Tracking Status */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tracking Updates</Text>
            <View style={styles.trackingCard}>
              {order.trackingNumber && (
                <View style={styles.trackingNumberContainer}>
                  <Text style={styles.trackingNumberLabel}>Tracking Number:</Text>
                  <Text style={styles.trackingNumberValue}>{order.trackingNumber}</Text>
                </View>
              )}
              {order.trackingHistory && order.trackingHistory.length > 0 ? (
                order.trackingHistory.map((event: any, index: number) => (
                  <View key={index} style={styles.trackingEvent}>
                    <View style={styles.trackingDotContainer}>
                      <View style={styles.trackingDot} />
                      {index < order.trackingHistory.length - 1 && (
                        <View style={styles.trackingLine} />
                      )}
                    </View>
                    <View style={styles.trackingEventContent}>
                      <Text style={styles.trackingEventTitle}>{event.event || 'Status Update'}</Text>
                      <Text style={styles.trackingEventDescription}>
                        {event.description || 'Order status updated'}
                      </Text>
                      <Text style={styles.trackingEventTime}>
                        {event.timestamp ? new Date(event.timestamp).toLocaleString() : 'N/A'}
                      </Text>
                      {event.location && (
                        <Text style={styles.trackingEventLocation}>
                          📍 {event.location}
                        </Text>
                      )}
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.noTrackingContainer}>
                  <IconSymbol name="car" size={32} color={theme.colors.subtitle} />
                  <Text style={styles.noTrackingText}>No tracking updates available</Text>
                  <Text style={styles.noTrackingSubtext}>
                    Tracking information will appear here once your order is shipped
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Cancellation Information */}
          {order.status === 'cancelled' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Cancellation Details</Text>
              <View style={styles.cancellationCard}>
                <View style={styles.cancellationHeader}>
                  <IconSymbol name="close-circle" size={24} color="#F44336" />
                  <Text style={styles.cancellationTitle}>Order Cancelled</Text>
                </View>
                {order.cancellationReason && (
                  <Text style={styles.cancellationReason}>
                    Reason: {order.cancellationReason}
                  </Text>
                )}
                {order.cancellationDescription && (
                  <Text style={styles.cancellationDescription}>
                    {order.cancellationDescription}
                  </Text>
                )}
                {order.cancelledAt && (
                  <Text style={styles.cancellationDate}>
                    Cancelled on: {new Date(order.cancelledAt).toLocaleDateString()}
                  </Text>
                )}
                {order.paymentStatus === 'paid' && order.paymentMethod !== 'cod' && (
                  <Text style={styles.refundInfo}>
                    💳 Refund will be processed within 3-5 business days
                  </Text>
                )}
              </View>
            </View>
          )}

          {/* Return/Replace Request Status */}
          {order.returnReplaceRequest && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Return/Replace Request</Text>
              <View style={styles.returnCard}>
                <View style={styles.returnHeader}>
                  <Text style={styles.returnType}>
                    {order.returnReplaceRequest.type === 'return' ? 'Return' : 'Replace'} Request
                  </Text>
                  <View style={[
                    styles.returnStatusBadge,
                    { backgroundColor: getStatusColor(order.returnReplaceRequest.status) }
                  ]}>
                    <Text style={styles.returnStatusText}>
                      {order.returnReplaceRequest.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
                <Text style={styles.returnReason}>Reason: {order.returnReplaceRequest.reason}</Text>
                <Text style={styles.returnDate}>
                  Requested: {formatDate(order.returnReplaceRequest.requestedAt)}
                </Text>
                {order.returnReplaceRequest.adminNote && (
                  <Text style={styles.returnAdminNote}>
                    Admin Note: {order.returnReplaceRequest.adminNote}
                  </Text>
                )}
              </View>
            </View>
          )}

          {/* Refund Request Status */}
          {order.refundRequest && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Refund Request</Text>
              <View style={styles.returnCard}>
                <View style={styles.returnHeader}>
                  <Text style={styles.returnType}>Refund Request</Text>
                  <View style={[
                    styles.returnStatusBadge,
                    { backgroundColor: getStatusColor(order.refundRequest.status) }
                  ]}>
                    <Text style={styles.returnStatusText}>
                      {order.refundRequest.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
                <Text style={styles.returnReason}>Reason: {order.refundRequest.reason}</Text>
                <Text style={styles.returnAmount}>
                  Amount: {formatPrice(order.refundRequest.refundAmount || 0)}
                </Text>
                <Text style={styles.returnDate}>
                  Requested: {formatDate(order.refundRequest.requestedAt)}
                </Text>
                {order.refundRequest.adminNote && (
                  <Text style={styles.returnAdminNote}>
                    Admin Note: {order.refundRequest.adminNote}
                  </Text>
                )}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.footer}>
        <View style={styles.actionButtons}>
          {order.status === 'pending' && (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleCancelOrder}
            >
              <LinearGradient
                colors={['#F44336', '#D32F2F']}
                style={styles.actionButtonGradient}
              >
                <IconSymbol name="close-circle" size={20} color="white" />
                <Text style={styles.actionButtonText}>Cancel Order</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {(order.status === 'delivered' || order.status === 'shipped') && 
           !order.returnReplaceRequest && !order.refundRequest && (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleRequestReturn}
            >
              <LinearGradient
                colors={['#FF9800', '#F57C00']}
                style={styles.actionButtonGradient}
              >
                <IconSymbol name="arrow-back-circle" size={20} color="white" />
                <Text style={styles.actionButtonText}>Return/Refund</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {(order.returnReplaceRequest || order.refundRequest) && (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleRequestReturn}
            >
              <LinearGradient
                colors={['#2196F3', '#1976D2']}
                style={styles.actionButtonGradient}
              >
                <IconSymbol name="document-text" size={20} color="white" />
                <Text style={styles.actionButtonText}>View Request Details</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {(order.trackingNumber || order.trackingUrl || (order.trackingHistory && order.trackingHistory.length > 0)) && (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleTrackOrder}
            >
              <LinearGradient
                colors={[theme.colors.primary, '#0056CC']}
                style={styles.actionButtonGradient}
              >
                <IconSymbol name="car" size={20} color="white" />
                <Text style={styles.actionButtonText}>Track Order</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleContactSupport}
          >
            <LinearGradient
              colors={['#FF6B6B', '#FF5252']}
              style={styles.actionButtonGradient}
            >
              <IconSymbol name="help-circle" size={20} color="white" />
              <Text style={styles.actionButtonText}>Get Help</Text>
            </LinearGradient>
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
  content: {
    padding: theme.spacing.lg,
  },
  orderSummary: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: theme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: theme.spacing.lg,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    fontFamily: theme.fonts.bold,
  },
  itemsContainer: {
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
    marginBottom: 4,
    fontFamily: theme.fonts.bold,
  },
  itemSpecs: {
    fontSize: 14,
    color: theme.colors.subtitle,
    marginBottom: 4,
    fontFamily: theme.fonts.regular,
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
  addressName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
    fontFamily: theme.fonts.bold,
  },
  addressText: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: 2,
    fontFamily: theme.fonts.regular,
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
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  paymentLabel: {
    fontSize: 14,
    color: theme.colors.subtitle,
    fontFamily: theme.fonts.regular,
  },
  paymentValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
  },
  footer: {
    backgroundColor: 'white',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  actionButtons: {
    gap: theme.spacing.sm,
  },
  actionButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: theme.fonts.bold,
  },
  trackingCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: theme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  trackingEvent: {
    flexDirection: 'row',
    marginBottom: theme.spacing.lg,
    position: 'relative',
  },
  trackingDotContainer: {
    alignItems: 'center',
    marginRight: theme.spacing.md,
    width: 20,
  },
  trackingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.primary,
    marginTop: 4,
  },
  trackingLine: {
    width: 2,
    height: 40,
    backgroundColor: '#E0E0E0',
    marginTop: 8,
  },
  trackingEventContent: {
    flex: 1,
  },
  trackingEventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
    fontFamily: theme.fonts.bold,
  },
  trackingEventDescription: {
    fontSize: 14,
    color: theme.colors.subtitle,
    marginBottom: 4,
    fontFamily: theme.fonts.regular,
  },
  trackingEventTime: {
    fontSize: 12,
    color: theme.colors.subtitle,
    marginBottom: 2,
    fontFamily: theme.fonts.regular,
  },
  trackingEventLocation: {
    fontSize: 12,
    color: theme.colors.primary,
    fontFamily: theme.fonts.regular,
  },
  noTrackingContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  noTrackingText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    fontFamily: theme.fonts.bold,
  },
  noTrackingSubtext: {
    fontSize: 14,
    color: theme.colors.subtitle,
    textAlign: 'center',
    fontFamily: theme.fonts.regular,
  },
  timelineCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: theme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: theme.spacing.lg,
    position: 'relative',
  },
  timelineDotContainer: {
    alignItems: 'center',
    marginRight: theme.spacing.md,
    width: 20,
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.primary,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineLine: {
    width: 2,
    height: 40,
    backgroundColor: '#E0E0E0',
    marginTop: 8,
  },
  timelineContent: {
    flex: 1,
  },
  timelineLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
    fontFamily: theme.fonts.bold,
  },
  timelineCurrent: {
    fontSize: 12,
    color: theme.colors.primary,
    fontFamily: theme.fonts.bold,
  },
  trackingNumberContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  trackingNumberLabel: {
    fontSize: 14,
    color: theme.colors.subtitle,
    fontFamily: theme.fonts.regular,
  },
  trackingNumberValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
    fontFamily: theme.fonts.bold,
  },
  returnCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: theme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  returnHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  returnType: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
  },
  returnStatusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: 12,
  },
  returnStatusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: theme.fonts.bold,
  },
  returnReason: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    fontFamily: theme.fonts.regular,
  },
  returnAmount: {
    fontSize: 14,
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
    fontFamily: theme.fonts.bold,
  },
  returnDate: {
    fontSize: 12,
    color: theme.colors.subtitle,
    marginBottom: theme.spacing.sm,
    fontFamily: theme.fonts.regular,
  },
  returnAdminNote: {
    fontSize: 12,
    color: theme.colors.subtitle,
    fontStyle: 'italic',
    fontFamily: theme.fonts.regular,
  },
  cancellationCard: {
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  cancellationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  cancellationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F44336',
    marginLeft: theme.spacing.sm,
    fontFamily: theme.fonts.bold,
  },
  cancellationReason: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D32F2F',
    marginBottom: theme.spacing.sm,
    fontFamily: theme.fonts.bold,
  },
  cancellationDescription: {
    fontSize: 14,
    color: '#BF360C',
    marginBottom: theme.spacing.sm,
    lineHeight: 20,
    fontFamily: theme.fonts.regular,
  },
  cancellationDate: {
    fontSize: 12,
    color: '#BF360C',
    marginBottom: theme.spacing.sm,
    fontFamily: theme.fonts.regular,
  },
  refundInfo: {
    fontSize: 14,
    color: '#D32F2F',
    fontWeight: '600',
    fontFamily: theme.fonts.bold,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    fontFamily: theme.fonts.bold,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  statusLabel: {
    fontSize: 14,
    color: theme.colors.subtitle,
    marginRight: theme.spacing.sm,
    fontFamily: theme.fonts.regular,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: theme.fonts.bold,
  },
  orderStatus: {
    fontSize: 16,
    color: theme.colors.subtitle,
    marginBottom: theme.spacing.sm,
    fontFamily: theme.fonts.regular,
  },
  orderDate: {
    fontSize: 16,
    color: theme.colors.subtitle,
    marginBottom: theme.spacing.sm,
    fontFamily: theme.fonts.regular,
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
    fontFamily: theme.fonts.bold,
  },
});

export default OrderDetailsScreen;
