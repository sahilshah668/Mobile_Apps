import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { AppInitializer } from '../services/appInitializer';
import { FeatureManager } from '../services/featureManager';
import { PermissionsManager } from '../services/permissionsManager';
import { PermissionAwareCamera } from './PermissionAwareCamera';
import { PermissionAwarePhotoPicker } from './PermissionAwarePhotoPicker';
import { PermissionAwareFilePicker } from './PermissionAwareFilePicker';
import { PermissionAwareLocation } from './PermissionAwareLocation';
import { getCustomFontFamily } from './CustomFontProvider';
import { AnalyticsDemo } from './AnalyticsDemo';
import { PushNotificationDemo } from './PushNotificationDemo';
import { BackendNotificationDemo } from './BackendNotificationDemo';

interface AppRequestDemoProps {
  appRequestData?: any;
}

export const AppRequestDemo: React.FC<AppRequestDemoProps> = ({ appRequestData }) => {
  const [initializationResult, setInitializationResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [currentLocation, setCurrentLocation] = useState<any>(null);

  useEffect(() => {
    initializeApp();
  }, [appRequestData]);

  const initializeApp = async () => {
    try {
      const result = await AppInitializer.initializeApp({
        appRequestData,
        autoRequestPermissions: true,
        loadCustomAssets: true,
        validateConfiguration: true
      });
      setInitializationResult(result);
    } catch (error) {
      console.error('Failed to initialize app:', error);
    }
  };

  const getFeatureStatus = (feature: string) => {
    if (!initializationResult) return 'Not initialized';
    return initializationResult.features.includes(feature) ? '✅ Enabled' : '❌ Disabled';
  };

  const getPermissionStatus = (permission: string) => {
    if (!initializationResult) return 'Not initialized';
    return initializationResult.permissions[permission] ? '✅ Granted' : '❌ Denied';
  };

  const renderOverview = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>App Initialization Status</Text>
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          Status: {initializationResult?.success ? '✅ Success' : '❌ Failed'}
        </Text>
        {initializationResult?.errors.length > 0 && (
          <Text style={styles.errorText}>
            Errors: {initializationResult.errors.join(', ')}
          </Text>
        )}
        {initializationResult?.warnings.length > 0 && (
          <Text style={styles.warningText}>
            Warnings: {initializationResult.warnings.join(', ')}
          </Text>
        )}
      </View>

      <Text style={styles.sectionTitle}>Enabled Features</Text>
      <View style={styles.featureList}>
        <Text style={styles.featureItem}>Camera: {getFeatureStatus('camera')}</Text>
        <Text style={styles.featureItem}>Photos: {getFeatureStatus('photos')}</Text>
        <Text style={styles.featureItem}>Files: {getFeatureStatus('files')}</Text>
        <Text style={styles.featureItem}>Location: {getFeatureStatus('location')}</Text>
        <Text style={styles.featureItem}>Notifications: {getFeatureStatus('notifications')}</Text>
        <Text style={styles.featureItem}>Analytics: {getFeatureStatus('analytics')}</Text>
        <Text style={styles.featureItem}>Push Notifications: {getFeatureStatus('push-notifications')}</Text>
        <Text style={styles.featureItem}>Custom Fonts: {getFeatureStatus('custom-fonts')}</Text>
        <Text style={styles.featureItem}>Custom Icons: {getFeatureStatus('custom-icons')}</Text>
        <Text style={styles.featureItem}>Custom Splash: {getFeatureStatus('custom-splash')}</Text>
      </View>

      <Text style={styles.sectionTitle}>Permission Status</Text>
      <View style={styles.featureList}>
        <Text style={styles.featureItem}>Camera: {getPermissionStatus('camera')}</Text>
        <Text style={styles.featureItem}>Photos: {getPermissionStatus('photos')}</Text>
        <Text style={styles.featureItem}>Files: {getPermissionStatus('files')}</Text>
        <Text style={styles.featureItem}>Location: {getPermissionStatus('location')}</Text>
        <Text style={styles.featureItem}>Notifications: {getPermissionStatus('notifications')}</Text>
      </View>

      <Text style={styles.sectionTitle}>Configuration Summary</Text>
      <View style={styles.configContainer}>
        <Text style={styles.configText}>
          {JSON.stringify(AppInitializer.getConfigurationSummary(), null, 2)}
        </Text>
      </View>
    </View>
  );

  const renderCamera = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Camera Feature</Text>
      <PermissionAwareCamera
        onPhotoTaken={(uri) => {
          Alert.alert('Photo Taken', `Photo saved to: ${uri}`);
        }}
        onError={(error) => {
          Alert.alert('Camera Error', error);
        }}
        style={styles.featureContainer}
      />
    </View>
  );

  const renderPhotos = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Photo Picker Feature</Text>
      <PermissionAwarePhotoPicker
        onPhotoSelected={(uri) => {
          setSelectedPhoto(uri);
          Alert.alert('Photo Selected', `Photo selected: ${uri}`);
        }}
        onError={(error) => {
          Alert.alert('Photo Picker Error', error);
        }}
        style={styles.featureContainer}
      />
    </View>
  );

  const renderFiles = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>File Picker Feature</Text>
      <PermissionAwareFilePicker
        onFileSelected={(result) => {
          setSelectedFile(result);
          Alert.alert('File Selected', `File selected: ${result.assets?.[0]?.name}`);
        }}
        onError={(error) => {
          Alert.alert('File Picker Error', error);
        }}
        style={styles.featureContainer}
      />
    </View>
  );

  const renderLocation = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Location Feature</Text>
      <PermissionAwareLocation
        onLocationUpdate={(location) => {
          setCurrentLocation(location);
          Alert.alert('Location Updated', `Location: ${location.coords.latitude}, ${location.coords.longitude}`);
        }}
        onError={(error) => {
          Alert.alert('Location Error', error);
        }}
        style={styles.featureContainer}
        watchPosition={true}
      />
    </View>
  );

  const renderCustomFonts = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Custom Fonts Demo</Text>
      <View style={styles.fontDemoContainer}>
        <Text style={[styles.fontDemoText, { fontFamily: 'System' }]}>
          System Font - Default
        </Text>
        <Text style={[styles.fontDemoText, { fontFamily: getCustomFontFamily('CustomFont', 400) }]}>
          Custom Font - Regular (400)
        </Text>
        <Text style={[styles.fontDemoText, { fontFamily: getCustomFontFamily('CustomFont', 700) }]}>
          Custom Font - Bold (700)
        </Text>
        <Text style={styles.fontInfo}>
          Custom fonts are loaded from app-request configuration and applied throughout the app.
        </Text>
      </View>
    </View>
  );

  const renderAnalytics = () => (
    <View style={styles.tabContent}>
      <AnalyticsDemo />
    </View>
  );

  const renderPushNotifications = () => (
    <View style={styles.tabContent}>
      <PushNotificationDemo />
    </View>
  );

  const renderBackendNotifications = () => (
    <View style={styles.tabContent}>
      <BackendNotificationDemo />
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'camera':
        return renderCamera();
      case 'photos':
        return renderPhotos();
      case 'files':
        return renderFiles();
      case 'location':
        return renderLocation();
      case 'fonts':
        return renderCustomFonts();
      case 'analytics':
        return renderAnalytics();
      case 'push-notifications':
        return renderPushNotifications();
      case 'backend-notifications':
        return renderBackendNotifications();
      default:
        return renderOverview();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>App-Request Features Demo</Text>
      
      <ScrollView horizontal style={styles.tabBar} showsHorizontalScrollIndicator={false}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
          onPress={() => setActiveTab('overview')}
        >
          <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
            Overview
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'camera' && styles.activeTab]}
          onPress={() => setActiveTab('camera')}
        >
          <Text style={[styles.tabText, activeTab === 'camera' && styles.activeTabText]}>
            Camera
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'photos' && styles.activeTab]}
          onPress={() => setActiveTab('photos')}
        >
          <Text style={[styles.tabText, activeTab === 'photos' && styles.activeTabText]}>
            Photos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'files' && styles.activeTab]}
          onPress={() => setActiveTab('files')}
        >
          <Text style={[styles.tabText, activeTab === 'files' && styles.activeTabText]}>
            Files
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'location' && styles.activeTab]}
          onPress={() => setActiveTab('location')}
        >
          <Text style={[styles.tabText, activeTab === 'location' && styles.activeTabText]}>
            Location
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'fonts' && styles.activeTab]}
          onPress={() => setActiveTab('fonts')}
        >
          <Text style={[styles.tabText, activeTab === 'fonts' && styles.activeTabText]}>
            Fonts
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'analytics' && styles.activeTab]}
          onPress={() => setActiveTab('analytics')}
        >
          <Text style={[styles.tabText, activeTab === 'analytics' && styles.activeTabText]}>
            Analytics
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'push-notifications' && styles.activeTab]}
          onPress={() => setActiveTab('push-notifications')}
        >
          <Text style={[styles.tabText, activeTab === 'push-notifications' && styles.activeTabText]}>
            Push
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'backend-notifications' && styles.activeTab]}
          onPress={() => setActiveTab('backend-notifications')}
        >
          <Text style={[styles.tabText, activeTab === 'backend-notifications' && styles.activeTabText]}>
            Backend
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderTabContent()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#333',
  },
  tabBar: {
    backgroundColor: 'white',
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginHorizontal: 5,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: 'white',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  tabContent: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  statusContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  statusText: {
    fontSize: 16,
    marginBottom: 5,
  },
  errorText: {
    fontSize: 14,
    color: '#ff4444',
    marginBottom: 5,
  },
  warningText: {
    fontSize: 14,
    color: '#ff8800',
    marginBottom: 5,
  },
  featureList: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  featureItem: {
    fontSize: 16,
    marginBottom: 8,
  },
  configContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  configText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#666',
  },
  featureContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 20,
  },
  fontDemoContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  fontDemoText: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
  },
  fontInfo: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
  },
});
