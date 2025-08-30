import { APP_CONFIG } from '../config/appConfig';

export class FeatureManager {
  /**
   * Check if camera feature is enabled
   */
  static isCameraEnabled(): boolean {
    return APP_CONFIG.appRequest?.permissions?.camera || false;
  }

  /**
   * Check if photos feature is enabled
   */
  static isPhotosEnabled(): boolean {
    return APP_CONFIG.appRequest?.permissions?.photos || false;
  }

  /**
   * Check if files feature is enabled
   */
  static isFilesEnabled(): boolean {
    return APP_CONFIG.appRequest?.permissions?.files || false;
  }

  /**
   * Check if location feature is enabled
   */
  static isLocationEnabled(): boolean {
    return APP_CONFIG.appRequest?.permissions?.location || false;
  }

  /**
   * Check if notifications feature is enabled
   */
  static isNotificationsEnabled(): boolean {
    return APP_CONFIG.appRequest?.permissions?.notifications || false;
  }

  /**
   * Check if analytics feature is enabled
   */
  static isAnalyticsEnabled(): boolean {
    return !!(APP_CONFIG.appRequest?.analytics?.ga4Id || APP_CONFIG.appRequest?.analytics?.sentryDsn);
  }

  /**
   * Check if Google Analytics 4 is enabled
   */
  static isGA4Enabled(): boolean {
    return !!APP_CONFIG.appRequest?.analytics?.ga4Id;
  }

  /**
   * Check if Sentry is enabled
   */
  static isSentryEnabled(): boolean {
    return !!APP_CONFIG.appRequest?.analytics?.sentryDsn;
  }

  /**
   * Check if push notifications are enabled
   */
  static isPushNotificationsEnabled(): boolean {
    return !!(APP_CONFIG.appRequest?.push?.fcmServerKey || 
              APP_CONFIG.appRequest?.push?.apns?.keyId);
  }

  /**
   * Check if FCM (Android) push notifications are enabled
   */
  static isFCMEnabled(): boolean {
    return !!APP_CONFIG.appRequest?.push?.fcmServerKey;
  }

  /**
   * Check if APNS (iOS) push notifications are enabled
   */
  static isAPNSEnabled(): boolean {
    return !!APP_CONFIG.appRequest?.push?.apns?.keyId;
  }

  /**
   * Check if custom fonts are enabled
   */
  static isCustomFontsEnabled(): boolean {
    return !!(APP_CONFIG.appRequest?.fonts && APP_CONFIG.appRequest.fonts.length > 0);
  }

  /**
   * Check if custom icons are enabled
   */
  static isCustomIconsEnabled(): boolean {
    return !!(APP_CONFIG.appRequest?.icons?.appIconUrl || 
              APP_CONFIG.appRequest?.icons?.adaptiveForegroundUrl);
  }

  /**
   * Check if custom splash screen is enabled
   */
  static isCustomSplashEnabled(): boolean {
    return !!(APP_CONFIG.appRequest?.splash?.imageUrl || 
              APP_CONFIG.appRequest?.splash?.darkImageUrl);
  }

  /**
   * Get all enabled features
   */
  static getEnabledFeatures(): string[] {
    const features: string[] = [];

    if (this.isCameraEnabled()) features.push('camera');
    if (this.isPhotosEnabled()) features.push('photos');
    if (this.isFilesEnabled()) features.push('files');
    if (this.isLocationEnabled()) features.push('location');
    if (this.isNotificationsEnabled()) features.push('notifications');
    if (this.isAnalyticsEnabled()) features.push('analytics');
    if (this.isPushNotificationsEnabled()) features.push('push-notifications');
    if (this.isCustomFontsEnabled()) features.push('custom-fonts');
    if (this.isCustomIconsEnabled()) features.push('custom-icons');
    if (this.isCustomSplashEnabled()) features.push('custom-splash');

    return features;
  }

  /**
   * Get feature configuration summary
   */
  static getFeatureSummary(): Record<string, boolean> {
    return {
      camera: this.isCameraEnabled(),
      photos: this.isPhotosEnabled(),
      files: this.isFilesEnabled(),
      location: this.isLocationEnabled(),
      notifications: this.isNotificationsEnabled(),
      analytics: this.isAnalyticsEnabled(),
      pushNotifications: this.isPushNotificationsEnabled(),
      customFonts: this.isCustomFontsEnabled(),
      customIcons: this.isCustomIconsEnabled(),
      customSplash: this.isCustomSplashEnabled()
    };
  }

  /**
   * Check if any advanced features are enabled
   */
  static hasAdvancedFeatures(): boolean {
    return this.isAnalyticsEnabled() || 
           this.isPushNotificationsEnabled() || 
           this.isCustomFontsEnabled() || 
           this.isCustomIconsEnabled() || 
           this.isCustomSplashEnabled();
  }

  /**
   * Check if any permissions are required
   */
  static hasRequiredPermissions(): boolean {
    return this.isCameraEnabled() || 
           this.isPhotosEnabled() || 
           this.isFilesEnabled() || 
           this.isLocationEnabled() || 
           this.isNotificationsEnabled();
  }
}
