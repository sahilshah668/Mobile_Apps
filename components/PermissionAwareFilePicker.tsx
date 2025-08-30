import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { FeatureManager } from '../services/featureManager';
import { PermissionsManager } from '../services/permissionsManager';

interface PermissionAwareFilePickerProps {
  onFileSelected?: (file: DocumentPicker.DocumentResult) => void;
  onError?: (error: string) => void;
  style?: any;
  multiple?: boolean;
  type?: string | string[];
}

export const PermissionAwareFilePicker: React.FC<PermissionAwareFilePickerProps> = ({
  onFileSelected,
  onError,
  style,
  multiple = false,
  type = '*/*'
}) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<DocumentPicker.DocumentResult[]>([]);

  useEffect(() => {
    // Check if files feature is enabled
    if (!FeatureManager.isFilesEnabled()) {
      console.log('📁 Files feature not enabled');
      onError?.('Files feature is not enabled for this app');
      return;
    }

    // Request files permission
    (async () => {
      const permission = await PermissionsManager.requestFilesPermission();
      setHasPermission(permission);
      
      if (!permission) {
        onError?.('Files permission denied');
      }
    })();
  }, []);

  const pickDocument = async () => {
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Please grant files permission to select documents.');
      return;
    }

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: type,
        multiple: multiple,
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        if (multiple && result.assets) {
          // Handle multiple files
          setSelectedFiles(result.assets);
          onFileSelected?.(result);
        } else if (!multiple && result.assets && result.assets.length > 0) {
          // Handle single file
          const file = result.assets[0];
          setSelectedFiles([file]);
          onFileSelected?.(result);
        }
      }
    } catch (error) {
      console.error('Error picking document:', error);
      onError?.('Failed to pick document');
    }
  };

  const clearSelection = () => {
    setSelectedFiles([]);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string): string => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎥';
    if (mimeType.startsWith('audio/')) return '🎵';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📈';
    if (mimeType.includes('zip') || mimeType.includes('rar')) return '📦';
    return '📄';
  };

  // If files feature is not enabled, show disabled message
  if (!FeatureManager.isFilesEnabled()) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.disabledText}>Files feature is not available</Text>
      </View>
    );
  }

  // If permission is still being checked
  if (hasPermission === null) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.loadingText}>Requesting files permission...</Text>
      </View>
    );
  }

  // If permission is denied
  if (hasPermission === false) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.errorText}>No access to files</Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={() => PermissionsManager.requestFilesPermission()}
        >
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Files are available and permission granted
  return (
    <View style={[styles.container, style]}>
      {selectedFiles.length > 0 ? (
        <View style={styles.filesContainer}>
          <Text style={styles.filesTitle}>
            Selected {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''}:
          </Text>
          <ScrollView style={styles.filesList}>
            {selectedFiles.map((file, index) => (
              <View key={index} style={styles.fileItem}>
                <Text style={styles.fileIcon}>
                  {getFileIcon(file.mimeType || 'application/octet-stream')}
                </Text>
                <View style={styles.fileInfo}>
                  <Text style={styles.fileName} numberOfLines={1}>
                    {file.name}
                  </Text>
                  <Text style={styles.fileSize}>
                    {formatFileSize(file.size || 0)}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.clearButton} onPress={clearSelection}>
            <Text style={styles.clearButtonText}>Clear Selection</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.pickButton} onPress={pickDocument}>
            <Text style={styles.pickButtonText}>
              {multiple ? 'Pick Files' : 'Pick File'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.helpText}>
            Select {multiple ? 'one or more files' : 'a file'} from your device
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    minWidth: 150,
    alignItems: 'center',
    marginBottom: 20,
  },
  pickButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  helpText: {
    color: '#666',
    textAlign: 'center',
    fontSize: 14,
  },
  filesContainer: {
    flex: 1,
  },
  filesTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
  },
  filesList: {
    flex: 1,
    marginBottom: 20,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  fileIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
  },
  fileSize: {
    fontSize: 14,
    color: '#666',
  },
  clearButton: {
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  clearButtonText: {
    color: 'white',
    fontSize: 16,
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
