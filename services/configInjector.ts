import { AssetLoader } from './assetLoader';
import { PermissionsManager } from './permissionsManager';
import { FeatureManager } from './featureManager';
import { APP_CONFIG } from '../config/appConfig';

export interface AppRequestData {
  appDetails: {
    appName: string;
    theme: string;
    customBranding: {
      logo: string;
      colors: any;
      appName: string;
    };
    identifiers: {
      androidPackageName: string;
      iosBundleId: string;
    };
    icons: {
      appIconUrl: string;
      adaptiveForegroundUrl: string;
      adaptiveBackgroundColor: string;
    };
    splash: {
      imageUrl: string;
      backgroundColor: string;
      resizeMode: 'contain' | 'cover';
      darkImageUrl: string;
      darkBackgroundColor: string;
    };
    fonts: Array<{
      familyName: string;
      url: string;
      weight: number;
      style: 'normal' | 'italic';
    }>;
    permissions: {
      camera: boolean;
      photos: boolean;
      files: boolean;
      location: boolean;
      notifications: boolean;
    };
    analytics: {
      ga4Id: string;
      sentryDsn: string;
    };
    push: {
      fcmServerKey: string;
      android: {
        enable: boolean;
        topicOrders: boolean;
        topicPromotions: boolean;
      };
      apns: {
        keyId: string;
        teamId: string;
        bundleId: string;
        p8Url: string;
      };
    };
  };
}

export class ConfigInjector {
  /**
   * Inject configuration from app-request data
   */
  static async injectFromAppRequest(appRequestData: AppRequestData): Promise<void> {
    try {
      console.log('🔧 Starting configuration injection...');

      // Inject basic app configuration
      this.injectBasicConfig(appRequestData);

      // Initialize permissions
      this.initializePermissions(appRequestData);

      // Load custom assets
      await this.loadCustomAssets(appRequestData);

      // Initialize analytics if enabled
      this.initializeAnalytics(appRequestData);

      // Initialize push notifications if enabled
      this.initializePushNotifications(appRequestData);

      console.log('✅ Configuration injection completed');
    } catch (error) {
      console.error('❌ Error during configuration injection:', error);
    }
  }

  /**
   * Inject basic configuration
   */
  private static injectBasicConfig(appRequestData: AppRequestData): void {
    const { appDetails } = appRequestData;

    // Update app name
    if (appDetails.appName) {
      APP_CONFIG.store.branding.appName = appDetails.appName;
      APP_CONFIG.theme.branding.appName = appDetails.appName;
      APP_CONFIG.branding.appName = appDetails.appName;
    }

    // Update custom branding
    if (appDetails.customBranding) {
      if (appDetails.customBranding.logo) {
        APP_CONFIG.store.branding.logo = appDetails.customBranding.logo;
        APP_CONFIG.theme.branding.logo = appDetails.customBranding.logo;
        APP_CONFIG.branding.logo = appDetails.customBranding.logo;
      }

      if (appDetails.customBranding.colors) {
        APP_CONFIG.store.branding.colors = appDetails.customBranding.colors;
        APP_CONFIG.theme.colors = appDetails.customBranding.colors;
        APP_CONFIG.branding.colors = appDetails.customBranding.colors;
      }
    }

    // Update identifiers
    if (appDetails.identifiers) {
      APP_CONFIG.appRequest.identifiers = appDetails.identifiers;
    }

    console.log('✅ Basic configuration injected');
  }

  /**
   * Initialize permissions
   */
  private static initializePermissions(appRequestData: AppRequestData): void {
    const { permissions } = appRequestData.appDetails;
    
    if (permissions) {
      APP_CONFIG.appRequest.permissions = permissions;
      PermissionsManager.initialize(permissions);
      console.log('✅ Permissions initialized');
    }
  }

  /**
   * Load custom assets
   */
  private static async loadCustomAssets(appRequestData: AppRequestData): Promise<void> {
    const { icons, splash, fonts } = appRequestData.appDetails;

    try {
      // Load custom fonts
      if (fonts && fonts.length > 0) {
        APP_CONFIG.appRequest.fonts = fonts;
        await AssetLoader.loadCustomFonts(fonts);
        console.log('✅ Custom fonts loaded');
      }

      // Load custom icons
      if (icons && (icons.appIconUrl || icons.adaptiveForegroundUrl)) {
        APP_CONFIG.appRequest.icons = icons;
        await AssetLoader.loadCustomIcons(icons);
        console.log('✅ Custom icons loaded');
      }

      // Load splash screens
      if (splash && (splash.imageUrl || splash.darkImageUrl)) {
        APP_CONFIG.appRequest.splash = splash;
        await AssetLoader.loadSplashScreens(splash);
        console.log('✅ Splash screens loaded');
      }
    } catch (error) {
      console.error('❌ Error loading custom assets:', error);
    }
  }

