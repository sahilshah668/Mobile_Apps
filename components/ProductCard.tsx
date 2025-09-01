import theme from '@/constants/theme';
import { getStatusColor, getShadowStyle, getBorderRadius, getSpacing } from '@/constants/themeUtils';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useAuth } from '@/hooks/useAuth';
import { addToCart, addToWishlist } from '@/store/cartSlice';
import { Product } from '@/store/productSlice';
import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import { Animated, Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

interface ProductCardProps {
  product: Product;
  onPress?: () => void;
  size?: 'small' | 'medium' | 'large';
  showBadge?: boolean;
  showAddToCart?: boolean;
  variant?: 'default' | 'circular' | 'flashSale' | 'justForYou';
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
  size = 'medium',
  showBadge = true,
  showAddToCart = false,
  variant = 'default',
}) => {
  const { requireAuth } = useAuth();
  const dispatch = useAppDispatch();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const wishlistAnimation = useRef(new Animated.Value(0)).current;
  const cartAnimation = useRef(new Animated.Value(0)).current;

  const getCardSize = () => {
    switch (size) {
      case 'small':
        return { width: width * 0.4, height: 180 };
      case 'large':
        return { width: width * 0.45, height: 220 };
      default:
        return { width: width * 0.42, height: 200 };
    }
  };

  const cardSize = getCardSize();

  const shakeAnimation = (animationRef: Animated.Value) => {
    Animated.sequence([
      Animated.timing(animationRef, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(animationRef, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(animationRef, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(animationRef, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleAddToCart = () => {
    if (requireAuth('add to cart')) {
      dispatch(addToCart({ product, quantity: 1 }));
      setIsInCart(true);
      shakeAnimation(cartAnimation);
    }
  };

  const handleAddToWishlist = () => {
    if (requireAuth('add to wishlist')) {
      dispatch(addToWishlist({ product }));
      setIsInWishlist(true);
      shakeAnimation(wishlistAnimation);
    }
  };

  const renderBadge = () => {
    if (!showBadge) return null;

    let badgeText = '';
    let badgeColor = theme.colors.primary;

    if (variant === 'flashSale') {
      badgeText = '-20%';
      badgeColor = theme.colors.discount;
    } else if (product.isNew) {
      badgeText = 'New';
      badgeColor = theme.colors.success;
    } else if (product.isSale) {
      badgeText = 'Sale';
      badgeColor = theme.colors.accent;
    } else if (product.isHot) {
      badgeText = 'Hot';
      badgeColor = theme.colors.warning;
    }

    if (!badgeText) return null;

    return (
      <View style={[styles.badge, { backgroundColor: badgeColor }]}>
        <Text style={styles.badgeText}>{badgeText}</Text>
      </View>
    );
  };

  const renderPrice = () => {
    if (product.originalPrice && product.price < product.originalPrice) {
      return (
        <View style={styles.priceContainer}>
          <Text style={styles.currentPrice}>${product.price}</Text>
          <Text style={styles.originalPrice}>${product.originalPrice}</Text>
        </View>
      );
    }

    return (
      <Text style={styles.price}>${product.price}</Text>
    );
  };

  // Flash Sale variant - matches screenshot design
  if (variant === 'flashSale') {
    return (
      <TouchableOpacity
        style={styles.flashSaleContainer}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <View style={styles.flashSaleImageContainer}>
          <Image source={{ uri: product.image }} style={styles.flashSaleImage} />
          {renderBadge()}
        </View>
        <View style={styles.flashSaleContent}>
          <Text style={styles.flashSaleName} numberOfLines={2}>{product.name}</Text>
          <View style={styles.flashSalePriceContainer}>
            <Text style={styles.flashSaleCurrentPrice}>${product.price}</Text>
            <Text style={styles.flashSaleOriginalPrice}>${Math.round(product.price * 1.8)}</Text>
          </View>
          <Animated.View
            style={{ transform: [{ translateX: cartAnimation }] }}
          >
            <TouchableOpacity
              style={[
                styles.flashSaleAddButton,
                isInCart && styles.flashSaleAddButtonActive
              ]}
              onPress={(e) => {
                e.stopPropagation();
                handleAddToCart();
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.flashSaleAddText}>
                {isInCart ? 'Added!' : 'Add to Cart'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </TouchableOpacity>
    );
  }

  // Just For You variant - horizontal layout
  if (variant === 'justForYou') {
    return (
      <TouchableOpacity
        style={styles.justForYouContainer}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <View style={styles.justForYouHorizontalLayout}>
          <View style={styles.justForYouImageContainer}>
            <Image source={{ uri: product.image }} style={styles.justForYouImage} />
          </View>
          <View style={styles.justForYouContent}>
            <Text style={styles.justForYouName} numberOfLines={2}>{product.name}</Text>
            <Text style={styles.justForYouPrice}>${product.price.toFixed(2).replace('.', ',')}</Text>
            <Animated.View
              style={{ transform: [{ translateX: cartAnimation }] }}
            >
              <TouchableOpacity
                style={[
                  styles.justForYouAddButton,
                  isInCart && styles.justForYouAddButtonActive
                ]}
                onPress={(e) => {
                  e.stopPropagation();
                  handleAddToCart();
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.justForYouAddText}>
                  {isInCart ? 'Added!' : 'Add to Cart'}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // Circular variant for Top Products section
  if (variant === 'circular') {
    return (
      <TouchableOpacity
        style={[styles.circularContainer, { width: 80, height: 80 }]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Image source={{ uri: product.image }} style={styles.circularImage} />
        {renderBadge()}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.container, { width: cardSize.width, height: cardSize.height }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: product.image }} style={styles.image} />
        {renderBadge()}
        <Animated.View
          style={[
            styles.wishlistButton,
            { transform: [{ translateX: wishlistAnimation }] }
          ]}
        >
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              handleAddToWishlist();
            }}
            activeOpacity={0.8}
          >
            <Ionicons 
              name={isInWishlist ? "heart" : "heart-outline"} 
              size={20} 
              color={isInWishlist ? "#FF4444" : "#FF4444"} 
            />
          </TouchableOpacity>
        </Animated.View>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        {renderPrice()}
        
        {product.likes && (
          <View style={styles.likesContainer}>
            <Text style={styles.likes}>{product.likes}❤️</Text>
            {product.isHot && <Text style={styles.status}>Hot</Text>}
            {product.isSale && <Text style={styles.status}>Sale</Text>}
            {product.isNew && <Text style={styles.status}>New</Text>}
          </View>
        )}

        {showAddToCart && (
          <Animated.View
            style={{ transform: [{ translateX: cartAnimation }] }}
          >
            <TouchableOpacity
              style={[
                styles.addToCartButton,
                isInCart && styles.addToCartButtonActive
              ]}
              onPress={(e) => {
                e.stopPropagation();
                handleAddToCart();
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.addToCartText}>
                {isInCart ? 'Added!' : 'Add to Cart'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    marginHorizontal: theme.spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  circularContainer: {
    borderRadius: 40,
    marginHorizontal: theme.spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  circularImage: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  flashSaleContainer: {
    width: 160,
    backgroundColor: 'white',
    borderRadius: 16,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  flashSaleImageContainer: {
    position: 'relative',
    height: 120,
  },
  flashSaleImage: {
    width: '100%',
    height: '100%',
  },
  flashSaleContent: {
    padding: theme.spacing.sm,
  },
  flashSaleName: {
    fontSize: theme.fontSizes.subtitle - 2,
    color: theme.colors.text,
    fontWeight: '500',
    marginBottom: theme.spacing.xs,
    fontFamily: theme.fonts.regular,
    lineHeight: 18,
  },
  flashSalePriceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  flashSaleCurrentPrice: {
    fontSize: theme.fontSizes.subtitle,
    color: theme.colors.primary,
    fontWeight: 'bold',
    fontFamily: theme.fonts.bold,
  },
  flashSaleOriginalPrice: {
    fontSize: theme.fontSizes.subtitle - 2,
    color: theme.colors.subtitle,
    textDecorationLine: 'line-through',
    fontFamily: theme.fonts.regular,
  },
  flashSaleAddButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.sm,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    marginTop: theme.spacing.xs,
    alignItems: 'center',
  },
  flashSaleAddText: {
    color: theme.colors.buttonText,
    fontSize: theme.fontSizes.link - 1,
    fontWeight: '600',
    fontFamily: theme.fonts.bold,
  },
  justForYouContainer: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  justForYouHorizontalLayout: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.sm,
  },
  justForYouImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: theme.spacing.sm,
  },
  justForYouImage: {
    width: '100%',
    height: '100%',
  },
  justForYouContent: {
    flex: 1,
  },
  justForYouName: {
    fontSize: 13,
    color: theme.colors.text,
    fontWeight: '500',
    marginBottom: 6,
    fontFamily: theme.fonts.regular,
    lineHeight: 16,
  },
  justForYouPrice: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: theme.fonts.bold,
  },
  justForYouAddButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 36,
  },
  justForYouAddText: {
    color: theme.colors.buttonText,
    fontSize: 12,
    fontWeight: '600',
    fontFamily: theme.fonts.bold,
    textAlign: 'center',
  },
  imageContainer: {
    position: 'relative',
    flex: 1,
  },
  image: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: theme.borderRadius.md,
    borderTopRightRadius: theme.borderRadius.md,
  },
  content: {
    padding: theme.spacing.sm,
    minHeight: 80,
  },
  name: {
    fontSize: theme.fontSizes.subtitle - 2,
    color: theme.colors.text,
    fontWeight: '500',
    marginBottom: theme.spacing.xs,
    fontFamily: theme.fonts.regular,
    lineHeight: 18,
  },
  price: {
    fontSize: theme.fontSizes.subtitle,
    color: theme.colors.primary,
    fontWeight: 'bold',
    fontFamily: theme.fonts.bold,
    marginBottom: theme.spacing.xs,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  currentPrice: {
    fontSize: theme.fontSizes.subtitle,
    color: theme.colors.primary,
    fontWeight: 'bold',
    fontFamily: theme.fonts.bold,
  },
  originalPrice: {
    fontSize: theme.fontSizes.subtitle - 2,
    color: theme.colors.subtitle,
    textDecorationLine: 'line-through',
    fontFamily: theme.fonts.regular,
  },
  likesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.xs,
  },
  likes: {
    fontSize: theme.fontSizes.link,
    color: theme.colors.subtitle,
    fontFamily: theme.fonts.regular,
  },
  status: {
    fontSize: theme.fontSizes.link - 1,
    color: theme.colors.primary,
    fontWeight: '500',
    fontFamily: theme.fonts.bold,
  },
  addToCartButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.sm,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    marginTop: theme.spacing.xs,
    alignItems: 'center',
  },
  addToCartText: {
    color: theme.colors.buttonText,
    fontSize: theme.fontSizes.link - 1,
    fontWeight: '600',
    fontFamily: theme.fonts.bold,
  },

  badge: {
    position: 'absolute',
    top: theme.spacing.xs,
    right: theme.spacing.xs,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  badgeText: {
    color: theme.colors.buttonText,
    fontSize: theme.fontSizes.link - 2,
    fontWeight: 'bold',
    fontFamily: theme.fonts.bold,
  },
  wishlistButton: {
    position: 'absolute',
    top: theme.spacing.xs,
    left: theme.spacing.xs,
    backgroundColor: theme.colors.background,
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  flashSaleAddButtonActive: {
    backgroundColor: '#2ECC71',
  },
  justForYouAddButtonActive: {
    backgroundColor: '#2ECC71',
  },
  addToCartButtonActive: {
    backgroundColor: '#2ECC71',
  },
});

export default ProductCard; 