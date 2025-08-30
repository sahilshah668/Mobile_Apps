import theme from '@/constants/theme';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useAuth } from '@/hooks/useAuth';
import { selectOrders } from '@/store/orderSlice';
import { RootState } from '@/store/store';
import { logout } from '@/store/userSlice';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';

import { IconSymbol } from '@/components/ui/IconSymbol';

const ProfileScreen: React.FC = () => {
  const { isAuthenticated, navigateToAuth } = useAuth();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { name, phone, email } = useSelector((state: RootState) => state.user);
  const orders = useSelector(selectOrders);

  const handleLogout = () => {
    dispatch(logout());
  };



  const handleViewOrderDetails = (orderId: string) => {
    router.push(`/order-tracking/${orderId}`);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {!isAuthenticated ? (
          // Guest Profile View
          <View style={styles.guestProfile}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarEmoji}>👤</Text>
            </View>
            <Text style={styles.guestTitle}>Welcome Guest!</Text>
            <Text style={styles.guestSubtitle}>
              Sign in to access your profile, order history, and personalized features.
            </Text>
            
            <TouchableOpacity style={styles.signInButton} onPress={navigateToAuth}>
              <LinearGradient
                colors={[theme.colors.primary, '#0056CC']}
                style={styles.signInButtonGradient}
              >
                <Text style={styles.signInButtonText}>Sign In</Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.guestFeatures}>
              <Text style={styles.featuresTitle}>Guest Features</Text>
              <View style={styles.featureItem}>
                <IconSymbol name="cart" size={20} color={theme.colors.primary} />
                <Text style={styles.featureText}>Add items to cart (saved locally)</Text>
              </View>
              <View style={styles.featureItem}>
                <IconSymbol name="heart" size={20} color={theme.colors.primary} />
                <Text style={styles.featureText}>Save favorites (saved locally)</Text>
              </View>
              <View style={styles.featureItem}>
                <IconSymbol name="search" size={20} color={theme.colors.primary} />
                <Text style={styles.featureText}>Browse and search products</Text>
              </View>
              <View style={styles.featureItem}>
                <IconSymbol name="star" size={20} color={theme.colors.primary} />
                <Text style={styles.featureText}>View product reviews</Text>
              </View>
            </View>

            <View style={styles.benefitsSection}>
              <Text style={styles.benefitsTitle}>Benefits of Signing In</Text>
              <View style={styles.benefitItem}>
                <IconSymbol name="sync" size={16} color="#4CAF50" />
                <Text style={styles.benefitText}>Sync cart & favorites across devices</Text>
              </View>
              <View style={styles.benefitItem}>
                <IconSymbol name="time" size={16} color="#4CAF50" />
                <Text style={styles.benefitText}>Order history & tracking</Text>
              </View>
              <View style={styles.benefitItem}>
                <IconSymbol name="notifications" size={16} color="#4CAF50" />
                <Text style={styles.benefitText}>Personalized notifications</Text>
              </View>
              <View style={styles.benefitItem}>
                <IconSymbol name="discount" size={16} color="#4CAF50" />
                <Text style={styles.benefitText}>Exclusive offers & discounts</Text>
              </View>
            </View>
          </View>
        ) : (
          // Authenticated Profile View
          <View style={styles.profileInfo}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarEmoji}>👤</Text>
            </View>
            <Text style={styles.userName}>{name}</Text>
            <Text style={styles.userPhone}>{phone}</Text>
            
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Account Information</Text>
              <View style={styles.infoRow}>
                <IconSymbol name="mail" size={20} color={theme.colors.subtitle} />
                <Text style={styles.infoLabel}>Email:</Text>
                <Text style={styles.infoValue}>{email || 'user@fashionsaga.com'}</Text>
              </View>
              <View style={styles.infoRow}>
                <IconSymbol name="phone" size={20} color={theme.colors.subtitle} />
                <Text style={styles.infoLabel}>Phone:</Text>
                <Text style={styles.infoValue}>{phone}</Text>
              </View>
            </View>

            <View style={styles.actionsSection}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => router.push('/profile-edit')}
              >
                <IconSymbol name="person" size={20} color={theme.colors.primary} />
                <Text style={styles.actionButtonText}>Edit Profile</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => router.push('/change-password')}
              >
                <IconSymbol name="lock" size={20} color={theme.colors.primary} />
                <Text style={styles.actionButtonText}>Change Password</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={() => router.push('/order-history')}
              >
                <IconSymbol name="cart" size={20} color={theme.colors.primary} />
                <Text style={styles.actionButtonText}>Order History</Text>
              </TouchableOpacity>
            </View>

            {/* Recent Orders */}
            {orders.length > 0 && (
              <View style={styles.ordersSection}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Recent Orders</Text>
                  <TouchableOpacity onPress={handleViewOrders}>
                    <Text style={styles.viewAllText}>View All</Text>
                  </TouchableOpacity>
                </View>
                
                {orders.slice(0, 3).map((order) => (
                  <TouchableOpacity
                    key={order.id}
                    style={styles.orderCard}
                    onPress={() => handleViewOrderDetails(order.id)}
                  >
                    <View style={styles.orderHeader}>
                      <Text style={styles.orderId}>Order #{order.id}</Text>
                      <View style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(order.status) }
                      ]}>
                        <Text style={styles.statusText}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.orderItems}>
                      {order.items.slice(0, 2).map((item) => (
                        <View key={item.id} style={styles.orderItem}>
                          <Image source={{ uri: item.product.image }} style={styles.orderItemImage} />
                          <View style={styles.orderItemDetails}>
                            <Text style={styles.orderItemName}>{item.product.name}</Text>
                            <Text style={styles.orderItemSpecs}>
                              Qty: {item.quantity}
                              {item.selectedSize && ` • Size: ${item.selectedSize}`}
                            </Text>
                          </View>
                        </View>
                      ))}
                      {order.items.length > 2 && (
                        <Text style={styles.moreItemsText}>+{order.items.length - 2} more items</Text>
                      )}
                    </View>
                    
                    <View style={styles.orderFooter}>
                      <Text style={styles.orderDate}>{formatDate(order.orderDate)}</Text>
                      <Text style={styles.orderTotal}>${order.total.toFixed(2)}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <LinearGradient
                colors={['#FF6B6B', '#FF5252']}
                style={styles.logoutButtonGradient}
              >
                <IconSymbol name="close" size={20} color="white" />
                <Text style={styles.logoutButtonText}>Logout</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: 60,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSizes.title,
    color: theme.colors.text,
    fontWeight: 'bold',
    marginBottom: theme.spacing.xl,
    fontFamily: theme.fonts.bold,
    textAlign: 'center',
  },
  guestProfile: {
    alignItems: 'center',
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(21, 107, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  avatarEmoji: {
    fontSize: 48,
  },
  guestTitle: {
    fontSize: 24,
    color: theme.colors.text,
    fontWeight: 'bold',
    marginBottom: theme.spacing.sm,
    fontFamily: theme.fonts.bold,
  },
  guestSubtitle: {
    fontSize: 16,
    color: theme.colors.subtitle,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    fontFamily: theme.fonts.regular,
    lineHeight: 24,
  },
  signInButton: {
    width: '100%',
    marginBottom: theme.spacing.xl,
  },
  signInButtonGradient: {
    paddingVertical: theme.spacing.md,
    borderRadius: 25,
    alignItems: 'center',
  },
  signInButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: theme.fonts.bold,
  },
  guestFeatures: {
    width: '100%',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  featuresTitle: {
    fontSize: 18,
    color: theme.colors.text,
    fontWeight: '600',
    marginBottom: theme.spacing.md,
    fontFamily: theme.fonts.bold,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  featureText: {
    fontSize: 14,
    color: theme.colors.subtitle,
    marginLeft: theme.spacing.sm,
    fontFamily: theme.fonts.regular,
  },
  benefitsSection: {
    width: '100%',
    backgroundColor: 'rgba(76, 175, 80, 0.05)',
    borderRadius: 16,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  benefitsTitle: {
    fontSize: 18,
    color: theme.colors.text,
    fontWeight: '600',
    marginBottom: theme.spacing.md,
    fontFamily: theme.fonts.bold,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  benefitText: {
    fontSize: 14,
    color: theme.colors.subtitle,
    marginLeft: theme.spacing.sm,
    fontFamily: theme.fonts.regular,
  },
  profileInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    color: theme.colors.text,
    fontWeight: 'bold',
    marginBottom: theme.spacing.xs,
    fontFamily: theme.fonts.bold,
  },
  userPhone: {
    fontSize: 16,
    color: theme.colors.subtitle,
    marginBottom: theme.spacing.xl,
    fontFamily: theme.fonts.regular,
  },
  infoSection: {
    width: '100%',
    backgroundColor: 'rgba(21, 107, 255, 0.05)',
    borderRadius: 16,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    color: theme.colors.text,
    fontWeight: '600',
    marginBottom: theme.spacing.md,
    fontFamily: theme.fonts.bold,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  infoLabel: {
    fontSize: 14,
    color: theme.colors.subtitle,
    marginLeft: theme.spacing.sm,
    marginRight: theme.spacing.sm,
    fontFamily: theme.fonts.regular,
  },
  infoValue: {
    fontSize: 14,
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
  },
  actionsSection: {
    width: '100%',
    marginBottom: theme.spacing.xl,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: 12,
    marginBottom: theme.spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonText: {
    fontSize: 16,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
    fontFamily: theme.fonts.regular,
  },
  ordersSection: {
    width: '100%',
    marginBottom: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  viewAllText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontFamily: theme.fonts.bold,
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
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
    marginBottom: theme.spacing.sm,
  },
  orderId: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '600',
    fontFamily: theme.fonts.bold,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
    fontFamily: theme.fonts.bold,
  },
  orderItems: {
    marginBottom: theme.spacing.sm,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  orderItemImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: theme.spacing.sm,
  },
  orderItemDetails: {
    flex: 1,
  },
  orderItemName: {
    fontSize: 14,
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
  },
  orderItemSpecs: {
    fontSize: 12,
    color: theme.colors.subtitle,
    fontFamily: theme.fonts.regular,
  },
  moreItemsText: {
    fontSize: 12,
    color: theme.colors.subtitle,
    fontStyle: 'italic',
    fontFamily: theme.fonts.regular,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  orderDate: {
    fontSize: 12,
    color: theme.colors.subtitle,
    fontFamily: theme.fonts.regular,
  },
  orderTotal: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '600',
    fontFamily: theme.fonts.bold,
  },
  logoutButton: {
    width: '100%',
  },
  logoutButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    borderRadius: 25,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: theme.spacing.sm,
    fontFamily: theme.fonts.bold,
  },
});

export default ProfileScreen; 