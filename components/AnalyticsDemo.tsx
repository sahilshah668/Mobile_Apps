import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, TextInput } from 'react-native';
import { AnalyticsManager } from '../services/analytics/analyticsManager';
import { GA4Service } from '../services/analytics/ga4Service';
import { SentryService } from '../services/analytics/sentryService';
import { FeatureManager } from '../services/featureManager';

export const AnalyticsDemo: React.FC = () => {
  const [analyticsStatus, setAnalyticsStatus] = useState<any>(null);
  const [customEventName, setCustomEventName] = useState('');
  const [customEventParams, setCustomEventParams] = useState('');
  const [userData, setUserData] = useState({
    userId: '',
    email: '',
    username: ''
  });

  useEffect(() => {
    updateAnalyticsStatus();
  }, []);

  const updateAnalyticsStatus = () => {
    const status = AnalyticsManager.getStatus();
    setAnalyticsStatus(status);
  };

  const handleTrackCustomEvent = () => {
    if (!customEventName.trim()) {
      Alert.alert('Error', 'Please enter an event name');
      return;
    }

    let parameters = {};
    if (customEventParams.trim()) {
      try {
        parameters = JSON.parse(customEventParams);
      } catch (error) {
        Alert.alert('Error', 'Invalid JSON parameters');
        return;
      }
    }

    AnalyticsManager.trackEvent({
      name: customEventName,
      parameters: parameters
    });

    Alert.alert('Success', `Event "${customEventName}" tracked successfully`);
    setCustomEventName('');
    setCustomEventParams('');
  };

  const handleTrackScreen = () => {
    AnalyticsManager.trackScreen('Analytics Demo Screen', {
      demo_mode: true,
      timestamp: Date.now()
    });
    Alert.alert('Success', 'Screen view tracked successfully');
  };

  const handleTrackError = () => {
    const testError = new Error('This is a test error for analytics demo');
    AnalyticsManager.trackError(testError, {
      demo_mode: true,
      error_type: 'test_error'
    });
    Alert.alert('Success', 'Test error tracked successfully');
  };

  const handleTrackPerformance = () => {
    const startTime = Date.now();
    
    // Simulate some work
    setTimeout(() => {
      const duration = Date.now() - startTime;
      AnalyticsManager.trackPerformance('demo_operation', duration, {
        demo_mode: true,
        operation_type: 'simulated_work'
      });
      Alert.alert('Success', `Performance tracked: ${duration}ms`);
    }, 1000);
  };

  const handleSetUser = () => {
    if (!userData.userId.trim()) {
      Alert.alert('Error', 'Please enter a user ID');
      return;
    }

    const userInfo: Record<string, any> = {};
    if (userData.email.trim()) userInfo.email = userData.email;
    if (userData.username.trim()) userInfo.username = userData.username;

    AnalyticsManager.setUser(userData.userId, userInfo);
    Alert.alert('Success', 'User data set successfully');
  };

  const handleAddBreadcrumb = () => {
    AnalyticsManager.addBreadcrumb('User performed demo action', 'demo', {
      action: 'analytics_demo',
      timestamp: Date.now()
    });
    Alert.alert('Success', 'Breadcrumb added successfully');
  };

  const handleStartTransaction = () => {
    const transactionId = AnalyticsManager.startTransaction('Demo Transaction', 'demo');
    if (transactionId) {
      Alert.alert('Success', `Transaction started: ${transactionId}`);
      
      // Finish transaction after 2 seconds
      setTimeout(() => {
        AnalyticsManager.finishTransaction(transactionId, 'ok');
        Alert.alert('Success', 'Transaction finished successfully');
      }, 2000);
    } else {
      Alert.alert('Error', 'Failed to start transaction');
    }
  };

  const handleFlushAnalytics = async () => {
    const success = await AnalyticsManager.flush(5000);
    Alert.alert(success ? 'Success' : 'Error', 
      success ? 'Analytics data flushed successfully' : 'Failed to flush analytics data');
  };

  const renderAnalyticsStatus = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Analytics Status</Text>
      <View style={styles.statusContainer}>
        <Text style={styles.statusItem}>
          Analytics Manager: {analyticsStatus?.initialized ? '✅ Initialized' : '❌ Not Initialized'}
        </Text>
        <Text style={styles.statusItem}>
          GA4 Enabled: {analyticsStatus?.ga4Enabled ? '✅ Yes' : '❌ No'}
        </Text>
        <Text style={styles.statusItem}>
          GA4 Initialized: {analyticsStatus?.ga4Initialized ? '✅ Yes' : '❌ No'}
        </Text>
        <Text style={styles.statusItem}>
          Sentry Enabled: {analyticsStatus?.sentryEnabled ? '✅ Yes' : '❌ No'}
        </Text>
        <Text style={styles.statusItem}>
          Sentry Initialized: {analyticsStatus?.sentryInitialized ? '✅ Yes' : '❌ No'}
        </Text>
      </View>
    </View>
  );

  const renderCustomEventTracking = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Custom Event Tracking</Text>
      <TextInput
        style={styles.input}
        placeholder="Event Name (e.g., button_click)"
        value={customEventName}
        onChangeText={setCustomEventName}
      />
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Parameters (JSON format, optional)"
        value={customEventParams}
        onChangeText={setCustomEventParams}
        multiline
        numberOfLines={3}
      />
      <TouchableOpacity style={styles.button} onPress={handleTrackCustomEvent}>
        <Text style={styles.buttonText}>Track Custom Event</Text>
      </TouchableOpacity>
    </View>
  );

  const renderUserManagement = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>User Management</Text>
      <TextInput
        style={styles.input}
        placeholder="User ID"
        value={userData.userId}
        onChangeText={(text) => setUserData({ ...userData, userId: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Email (optional)"
        value={userData.email}
        onChangeText={(text) => setUserData({ ...userData, email: text })}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Username (optional)"
        value={userData.username}
        onChangeText={(text) => setUserData({ ...userData, username: text })}
      />
      <TouchableOpacity style={styles.button} onPress={handleSetUser}>
        <Text style={styles.buttonText}>Set User</Text>
      </TouchableOpacity>
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.buttonGrid}>
        <TouchableOpacity style={styles.gridButton} onPress={handleTrackScreen}>
          <Text style={styles.gridButtonText}>Track Screen</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.gridButton} onPress={handleTrackError}>
          <Text style={styles.gridButtonText}>Track Error</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.gridButton} onPress={handleTrackPerformance}>
          <Text style={styles.gridButtonText}>Track Performance</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.gridButton} onPress={handleAddBreadcrumb}>
          <Text style={styles.gridButtonText}>Add Breadcrumb</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.gridButton} onPress={handleStartTransaction}>
          <Text style={styles.gridButtonText}>Start Transaction</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.gridButton} onPress={handleFlushAnalytics}>
          <Text style={styles.gridButtonText}>Flush Analytics</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderConfiguration = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Analytics Configuration</Text>
      <View style={styles.configContainer}>
        <Text style={styles.configText}>
          {JSON.stringify(AnalyticsManager.getConfig(), null, 2)}
        </Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Analytics Demo</Text>
      
      {analyticsStatus && renderAnalyticsStatus()}
      {renderCustomEventTracking()}
      {renderUserManagement()}
      {renderQuickActions()}
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
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridButton: {
    backgroundColor: '#34C759',
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
