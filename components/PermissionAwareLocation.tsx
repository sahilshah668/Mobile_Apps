import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as Location from 'expo-location';
import { FeatureManager } from '../services/featureManager';
import { PermissionsManager } from '../services/permissionsManager';

interface PermissionAwareLocationProps {
  onLocationUpdate?: (location: Location.LocationObject) => void;
  onError?: (error: string) => void;
  style?: any;
  watchPosition?: boolean;
  accuracy?: Location.Accuracy;
}

export const PermissionAwareLocation: React.FC<PermissionAwareLocationProps> = ({
  onLocationUpdate,
  onError,
  style,
  watchPosition = false,
  accuracy = Location.Accuracy.Balanced
}) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [isWatching, setIsWatching] = useState(false);
  const [locationSubscription, setLocationSubscription] = useState<Location.LocationSubscription | null>(null);

  useEffect(() => {
    // Check if location feature is enabled
    if (!FeatureManager.isLocationEnabled()) {
      console.log('📍 Location feature not enabled');
      onError?.('Location feature is not enabled for this app');
      return;
    }

    // Request location permission
    (async () => {
      const permission = await PermissionsManager.requestLocationPermission();
      setHasPermission(permission);
      
      if (!permission) {
        onError?.('Location permission denied');
      }
    })();

    // Cleanup subscription on unmount
    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, []);

  const getCurrentLocation = async () => {
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Please grant location permission to get your location.');
      return;
    }

    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: accuracy,
      });
      
      setCurrentLocation(location);
      onLocationUpdate?.(location);
      console.log('📍 Current location:', location);
    } catch (error) {
      console.error('Error getting location:', error);
      onError?.('Failed to get current location');
    }
  };

  const startWatchingLocation = async () => {
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Please grant location permission to watch your location.');
      return;
    }

    try {
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: accuracy,
          timeInterval: 5000, // Update every 5 seconds
          distanceInterval: 10, // Update every 10 meters
        },
        (location) => {
          setCurrentLocation(location);
          onLocationUpdate?.(location);
          console.log('📍 Location updated:', location);
        }
      );

      setLocationSubscription(subscription);
      setIsWatching(true);
      console.log('📍 Started watching location');
    } catch (error) {
      console.error('Error watching location:', error);
      onError?.('Failed to start location watching');
    }
  };

  const stopWatchingLocation = () => {
    if (locationSubscription) {
      locationSubscription.remove();
      setLocationSubscription(null);
      setIsWatching(false);
      console.log('📍 Stopped watching location');
    }
  };

  const formatLocation = (location: Location.LocationObject): string => {
    return `Lat: ${location.coords.latitude.toFixed(6)}, Lon: ${location.coords.longitude.toFixed(6)}`;
  };

  const formatAccuracy = (accuracy: number): string => {
    if (accuracy < 5) return 'Excellent';
    if (accuracy < 10) return 'Good';
    if (accuracy < 20) return 'Fair';
    return 'Poor';
  };

  // If location feature is not enabled, show disabled message
  if (!FeatureManager.isLocationEnabled()) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.disabledText}>Location feature is not available</Text>
      </View>
    );
  }

  // If permission is still being checked
  if (hasPermission === null) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.loadingText}>Requesting location permission...</Text>
      </View>
    );
  }

  // If permission is denied
  if (hasPermission === false) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.errorText}>No access to location</Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={() => PermissionsManager.requestLocationPermission()}
        >
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Location is available and permission granted
  return (
    <View style={[styles.container, style]}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.getLocationButton} onPress={getCurrentLocation}>
          <Text style={styles.getLocationButtonText}>Get Current Location</Text>
        </TouchableOpacity>

        {watchPosition && (
          <TouchableOpacity
            style={[styles.watchButton, isWatching && styles.watchButtonActive]}
            onPress={isWatching ? stopWatchingLocation : startWatchingLocation}
          >
            <Text style={styles.watchButtonText}>
              {isWatching ? 'Stop Watching' : 'Start Watching'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {currentLocation && (
        <View style={styles.locationContainer}>
          <Text style={styles.locationTitle}>Current Location:</Text>
          <Text style={styles.locationText}>{formatLocation(currentLocation)}</Text>
          <Text style={styles.accuracyText}>
            Accuracy: {formatAccuracy(currentLocation.coords.accuracy || 0)} 
            ({currentLocation.coords.accuracy?.toFixed(1)}m)
          </Text>
          <Text style={styles.timestampText}>
            Updated: {new Date(currentLocation.timestamp).toLocaleTimeString()}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  getLocationButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    minWidth: 150,
    alignItems: 'center',
  },
  getLocationButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  watchButton: {
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 10,
    minWidth: 150,
    alignItems: 'center',
  },
  watchButtonActive: {
    backgroundColor: '#FF3B30',
  },
  watchButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  locationContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  locationTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  locationText: {
    fontSize: 16,
    fontFamily: 'monospace',
    textAlign: 'center',
    marginBottom: 10,
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 5,
  },
  accuracyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 5,
  },
  timestampText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  disabledText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
  loadingText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
  errorText: {
    color: '#ff4444',
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
  permissionButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    alignSelf: 'center',
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
