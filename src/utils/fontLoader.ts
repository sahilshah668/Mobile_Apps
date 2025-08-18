import APP_CONFIG from '../config/appConfig';

export interface FontConfig {
  familyName: string;
  url: string;
  weight?: number;
  style?: 'normal' | 'italic';
}

export interface LoadedFonts {
  [familyName: string]: any; // Font object from expo-font
}

/**
 * Load custom fonts from APP_CONFIG
 * This function is called from app/_layout.tsx
 */
export const loadCustomFonts = async (): Promise<LoadedFonts> => {
  const fonts = APP_CONFIG.fonts || [];
  const loadedFonts: LoadedFonts = {};

  if (fonts.length === 0) {
    console.log('No custom fonts configured');
    return loadedFonts;
  }

  try {
    // Create font loading promises
    const fontPromises = fonts.map(async (font) => {
      try {
        // Note: In a real implementation, fonts would be downloaded and cached
        // For now, we'll use a placeholder approach
        console.log(`Loading font: ${font.familyName}`);
        
        // This is a placeholder - in reality, you would:
        // 1. Download the font from font.url
        // 2. Cache it locally
        // 3. Load it using expo-font
        
        // For now, we'll just log the font info
        loadedFonts[font.familyName] = {
          familyName: font.familyName,
          weight: font.weight || 400,
          style: font.style || 'normal',
          loaded: true,
        };
        
        return loadedFonts[font.familyName];
      } catch (error) {
        console.error(`Failed to load font ${font.familyName}:`, error);
        return null;
      }
    });

    // Wait for all fonts to load
    await Promise.all(fontPromises);
    
    console.log('Custom fonts loaded:', Object.keys(loadedFonts));
    return loadedFonts;
  } catch (error) {
    console.error('Error loading custom fonts:', error);
    return loadedFonts;
  }
};

/**
 * Get the primary font family with fallback
 */
export const getPrimaryFontFamily = (): string => {
  const fonts = APP_CONFIG.fonts || [];
  return fonts[0]?.familyName || 'System';
};

/**
 * Get font family with weight and style
 */
export const getFontFamily = (
  familyName?: string,
  weight?: number,
  style?: 'normal' | 'italic'
): string => {
  const fonts = APP_CONFIG.fonts || [];
  const font = fonts.find(f => f.familyName === familyName);
  
  if (!font) {
    return familyName || 'System';
  }

  // In a real implementation, you would return the specific font variant
  // For now, we'll return the family name
  return font.familyName;
};

/**
 * Check if a font is available
 */
export const isFontAvailable = (familyName: string): boolean => {
  const fonts = APP_CONFIG.fonts || [];
  return fonts.some(f => f.familyName === familyName);
};

/**
 * Get all available font families
 */
export const getAvailableFontFamilies = (): string[] => {
  const fonts = APP_CONFIG.fonts || [];
  return fonts.map(f => f.familyName);
};

/**
 * Create font style object for React Native Text components
 */
export const createFontStyle = (
  familyName?: string,
  size?: number,
  weight?: number,
  style?: 'normal' | 'italic'
) => {
  const fontFamily = getFontFamily(familyName, weight, style);
  
  return {
    fontFamily,
    fontSize: size,
    fontWeight: weight,
    fontStyle: style,
  };
};

/**
 * Predefined font styles using the theme system
 */
export const fontStyles = {
  heading1: createFontStyle(getPrimaryFontFamily(), 32, 700),
  heading2: createFontStyle(getPrimaryFontFamily(), 28, 600),
  heading3: createFontStyle(getPrimaryFontFamily(), 24, 600),
  heading4: createFontStyle(getPrimaryFontFamily(), 20, 500),
  body1: createFontStyle(getPrimaryFontFamily(), 16, 400),
  body2: createFontStyle(getPrimaryFontFamily(), 14, 400),
  caption: createFontStyle(getPrimaryFontFamily(), 12, 400),
  button: createFontStyle(getPrimaryFontFamily(), 16, 600),
  input: createFontStyle(getPrimaryFontFamily(), 16, 400),
};
