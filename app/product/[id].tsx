import theme from '@/constants/theme';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useAuth } from '@/hooks/useAuth';
import { addToCart, addToWishlist } from '@/store/cartSlice';
import { fetchProductDetails } from '@/store/productSlice';
import { RootState } from '@/store/store';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSelector } from 'react-redux';

import ReviewForm from '@/components/ReviewForm';
import SizeChart from '@/components/SizeChart';
import { IconSymbol } from '@/components/ui/IconSymbol';

const { height } = Dimensions.get('window');

const ProductDetailScreen: React.FC = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { requireAuth } = useAuth();
  const selectedProduct = useSelector((state: RootState) => state.products.selectedProduct);
  
  // Use static theme and features
  const hasReviews = true;
  const hasWishlist = true;
  const hasSocialSharing = false;
  
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  
  const cartAnimation = useRef(new Animated.Value(0)).current;
  const wishlistAnimation = useRef(new Animated.Value(0)).current;

  // Use selectedProduct from Redux or fallback to mock data
  const product = selectedProduct || {
    id: id || '1',
    name: 'Premium Leather Handbag',
    price: 89,
    originalPrice: 120,
    discount: 25,
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=400&h=400&fit=crop',
    ],
    category: 'Bags',
    brand: 'Luxury Brand',
    rating: 4.8,
    reviews: 124,
    isNew: true,
    inStock: true,
    description: 'This premium leather handbag combines timeless elegance with modern functionality. Crafted from the finest Italian leather, it features a spacious interior with multiple compartments, perfect for organizing your essentials. The adjustable shoulder strap and top handles offer versatile carrying options.',
    sizes: ['Small', 'Medium', 'Large'],
    colors: ['Black', 'Brown', 'Tan'],
    productReviews: [
      {
        id: '1',
        userName: 'Sarah Johnson',
        rating: 5,
        date: '2024-01-15',
        comment: 'Absolutely love this bag! The quality is exceptional and it goes with everything. Highly recommend!',
        userAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=50&h=50&fit=crop&crop=face',
      },
      {
        id: '2',
        userName: 'Michael Chen',
        rating: 4,
        date: '2024-01-10',
        comment: 'Great quality leather and perfect size. The only minor issue is the strap could be a bit longer.',
        userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face',
      },
      {
        id: '3',
        userName: 'Emma Davis',
        rating: 5,
        date: '2024-01-05',
        comment: 'This bag exceeded my expectations. The craftsmanship is amazing and it looks even better in person.',
        userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face',
      },
    ],
  };

  useEffect(() => {
    if (id) {
      // Fetch product details from backend
      dispatch(fetchProductDetails(id));
    }
  }, [id, dispatch]);

  const handleBackPress = () => {
    router.back();
  };

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

  const handleAddToCart = async () => {
    try {
      console.log('Add to Cart clicked');
      console.log('Selected size:', selectedSize);
      console.log('Selected color:', selectedColor);
      console.log('Quantity:', quantity);
      
      if (product.sizes && product.sizes.length > 0 && !selectedSize) {
        Alert.alert('Size Required', 'Please select a size before adding to cart.');
        return;
      }
      
      if (product.colors && product.colors.length > 0 && !selectedColor) {
        Alert.alert('Color Required', 'Please select a color before adding to cart.');
        return;
      }

      setIsAddingToCart(true);
      console.log('About to check authentication...');

      if (requireAuth('add to cart')) {
        console.log('Authentication passed, dispatching addToCart...');
        dispatch(addToCart({ 
          product, 
          quantity, 
          color: selectedColor, 
          size: selectedSize 
        }));
        setIsInCart(true);
        shakeAnimation(cartAnimation);
        
        // Show success feedback
        Alert.alert(
          'Added to Cart!',
          `${product.name} has been added to your cart.`,
          [
            { text: 'Continue Shopping', style: 'default' },
            { text: 'View Cart', style: 'default', onPress: () => router.push('/(tabs)/cart') }
          ]
        );
      } else {
        console.log('Authentication failed, user redirected to login');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', 'Failed to add item to cart. Please try again.');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    try {
      console.log('Buy Now clicked');
      console.log('Selected size:', selectedSize);
      console.log('Selected color:', selectedColor);
      console.log('Quantity:', quantity);
      
      if (product.sizes && product.sizes.length > 0 && !selectedSize) {
        Alert.alert('Size Required', 'Please select a size before purchasing.');
        return;
      }
      
      if (product.colors && product.colors.length > 0 && !selectedColor) {
        Alert.alert('Color Required', 'Please select a color before purchasing.');
        return;
      }

      setIsBuyingNow(true);
      console.log('About to check authentication for purchase...');

      if (requireAuth('purchase this item')) {
        console.log('Authentication passed, adding to cart and navigating to checkout...');
        // Add to cart first
        dispatch(addToCart({ 
          product, 
          quantity, 
          color: selectedColor, 
          size: selectedSize 
        }));
        
        // Navigate to checkout
        router.push('/checkout');
      } else {
        console.log('Authentication failed for purchase, user redirected to login');
      }
    } catch (error) {
      console.error('Error buying now:', error);
      Alert.alert('Error', 'Failed to process purchase. Please try again.');
    } finally {
      setIsBuyingNow(false);
    }
  };

  const handleAddToWishlist = () => {
    if (requireAuth('add to wishlist')) {
      dispatch(addToWishlist({ 
        product, 
        size: selectedSize, 
        color: selectedColor 
      }));
      setIsInWishlist(true);
      shakeAnimation(wishlistAnimation);
    }
  };

  const handleShare = () => {
    // TODO: Implement share functionality
    console.log('Sharing product:', product.id);
  };

  const handleViewAllReviews = () => {
    router.push(`/product-reviews/${product.id}`);
  };

  const handleWriteReview = () => {
    if (requireAuth('write a review')) {
      setShowReviewForm(true);
    }
  };

  const handleSizeChartPress = () => {
    setShowSizeChart(true);
  };

  const handleImagePress = (index: number) => {
    setSelectedImageIndex(index);
  };

  const handleSizePress = (size: string) => {
    setSelectedSize(size);
  };

  const handleColorPress = (color: string) => {
    setSelectedColor(color);
  };

  const handleQuantityChange = (increment: boolean) => {
    if (increment) {
      setQuantity(prev => Math.min(prev + 1, 10));
    } else {
      setQuantity(prev => Math.max(prev - 1, 1));
    }
  };

  const renderImageGallery = () => (
    <View style={styles.imageGalleryContainer}>
      <View style={styles.mainImageContainer}>
        <Image 
          source={{ uri: product.images?.[selectedImageIndex] || product.image }} 
          style={styles.mainImage} 
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', 'transparent']}
          style={styles.imageOverlay}
        />
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <BlurView intensity={20} style={styles.backButtonBlur}>
            <IconSymbol name="arrow-back" size={20} color="white" />
          </BlurView>
        </TouchableOpacity>
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={handleAddToWishlist}>
            <BlurView intensity={20} style={styles.actionButtonBlur}>
              <IconSymbol name="heart" size={20} color="white" />
            </BlurView>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <BlurView intensity={20} style={styles.actionButtonBlur}>
              <IconSymbol name="share" size={20} color="white" />
            </BlurView>
          </TouchableOpacity>
        </View>
      </View>
      
      {product.images && product.images.length > 1 && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.thumbnailContainer}
        >
          {product.images.map((image, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.thumbnail,
                selectedImageIndex === index && styles.thumbnailActive
              ]}
              onPress={() => handleImagePress(index)}
            >
              <Image source={{ uri: image }} style={styles.thumbnailImage} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );

  const renderProductInfo = () => (
    <View style={styles.productInfoContainer}>
      <View style={styles.productHeader}>
        <View style={styles.brandContainer}>
          <Text style={styles.brand}>{product.brand}</Text>
          <View style={styles.ratingContainer}>
            <IconSymbol name="star" size={16} color="#FFD700" />
            <Text style={styles.rating}>{product.rating}</Text>
            <Text style={styles.reviews}>({product.reviews} reviews)</Text>
          </View>
        </View>
        {product.isNew && (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>NEW</Text>
          </View>
        )}
      </View>

      <Text style={styles.productName}>{product.name}</Text>
      
      <View style={styles.priceContainer}>
        <Text style={styles.currentPrice}>${product.price}</Text>
        {product.originalPrice && product.originalPrice > product.price && (
          <Text style={styles.originalPrice}>${product.originalPrice}</Text>
        )}
        {product.discount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{product.discount}%</Text>
          </View>
        )}
      </View>

      <Text style={styles.description}>{product.description}</Text>

      {/* Size Selection */}
      {product.sizes && product.sizes.length > 0 && (
        <View style={styles.optionContainer}>
          <View style={styles.optionHeader}>
            <Text style={styles.optionTitle}>Size</Text>
            <TouchableOpacity style={styles.sizeChartButton} onPress={handleSizeChartPress}>
                              <IconSymbol name="options" size={16} color={theme.colors.primary} />
              <Text style={styles.sizeChartText}>Size Chart</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.optionsRow}>
            {product.sizes.map((size) => (
              <TouchableOpacity
                key={size}
                style={[
                  styles.optionButton,
                  selectedSize === size && styles.optionButtonActive
                ]}
                onPress={() => handleSizePress(size)}
              >
                <Text style={[
                  styles.optionButtonText,
                  selectedSize === size && styles.optionButtonTextActive
                ]}>
                  {size}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {!selectedSize && (
            <Text style={styles.optionHelper}>Please select a size</Text>
          )}
        </View>
      )}

      {/* Color Selection */}
      {product.colors && product.colors.length > 0 && (
        <View style={styles.optionContainer}>
          <Text style={styles.optionTitle}>Color</Text>
          <View style={styles.optionsRow}>
            {product.colors.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.optionButton,
                  selectedColor === color && styles.optionButtonActive
                ]}
                onPress={() => handleColorPress(color)}
              >
                <Text style={[
                  styles.optionButtonText,
                  selectedColor === color && styles.optionButtonTextActive
                ]}>
                  {color}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {!selectedColor && (
            <Text style={styles.optionHelper}>Please select a color</Text>
          )}
        </View>
      )}

      <View style={styles.quantityContainer}>
        <Text style={styles.optionTitle}>Quantity</Text>
        <View style={styles.quantitySelector}>
          <TouchableOpacity 
            style={styles.quantityButton} 
            onPress={() => handleQuantityChange(false)}
          >
            <IconSymbol name="remove" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{quantity}</Text>
          <TouchableOpacity 
            style={styles.quantityButton} 
            onPress={() => handleQuantityChange(true)}
          >
            <IconSymbol name="add" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Reviews Section */}
      <View style={styles.reviewsContainer}>
        <View style={styles.reviewsHeader}>
          <Text style={styles.optionTitle}>Customer Reviews</Text>
          <View style={styles.reviewsActions}>
            <TouchableOpacity style={styles.writeReviewButton} onPress={handleWriteReview}>
              <Text style={styles.writeReviewText}>Write Review</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.viewAllReviewsButton} onPress={handleViewAllReviews}>
              <Text style={styles.viewAllReviewsText}>View All</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.ratingSummary}>
          <View style={styles.ratingDisplay}>
            <Text style={styles.ratingNumber}>{product.rating}</Text>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <IconSymbol
                  key={star}
                  name={star <= Math.floor(product.rating) ? 'star' : 'star-outline'}
                  size={16}
                  color={star <= product.rating ? '#FFD700' : '#E0E0E0'}
                />
              ))}
            </View>
            <Text style={styles.reviewsCount}>({product.reviews} reviews)</Text>
          </View>
        </View>

        {product.productReviews && product.productReviews.slice(0, 2).map((review) => (
          <View key={review.id} style={styles.reviewItem}>
            <View style={styles.reviewHeader}>
              <Image source={{ uri: review.userAvatar }} style={styles.reviewerAvatar} />
              <View style={styles.reviewerInfo}>
                <Text style={styles.reviewerName}>{review.userName}</Text>
                <View style={styles.reviewRating}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <IconSymbol
                      key={star}
                      name={star <= review.rating ? 'star' : 'star-outline'}
                      size={12}
                      color={star <= review.rating ? '#FFD700' : '#E0E0E0'}
                    />
                  ))}
                </View>
              </View>
              <Text style={styles.reviewDate}>
                {new Date(review.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </Text>
            </View>
            <Text style={styles.reviewComment}>{review.comment}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderActionButtons = () => (
    <View style={styles.actionButtonsContainer}>
      <TouchableOpacity 
        style={[styles.addToCartButton, isAddingToCart && styles.buttonDisabled]} 
        onPress={handleAddToCart}
        disabled={isAddingToCart || isBuyingNow}
      >
        <LinearGradient
          colors={[theme.colors.primary, '#0056CC']}
          style={styles.addToCartGradient}
        >
          <IconSymbol name="cart" size={20} color="white" />
          <Text style={styles.addToCartText}>
            {isAddingToCart ? 'Adding...' : 'Add to Cart'}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.buyNowButton, isBuyingNow && styles.buttonDisabled]} 
        onPress={handleBuyNow}
        disabled={isAddingToCart || isBuyingNow}
      >
        <LinearGradient
          colors={['#FF6B6B', '#FF5252']}
          style={styles.buyNowGradient}
        >
          <Text style={styles.buyNowText}>
            {isBuyingNow ? 'Processing...' : 'Buy Now'}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderImageGallery()}
        {renderProductInfo()}
      </ScrollView>

      {renderActionButtons()}

      {hasReviews && (
        <ReviewForm
          productId={selectedProduct?.id || product.id}
          productName={selectedProduct?.name || product.name}
          visible={showReviewForm}
          onClose={() => setShowReviewForm(false)}
        />
      )}

      <SizeChart
        visible={showSizeChart}
        onClose={() => setShowSizeChart(false)}
        category={selectedProduct?.category || product.category}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  imageGalleryContainer: {
    marginBottom: theme.spacing.lg,
  },
  mainImageContainer: {
    position: 'relative',
    height: height * 0.5,
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  backButtonBlur: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtons: {
    position: 'absolute',
    top: 50,
    right: 20,
    gap: theme.spacing.sm,
  },
  actionButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  actionButtonBlur: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: theme.spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  thumbnailActive: {
    borderColor: theme.colors.primary,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  productInfoContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: 100,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  brandContainer: {
    flex: 1,
  },
  brand: {
    fontSize: 16,
    color: theme.colors.subtitle,
    fontWeight: '600',
    fontFamily: theme.fonts.bold,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '600',
    fontFamily: theme.fonts.bold,
  },
  reviews: {
    fontSize: 14,
    color: theme.colors.subtitle,
    fontFamily: theme.fonts.regular,
  },
  newBadge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: 12,
  },
  newBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: theme.fonts.bold,
  },
  productName: {
    fontSize: 24,
    color: theme.colors.text,
    fontWeight: 'bold',
    marginBottom: theme.spacing.sm,
    fontFamily: theme.fonts.bold,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  currentPrice: {
    fontSize: 24,
    color: theme.colors.text,
    fontWeight: 'bold',
    fontFamily: theme.fonts.bold,
  },
  originalPrice: {
    fontSize: 18,
    color: theme.colors.subtitle,
    textDecorationLine: 'line-through',
    fontFamily: theme.fonts.regular,
  },
  discountBadge: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: 12,
  },
  discountText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: theme.fonts.bold,
  },
  description: {
    fontSize: 16,
    color: theme.colors.text,
    lineHeight: 24,
    marginBottom: theme.spacing.lg,
    fontFamily: theme.fonts.regular,
  },
  optionContainer: {
    marginBottom: theme.spacing.lg,
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  optionTitle: {
    fontSize: 18,
    color: theme.colors.text,
    fontWeight: '600',
    fontFamily: theme.fonts.bold,
  },
  sizeChartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    backgroundColor: 'rgba(21, 107, 255, 0.1)',
    borderRadius: 16,
    gap: 4,
  },
  sizeChartText: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '600',
    fontFamily: theme.fonts.bold,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(21, 107, 255, 0.2)',
    backgroundColor: 'rgba(21, 107, 255, 0.05)',
  },
  optionButtonActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  optionButtonText: {
    fontSize: 14,
    color: theme.colors.subtitle,
    fontWeight: '600',
    fontFamily: theme.fonts.bold,
  },
  optionButtonTextActive: {
    color: 'white',
  },
  optionHelper: {
    fontSize: 12,
    color: theme.colors.subtitle,
    fontStyle: 'italic',
    marginTop: theme.spacing.xs,
    fontFamily: theme.fonts.regular,
  },
  quantityContainer: {
    marginBottom: theme.spacing.lg,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(21, 107, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 18,
    color: theme.colors.text,
    fontWeight: '600',
    fontFamily: theme.fonts.bold,
    minWidth: 30,
    textAlign: 'center',
  },
  reviewsContainer: {
    marginBottom: theme.spacing.lg,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  reviewsActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  writeReviewButton: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
  },
  writeReviewText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: theme.fonts.bold,
  },
  viewAllReviewsButton: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  viewAllReviewsText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: theme.fonts.bold,
  },
  ratingSummary: {
    marginBottom: theme.spacing.lg,
  },
  ratingDisplay: {
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    backgroundColor: 'rgba(21, 107, 255, 0.05)',
    borderRadius: 12,
  },
  ratingNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.primary,
    fontFamily: theme.fonts.bold,
    marginBottom: theme.spacing.xs,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: theme.spacing.xs,
  },
  reviewsCount: {
    fontSize: 14,
    color: theme.colors.subtitle,
    fontFamily: theme.fonts.regular,
  },
  reviewItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: theme.spacing.sm,
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
    marginBottom: 2,
  },
  reviewRating: {
    flexDirection: 'row',
  },
  reviewDate: {
    fontSize: 12,
    color: theme.colors.subtitle,
    fontFamily: theme.fonts.regular,
  },
  reviewComment: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
    fontFamily: theme.fonts.regular,
  },
  actionButtonsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  addToCartButton: {
    flex: 1,
    borderRadius: 25,
    overflow: 'hidden',
  },
  addToCartGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: theme.spacing.sm,
  },
  addToCartText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
    fontFamily: theme.fonts.bold,
  },
  buyNowButton: {
    flex: 1,
    borderRadius: 25,
    overflow: 'hidden',
  },
  buyNowGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  buyNowText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
    fontFamily: theme.fonts.bold,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});

export default ProductDetailScreen; 