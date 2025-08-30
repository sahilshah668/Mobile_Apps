import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { FeatureManager } from '../services/featureManager';
import { PermissionsManager } from '../services/permissionsManager';

interface PermissionAwarePhotoPickerProps {
  onPhotoSelected?: (uri: string) => void;
  onError?: (error: string) => void;
  style?: any;
  multiple?: boolean;
  aspect?: [number, number];
  quality?: number;
}

export const PermissionAwarePhotoPicker: React.FC<PermissionAwarePhotoPickerProps> = ({
  onPhotoSelected,
  onError,
  style,
  multiple = false,
  aspect = [4, 3],
  quality = 0.8
}) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    // Check if photos feature is enabled
    if (!FeatureManager.isPhotosEnabled()) {
      console.log('🖼️ Photos feature not enabled');
      onError?.('Photos feature is not enabled for this app');
      return;
    }

    // Request photos permission
    (async () => {
      const permission = await PermissionsManager.requestPhotosPermission();
      setHasPermission(permission);
      
      if (!permission) {
        onError?.('Photos permission denied');
      }
    })();
  }, []);

  const pickImage = async () => {
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Please grant photos permission to select images.');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: !multiple,
        aspect: multiple ? undefined : aspect,
        quality: quality,
        allowsMultipleSelection: multiple,
      });

      if (!result.canceled) {
        if (multiple && result.assets && result.assets.length > 0) {
          // Handle multiple images
          const uris = result.assets.map(asset => asset.uri);
          console.log('Selected multiple images:', uris);
          // For now, just use the first image
          const firstUri = uris[0];
          setSelectedImage(firstUri);
          onPhotoSelected?.(firstUri);
        } else if (!multiple && result.assets && result.assets.length > 0) {
          // Handle single image
          const uri = result.assets[0].uri;
          setSelectedImage(uri);
          onPhotoSelected?.(uri);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      onError?.('Failed to pick image');
    }
  };

  const takePhoto = async () => {
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Please grant camera permission to take photos.');
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: aspect,
        quality: quality,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setSelectedImage(uri);
        onPhotoSelected?.(uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      onError?.('Failed to take photo');
    }
  };

  const clearSelection = () => {
    setSelectedImage(null);
  };

  // If photos feature is not enabled, show disabled message
  if (!FeatureManager.isPhotosEnabled()) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.disabledText}>Photos feature is not available</Text>
      </View>
    );
  }

  // If permission is still being checked
  if (hasPermission === null) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.loadingText}>Requesting photos permission...</Text>
      </View>
    );
  }

  // If permission is denied
  if (hasPermission === false) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.errorText}>No access to photos</Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={() => PermissionsManager.requestPhotosPermission()}
        >
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Photos are available and permission granted
  return (
    <View style={[styles.container, style]}>
      {selectedImage ? (
        <View style={styles.imageContainer}>
          <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
          <TouchableOpacity style={styles.clearButton} onPress={clearSelection}>
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.pickButton} onPress={pickImage}>
            <Text style={styles.pickButtonText}>
              {multiple ? 'Pick Images' : 'Pick Image'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cameraButton} onPress={takePhoto}>
            <Text style={styles.cameraButtonText}>Take Photo</Text>
          </TouchableOpacity>
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  pickButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    minWidth: 150,
    alignItems: 'center',
  },
  pickButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cameraButton: {
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 10,
    minWidth: 150,
    alignItems: 'center',
  },
  cameraButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  imageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedImage: {
    width: 300,
    height: 300,
    borderRadius: 10,
    marginBottom: 20,
  },
  clearButton: {
    backgroundColor: '#FF3B30',
    padding: 10,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  clearButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
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
