import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';

import theme from '@/constants/theme';
import { RootState } from '@/store/store';
import { getOrderHistory } from '@/services/api';
import { IconSymbol } from '@/components/ui/IconSymbol';

interface Order {
  id?: string;
  _id?: string;
  orderNumber?: string;
  status: string;
  total?: number;
  totalAmount?: number;
  orderDate?: string;
  createdAt?: string;
  items?: Array<{
    id: string;
    product: {
      name: string;
      image: string;
      price: number;
    };
    quantity: number;
    selectedSize?: string;
  }>;
  products?: Array<{
    product: {
      name: string;
      images: string[];
      price: number;
    };
    quantity: number;
    price: number;
  }>;
  paymentStatus?: string;
  shippingAddress?: {
    fullName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

const OrderHistoryScreen: React.FC = () => {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);

  const statusFilters = [
    { key: 'all', label: 'All Orders' },
    { key: 'pending', label: 'Pending' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'processing', label: 'Processing' },
    { key: 'shipped', label: 'Shipped' },
    { key: 'delivered', label: 'Delivered' },
    { key: 'cancelled', label: 'Cancelled' },
    { key: 'refunded', label: 'Refunded' },
  ];

  const loadOrders = async (pageNum: number = 1, refresh: boolean = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
        setPage(1);
      } else if (pageNum > 1) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const params: any = {
        page: pageNum,
        limit: 10,
      };

      if (selectedStatus !== 'all') {
        params.status = selectedStatus;
      }

      const response = await getOrderHistory(params);
      console.log('Order history response:', response);
      const newOrders = response?.data?.orders || response?.orders || [];
      console.log('Parsed orders:', newOrders);

      if (refresh || pageNum === 1) {
        setOrders(newOrders);
      } else {
        setOrders(prev => [...prev, ...newOrders]);
      }

      setHasMore(newOrders.length === 10); // If we got less than limit, no more data
      setError(null);
    } catch (err: any) {
      console.error('Failed to load orders:', err);
      setError(err.message || 'Failed to load orders');
      if (refresh) {
        Alert.alert('Error', 'Failed to refresh orders');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadOrders(1, true);
  }, [selectedStatus]);

  // Refresh order history when returning from order details
  useFocusEffect(
    React.useCallback(() => {
      loadOrders(1, true);
    }, [])
  );

  const handleRefresh = () => {
    loadOrders(1, true);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadOrders(nextPage);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return '#4CAF50';
      case 'processing':
        return '#FF9800';
      case 'shipped':
        return '#2196F3';
      case 'delivered':
        return '#4CAF50';
      case 'cancelled':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'checkmark-circle';
      case 'processing':
        return 'time';
      case 'shipped':
        return 'car';
      case 'delivered':
        return 'checkmark-circle';
      case 'cancelled':
        return 'close-circle';
      default:
        return 'ellipse';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  const handleOrderPress = (order: Order) => {
    router.push(`/order-details?orderId=${order.id || order._id}`);
  };

  const renderOrderItem = ({ item: order }: { item: Order }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => handleOrderPress(order)}
    >
      {/* Order Header */}
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderNumber}>Order #{order.orderNumber || order._id || order.id}</Text>
          <Text style={styles.orderDate}>{formatDate(order.orderDate || order.createdAt)}</Text>
        </View>
        <View style={[
          styles.statusBadge,
          { backgroundColor: getStatusColor(order.status) }
        ]}>
          <IconSymbol 
            name={getStatusIcon(order.status)} 
            size={12} 
            color="white" 
          />
          <Text style={styles.statusText}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Text>
        </View>
      </View>

      {/* Order Items */}
      <View style={styles.orderItems}>
        {(order.items || order.products || []).slice(0, 2).map((item, index) => {
          const product = item.product;
          const image = product.images?.[0] || product.image || '';
          const itemId = item.id || `item-${index}`;
          
          return (
            <View key={itemId} style={styles.orderItem}>
              <Image source={{ uri: image }} style={styles.orderItemImage} />
              <View style={styles.orderItemDetails}>
                <Text style={styles.orderItemName} numberOfLines={2}>
                  {product.name}
                </Text>
                <Text style={styles.orderItemSpecs}>
                  Qty: {item.quantity}
                  {item.selectedSize && ` • Size: ${item.selectedSize}`}
                </Text>
                <Text style={styles.orderItemPrice}>
                  {formatPrice(product.price)}
                </Text>
              </View>
            </View>
          );
        })}
        {(order.items || order.products || []).length > 2 && (
          <Text style={styles.moreItemsText}>
            +{(order.items || order.products || []).length - 2} more items
          </Text>
        )}
      </View>

