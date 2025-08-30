import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, TextInput, RefreshControl } from 'react-native';
import { MobileNotificationService, NotificationData, NotificationStats } from '../services/notifications/mobileNotificationService';
import { PushNotificationManager } from '../services/notifications/pushNotificationManager';
import { FeatureManager } from '../services/featureManager';

export const BackendNotificationDemo: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [storeId, setStoreId] = useState('demo-store-123');
  const [userId, setUserId] = useState('demo-user-456');

  useEffect(() => {
    loadNotifications();
    loadStats();
  }, []);

  const loadNotifications = async () => {
    if (!MobileNotificationService.isServiceInitialized()) {
      Alert.alert('Error', 'Mobile notification service not initialized');
      return;
    }

    setLoading(true);
    try {
      const response = await MobileNotificationService.getNotifications({
        page: 1,
        limit: 20,
        storeId,
      });
      setNotifications(response.notifications);
    } catch (error) {
      console.error('Failed to load notifications:', error);
      Alert.alert('Error', 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    if (!MobileNotificationService.isServiceInitialized()) {
      return;
    }

    try {
      const notificationStats = await MobileNotificationService.getNotificationStats(storeId);
      setStats(notificationStats);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadNotifications(), loadStats()]);
    setRefreshing(false);
  };

  const handleRegisterToken = async () => {
    if (!FeatureManager.isPushNotificationsEnabled()) {
      Alert.alert('Error', 'Push notifications not enabled');
      return;
    }

    try {
      await MobileNotificationService.autoRegisterToken(storeId, userId);
      Alert.alert('Success', 'Push token registered with backend');
    } catch (error) {
      Alert.alert('Error', 'Failed to register push token');
    }
  };

  const handleSubscribeToTopics = async () => {
    if (!FeatureManager.isPushNotificationsEnabled()) {
      Alert.alert('Error', 'Push notifications not enabled');
      return;
    }

    try {
      await MobileNotificationService.autoSubscribeToTopics(storeId);
      Alert.alert('Success', 'Subscribed to default topics');
    } catch (error) {
      Alert.alert('Error', 'Failed to subscribe to topics');
    }
  };

  const handleSendTestNotification = async () => {
    const pushToken = PushNotificationManager.getPushToken();
    if (!pushToken) {
      Alert.alert('Error', 'No push token available');
      return;
    }

    try {
      const result = await MobileNotificationService.sendTestNotification(
        pushToken,
        'Test from Mobile App',
        'This notification was sent from the mobile app to the backend',
        { source: 'mobile-app', timestamp: Date.now() }
      );
      Alert.alert('Success', `Test notification sent: ${result.messageId}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to send test notification');
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await MobileNotificationService.markAsRead(notificationId);
      Alert.alert('Success', 'Notification marked as read');
      loadNotifications();
      loadStats();
    } catch (error) {
      Alert.alert('Error', 'Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await MobileNotificationService.markAllAsRead(storeId);
      Alert.alert('Success', 'All notifications marked as read');
      loadNotifications();
      loadStats();
    } catch (error) {
      Alert.alert('Error', 'Failed to mark all notifications as read');
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await MobileNotificationService.deleteNotification(notificationId);
      Alert.alert('Success', 'Notification deleted');
      loadNotifications();
      loadStats();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete notification');
    }
  };

  const handleBulkMarkAsRead = async () => {
    if (selectedNotifications.length === 0) {
      Alert.alert('Error', 'No notifications selected');
      return;
    }

    try {
      await MobileNotificationService.bulkMarkAsRead(selectedNotifications);
      Alert.alert('Success', `${selectedNotifications.length} notifications marked as read`);
      setSelectedNotifications([]);
      loadNotifications();
      loadStats();
    } catch (error) {
      Alert.alert('Error', 'Failed to mark notifications as read');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedNotifications.length === 0) {
      Alert.alert('Error', 'No notifications selected');
      return;
    }

    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete ${selectedNotifications.length} notifications?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await MobileNotificationService.bulkDeleteNotifications(selectedNotifications);
              Alert.alert('Success', `${selectedNotifications.length} notifications deleted`);
              setSelectedNotifications([]);
              loadNotifications();
              loadStats();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete notifications');
            }
          },
        },
      ]
    );
  };

  const toggleNotificationSelection = (notificationId: string) => {
    setSelectedNotifications(prev =>
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const renderStats = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Notification Statistics</Text>
      {stats ? (
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, styles.unreadText]}>{stats.unread}</Text>
            <Text style={styles.statLabel}>Unread</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.read}</Text>
            <Text style={styles.statLabel}>Read</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.last24h}</Text>
            <Text style={styles.statLabel}>Last 24h</Text>
          </View>
        </View>
      ) : (
        <Text style={styles.noDataText}>No statistics available</Text>
      )}
    </View>
  );

  const renderActions = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Backend Actions</Text>
      <View style={styles.buttonGrid}>
        <TouchableOpacity style={styles.gridButton} onPress={handleRegisterToken}>
          <Text style={styles.gridButtonText}>Register Token</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.gridButton} onPress={handleSubscribeToTopics}>
          <Text style={styles.gridButtonText}>Subscribe Topics</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.gridButton} onPress={handleSendTestNotification}>
          <Text style={styles.gridButtonText}>Send Test</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.gridButton} onPress={handleMarkAllAsRead}>
          <Text style={styles.gridButtonText}>Mark All Read</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderBulkActions = () => {
    if (selectedNotifications.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Bulk Actions ({selectedNotifications.length} selected)
        </Text>
        <View style={styles.buttonGrid}>
          <TouchableOpacity style={styles.gridButton} onPress={handleBulkMarkAsRead}>
            <Text style={styles.gridButtonText}>Mark Read</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.gridButton, styles.deleteButton]} onPress={handleBulkDelete}>
            <Text style={styles.gridButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderNotifications = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Notifications from Backend</Text>
      {loading ? (
        <Text style={styles.loadingText}>Loading notifications...</Text>
      ) : notifications.length > 0 ? (
        <View style={styles.notificationsContainer}>
          {notifications.map((notification) => (
            <View key={notification._id} style={styles.notificationItem}>
              <TouchableOpacity
                style={styles.notificationCheckbox}
                onPress={() => toggleNotificationSelection(notification._id)}
              >
                <View style={[
                  styles.checkbox,
                  selectedNotifications.includes(notification._id) && styles.checkboxSelected
                ]}>
                  {selectedNotifications.includes(notification._id) && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </View>
              </TouchableOpacity>
              
              <View style={styles.notificationContent}>
                <View style={styles.notificationHeader}>
                  <Text style={[
                    styles.notificationType,
                    styles[`type${notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}`]
                  ]}>
                    {notification.type.toUpperCase()}
                  </Text>
                  <Text style={styles.notificationDate}>
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                
                <Text style={[
                  styles.notificationMessage,
                  !notification.isRead && styles.unreadMessage
                ]}>
                  {notification.message}
                </Text>
                
                {notification.data && Object.keys(notification.data).length > 0 && (
                  <Text style={styles.notificationData}>
                    Data: {JSON.stringify(notification.data)}
                  </Text>
                )}
                
                <View style={styles.notificationActions}>
                  {!notification.isRead && (
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleMarkAsRead(notification._id)}
                    >
                      <Text style={styles.actionButtonText}>Mark Read</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteActionButton]}
                    onPress={() => handleDeleteNotification(notification._id)}
                  >
                    <Text style={styles.actionButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.noDataText}>No notifications available</Text>
      )}
    </View>
  );

  const renderConfiguration = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Configuration</Text>
      <View style={styles.configContainer}>
        <Text style={styles.configLabel}>Store ID:</Text>
        <TextInput
          style={styles.configInput}
          value={storeId}
          onChangeText={setStoreId}
          placeholder="Enter store ID"
        />
        
        <Text style={styles.configLabel}>User ID:</Text>
        <TextInput
          style={styles.configInput}
          value={userId}
          onChangeText={setUserId}
          placeholder="Enter user ID"
        />
        
        <Text style={styles.configLabel}>Service Status:</Text>
        <Text style={styles.configValue}>
          {MobileNotificationService.isServiceInitialized() ? '✅ Initialized' : '❌ Not Initialized'}
        </Text>
        
        <Text style={styles.configLabel}>Push Token:</Text>
        <Text style={styles.configValue}>
          {PushNotificationManager.getPushToken() ? '✅ Available' : '❌ Not Available'}
        </Text>
      </View>
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Backend Notification Integration</Text>
      
      {renderConfiguration()}
      {renderStats()}
      {renderActions()}
      {renderBulkActions()}
      {renderNotifications()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  unreadText: {
    color: '#FF3B30',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    width: '48%',
    marginBottom: 10,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  gridButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  notificationsContainer: {
    maxHeight: 400,
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  notificationCheckbox: {
    marginRight: 10,
    justifyContent: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#007AFF',
  },
  checkmark: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  notificationType: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeInfo: {
    backgroundColor: '#E3F2FD',
    color: '#1976D2',
  },
  typeSuccess: {
    backgroundColor: '#E8F5E8',
    color: '#2E7D32',
  },
  typeWarning: {
    backgroundColor: '#FFF3E0',
    color: '#F57C00',
  },
  typeError: {
    backgroundColor: '#FFEBEE',
    color: '#D32F2F',
  },
  notificationDate: {
    fontSize: 12,
    color: '#666',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  unreadMessage: {
    fontWeight: '600',
  },
  notificationData: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
    backgroundColor: '#f1f1f1',
    padding: 5,
    borderRadius: 4,
    marginBottom: 8,
  },
  notificationActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    backgroundColor: '#34C759',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteActionButton: {
    backgroundColor: '#FF3B30',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  configContainer: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
  },
  configLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  configInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 10,
    marginBottom: 15,
    fontSize: 14,
    backgroundColor: 'white',
  },
  configValue: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
  noDataText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
});
