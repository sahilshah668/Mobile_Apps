import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, TextInput, Platform } from 'react-native';
import { PushNotificationManager } from '../services/notifications/pushNotificationManager';
import { FeatureManager } from '../services/featureManager';

export const PushNotificationDemo: React.FC = () => {
  const [pushStatus, setPushStatus] = useState<any>(null);
  const [customNotification, setCustomNotification] = useState({
    title: '',
    body: '',
    data: ''
  });
  const [selectedTopic, setSelectedTopic] = useState('');
  const [subscribedTopics, setSubscribedTopics] = useState<string[]>([]);

  useEffect(() => {
    updatePushStatus();
  }, []);

  const updatePushStatus = () => {
    const status = PushNotificationManager.getStatus();
    setPushStatus(status);
  };

  const handleSendTestNotification = async () => {
    try {
      await PushNotificationManager.sendTestNotification();
      Alert.alert('Success', 'Test notification sent successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to send test notification');
    }
  };

  const handleSendCustomNotification = async () => {
    if (!customNotification.title.trim() || !customNotification.body.trim()) {
      Alert.alert('Error', 'Please enter both title and body');
      return;
    }

    let data = {};
    if (customNotification.data.trim()) {
      try {
        data = JSON.parse(customNotification.data);
      } catch (error) {
        Alert.alert('Error', 'Invalid JSON data');
        return;
      }
    }

    try {
      await PushNotificationManager.sendNotification({
        title: customNotification.title,
        body: customNotification.body,
        data: data,
        sound: 'default',
        priority: 'high'
      });

      Alert.alert('Success', 'Custom notification sent successfully');
      setCustomNotification({ title: '', body: '', data: '' });
    } catch (error) {
      Alert.alert('Error', 'Failed to send custom notification');
    }
  };

  const handleSendOrderNotification = async () => {
    try {
      await PushNotificationManager.sendOrderNotification('ORD-12345', 'Shipped');
      Alert.alert('Success', 'Order notification sent successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to send order notification');
    }
  };

  const handleSendPromotionNotification = async () => {
    try {
      await PushNotificationManager.sendPromotionNotification(
        'Special Offer!',
        'Get 20% off on all items today',
        'PROMO-001'
      );
      Alert.alert('Success', 'Promotion notification sent successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to send promotion notification');
    }
  };

  const handleSubscribeToTopic = async () => {
    if (!selectedTopic.trim()) {
      Alert.alert('Error', 'Please select a topic');
      return;
    }

    try {
      const success = await PushNotificationManager.subscribeToTopic(selectedTopic);
      if (success) {
        setSubscribedTopics([...subscribedTopics, selectedTopic]);
        Alert.alert('Success', `Subscribed to topic: ${selectedTopic}`);
        setSelectedTopic('');
      } else {
        Alert.alert('Error', 'Failed to subscribe to topic');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to subscribe to topic');
    }
  };

  const handleUnsubscribeFromTopic = async (topic: string) => {
    try {
      const success = await PushNotificationManager.unsubscribeFromTopic(topic);
      if (success) {
        setSubscribedTopics(subscribedTopics.filter(t => t !== topic));
        Alert.alert('Success', `Unsubscribed from topic: ${topic}`);
      } else {
        Alert.alert('Error', 'Failed to unsubscribe from topic');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to unsubscribe from topic');
    }
  };

  const renderPushStatus = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Push Notification Status</Text>
      <View style={styles.statusContainer}>
        <Text style={styles.statusItem}>
          Manager: {pushStatus?.initialized ? '✅ Initialized' : '❌ Not Initialized'}
        </Text>
        <Text style={styles.statusItem}>
          Push Enabled: {pushStatus?.pushNotificationsEnabled ? '✅ Yes' : '❌ No'}
        </Text>
        <Text style={styles.statusItem}>
          FCM Enabled: {pushStatus?.fcmEnabled ? '✅ Yes' : '❌ No'}
        </Text>
        <Text style={styles.statusItem}>
          FCM Initialized: {pushStatus?.fcmInitialized ? '✅ Yes' : '❌ No'}
        </Text>
        <Text style={styles.statusItem}>
          APNS Enabled: {pushStatus?.apnsEnabled ? '✅ Yes' : '❌ No'}
        </Text>
        <Text style={styles.statusItem}>
          APNS Initialized: {pushStatus?.apnsInitialized ? '✅ Yes' : '❌ No'}
        </Text>
        <Text style={styles.statusItem}>
          Push Token: {pushStatus?.hasPushToken ? '✅ Available' : '❌ Not Available'}
        </Text>
        <Text style={styles.statusItem}>
          Platform: {Platform.OS.toUpperCase()}
        </Text>
      </View>
    </View>
  );

  const renderTestNotifications = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Test Notifications</Text>
      <View style={styles.buttonGrid}>
        <TouchableOpacity style={styles.gridButton} onPress={handleSendTestNotification}>
          <Text style={styles.gridButtonText}>Send Test</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.gridButton} onPress={handleSendOrderNotification}>
          <Text style={styles.gridButtonText}>Order Update</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.gridButton} onPress={handleSendPromotionNotification}>
          <Text style={styles.gridButtonText}>Promotion</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCustomNotification = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Custom Notification</Text>
      <TextInput
        style={styles.input}
        placeholder="Notification Title"
        value={customNotification.title}
        onChangeText={(text) => setCustomNotification({ ...customNotification, title: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Notification Body"
        value={customNotification.body}
        onChangeText={(text) => setCustomNotification({ ...customNotification, body: text })}
      />
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Data (JSON format, optional)"
        value={customNotification.data}
        onChangeText={(text) => setCustomNotification({ ...customNotification, data: text })}
        multiline
        numberOfLines={3}
      />
      <TouchableOpacity style={styles.button} onPress={handleSendCustomNotification}>
        <Text style={styles.buttonText}>Send Custom Notification</Text>
      </TouchableOpacity>
    </View>
  );

  const renderTopicManagement = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Topic Management</Text>
      <View style={styles.topicContainer}>
        <Text style={styles.topicTitle}>Available Topics:</Text>
        {PushNotificationManager.getAvailableTopics().map((topic, index) => (
          <TouchableOpacity
            key={index}
            style={styles.topicItem}
            onPress={() => setSelectedTopic(topic.name)}
          >
            <Text style={styles.topicName}>{topic.name}</Text>
            <Text style={styles.topicDescription}>{topic.description}</Text>
            <Text style={styles.topicPlatform}>Platform: {topic.platform}</Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {selectedTopic && (
        <View style={styles.selectedTopicContainer}>
          <Text style={styles.selectedTopicText}>Selected: {selectedTopic}</Text>
          <TouchableOpacity style={styles.button} onPress={handleSubscribeToTopic}>
            <Text style={styles.buttonText}>Subscribe</Text>
          </TouchableOpacity>
        </View>
      )}

      {subscribedTopics.length > 0 && (
        <View style={styles.subscribedTopicsContainer}>
          <Text style={styles.subscribedTopicsTitle}>Subscribed Topics:</Text>
          {subscribedTopics.map((topic, index) => (
            <View key={index} style={styles.subscribedTopicItem}>
              <Text style={styles.subscribedTopicName}>{topic}</Text>
              <TouchableOpacity
                style={styles.unsubscribeButton}
                onPress={() => handleUnsubscribeFromTopic(topic)}
              >
                <Text style={styles.unsubscribeButtonText}>Unsubscribe</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const renderNotificationCategories = () => {
    const categories = PushNotificationManager.getNotificationCategories();
    
    if (categories.length === 0) {
      return null;
    }

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notification Categories (iOS)</Text>
        <View style={styles.categoriesContainer}>
          {categories.map((category, index) => (
            <View key={index} style={styles.categoryItem}>
              <Text style={styles.categoryName}>{category.identifier}</Text>
              {category.actions.map((action, actionIndex) => (
                <Text key={actionIndex} style={styles.categoryAction}>
                  • {action.title} ({action.identifier})
                </Text>
              ))}
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderConfiguration = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Push Notification Configuration</Text>
      <View style={styles.configContainer}>
        <Text style={styles.configText}>
          {JSON.stringify(PushNotificationManager.getConfig(), null, 2)}
        </Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Push Notifications Demo</Text>
      
      {pushStatus && renderPushStatus()}
      {renderTestNotifications()}
      {renderCustomNotification()}
      {renderTopicManagement()}
      {renderNotificationCategories()}
      {renderConfiguration()}
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
  statusContainer: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
  },
  statusItem: {
    fontSize: 14,
    marginBottom: 8,
    color: '#333',
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
  gridButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: 'white',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  topicContainer: {
    marginBottom: 20,
  },
  topicTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  topicItem: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  topicName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  topicDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  topicPlatform: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  selectedTopicContainer: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  selectedTopicText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976d2',
    marginBottom: 10,
  },
  subscribedTopicsContainer: {
    marginTop: 20,
  },
  subscribedTopicsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  subscribedTopicItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  subscribedTopicName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  unsubscribeButton: {
    backgroundColor: '#ff4444',
    padding: 8,
    borderRadius: 6,
  },
  unsubscribeButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  categoriesContainer: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
  },
  categoryItem: {
    marginBottom: 15,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  categoryAction: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
    marginBottom: 4,
  },
  configContainer: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
  },
  configText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#666',
  },
});
