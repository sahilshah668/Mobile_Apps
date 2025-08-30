import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import * as DocumentPicker from 'expo-document-picker';
import { Platform } from 'react-native';

export interface PermissionStatus {
  camera: boolean;
  photos: boolean;
  files: boolean;
  location: boolean;
  notifications: boolean;
}

export interface PermissionConfig {
  camera: boolean;
  photos: boolean;
  files: boolean;
  location: boolean;
  notifications: boolean;
}

export class PermissionsManager {
  private static permissionConfig: PermissionConfig = {
    camera: false,
    photos: false,
    files: false,
    location: false,
    notifications: false
  };

  /**
   * Initialize permissions from app configuration
   */
  static initialize(config: PermissionConfig): void {
    this.permissionConfig = config;
    console.log('🔐 Permissions initialized:', config);
  }

  /**
   * Request camera permission
   */
  static async requestCameraPermission(): Promise<boolean> {
    if (!this.permissionConfig.camera) {
      console.log('📷 Camera permission not enabled in app config');
      return false;
    }

    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      const granted = status === 'granted';
      console.log(`📷 Camera permission: ${granted ? 'granted' : 'denied'}`);
      return granted;
    } catch (error) {
      console.error('❌ Error requesting camera permission:', error);
      return false;
    }
  }

  /**
   * Request photos permission
   */
  static async requestPhotosPermission(): Promise<boolean> {
    if (!this.permissionConfig.photos) {
      console.log('🖼️ Photos permission not enabled in app config');
      return false;
    }

    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      const granted = status === 'granted';
      console.log(`🖼️ Photos permission: ${granted ? 'granted' : 'denied'}`);
      return granted;
    } catch (error) {
      console.error('❌ Error requesting photos permission:', error);
      return false;
    }
  }

  /**
   * Request files permission (document picker)
   */
  static async requestFilesPermission(): Promise<boolean> {
    if (!this.permissionConfig.files) {
      console.log('📁 Files permission not enabled in app config');
      return false;
    }

    try {
      // Document picker doesn't require explicit permission on most platforms
      // but we'll check if it's enabled in config
      console.log('📁 Files access enabled');
      return true;
    } catch (error) {
      console.error('❌ Error checking files permission:', error);
      return false;
    }
  }

  /**
   * Request location permission
   */
  static async requestLocationPermission(): Promise<boolean> {
    if (!this.permissionConfig.location) {
      console.log('📍 Location permission not enabled in app config');
      return false;
    }

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const granted = status === 'granted';
      console.log(`📍 Location permission: ${granted ? 'granted' : 'denied'}`);
      return granted;
    } catch (error) {
      console.error('❌ Error requesting location permission:', error);
      return false;
    }
  }

  /**
   * Request notification permission
   */
  static async requestNotificationPermission(): Promise<boolean> {
    if (!this.permissionConfig.notifications) {
      console.log('🔔 Notifications permission not enabled in app config');
      return false;
    }

    try {
      const { status } = await Notifications.requestPermissionsAsync();
      const granted = status === 'granted';
      console.log(`🔔 Notifications permission: ${granted ? 'granted' : 'denied'}`);
      return granted;
    } catch (error) {
      console.error('❌ Error requesting notifications permission:', error);
      return false;
    }
  }

  /**
   * Check all permissions status
   */
  static async checkAllPermissions(): Promise<PermissionStatus> {
    const status: PermissionStatus = {
      camera: false,
      photos: false,
      files: false,
      location: false,
      notifications: false
    };

    try {
      // Check camera permission
      if (this.permissionConfig.camera) {
        const { status: cameraStatus } = await ImagePicker.getCameraPermissionsAsync();
        status.camera = cameraStatus === 'granted';
      }

      // Check photos permission
      if (this.permissionConfig.photos) {
        const { status: photosStatus } = await ImagePicker.getMediaLibraryPermissionsAsync();
        status.photos = photosStatus === 'granted';
      }

      // Check files permission (always true if enabled in config)
      status.files = this.permissionConfig.files;

      // Check location permission
      if (this.permissionConfig.location) {
        const { status: locationStatus } = await Location.getForegroundPermissionsAsync();
        status.location = locationStatus === 'granted';
      }

      // Check notifications permission
      if (this.permissionConfig.notifications) {
        const { status: notificationStatus } = await Notifications.getPermissionsAsync();
        status.notifications = notificationStatus === 'granted';
      }

      console.log('🔍 Permission status:', status);
      return status;
    } catch (error) {
      console.error('❌ Error checking permissions:', error);
      return status;
    }
  }

  /**
   * Request all enabled permissions
   */
  static async requestAllPermissions(): Promise<PermissionStatus> {
    const promises = [];

    if (this.permissionConfig.camera) {
      promises.push(this.requestCameraPermission());
    }
    if (this.permissionConfig.photos) {
      promises.push(this.requestPhotosPermission());
    }
    if (this.permissionConfig.files) {
      promises.push(this.requestFilesPermission());
    }
    if (this.permissionConfig.location) {
      promises.push(this.requestLocationPermission());
    }
    if (this.permissionConfig.notifications) {
      promises.push(this.requestNotificationPermission());
    }

    const results = await Promise.all(promises);
    
    const status: PermissionStatus = {
      camera: this.permissionConfig.camera ? results[0] : false,
      photos: this.permissionConfig.photos ? results[1] : false,
      files: this.permissionConfig.files ? results[2] : false,
      location: this.permissionConfig.location ? results[3] : false,
      notifications: this.permissionConfig.notifications ? results[4] : false
    };

    console.log('✅ All permissions requested:', status);
    return status;
  }

  /**
   * Check if a specific permission is enabled in config
   */
  static isPermissionEnabled(permission: keyof PermissionConfig): boolean {
    return this.permissionConfig[permission];
  }

  /**
   * Get current permission configuration
   */
  static getPermissionConfig(): PermissionConfig {
    return { ...this.permissionConfig };
  }
}
