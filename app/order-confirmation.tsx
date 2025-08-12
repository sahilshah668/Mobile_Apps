import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import {
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
import { selectCurrentOrder } from '@/store/orderSlice';

const OrderConfirmationScreen: React.FC = () => {
  const router = useRouter();
  const currentOrder = useSelector(selectCurrentOrder);

  if (!currentOrder) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No order found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.push('/(tabs)/home')}>
          <Text style={styles.backButtonText}>Go to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
        return 'checkmark-circle';
      case 'processing':
        return 'time';
      case 'shipped':
        return 'car';
      case 'delivered':
        return 'checkmark-done-circle';
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
    router.push(`/order-tracking/${currentOrder.id}`);
  };

  const handleContinueShopping = () => {
    router.push('/(tabs)/home');
  };

  const handleViewOrders = () => {
    router.push('/(tabs)/profile');
  };

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
              <IconSymbol name="checkmark-circle" size={60} color="white" />
            </View>
            <Text style={styles.successTitle}>Order Confirmed!</Text>
            <Text style={styles.successSubtitle}>
              Thank you for your purchase. We'll send you updates on your order.
            </Text>
          </LinearGradient>
        </View>

        {/* Order Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Details</Text>
          <View style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <Text style={styles.orderId}>Order #{currentOrder.id}</Text>
              <View style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(currentOrder.status) }
              ]}>
                <IconSymbol 
                  name={getStatusIcon(currentOrder.status)} 
                  size={16} 
                  color="white" 
                />
                <Text style={styles.statusText}>
                  {currentOrder.status.charAt(0).toUpperCase() + currentOrder.status.slice(1)}
                </Text>
              </View>
            </View>
            
            <View style={styles.orderInfo}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Order Date:</Text>
                <Text style={styles.infoValue}>{formatDate(currentOrder.orderDate)}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Payment Method:</Text>
                <Text style={styles.infoValue}>{currentOrder.paymentMethod}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Total Amount:</Text>
                <Text style={styles.infoValue}>${currentOrder.total.toFixed(2)}</Text>
              </View>
              {currentOrder.estimatedDelivery && (
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
            {currentOrder.items.map((item, index) => (
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
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shipping Address</Text>
          <View style={styles.addressCard}>
            <IconSymbol name="location" size={20} color={theme.colors.primary} />
            <View style={styles.addressDetails}>
              <Text style={styles.addressText}>{currentOrder.shippingAddress.address}</Text>
              <Text style={styles.addressText}>
                {currentOrder.shippingAddress.city}, {currentOrder.shippingAddress.state} {currentOrder.shippingAddress.zipCode}
              </Text>
              <Text style={styles.addressText}>{currentOrder.shippingAddress.country}</Text>
            </View>
          </View>
        </View>

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
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: theme.fonts.bold,
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
  errorText: {
    fontSize: 18,
    color: theme.colors.subtitle,
    textAlign: 'center',
    marginTop: 100,
    fontFamily: theme.fonts.regular,
  },
  backButton: {
    marginTop: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: theme.spacing.lg,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: theme.fonts.bold,
  },
});

export default OrderConfirmationScreen; 