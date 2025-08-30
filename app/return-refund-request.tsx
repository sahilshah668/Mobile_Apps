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
import { requestReturnReplaceThunk, requestRefundThunk } from '@/store/orderSlice';
import { IconSymbol } from '@/components/ui/IconSymbol';

interface ReturnRefundRequest {
  type: 'return' | 'replace' | 'refund';
  reason: string;
  description: string;
  refundAmount?: number;
  items?: string[];
}

const ReturnRefundRequestScreen: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [requestType, setRequestType] = useState<'return' | 'replace' | 'refund'>('return');
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const reasons = {
    return: [
      'Wrong size',
      'Defective product',
      'Not as described',
      'Changed mind',
      'Quality issues',
      'Other'
    ],
    replace: [
      'Wrong size',
      'Defective product',
      'Damaged during shipping',
      'Color mismatch',
      'Other'
    ],
    refund: [
      'Order cancelled',
      'Payment error',
      'Service not provided',
      'Other'
    ]
  };

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

  const handleItemSelection = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSubmit = async () => {
    if (!reason.trim()) {
      Alert.alert('Error', 'Please select a reason for your request');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please provide a description');
      return;
    }

    if (requestType === 'refund' && (!refundAmount || parseFloat(refundAmount) <= 0)) {
      Alert.alert('Error', 'Please enter a valid refund amount');
      return;
    }

    try {
      setSubmitting(true);

      const requestData: ReturnRefundRequest = {
        type: requestType,
        reason: reason,
        description: description,
        items: selectedItems.length > 0 ? selectedItems : undefined
      };

      if (requestType === 'refund') {
        requestData.refundAmount = parseFloat(refundAmount);
      }

      let result;
      if (requestType === 'refund') {
        result = await dispatch(requestRefundThunk({
          orderId: orderId!,
          data: {
            refundAmount: parseFloat(refundAmount),
            reason: reason
          }
        })).unwrap();
      } else {
        result = await dispatch(requestReturnReplaceThunk({
          orderId: orderId!,
          data: {
            type: requestType,
            reason: reason,
            description: description,
            items: selectedItems
          }
        })).unwrap();
      }

      Alert.alert(
        'Request Submitted',
        'Your request has been submitted successfully. We will review it and get back to you soon.',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (err: any) {
      console.error('Failed to submit request:', err);
      Alert.alert('Error', err.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  const getMaxRefundAmount = () => {
    return order?.totalAmount || 0;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Return/Refund Request</Text>
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
          <Text style={styles.headerTitle}>Return/Refund Request</Text>
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Return/Refund Request</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.orderCard}>
            <Text style={styles.orderNumber}>Order #{order._id || order.id}</Text>
            <Text style={styles.orderDate}>
              {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
            </Text>
            <Text style={styles.orderTotal}>Total: {formatPrice(order.totalAmount || 0)}</Text>
          </View>
        </View>

        {/* Request Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Request Type</Text>
          <View style={styles.typeContainer}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                requestType === 'return' && styles.typeButtonActive
              ]}
              onPress={() => setRequestType('return')}
            >
              <IconSymbol 
                name="arrow-back-circle" 
                size={24} 
                color={requestType === 'return' ? 'white' : theme.colors.primary} 
              />
              <Text style={[
                styles.typeButtonText,
                requestType === 'return' && styles.typeButtonTextActive
              ]}>
                Return
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeButton,
                requestType === 'replace' && styles.typeButtonActive
              ]}
              onPress={() => setRequestType('replace')}
            >
              <IconSymbol 
                name="swap-horizontal" 
                size={24} 
                color={requestType === 'replace' ? 'white' : theme.colors.primary} 
              />
              <Text style={[
                styles.typeButtonText,
                requestType === 'replace' && styles.typeButtonTextActive
              ]}>
                Replace
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeButton,
                requestType === 'refund' && styles.typeButtonActive
              ]}
              onPress={() => setRequestType('refund')}
            >
              <IconSymbol 
                name="card" 
                size={24} 
                color={requestType === 'refund' ? 'white' : theme.colors.primary} 
              />
              <Text style={[
                styles.typeButtonText,
                requestType === 'refund' && styles.typeButtonTextActive
              ]}>
                Refund
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Item Selection (for return/replace) */}
        {(requestType === 'return' || requestType === 'replace') && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Items</Text>
            <View style={styles.itemsContainer}>
              {getOrderItems().map((item: any, index: number) => {
                const product = item.product || {};
                const itemId = item.id || `item-${index}`;
                const isSelected = selectedItems.includes(itemId);
                
                return (
                  <TouchableOpacity
                    key={itemId}
                    style={[
                      styles.itemCard,
                      isSelected && styles.itemCardSelected
                    ]}
                    onPress={() => handleItemSelection(itemId)}
                  >
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>
                        {product.name || 'Product Name Not Available'}
                      </Text>
                      <Text style={styles.itemDetails}>
                        Qty: {item.quantity} • {formatPrice((product.price || 0) * (item.quantity || 1))}
                      </Text>
                    </View>
                    <View style={[
                      styles.checkbox,
                      isSelected && styles.checkboxSelected
                    ]}>
                      {isSelected && (
                        <IconSymbol name="checkmark" size={16} color="white" />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Refund Amount (for refund) */}
        {requestType === 'refund' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Refund Amount</Text>
            <View style={styles.refundContainer}>
              <Text style={styles.refundLabel}>Maximum refund amount: {formatPrice(getMaxRefundAmount())}</Text>
              <TextInput
                style={styles.refundInput}
                placeholder="Enter refund amount"
                value={refundAmount}
                onChangeText={setRefundAmount}
                keyboardType="numeric"
                placeholderTextColor={theme.colors.subtitle}
              />
            </View>
          </View>
        )}

        {/* Reason Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reason</Text>
          <View style={styles.reasonsContainer}>
            {reasons[requestType].map((reasonOption) => (
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

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Details</Text>
          <TextInput
            style={styles.descriptionInput}
            placeholder="Please provide additional details about your request..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            placeholderTextColor={theme.colors.subtitle}
          />
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <LinearGradient
            colors={[theme.colors.primary, '#0056CC']}
            style={styles.submitButtonGradient}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <IconSymbol name="checkmark-circle" size={20} color="white" />
                <Text style={styles.submitButtonText}>Submit Request</Text>
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
    fontFamily: theme.fonts.bold,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  typeButton: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: theme.spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  typeButtonActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: 4,
    fontFamily: theme.fonts.bold,
  },
  typeButtonTextActive: {
    color: 'white',
  },
  itemsContainer: {
    gap: theme.spacing.sm,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: theme.spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  itemCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: '#F0F8FF',
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
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  refundContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: theme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  refundLabel: {
    fontSize: 14,
    color: theme.colors.subtitle,
    marginBottom: theme.spacing.md,
    fontFamily: theme.fonts.regular,
  },
  refundInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text,
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
    borderColor: theme.colors.primary,
    backgroundColor: '#F0F8FF',
  },
  reasonButtonText: {
    fontSize: 16,
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
  },
  reasonButtonTextActive: {
    color: theme.colors.primary,
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
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  submitButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: theme.fonts.bold,
  },
});

export default ReturnRefundRequestScreen;
