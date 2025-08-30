import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { getAccessToken } from '../services/token';
import { APP_CONFIG } from '../config/appConfig';

const DebugInfo: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const userState = useSelector((state: RootState) => state.user);

  useEffect(() => {
    const gatherDebugInfo = async () => {
      try {
        const token = await getAccessToken();
        setDebugInfo({
          timestamp: new Date().toISOString(),
          userState: {
            isAuthenticated: userState.isAuthenticated,
            loading: userState.loading,
            hasToken: !!token,
            tokenLength: token ? token.length : 0,
            name: userState.name,
            error: userState.error
          },
          appConfig: {
            storeId: APP_CONFIG?.store?.id,
            storeName: APP_CONFIG?.store?.name,
            hasConfig: !!APP_CONFIG
          },
          platform: {
            platform: require('react-native').Platform.OS,
            version: require('react-native').Platform.Version
          }
        });
      } catch (error) {
        setDebugInfo({
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    };

    gatherDebugInfo();
  }, [userState]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Debug Information</Text>
      <Text style={styles.section}>User State:</Text>
      <Text style={styles.info}>Authenticated: {debugInfo.userState?.isAuthenticated ? 'Yes' : 'No'}</Text>
      <Text style={styles.info}>Loading: {debugInfo.userState?.loading ? 'Yes' : 'No'}</Text>
      <Text style={styles.info}>Has Token: {debugInfo.userState?.hasToken ? 'Yes' : 'No'}</Text>
      <Text style={styles.info}>Token Length: {debugInfo.userState?.tokenLength || 0}</Text>
      <Text style={styles.info}>Name: {debugInfo.userState?.name || 'N/A'}</Text>
      <Text style={styles.info}>Error: {debugInfo.userState?.error || 'None'}</Text>
      
      <Text style={styles.section}>App Config:</Text>
      <Text style={styles.info}>Store ID: {debugInfo.appConfig?.storeId || 'N/A'}</Text>
      <Text style={styles.info}>Store Name: {debugInfo.appConfig?.storeName || 'N/A'}</Text>
      <Text style={styles.info}>Has Config: {debugInfo.appConfig?.hasConfig ? 'Yes' : 'No'}</Text>
      
      <Text style={styles.section}>Platform:</Text>
      <Text style={styles.info}>OS: {debugInfo.platform?.platform || 'N/A'}</Text>
      <Text style={styles.info}>Version: {debugInfo.platform?.version || 'N/A'}</Text>
      
      <Text style={styles.section}>Timestamp:</Text>
      <Text style={styles.info}>{debugInfo.timestamp || 'N/A'}</Text>
      
      {debugInfo.error && (
        <>
          <Text style={styles.section}>Error:</Text>
          <Text style={styles.error}>{debugInfo.error}</Text>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  section: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
    color: '#156BFF',
  },
  info: {
    fontSize: 14,
    marginBottom: 3,
    color: '#666',
  },
  error: {
    fontSize: 14,
    marginBottom: 3,
    color: '#FF0000',
  },
});

export default DebugInfo;
