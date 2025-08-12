import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSelector } from 'react-redux';

import { IconSymbol } from '@/components/ui/IconSymbol';
import theme from '@/constants/theme';
import { selectOrderById } from '@/store/orderSlice';
import { RootState } from '@/store/store';

const { width } = Dimensions.get('window');

interface TrackingStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  status: 'completed' | 'current' | 'pending';
  timestamp?: string;
}

const OrderTrackingScreen: React.FC = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const order = useSelector((state: RootState) => selectOrderById(state, id || ''));
  const [trackingSteps, setTrackingSteps] = useState<TrackingStep[]>([]);

  useEffect(() => {
    if (order) {
      generateTrackingSteps();
    }
  }, [order]);

  const generateTrackingSteps = () => {
    if (!order) return;

    const steps: TrackingStep[] = [
      {
        id: 'ordered',
        title: 'Order Placed',
        description: 'Your order has been successfully placed',
        icon: 'checkmark-circle',
        status: 'completed',
        timestamp: order.orderDate,
      },
      {
        id: 'confirmed',
        title: 'Order Confirmed',
        description: 'We have confirmed your order and payment',
        icon: 'checkmark-circle',
        status: order.status === 'confirmed' || order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered' ? 'completed' : 'pending',
        timestamp: order.status === 'confirmed' ? new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() : undefined,
      },
      {
        id: 'processing',
        title: 'Processing',
        description: 'Your order is being prepared for shipment',
        icon: 'time',
        status: order.status === 'processing' ? 'current' : 
               order.status === 'shipped' || order.status === 'delivered' ? 'completed' : 'pending',
        timestamp: order.status === 'processing' ? new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() : undefined,
      },
      {
        id: 'shipped',
        title: 'Shipped',
        description: 'Your order is on its way to you',
        icon: 'car',
        status: order.status === 'shipped' ? 'current' : 
               order.status === 'delivered' ? 'completed' : 'pending',
        timestamp: order.status === 'shipped' ? new Date(Date.now() - 30 * 60 * 1000).toISOString() : undefined,
      },
      {
        id: 'delivered',
        title: 'Delivered',
        description: 'Your order has been delivered',
        icon: 'checkmark-done-circle',
        status: order.status === 'delivered' ? 'completed' : 'pending',
        timestamp: order.status === 'delivered' ? new Date().toISOString() : undefined,
      },
    ];

    setTrackingSteps(steps);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#4CAF50';
      case 'current':
        return theme.colors.primary;
      default:
        return '#E0E0E0';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleBack = () => {
    router.back();
  };

  const handleContactSupport = () => {
    // TODO: Implement contact support functionality
    console.log('Contact support');
  };

  if (!order) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <IconSymbol name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Tracking</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Order not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <IconSymbol name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Tracking</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Order Summary */}
        <View style={styles.orderSummary}>
          <View style={styles.orderHeader}>
            <Text style={styles.orderId}>Order #{order.id}</Text>
            <View style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(order.status === 'delivered' ? 'completed' : 'current') }
            ]}>
              <IconSymbol 
                name={order.status === 'delivered' ? 'checkmark-done-circle' : 'time'} 
                size={16} 
                color="white" 
              />
              <Text style={styles.statusText}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Text>
            </View>
          </View>
          
          {order.trackingNumber && (
            <View style={styles.trackingInfo}>
              <Text style={styles.trackingLabel}>Tracking Number:</Text>
              <Text style={styles.trackingNumber}>{order.trackingNumber}</Text>
            </View>
          )}
          
          <Text style={styles.estimatedDelivery}>
            Estimated Delivery: {formatDate(order.estimatedDelivery || '')}
          </Text>
        </View>

        {/* Tracking Timeline */}
        <View style={styles.timelineContainer}>
          <Text style={styles.sectionTitle}>Order Progress</Text>
          <View style={styles.timeline}>
            {trackingSteps.map((step, index) => (
              <View key={step.id} style={styles.timelineStep}>
                <View style={styles.timelineConnector}>
                  <View style={[
                    styles.stepIcon,
                    { backgroundColor: getStatusColor(step.status) }
                  ]}>
                    <IconSymbol 
                      name={step.icon} 
                      size={20} 
                      color={step.status === 'pending' ? '#9E9E9E' : 'white'} 
                    />
                  </View>
                  {index < trackingSteps.length - 1 && (
                    <View style={[
                      styles.connectorLine,
                      { backgroundColor: getStatusColor(step.status === 'completed' ? 'completed' : 'pending') }
                    ]} />
                  )}
                </View>
                
                <View style={styles.stepContent}>
                  <View style={styles.stepHeader}>
                    <Text style={[
                      styles.stepTitle,
                      { color: step.status === 'pending' ? theme.colors.subtitle : theme.colors.text }
                    ]}>
                      {step.title}
                    </Text>
                    {step.timestamp && (
                      <Text style={styles.stepTimestamp}>
                        {formatDate(step.timestamp)}
                      </Text>
                    )}
                  </View>
                  <Text style={[
                    styles.stepDescription,
                    { color: step.status === 'pending' ? theme.colors.subtitle : theme.colors.text }
                  ]}>
                    {step.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.itemsSection}>
          <Text style={styles.sectionTitle}>Items in Order</Text>
          <View style={styles.itemsContainer}>
            {order.items.map((item) => (
              <View key={item.id} style={styles.orderItem}>
                <Image source={{ uri: item.product.image }} style={styles.itemImage} />
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{item.product.name}</Text>
                  <Text style={styles.itemSpecs}>
                    Qty: {item.quantity}
                    {item.selectedSize && ` • Size: ${item.selectedSize}`}
                    {item.selectedColor && ` • Color: ${item.selectedColor}`}
                  </Text>
                  <Text style={styles.itemPrice}>${(item.product.price * item.quantity).toFixed(2)}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Shipping Address */}
        <View style={styles.addressSection}>
          <Text style={styles.sectionTitle}>Shipping Address</Text>
          <View style={styles.addressCard}>
            <IconSymbol name="location" size={20} color={theme.colors.primary} />
            <View style={styles.addressDetails}>
              <Text style={styles.addressText}>{order.shippingAddress.address}</Text>
              <Text style={styles.addressText}>
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
              </Text>
              <Text style={styles.addressText}>{order.shippingAddress.country}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Support Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.supportButton} onPress={handleContactSupport}>
          <LinearGradient
            colors={['#FF6B6B', '#FF5252']}
            style={styles.supportButtonGradient}
          >
            <IconSymbol name="help-circle" size={20} color="white" />
            <Text style={styles.supportButtonText}>Need Help?</Text>
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
    paddingVertical: theme.spacing.md,
    paddingTop: theme.spacing.lg + 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: theme.colors.background,
  },
  backButton: {
    padding: theme.spacing.sm,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  orderSummary: {
    backgroundColor: 'white',
    margin: theme.spacing.lg,
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
    fontSize: 18,
    fontWeight: 'bold',
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
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: theme.fonts.bold,
  },
  trackingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  trackingLabel: {
    fontSize: 14,
    color: theme.colors.subtitle,
    fontFamily: theme.fonts.regular,
    marginRight: theme.spacing.sm,
  },
  trackingNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
    fontFamily: theme.fonts.bold,
  },
  estimatedDelivery: {
    fontSize: 14,
    color: theme.colors.subtitle,
    fontFamily: theme.fonts.regular,
  },
  timelineContainer: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
    marginBottom: theme.spacing.md,
  },
  timeline: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: theme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  timelineStep: {
    flexDirection: 'row',
    marginBottom: theme.spacing.lg,
  },
  timelineConnector: {
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  connectorLine: {
    width: 2,
    height: 40,
    backgroundColor: '#E0E0E0',
  },
  stepContent: {
    flex: 1,
    paddingTop: theme.spacing.xs,
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.xs,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: theme.fonts.bold,
    flex: 1,
  },
  stepTimestamp: {
    fontSize: 12,
    color: theme.colors.subtitle,
    fontFamily: theme.fonts.regular,
  },
  stepDescription: {
    fontSize: 14,
    fontFamily: theme.fonts.regular,
    lineHeight: 20,
  },
  itemsSection: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
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
  addressSection: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
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
  footer: {
    backgroundColor: 'white',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  supportButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  supportButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  supportButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: theme.fonts.bold,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: theme.colors.subtitle,
    fontFamily: theme.fonts.regular,
  },
});

export default OrderTrackingScreen; 