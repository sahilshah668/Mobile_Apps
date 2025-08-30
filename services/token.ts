import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'sa2z_access_token';
const REFRESH_TOKEN_KEY = 'sa2z_refresh_token';

export async function setTokens(accessToken: string, refreshToken?: string) {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
  }
}

export async function getAccessToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function getRefreshToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function clearTokens() {
  try { await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY); } catch {}
  try { await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY); } catch {}
}

export function isJwtExpired(token?: string | null): boolean {
  if (!token) {
    console.log('Token validation: No token provided');
    return true;
  }
  
  try {
    // Use atob for React Native instead of Buffer
    const base64 = token.split('.')[1];
    const payload = JSON.parse(atob(base64));
    const exp = payload?.exp ? Number(payload.exp) * 1000 : 0;
    const now = Date.now();
    const isExpired = !exp || now >= exp;
    
    console.log('Token validation:', {
      expires: new Date(exp).toISOString(),
      now: new Date(now).toISOString(),
      isExpired,
      timeUntilExpiry: exp - now
    });
    
    return isExpired;
  } catch (error) {
    console.error('Token validation error:', error);
    return true;
  }
}


