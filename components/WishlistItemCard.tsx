import theme from '@/constants/theme';
import { WishlistItem } from '@/store/cartSlice';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface WishlistItemCardProps {
  item: WishlistItem;
  onRemove: (id: string) => void;
  onAddToCart: (id: string) => void;
}

const WishlistItemCard: React.FC<WishlistItemCardProps> = ({
  item,
  onRemove,
  onAddToCart,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.product.image }} style={styles.image} />
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => onRemove(item.id)}
        >
          <Ionicons name="trash" size={16} color="#FF4444" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.productName} numberOfLines={2}>
          Lorem ipsum dolor sit amet consectetur.
        </Text>
        
        <Text style={styles.price}>
          ${item.product.price.toFixed(2).replace('.', ',')}
        </Text>
        
        <View style={styles.optionsRow}>
          <View style={styles.optionsContainer}>
            <TouchableOpacity style={styles.optionButton}>
              <Text style={styles.optionText}>{item.selectedColor || 'Pink'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionButton}>
              <Text style={styles.optionText}>{item.selectedSize || 'M'}</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            style={styles.addToCartButton}
            onPress={() => onAddToCart(item.id)}
          >
            <Ionicons name="bag-add" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
    marginRight: theme.spacing.md,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.sm,
  },
  removeButton: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 14,
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
    marginBottom: 8,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  optionButton: {
    backgroundColor: '#FFE5E5',
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  optionText: {
    fontSize: 12,
    color: '#FF6B6B',
    fontFamily: theme.fonts.regular,
  },
  addToCartButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
});

export default WishlistItemCard; 