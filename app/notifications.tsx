import { IconSymbol } from '@/components/ui/IconSymbol';
import theme from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Alert,
    Dimensions,
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSelector } from 'react-redux';

import { useAppDispatch } from '@/hooks/useAppDispatch';
import {
    clearAllNotifications,
    markAllAsRead,
    markAsRead,
    selectNotifications,
    selectNotificationSettings,
    selectUnreadCount,
    updateNotificationSettings,
} from '@/store/notificationSlice';

const { width, height } = Dimensions.get('window');

const NotificationsScreen: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const notifications = useSelector(selectNotifications);
  const unreadCount = useSelector(selectUnreadCount);
  const settings = useSelector(selectNotificationSettings);

  const notificationSettings = [
    {
      id: 'orderUpdates',
      title: 'Order Updates',
      description: 'Get notified about order status changes',
      enabled: settings.orderUpdates,
      onToggle: (value: boolean) => dispatch(updateNotificationSettings({ orderUpdates: value })),
      icon: 'shopping-bag',
    },
    {
      id: 'priceDrops',
      title: 'Price Drop Alerts',
      description: 'Be notified when items in your wishlist drop in price',
      enabled: settings.priceDrops,
      onToggle: (value: boolean) => dispatch(updateNotificationSettings({ priceDrops: value })),
      icon: 'trending-down',
    },
    {
      id: 'newProducts',
      title: 'New Products',
      description: 'Get alerts for new arrivals in your favorite categories',
      enabled: settings.newProducts,
      onToggle: (value: boolean) => dispatch(updateNotificationSettings({ newProducts: value })),
      icon: 'star',
    },
    {
      id: 'promotions',
      title: 'Promotions & Offers',
      description: 'Receive special offers and promotional notifications',
      enabled: settings.promotions,
      onToggle: (value: boolean) => dispatch(updateNotificationSettings({ promotions: value })),
      icon: 'gift',
    },
    {
      id: 'systemNotifications',
      title: 'System Notifications',
      description: 'Important app updates and system messages',
      enabled: settings.systemNotifications,
      onToggle: (value: boolean) => dispatch(updateNotificationSettings({ systemNotifications: value })),
      icon: 'settings',
    },
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order':
        return 'shopping-bag';
      case 'price_drop':
        return 'trending-down';
      case 'new_product':
        return 'star';
      case 'promotion':
        return 'gift';
      case 'system':
        return 'settings';
      default:
        return 'notification';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'order':
        return '#4A90E2';
      case 'price_drop':
        return '#FF6B6B';
      case 'new_product':
        return '#FFD700';
      case 'promotion':
        return '#9B59B6';
      case 'system':
        return '#2ECC71';
      default:
        return theme.colors.primary;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return notificationTime.toLocaleDateString();
  };

  const handleNotificationPress = (notification: any) => {
    dispatch(markAsRead(notification.id));
    
    // Handle navigation based on notification type
    if (notification.type === 'order' && notification.data?.orderId) {
      router.push(`/order-tracking/${notification.data.orderId}`);
    } else if (notification.type === 'price_drop' && notification.data?.productId) {
      router.push(`/product/${notification.data.productId}`);
    }
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to clear all notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear All', style: 'destructive', onPress: () => dispatch(clearAllNotifications()) },
      ]
    );
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Header */}
      <LinearGradient
        colors={['rgba(21, 107, 255, 0.95)', 'rgba(21, 107, 255, 0.8)']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <IconSymbol name="chevron-left" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <IconSymbol name="notification" size={24} color="white" />
            <Text style={styles.headerTitle}>Notifications</Text>
          </View>
          <TouchableOpacity style={styles.clearButton} onPress={handleClearAll}>
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Notification Stats */}
        <View style={styles.statsCard}>
          <LinearGradient
            colors={['rgba(21, 107, 255, 0.1)', 'rgba(21, 107, 255, 0.05)']}
            style={styles.statsGradient}
          >
            <View style={styles.statsContent}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{unreadCount}</Text>
                <Text style={styles.statLabel}>Unread</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{notifications.length}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {notifications.filter(n => {
                    const today = new Date();
                    const notificationDate = new Date(n.timestamp);
                    return today.toDateString() === notificationDate.toDateString();
                  }).length}
                </Text>
                <Text style={styles.statLabel}>Today</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Notification Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Settings</Text>
          {notificationSettings.map((setting) => (
            <View key={setting.id} style={styles.settingCard}>
              <View style={styles.settingIcon}>
                <IconSymbol name={setting.icon as any} size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>{setting.title}</Text>
                <Text style={styles.settingDescription}>{setting.description}</Text>
              </View>
              <Switch
                value={setting.enabled}
                onValueChange={setting.onToggle}
                trackColor={{ false: '#E5E5E5', true: theme.colors.primary }}
                thumbColor={setting.enabled ? 'white' : '#F4F3F4'}
              />
            </View>
          ))}
        </View>

        {/* Recent Notifications */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Notifications</Text>
            {unreadCount > 0 && (
              <TouchableOpacity onPress={handleMarkAllAsRead}>
                <Text style={styles.markAllReadText}>Mark All Read</Text>
              </TouchableOpacity>
            )}
          </View>
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <TouchableOpacity 
                key={notification.id} 
                style={styles.notificationCard}
                onPress={() => handleNotificationPress(notification)}
              >
                <View style={[
                  styles.notificationIcon,
                  { backgroundColor: `${getNotificationColor(notification.type)}20` }
                ]}>
                  <IconSymbol 
                    name={getNotificationIcon(notification.type) as any} 
                    size={20} 
                    color={getNotificationColor(notification.type)} 
                  />
                </View>
                <View style={styles.notificationContent}>
                  <View style={styles.notificationHeader}>
                    <Text style={[
                      styles.notificationTitle,
                      !notification.isRead && styles.unreadTitle
                    ]}>
                      {notification.title}
                    </Text>
                    <Text style={styles.notificationTime}>
                      {formatTimeAgo(notification.timestamp)}
                    </Text>
                  </View>
                  <Text style={[
                    styles.notificationMessage,
                    !notification.isRead && styles.unreadMessage
                  ]}>
                    {notification.message}
                  </Text>
                </View>
                {!notification.isRead && (
                  <View style={styles.unreadDot} />
                )}
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <IconSymbol name="notification-off" size={48} color={theme.colors.subtitle} />
              <Text style={styles.emptyStateText}>No notifications yet</Text>
              <Text style={styles.emptyStateSubtext}>We'll notify you when something important happens</Text>
            </View>
          )}
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFF',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
    fontFamily: theme.fonts.bold,
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  clearButtonText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
    fontFamily: theme.fonts.bold,
  },
  scrollView: {
    flex: 1,
  },
  statsCard: {
    margin: theme.spacing.lg,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  statsGradient: {
    padding: theme.spacing.lg,
  },
  statsContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    color: theme.colors.primary,
    fontWeight: 'bold',
    fontFamily: theme.fonts.bold,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.subtitle,
    fontFamily: theme.fonts.regular,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(21, 107, 255, 0.2)',
  },
  section: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    color: theme.colors.text,
    fontWeight: 'bold',
    fontFamily: theme.fonts.bold,
    marginBottom: 16,
  },
  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: theme.spacing.md,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(21, 107, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '600',
    fontFamily: theme.fonts.bold,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: theme.colors.subtitle,
    fontFamily: theme.fonts.regular,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: theme.spacing.md,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '600',
    fontFamily: theme.fonts.bold,
    flex: 1,
  },
  notificationTime: {
    fontSize: 12,
    color: theme.colors.subtitle,
    fontFamily: theme.fonts.regular,
    marginLeft: 8,
  },
  notificationMessage: {
    fontSize: 14,
    color: theme.colors.subtitle,
    fontFamily: theme.fonts.regular,
    lineHeight: 20,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
    marginLeft: 8,
    marginTop: 4,
  },
  bottomSpacing: {
    height: 100,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  markAllReadText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '600',
    fontFamily: theme.fonts.bold,
  },
  unreadTitle: {
    color: theme.colors.text,
    fontWeight: '700',
  },
  unreadMessage: {
    color: theme.colors.text,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyStateText: {
    fontSize: 18,
    color: theme.colors.text,
    fontWeight: '600',
    fontFamily: theme.fonts.bold,
    marginTop: theme.spacing.md,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: theme.colors.subtitle,
    fontFamily: theme.fonts.regular,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
  },
});

export default NotificationsScreen; 