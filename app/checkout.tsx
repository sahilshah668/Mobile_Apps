import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';

import { IconSymbol } from '@/components/ui/IconSymbol';
import theme from '@/constants/theme';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useAuth } from '@/hooks/useAuth';
import {
  clearCart,
  selectCartItems,
  selectCartTotal,
} from '@/store/cartSlice';
import { createMobilePaymentOrder } from '@/store/orderSlice';
import { selectDefaultAddress, selectAddresses } from '@/store/addressSlice';

const CheckoutScreen: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { requireAuth } = useAuth();
  
  // Use static theme
  const hasPaymentIntegration = true; // Enable payment integration
  
  const cartItems = useSelector(selectCartItems);
  const cartTotal = useSelector(selectCartTotal);
  const defaultAddress = useSelector(selectDefaultAddress);
  const addresses = useSelector(selectAddresses);
  
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('razorpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(defaultAddress);

  const paymentMethods = [
    {
      id: 'razorpay',
      name: 'Credit/Debit Card',
      icon: 'card',
      description: 'Pay securely with your card',
    },
    {
      id: 'upi',
      name: 'UPI',
      icon: 'phone',
      description: 'Pay using UPI apps',
    },
    {
      id: 'cod',
      name: 'Cash on Delivery',
      icon: 'cash',
      description: 'Pay when you receive',
    },
  ];

  const shippingCost = 5.99;
  const tax = cartTotal * 0.18; // 18% tax
  const finalTotal = cartTotal + shippingCost + tax;

  // Update selected address when default address changes
  useEffect(() => {
    if (defaultAddress && !selectedAddress) {
      setSelectedAddress(defaultAddress);
    }
  }, [defaultAddress, selectedAddress]);

  const handlePaymentMethodSelect = (methodId: string) => {
    setSelectedPaymentMethod(methodId);
  };

  const handlePlaceOrder = async () => {
    if (!requireAuth('place order')) return;

    if (!selectedAddress) {
      Alert.alert('Error', 'Please add a shipping address');
      return;
    }

    if (cartItems.length === 0) {
      Alert.alert('Error', 'Your cart is empty');
      return;
    }

    setIsProcessing(true);

    try {
      // Create mobile payment order
      const result = await dispatch(createMobilePaymentOrder({
        cart: cartItems,
        shippingAddress: {
          fullName: selectedAddress.fullName,
          address: selectedAddress.address,
          addressLine2: selectedAddress.addressLine2,
          city: selectedAddress.city,
          state: selectedAddress.state,
          zipCode: selectedAddress.zipCode,
          country: selectedAddress.country,
          phone: selectedAddress.phone,
        },
        paymentMethod: selectedPaymentMethod,
        shippingCost,
      })).unwrap();

      console.log('Payment order created successfully:', result);

      // Clear cart after successful order creation
      dispatch(clearCart());

      // For COD orders, navigate directly to confirmation
      if (selectedPaymentMethod === 'cod') {
        router.push({
          pathname: '/order-confirmation',
          params: {
            orderId: result.orderId,
            paymentMethod: 'cod',
            amount: (finalTotal * 100).toString(), // Convert to paise for consistency
          }
        });
      } else {
        // For online payments, navigate to payment processing
        router.push({
          pathname: '/order-confirmation',
          params: {
            orderId: result.orderId,
            paymentOrderId: result.razorpayOrderId,
            amount: result.amount,
            key: result.key,
          }
        });
      }

    } catch (error: any) {
      console.error('Checkout error:', error);
      Alert.alert('Error', error.message || 'Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditAddress = () => {
    router.push('/addresses');
  };

  const handleSelectAddress = () => {
    if (addresses.length > 1) {
      // Show address selection modal or navigate to address selection
      Alert.alert('Select Address', 'Address selection will be implemented');
    } else {
      router.push('/addresses');
    }
  };

  const renderOrderSummary = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Order Summary</Text>
      <View style={styles.orderItems}>
        {cartItems.map((item) => (
          <View key={item.id} style={styles.orderItem}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.product?.name || 'Product'}</Text>
              <Text style={styles.itemDetails}>
                Qty: {item.quantity}
                {item.selectedSize && ` • Size: ${item.selectedSize}`}
                {item.selectedColor && ` • Color: ${item.selectedColor}`}
              </Text>
            </View>
            <Text style={styles.itemPrice}>${((item.product?.price || 0) * item.quantity).toFixed(2)}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderPriceBreakdown = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Price Breakdown</Text>
      <View style={styles.priceRow}>
        <Text style={styles.priceLabel}>Subtotal</Text>
        <Text style={styles.priceValue}>${cartTotal.toFixed(2)}</Text>
      </View>
      <View style={styles.priceRow}>
        <Text style={styles.priceLabel}>Shipping</Text>
        <Text style={styles.priceValue}>${shippingCost.toFixed(2)}</Text>
      </View>
      <View style={styles.priceRow}>
        <Text style={styles.priceLabel}>Tax (18%)</Text>
        <Text style={styles.priceValue}>${tax.toFixed(2)}</Text>
      </View>
      <View style={[styles.priceRow, styles.totalRow]}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>${finalTotal.toFixed(2)}</Text>
      </View>
    </View>
  );

  const renderShippingAddress = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Shipping Address</Text>
        <TouchableOpacity onPress={handleEditAddress}>
          <Text style={styles.editButton}>Edit</Text>
        </TouchableOpacity>
      </View>
      {selectedAddress ? (
        <View style={styles.addressCard}>
          <Text style={styles.addressText}>{selectedAddress.fullName}</Text>
          <Text style={styles.addressText}>{selectedAddress.address}</Text>
          {selectedAddress.addressLine2 && (
            <Text style={styles.addressText}>{selectedAddress.addressLine2}</Text>
          )}
          <Text style={styles.addressText}>
            {selectedAddress.city}, {selectedAddress.state} {selectedAddress.zipCode}
          </Text>
          <Text style={styles.addressText}>{selectedAddress.country}</Text>
          <Text style={styles.addressText}>{selectedAddress.phone}</Text>
          {addresses.length > 1 && (
            <TouchableOpacity style={styles.selectAddressButton} onPress={handleSelectAddress}>
              <Text style={styles.selectAddressText}>Select Different Address</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <TouchableOpacity style={styles.addAddressButton} onPress={handleEditAddress}>
          <IconSymbol name="add" size={20} color={theme.colors.primary} />
          <Text style={styles.addAddressText}>Add Shipping Address</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderPaymentMethods = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Payment Method</Text>
      {paymentMethods.map((method) => (
        <TouchableOpacity
          key={method.id}
          style={[
            styles.paymentMethodCard,
            selectedPaymentMethod === method.id && styles.selectedPaymentMethod,
          ]}
          onPress={() => handlePaymentMethodSelect(method.id)}
        >
          <View style={styles.paymentMethodInfo}>
            <IconSymbol name={method.icon} size={24} color={theme.colors.primary} />
            <View style={styles.paymentMethodDetails}>
              <Text style={styles.paymentMethodName}>{method.name}</Text>
              <Text style={styles.paymentMethodDescription}>{method.description}</Text>
            </View>
          </View>
          <View style={[
            styles.radioButton,
            selectedPaymentMethod === method.id && styles.radioButtonSelected,
          ]}>
            {selectedPaymentMethod === method.id && (
              <View style={styles.radioButtonInner} />
            )}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.background, borderBottomColor: '#E5E5E5' }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <IconSymbol name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Checkout</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderOrderSummary()}
        {renderPriceBreakdown()}
        {renderShippingAddress()}
        {hasPaymentIntegration && renderPaymentMethods()}
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.colors.background, borderTopColor: '#E5E5E5' }]}>
        <View style={styles.totalContainer}>
          <Text style={[styles.footerTotalLabel, { color: theme.colors.subtitle }]}>Total Amount</Text>
          <Text style={[styles.footerTotalValue, { color: theme.colors.primary }]}>${finalTotal.toFixed(2)}</Text>
        </View>
        <TouchableOpacity
          style={[styles.placeOrderButton, isProcessing && styles.placeOrderButtonDisabled]}
          onPress={handlePlaceOrder}
          disabled={isProcessing || cartItems.length === 0 || !selectedAddress}
        >
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.primary]}
            style={styles.placeOrderGradient}
          >
            {isProcessing ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.placeOrderText}>Place Order</Text>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    paddingTop: theme.spacing.lg + 20,
    borderBottomWidth: 1,
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
    paddingHorizontal: theme.spacing.lg,
  },
  section: {
    marginVertical: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
  },
  editButton: {
    color: theme.colors.primary,
    fontSize: 16,
    fontFamily: theme.fonts.bold,
  },
  orderItems: {
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  itemInfo: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
    marginBottom: 4,
  },
  itemDetails: {
    fontSize: 14,
    color: theme.colors.subtitle,
    fontFamily: theme.fonts.regular,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  priceLabel: {
    fontSize: 16,
    color: theme.colors.subtitle,
    fontFamily: theme.fonts.regular,
  },
  priceValue: {
    fontSize: 16,
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
    fontFamily: theme.fonts.bold,
  },
  addressCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: theme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  addressText: {
    fontSize: 16,
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
    marginBottom: 4,
  },
  addAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: theme.spacing.lg,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderStyle: 'dashed',
  },
  addAddressText: {
    marginLeft: theme.spacing.sm,
    fontSize: 16,
    color: theme.colors.primary,
    fontFamily: theme.fonts.bold,
  },
  selectAddressButton: {
    marginTop: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectAddressText: {
    color: 'white',
    fontSize: 14,
    fontFamily: theme.fonts.bold,
  },
  paymentMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedPaymentMethod: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  paymentMethodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentMethodDetails: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
  },
  paymentMethodDescription: {
    fontSize: 14,
    color: theme.colors.subtitle,
    fontFamily: theme.fonts.regular,
    marginTop: 2,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: theme.colors.primary,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
  },
  footer: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  footerTotalLabel: {
    fontSize: 16,
    color: theme.colors.subtitle,
    fontFamily: theme.fonts.regular,
  },
  footerTotalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.primary,
    fontFamily: theme.fonts.bold,
  },
  placeOrderButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  placeOrderButtonDisabled: {
    opacity: 0.6,
  },
  placeOrderGradient: {
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  placeOrderText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: theme.fonts.bold,
  },
});

export default CheckoutScreen; 