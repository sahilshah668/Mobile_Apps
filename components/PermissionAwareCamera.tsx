import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Camera, CameraType } from 'expo-camera';
import { FeatureManager } from '../services/featureManager';
import { PermissionsManager } from '../services/permissionsManager';

interface PermissionAwareCameraProps {
  onPhotoTaken?: (uri: string) => void;
  onError?: (error: string) => void;
  style?: any;
}

export const PermissionAwareCamera: React.FC<PermissionAwareCameraProps> = ({
  onPhotoTaken,
  onError,
  style
}) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [camera, setCamera] = useState<Camera | null>(null);
  const [type, setType] = useState(CameraType.back);

  useEffect(() => {
    // Check if camera feature is enabled
    if (!FeatureManager.isCameraEnabled()) {
      console.log('📷 Camera feature not enabled');
      onError?.('Camera feature is not enabled for this app');
      return;
    }

    // Request camera permission
    (async () => {
      const permission = await PermissionsManager.requestCameraPermission();
      setHasPermission(permission);
      
      if (!permission) {
        onError?.('Camera permission denied');
      }
    })();
  }, []);

  const takePicture = async () => {
    if (!camera) return;

    try {
      const photo = await camera.takePictureAsync();
      onPhotoTaken?.(photo.uri);
    } catch (error) {
      console.error('Error taking picture:', error);
      onError?.('Failed to take picture');
    }
  };

  const flipCamera = () => {
    setType(current => (current === CameraType.back ? CameraType.front : CameraType.back));
  };

  // If camera feature is not enabled, show disabled message
  if (!FeatureManager.isCameraEnabled()) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.disabledText}>Camera feature is not available</Text>
      </View>
    );
  }

  // If permission is still being checked
  if (hasPermission === null) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.loadingText}>Requesting camera permission...</Text>
      </View>
    );
  }

  // If permission is denied
  if (hasPermission === false) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.errorText}>No access to camera</Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={() => PermissionsManager.requestCameraPermission()}
        >
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Camera is available and permission granted
  return (
    <View style={[styles.container, style]}>
      <Camera
        style={styles.camera}
        type={type}
        ref={ref => setCamera(ref)}
      >
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.flipButton} onPress={flipCamera}>
            <Text style={styles.flipText}>Flip Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>
        </View>
      </Camera>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    marginBottom: 40,
  },
  flipButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 15,
    borderRadius: 10,
  },
  flipText: {
    fontSize: 16,
    color: 'white',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
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