  /**
   * Initialize analytics
   */
  private static initializeAnalytics(appRequestData: AppRequestData): void {
    const { analytics } = appRequestData.appDetails;

    if (analytics) {
      APP_CONFIG.appRequest.analytics = analytics;
      
      // Analytics will be initialized by their respective services
      // when the app starts and checks FeatureManager.isAnalyticsEnabled()
      console.log('✅ Analytics configuration injected');
    }
  }

  /**
   * Initialize push notifications
   */
  private static initializePushNotifications(appRequestData: AppRequestData): void {
    const { push } = appRequestData.appDetails;

    if (push) {
      APP_CONFIG.appRequest.push = push;
      
      // Push notifications will be initialized by their respective services
      // when the app starts and checks FeatureManager.isPushNotificationsEnabled()
      console.log('✅ Push notifications configuration injected');
    }
  }

  /**
   * Validate configuration
   */
  static validateConfiguration(): boolean {
    try {
      // Check if required fields are present
      if (!APP_CONFIG.store.branding.appName) {
        console.warn('⚠️ App name is missing');
        return false;
      }

      // Check if permissions are properly configured
      const permissions = APP_CONFIG.appRequest?.permissions;
      if (permissions) {
        const requiredPermissions = Object.values(permissions).some(Boolean);
        if (requiredPermissions) {
          console.log('✅ Permissions configuration validated');
        }
      }

      // Check if features are properly configured
      const enabledFeatures = FeatureManager.getEnabledFeatures();
      console.log('✅ Enabled features:', enabledFeatures);

      return true;
    } catch (error) {
      console.error('❌ Configuration validation failed:', error);
      return false;
    }
  }

  /**
   * Get configuration summary
   */
  static getConfigurationSummary(): Record<string, any> {
    return {
      appName: APP_CONFIG.store.branding.appName,
      theme: APP_CONFIG.appRequest?.theme,
      permissions: APP_CONFIG.appRequest?.permissions,
      analytics: {
        enabled: FeatureManager.isAnalyticsEnabled(),
        ga4: FeatureManager.isGA4Enabled(),
        sentry: FeatureManager.isSentryEnabled()
      },
      pushNotifications: {
        enabled: FeatureManager.isPushNotificationsEnabled(),
        fcm: FeatureManager.isFCMEnabled(),
        apns: FeatureManager.isAPNSEnabled()
      },
      customAssets: {
        fonts: FeatureManager.isCustomFontsEnabled(),
        icons: FeatureManager.isCustomIconsEnabled(),
        splash: FeatureManager.isCustomSplashEnabled()
      },
      enabledFeatures: FeatureManager.getEnabledFeatures()
    };
  }

  /**
   * Reset configuration to defaults
   */
  static resetConfiguration(): void {
    // Reset app-request specific configurations
    APP_CONFIG.appRequest = {
      identifiers: {
        androidPackageName: "",
        iosBundleId: ""
      },
      icons: {
        appIconUrl: "",
        adaptiveForegroundUrl: "",
        adaptiveBackgroundColor: ""
      },
      splash: {
        imageUrl: "",
        backgroundColor: "",
        resizeMode: "contain" as "contain" | "cover",
        darkImageUrl: "",
        darkBackgroundColor: ""
      },
      fonts: [],
      permissions: {
        camera: false,
        photos: false,
        files: false,
        location: false,
        notifications: false
      },
      analytics: {
        ga4Id: "",
        sentryDsn: ""
      },
      push: {
        fcmServerKey: "",
        android: {
          enable: false,
          topicOrders: false,
          topicPromotions: false
        },
        apns: {
          keyId: "",
          teamId: "",
          bundleId: "",
          p8Url: ""
        }
      }
    };

    // Clear cached assets
    AssetLoader.clearCache();

    console.log('✅ Configuration reset to defaults');
  }
}
