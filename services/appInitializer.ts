import { ConfigInjector, AppRequestData } from './configInjector';
import { FeatureManager } from './featureManager';
import { PermissionsManager } from './permissionsManager';
import { AssetLoader } from './assetLoader';
import { AnalyticsManager } from './analytics/analyticsManager';
import { PushNotificationManager } from './notifications/pushNotificationManager';
import { MobileNotificationService } from './notifications/mobileNotificationService';
import { APP_CONFIG } from '../config/appConfig';

export interface AppInitializationOptions {
  appRequestData?: AppRequestData;
  autoRequestPermissions?: boolean;
  loadCustomAssets?: boolean;
  validateConfiguration?: boolean;
}

export interface AppInitializationResult {
  success: boolean;
  features: string[];
  permissions: Record<string, boolean>;
  errors: string[];
  warnings: string[];
}

export class AppInitializer {
  private static initializationComplete = false;
  private static initializationPromise: Promise<AppInitializationResult> | null = null;

  /**
   * Initialize the app with app-request configuration
   */
  static async initializeApp(options: AppInitializationOptions = {}): Promise<AppInitializationResult> {
    // Prevent multiple initializations
    if (this.initializationComplete) {
      console.log('🔄 App already initialized');
      return {
        success: true,
        features: FeatureManager.getEnabledFeatures(),
        permissions: {},
        errors: [],
        warnings: ['App already initialized']
      };
    }

    // Return existing promise if initialization is in progress
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this.performInitialization(options);
    return this.initializationPromise;
  }

  /**
   * Perform the actual initialization
   */
  private static async performInitialization(options: AppInitializationOptions): Promise<AppInitializationResult> {
    const result: AppInitializationResult = {
      success: false,
      features: [],
      permissions: {},
      errors: [],
      warnings: []
    };

    try {
      console.log('🚀 Starting app initialization...');

      // Step 1: Inject configuration from app-request data
      if (options.appRequestData) {
        console.log('🔧 Injecting app-request configuration...');
        await ConfigInjector.injectFromAppRequest(options.appRequestData);
      }

      // Step 2: Validate configuration
      if (options.validateConfiguration !== false) {
        console.log('✅ Validating configuration...');
        const isValid = ConfigInjector.validateConfiguration();
        if (!isValid) {
          result.warnings.push('Configuration validation failed');
        }
      }

      // Step 3: Load custom assets
      if (options.loadCustomAssets !== false) {
        console.log('📦 Loading custom assets...');
        await this.loadCustomAssets();
      }

      // Step 4: Request permissions if enabled
      if (options.autoRequestPermissions !== false) {
        console.log('🔐 Requesting permissions...');
        const permissions = await this.requestPermissions();
        result.permissions = permissions;
      }

      // Step 5: Initialize analytics if enabled
      if (FeatureManager.isAnalyticsEnabled()) {
        console.log('📊 Initializing analytics...');
        AnalyticsManager.initialize();
      }

      // Step 6: Initialize push notifications if enabled
      if (FeatureManager.isPushNotificationsEnabled()) {
        console.log('🔔 Initializing push notifications...');
        await PushNotificationManager.initialize();
      }

      // Step 7: Initialize mobile notification service
      console.log('📱 Initializing mobile notification service...');
      MobileNotificationService.initialize();

      // Step 8: Get enabled features
      result.features = FeatureManager.getEnabledFeatures();

      // Step 9: Mark initialization as complete
      this.initializationComplete = true;
      result.success = true;

      console.log('✅ App initialization completed successfully');
      console.log('📋 Enabled features:', result.features);
      console.log('🔐 Permissions:', result.permissions);

    } catch (error) {
      console.error('❌ App initialization failed:', error);
      result.errors.push(error instanceof Error ? error.message : 'Unknown error');
      result.success = false;
    }

    return result;
  }

  /**
   * Load custom assets
   */
  private static async loadCustomAssets(): Promise<void> {
    const { icons, splash, fonts } = APP_CONFIG.appRequest || {};

    try {
      // Load custom fonts
      if (fonts && fonts.length > 0) {
        await AssetLoader.loadCustomFonts(fonts);
      }

      // Load custom icons
      if (icons && (icons.appIconUrl || icons.adaptiveForegroundUrl)) {
        await AssetLoader.loadCustomIcons(icons);
      }

      // Load splash screens
      if (splash && (splash.imageUrl || splash.darkImageUrl)) {
        await AssetLoader.loadSplashScreens(splash);
      }
    } catch (error) {
      console.error('❌ Error loading custom assets:', error);
      throw error;
    }
  }

  /**
   * Request permissions
   */
  private static async requestPermissions(): Promise<Record<string, boolean>> {
    try {
      const permissions = await PermissionsManager.requestAllPermissions();
      return permissions;
    } catch (error) {
      console.error('❌ Error requesting permissions:', error);
      return {
        camera: false,
        photos: false,
        files: false,
        location: false,
        notifications: false
      };
    }
  }

  /**
   * Get initialization status
   */
  static isInitialized(): boolean {
    return this.initializationComplete;
  }

  /**
   * Get configuration summary
   */
  static getConfigurationSummary() {
    return ConfigInjector.getConfigurationSummary();
  }

  /**
   * Reset initialization state (for testing)
   */
  static reset(): void {
    this.initializationComplete = false;
    this.initializationPromise = null;
    ConfigInjector.resetConfiguration();
    AssetLoader.clearCache();
    AnalyticsManager.reset();
    PushNotificationManager.reset();
    MobileNotificationService.reset();
    console.log('🔄 App initialization state reset');
  }

  /**
   * Check if specific feature is ready
   */
  static isFeatureReady(feature: string): boolean {
    if (!this.initializationComplete) {
      return false;
    }

    switch (feature) {
      case 'camera':
        return FeatureManager.isCameraEnabled() && 
               PermissionsManager.isPermissionEnabled('camera');
      case 'photos':
        return FeatureManager.isPhotosEnabled() && 
               PermissionsManager.isPermissionEnabled('photos');
      case 'files':
        return FeatureManager.isFilesEnabled() && 
               PermissionsManager.isPermissionEnabled('files');
      case 'location':
        return FeatureManager.isLocationEnabled() && 
               PermissionsManager.isPermissionEnabled('location');
      case 'notifications':
        return FeatureManager.isNotificationsEnabled() && 
               PermissionsManager.isPermissionEnabled('notifications');
      case 'analytics':
        return FeatureManager.isAnalyticsEnabled();
      case 'push-notifications':
        return FeatureManager.isPushNotificationsEnabled();
      case 'custom-fonts':
        return FeatureManager.isCustomFontsEnabled();
      case 'custom-icons':
        return FeatureManager.isCustomIconsEnabled();
      case 'custom-splash':
        return FeatureManager.isCustomSplashEnabled();
      default:
        return false;
    }
  }

  /**
   * Get all ready features
   */
  static getReadyFeatures(): string[] {
    if (!this.initializationComplete) {
      return [];
    }

    const allFeatures = FeatureManager.getEnabledFeatures();
    return allFeatures.filter(feature => this.isFeatureReady(feature));
  }
}
