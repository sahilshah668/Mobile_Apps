import * as FileSystem from 'expo-file-system';
import * as Font from 'expo-font';
import { Platform } from 'react-native';

export interface FontConfig {
  familyName: string;
  url: string;
  weight: number;
  style: 'normal' | 'italic';
}

export interface IconConfig {
  appIconUrl: string;
  adaptiveForegroundUrl: string;
  adaptiveBackgroundColor: string;
}

export interface SplashConfig {
  imageUrl: string;
  backgroundColor: string;
  resizeMode: 'contain' | 'cover';
  darkImageUrl: string;
  darkBackgroundColor: string;
}

export class AssetLoader {
  private static customFonts: Map<string, string> = new Map();

  /**
   * Load custom fonts from URLs
   */
  static async loadCustomFonts(fonts: FontConfig[]): Promise<void> {
    try {
      const fontPromises = fonts.map(async (font) => {
        const fileName = `${font.familyName}-${font.weight}-${font.style}.ttf`;
        const fileUri = `${FileSystem.documentDirectory}fonts/${fileName}`;
        
        // Create fonts directory if it doesn't exist
        const fontsDir = `${FileSystem.documentDirectory}fonts/`;
        const dirInfo = await FileSystem.getInfoAsync(fontsDir);
        if (!dirInfo.exists) {
          await FileSystem.makeDirectoryAsync(fontsDir, { intermediates: true });
        }

        // Download font if not already cached
        const fileInfo = await FileSystem.getInfoAsync(fileUri);
        if (!fileInfo.exists) {
          await FileSystem.downloadAsync(font.url, fileUri);
        }

        // Load font with expo-font
        const fontFamily = `${font.familyName}-${font.weight}`;
        await Font.loadAsync({
          [fontFamily]: fileUri
        });

        this.customFonts.set(fontFamily, fileUri);
        console.log(`✅ Loaded custom font: ${fontFamily}`);
      });

      await Promise.all(fontPromises);
    } catch (error) {
      console.error('❌ Error loading custom fonts:', error);
    }
  }

  /**
   * Load custom icons
   */
  static async loadCustomIcons(icons: IconConfig): Promise<void> {
    try {
      if (!icons.appIconUrl && !icons.adaptiveForegroundUrl) {
        return;
      }

      const iconsDir = `${FileSystem.documentDirectory}icons/`;
      const dirInfo = await FileSystem.getInfoAsync(iconsDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(iconsDir, { intermediates: true });
      }

      const iconPromises = [];

      if (icons.appIconUrl) {
        const appIconUri = `${iconsDir}app-icon.png`;
        iconPromises.push(
          FileSystem.downloadAsync(icons.appIconUrl, appIconUri)
            .then(() => console.log('✅ Downloaded app icon'))
        );
      }

      if (icons.adaptiveForegroundUrl) {
        const adaptiveIconUri = `${iconsDir}adaptive-icon.png`;
        iconPromises.push(
          FileSystem.downloadAsync(icons.adaptiveForegroundUrl, adaptiveIconUri)
            .then(() => console.log('✅ Downloaded adaptive icon'))
        );
      }

      await Promise.all(iconPromises);
    } catch (error) {
      console.error('❌ Error loading custom icons:', error);
    }
  }

  /**
   * Load splash screen images
   */
  static async loadSplashScreens(splash: SplashConfig): Promise<void> {
    try {
      if (!splash.imageUrl && !splash.darkImageUrl) {
        return;
      }

      const splashDir = `${FileSystem.documentDirectory}splash/`;
      const dirInfo = await FileSystem.getInfoAsync(splashDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(splashDir, { intermediates: true });
      }

      const splashPromises = [];

      if (splash.imageUrl) {
        const splashUri = `${splashDir}splash.png`;
        splashPromises.push(
          FileSystem.downloadAsync(splash.imageUrl, splashUri)
            .then(() => console.log('✅ Downloaded splash screen'))
        );
      }

      if (splash.darkImageUrl) {
        const darkSplashUri = `${splashDir}splash-dark.png`;
        splashPromises.push(
          FileSystem.downloadAsync(splash.darkImageUrl, darkSplashUri)
            .then(() => console.log('✅ Downloaded dark splash screen'))
        );
      }

      await Promise.all(splashPromises);
    } catch (error) {
      console.error('❌ Error loading splash screens:', error);
    }
  }

  /**
   * Get custom font family name
   */
  static getCustomFontFamily(baseName: string, weight: number = 400): string {
    return `${baseName}-${weight}`;
  }

  /**
   * Check if custom font is loaded
   */
  static isCustomFontLoaded(fontFamily: string): boolean {
    return this.customFonts.has(fontFamily);
  }

  /**
   * Clear all cached assets
   */
  static async clearCache(): Promise<void> {
    try {
      const cacheDirs = [
        `${FileSystem.documentDirectory}fonts/`,
        `${FileSystem.documentDirectory}icons/`,
        `${FileSystem.documentDirectory}splash/`
      ];

      for (const dir of cacheDirs) {
        const dirInfo = await FileSystem.getInfoAsync(dir);
        if (dirInfo.exists) {
          await FileSystem.deleteAsync(dir, { idempotent: true });
        }
      }

      this.customFonts.clear();
      console.log('✅ Cleared asset cache');
    } catch (error) {
      console.error('❌ Error clearing cache:', error);
    }
  }
}