      {/* Order Footer */}
      <View style={styles.orderFooter}>
        <View style={styles.orderTotal}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalAmount}>{formatPrice(order.total || order.totalAmount)}</Text>
        </View>
        <View style={styles.orderActions}>
          <TouchableOpacity 
            style={styles.viewDetailsButton}
            onPress={() => router.push(`/order-details?orderId=${order.id || order._id}`)}
          >
            <Text style={styles.viewDetailsText}>View Details</Text>
            <IconSymbol name="arrow-forward" size={16} color={theme.colors.primary} />
          </TouchableOpacity>
          
          {(order.status === 'delivered' || order.status === 'shipped') && (
            <TouchableOpacity 
              style={styles.returnButton}
              onPress={() => router.push(`/return-refund-request?orderId=${order.id || order._id}`)}
            >
              <IconSymbol name="arrow-back-circle" size={16} color="#FF9800" />
              <Text style={styles.returnButtonText}>Return/Refund</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderStatusFilter = ({ item }: { item: { key: string; label: string } }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        selectedStatus === item.key && styles.filterButtonActive
      ]}
      onPress={() => setSelectedStatus(item.key)}
    >
      <Text style={[
        styles.filterButtonText,
        selectedStatus === item.key && styles.filterButtonTextActive
      ]}>
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  if (loading && orders.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order History</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading orders...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order History</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Status Filters */}
      <View style={styles.filtersContainer}>
        <FlatList
          data={statusFilters}
          renderItem={renderStatusFilter}
          keyExtractor={(item) => item.key}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersList}
        />
      </View>

      {/* Orders List */}
      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.ordersList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyContainer}>
              <IconSymbol name="cart" size={64} color={theme.colors.subtitle} />
              <Text style={styles.emptyTitle}>No Orders Found</Text>
              <Text style={styles.emptySubtitle}>
                {selectedStatus === 'all' 
                  ? "You haven't placed any orders yet."
                  : `No ${selectedStatus} orders found.`
                }
              </Text>
              <TouchableOpacity 
                style={styles.shopNowButton}
                onPress={() => router.push('/(tabs)/home')}
              >
                <LinearGradient
                  colors={[theme.colors.primary, '#0056CC']}
                  style={styles.shopNowGradient}
                >
                  <Text style={styles.shopNowText}>Start Shopping</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )
        }
        ListFooterComponent={
          loadingMore && (
            <View style={styles.loadingMoreContainer}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <Text style={styles.loadingMoreText}>Loading more orders...</Text>
            </View>
          )
        }
      />
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
  filtersContainer: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filtersList: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  filterButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: 'white',
    marginRight: theme.spacing.sm,
  },
  filterButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
  },
  filterButtonTextActive: {
    color: 'white',
    fontFamily: theme.fonts.bold,
  },
  ordersList: {
    padding: theme.spacing.lg,
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  orderInfo: {
    flex: 1,
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
    fontFamily: theme.fonts.regular,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: theme.fonts.bold,
  },
  orderItems: {
    marginBottom: theme.spacing.md,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  orderItemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: theme.spacing.md,
  },
  orderItemDetails: {
    flex: 1,
  },
  orderItemName: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: 2,
    fontFamily: theme.fonts.regular,
  },
  orderItemSpecs: {
    fontSize: 12,
    color: theme.colors.subtitle,
    marginBottom: 2,
    fontFamily: theme.fonts.regular,
  },
  orderItemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
    fontFamily: theme.fonts.bold,
  },
  moreItemsText: {
    fontSize: 12,
    color: theme.colors.subtitle,
    fontStyle: 'italic',
    marginTop: theme.spacing.xs,
    fontFamily: theme.fonts.regular,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  orderTotal: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    color: theme.colors.subtitle,
    marginRight: theme.spacing.xs,
    fontFamily: theme.fonts.regular,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
  },
  orderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewDetailsText: {
    fontSize: 14,
    color: theme.colors.primary,
    marginRight: theme.spacing.xs,
    fontFamily: theme.fonts.bold,
  },
  returnButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  returnButtonText: {
    fontSize: 14,
    color: '#FF9800',
    fontFamily: theme.fonts.bold,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    fontFamily: theme.fonts.bold,
  },
  emptySubtitle: {
    fontSize: 16,
    color: theme.colors.subtitle,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    fontFamily: theme.fonts.regular,
  },
  shopNowButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  shopNowGradient: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
  },
  shopNowText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: theme.fonts.bold,
  },
  loadingMoreContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
  },
  loadingMoreText: {
    marginLeft: theme.spacing.sm,
    fontSize: 14,
    color: theme.colors.subtitle,
    fontFamily: theme.fonts.regular,
  },
});

export default OrderHistoryScreen;
