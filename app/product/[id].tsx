import theme from '@/constants/theme';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useAuth } from '@/hooks/useAuth';
import { addToCart, addToWishlist, removeFromWishlist } from '@/store/cartSlice';
import { fetchProductDetails } from '@/store/productSlice';
import { 
  fetchProductReviews, 
  submitReview, 
  selectReviews, 
  selectReviewsLoading, 
  selectAverageRating,
  clearReviewError 
} from '@/store/reviewSlice';
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
    Share,
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
  const { selectedProduct, loading, error } = useSelector((state: RootState) => {
    try {
      return state.products || { selectedProduct: null, loading: false, error: null };
    } catch (err) {
      console.log('Error accessing products state:', err);
      return { selectedProduct: null, loading: false, error: null };
    }
  });
  
  const { wishlist } = useSelector((state: RootState) => state.cart);
  const reviews = useSelector((state: RootState) => selectReviews(state));
  const reviewsLoading = useSelector((state: RootState) => selectReviewsLoading(state));
  const averageRating = useSelector((state: RootState) => selectAverageRating(state, id || ''));
  
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

  useEffect(() => {
    console.log('Product detail screen mounted with ID:', id);
    if (id && typeof id === 'string') {
      console.log('Dispatching fetchProductDetails for ID:', id);
      dispatch(fetchProductDetails(id));
    }
  }, [id, dispatch]);

  useEffect(() => {
    // Temporarily simplified logging to debug crash issue
    console.log('Product detail state changed:', {
      loading,
      hasProduct: !!selectedProduct,
      error: typeof error === 'string' ? error : 'Unknown error',
      productId: selectedProduct?.id || 'No ID',
      productName: selectedProduct?.name || 'No Name',
    });
  }, [selectedProduct, loading, error]);

  // Check if product is in wishlist
  useEffect(() => {
    if (product && wishlist) {
      const isProductInWishlist = wishlist.some(item => 
        item.product.id === product.id && 
        item.selectedColor === selectedColor && 
        item.selectedSize === selectedSize
      );
      setIsInWishlist(isProductInWishlist);
    }
  }, [product, wishlist, selectedColor, selectedSize]);

  // Fetch reviews when product loads
  useEffect(() => {
    if (id) {
      dispatch(fetchProductReviews(id));
    }
  }, [id, dispatch]);

  // Use selectedProduct from Redux with defensive programming
  const product = selectedProduct && typeof selectedProduct === 'object' ? selectedProduct : null;
  
  console.log('Product data for variants:', {
    hasSizes: !!product?.sizes,
    sizesLength: product?.sizes?.length || 0,
    sizes: product?.sizes,
    hasColors: !!product?.colors,
    colorsLength: product?.colors?.length || 0,
    colors: product?.colors,
  });

  // Show loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingSpinner}>
          <IconSymbol name="search" size={40} color={theme.colors.primary} />
        </View>
        <Text style={styles.loadingText}>Loading product details...</Text>
      </View>
    );
  }

  // Show error state
  if (error || !product) {
    return (
      <View style={styles.errorContainer}>
        <IconSymbol name="error" size={48} color={theme.colors.subtitle} />
        <Text style={styles.errorText}>Failed to load product details</Text>
        {error && typeof error === 'string' && (
          <Text style={styles.errorDetails}>{error}</Text>
        )}
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={() => {
            if (id) {
              dispatch(fetchProductDetails(id));
            }
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
      
      if (product?.sizes && product?.sizes.length > 0 && !selectedSize) {
        Alert.alert('Size Required', 'Please select a size before adding to cart.');
        return;
      }
      
      if (product?.colors && product?.colors.length > 0 && !selectedColor) {
        Alert.alert('Color Required', 'Please select a color before adding to cart.');
        return;
      }

      setIsAddingToCart(true);
      console.log('About to check authentication...');

      if (requireAuth('add to cart')) {
        console.log('Authentication passed, dispatching addToCart...');
        if (product) {
        dispatch(addToCart({ 
          product, 
          quantity, 
          color: selectedColor, 
          size: selectedSize 
        }));
        }
        setIsInCart(true);
        shakeAnimation(cartAnimation);
        
        // Show success feedback
        Alert.alert(
          'Added to Cart!',
          `${product?.name || 'Product'} has been added to your cart.`,
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
      
      if (product?.sizes && product?.sizes.length > 0 && !selectedSize) {
        Alert.alert('Size Required', 'Please select a size before purchasing.');
        return;
      }
      
      if (product?.colors && product?.colors.length > 0 && !selectedColor) {
        Alert.alert('Color Required', 'Please select a color before purchasing.');
        return;
      }

      setIsBuyingNow(true);
      console.log('About to check authentication for purchase...');

      if (requireAuth('purchase this item')) {
        console.log('Authentication passed, adding to cart and navigating to checkout...');
        // Add to cart first
        if (product) {
        dispatch(addToCart({ 
          product, 
          quantity, 
          color: selectedColor, 
          size: selectedSize 
        }));
        }
        
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

  const handleToggleWishlist = () => {
    if (requireAuth('manage wishlist')) {
      if (product) {
        if (isInWishlist) {
          // Find the wishlist item to remove
          const wishlistItem = wishlist.find(item => 
            item.product.id === product.id && 
            item.selectedColor === selectedColor && 
            item.selectedSize === selectedSize
          );
          
          if (wishlistItem) {
            dispatch(removeFromWishlist(wishlistItem.id));
            setIsInWishlist(false);
          }
        } else {
          // Add to wishlist
      dispatch(addToWishlist({ 
        product, 
        size: selectedSize, 
        color: selectedColor 
      }));
      setIsInWishlist(true);
        }
      shakeAnimation(wishlistAnimation);
      }
    }
  };

  const handleShare = async () => {
    try {
      const shareMessage = `Check out this amazing product: ${product?.name}\n\nPrice: $${product?.price}\n\n${product?.description?.substring(0, 100)}...\n\nView it in our app!`;
      
      await Share.share({
        message: shareMessage,
        title: product?.name || 'Amazing Product',
      });
    } catch (error) {
      console.error('Error sharing product:', error);
      Alert.alert('Error', 'Failed to share product. Please try again.');
    }
  };

  const handleViewAllReviews = () => {
    router.push(`/product-reviews/${product?.id}`);
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
          source={{ uri: product?.images?.[selectedImageIndex] || product?.image || 'https://via.placeholder.com/400x400' }} 
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
          <TouchableOpacity style={styles.actionButton} onPress={handleToggleWishlist}>
            <BlurView intensity={20} style={styles.actionButtonBlur}>
              <IconSymbol 
                name="heart" 
                size={20} 
                color={isInWishlist ? "#FF4444" : "white"} 
              />
            </BlurView>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <BlurView intensity={20} style={styles.actionButtonBlur}>
              <IconSymbol name="share" size={20} color="white" />
            </BlurView>
          </TouchableOpacity>
        </View>
      </View>
      
      {product?.images && product.images.length > 1 && (
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
                  name={star <= Math.floor(product.rating || 0) ? 'star' : 'star-outline'}
                  size={16}
                  color={star <= (product.rating || 0) ? '#FFD700' : '#E0E0E0'}
                />
              ))}
            </View>
            <Text style={styles.reviewsCount}>({product.reviews} reviews)</Text>
          </View>
        </View>

        {/* Show placeholder reviews since productReviews is not in the Product interface */}
        <View style={styles.reviewItem}>
          <Text style={styles.reviewText}>No reviews yet. Be the first to review this product!</Text>
                </View>
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
      
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {renderImageGallery()}
        
        {/* Product Information */}
        <View style={styles.productInfoContainer}>
          {/* Product Name */}
          <Text style={styles.productName}>{product?.name || 'Product Name'}</Text>
          
          {/* Featured Badge */}
          {product?.isFeatured && (
            <View style={styles.featuredBadge}>
              <IconSymbol name="star" size={12} color="#FFD700" />
              <Text style={styles.featuredBadgeText}>Featured</Text>
            </View>
          )}
          
          {/* Price Section */}
          <View style={styles.priceContainer}>
            <Text style={styles.currentPrice}>${product?.price || 0}</Text>
            {product?.originalPrice && product?.originalPrice > (product?.price || 0) && (
              <Text style={styles.originalPrice}>${product?.originalPrice}</Text>
            )}
          </View>
          
          {/* Product Description */}
          <Text style={styles.description}>{product?.description || 'No description available'}</Text>

          {/* Product Tags */}
          {product?.tags && product?.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              <Text style={styles.tagsTitle}>Tags:</Text>
              <View style={styles.tagsRow}>
                {product?.tags?.map((tag, index) => (
                  <View key={index} style={styles.tagBadge}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Rating and Reviews */}
          <View style={styles.ratingContainer}>
            <View style={styles.ratingDisplay}>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <IconSymbol
                    key={star}
                    name={star <= averageRating ? 'star' : 'star-outline'}
                    size={16}
                    color={star <= averageRating ? '#FFD700' : '#E0E0E0'}
                  />
                ))}
              </View>
              <Text style={styles.ratingNumber}>{averageRating.toFixed(1)}</Text>
              <Text style={styles.reviewsCount}>({reviews.length} reviews)</Text>
            </View>
            <TouchableOpacity 
              style={styles.writeReviewButton}
              onPress={() => {
                if (requireAuth('write a review')) {
                  setShowReviewForm(true);
                }
              }}
            >
              <Text style={styles.writeReviewText}>Write Review</Text>
            </TouchableOpacity>
          </View>
          
          {/* Real Reviews */}
          <View style={styles.reviewsSection}>
            <Text style={styles.reviewsSectionTitle}>Customer Reviews</Text>
            {reviewsLoading ? (
              <View style={styles.reviewItem}>
                <Text style={styles.reviewComment}>Loading reviews...</Text>
              </View>
            ) : reviews.length > 0 ? (
              reviews.map((review) => (
                <View key={review.id} style={styles.reviewItem}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewStars}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <IconSymbol
                          key={star}
                          name={star <= review.rating ? 'star' : 'star-outline'}
                          size={12}
                          color={star <= review.rating ? '#FFD700' : '#E0E0E0'}
                        />
                      ))}
                    </View>
                    <Text style={styles.reviewAuthor}>{review.userName}</Text>
                    <Text style={styles.reviewDate}>
                      {new Date(review.date).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text style={styles.reviewComment}>
                    "{review.comment}"
                  </Text>
                </View>
              ))
            ) : (
              <View style={styles.reviewItem}>
                <Text style={styles.reviewComment}>No reviews yet. Be the first to review this product!</Text>
              </View>
            )}
          </View>

          {/* Quantity Selection */}
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

          {/* Return Policy */}
          {product?.returnable && (
            <View style={styles.returnPolicyContainer}>
              <IconSymbol name="checkmark" size={16} color={theme.colors.primary} />
              <Text style={styles.returnPolicyText}>
                Returnable within {product?.returnWindowDays || 14} days
              </Text>
            </View>
          )}

          {/* Size Selection */}
          {product?.sizes && product?.sizes.length > 0 && (
            <View style={styles.optionContainer}>
              <Text style={styles.optionTitle}>Size</Text>
              <View style={styles.optionsRow}>
                {product?.sizes?.map((size) => (
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
          {product?.colors && product?.colors.length > 0 && (
            <View style={styles.optionContainer}>
              <Text style={styles.optionTitle}>Color</Text>
              <View style={styles.optionsRow}>
                {product?.colors?.map((color) => (
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
        </View>
      </ScrollView>

      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity 
          style={styles.addToCartButton}
          onPress={handleAddToCart}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.link]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.addToCartGradient}
          >
            <IconSymbol name="shopping-cart" size={20} color="white" />
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.buyNowButton}
          onPress={handleBuyNow}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.buyNowGradient}
          >
            <IconSymbol name="cart" size={20} color="white" />
            <Text style={styles.buyNowText}>Buy Now</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

        <ReviewForm
        productId={product?.id || ''}
        productName={product?.name || ''}
          visible={showReviewForm}
          onClose={() => setShowReviewForm(false)}
        onSubmit={(reviewData) => {
          dispatch(submitReview({
            productId: product?.id || '',
            rating: reviewData.rating,
            comment: reviewData.comment,
          }));
          setShowReviewForm(false);
        }}
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  addToCartButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  addToCartGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  addToCartText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '700',
    fontFamily: theme.fonts.bold,
    letterSpacing: 0.5,
  },
  buyNowButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  buyNowGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  buyNowText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '700',
    fontFamily: theme.fonts.bold,
    letterSpacing: 0.5,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingSpinner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: 18,
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background,
  },
  errorText: {
    fontSize: 20,
    color: theme.colors.subtitle,
    fontFamily: theme.fonts.bold,
    marginBottom: theme.spacing.sm,
  },
  errorDetails: {
    fontSize: 14,
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
    marginBottom: theme.spacing.md,
  },
  retryButton: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: theme.fonts.bold,
  },
  // Additional styles for the simplified product info section
  ratingText: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '600',
    fontFamily: theme.fonts.bold,
  },
  priceText: {
    fontSize: 24,
    color: theme.colors.text,
    fontWeight: 'bold',
    fontFamily: theme.fonts.bold,
  },
  originalPriceText: {
    fontSize: 18,
    color: theme.colors.subtitle,
    textDecorationLine: 'line-through',
    fontFamily: theme.fonts.regular,
  },
  reviewsTitle: {
    fontSize: 18,
    color: theme.colors.text,
    fontWeight: '600',
    fontFamily: theme.fonts.bold,
  },
  addReviewText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: theme.fonts.bold,
  },
  reviewText: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
    fontFamily: theme.fonts.regular,
  },
  // Additional styles for the complete product info section
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderWidth: 1,
    borderColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  featuredBadgeText: {
    color: '#B8860B',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: theme.fonts.bold,
    marginLeft: 4,
  },
  tagsContainer: {
    marginBottom: theme.spacing.lg,
  },
  tagsTitle: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '600',
    fontFamily: theme.fonts.bold,
    marginBottom: theme.spacing.sm,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  tagBadge: {
    backgroundColor: 'rgba(21, 107, 255, 0.1)',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '600',
    fontFamily: theme.fonts.bold,
  },
  returnPolicyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(21, 107, 255, 0.05)',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: 12,
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  returnPolicyText: {
    fontSize: 14,
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
  },
  reviewsSection: {
    marginBottom: theme.spacing.lg,
  },
  reviewsSectionTitle: {
    fontSize: 18,
    color: theme.colors.text,
    fontWeight: '600',
    fontFamily: theme.fonts.bold,
    marginBottom: theme.spacing.md,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
  },

});

export default ProductDetailScreen; 