import { IconSymbol } from '@/components/ui/IconSymbol';
import theme from '@/constants/theme';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

// Responsive values
const isSmallScreen = width < 375;
const searchBarHeight = isSmallScreen ? 44 : 48;
const searchBarFontSize = isSmallScreen ? 14 : Math.min(theme.fontSizes.subtitle, 16);

interface SearchBarProps {
  value?: string;
  onChangeText?: (text: string) => void;
  onCameraPress?: () => void;
  onSubmitEditing?: () => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  onCameraPress,
  onSubmitEditing,
  placeholder = 'Search for amazing products...',
}) => {
  const router = useRouter();

  const handleSearchPress = () => {
    router.push('/search');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.searchContainer} onPress={handleSearchPress}>
        <View style={styles.searchIconContainer}>
          <IconSymbol name="search" size={18} color="rgba(255, 255, 255, 0.7)" />
        </View>
        <Text style={styles.placeholderText}>{placeholder}</Text>
        <TouchableOpacity style={styles.cameraButton} onPress={onCameraPress}>
          <View style={styles.cameraIconContainer}>
            <IconSymbol name="camera" size={18} color="white" />
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: theme.spacing.lg,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    paddingHorizontal: isSmallScreen ? 12 : 16,
    height: searchBarHeight,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  searchIconContainer: {
    marginRight: isSmallScreen ? 8 : 12,
    width: 20,
    alignItems: 'center',
  },
  placeholderText: {
    flex: 1,
    fontSize: searchBarFontSize,
    color: 'rgba(255, 255, 255, 0.7)',
    fontFamily: theme.fonts.regular,
  },
  cameraButton: {
    marginLeft: isSmallScreen ? 8 : 12,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SearchBar; 