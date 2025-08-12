import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useAuth } from '@/hooks/useAuth';
import { fetchProductReviews, markReviewHelpful, selectProductReviews, selectReviewsLoading } from '@/store/reviewSlice';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSelector } from 'react-redux';

import ReviewForm from '@/components/ReviewForm';
import { IconSymbol } from '@/components/ui/IconSymbol';
import theme from '@/constants/theme';

const { width } = Dimensions.get('window');

interface Review {
  id: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
}

const ProductReviewsScreen: React.FC = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { requireAuth } = useAuth();
  
  const [product, setProduct] = useState<any>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  
  const reviews = useSelector((state) => selectProductReviews(state, id || ''));
  const loading = useSelector(selectReviewsLoading);

  useEffect(() => {
    if (id) {
      // Mock product data
      const mockProduct = {
        id,
        name: 'Premium Leather Handbag',
        brand: 'Luxury Brand',
        rating: 4.8,
        reviews: 124,
        image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=200&h=200&fit=crop',
      };

      setProduct(mockProduct);
      
      // Fetch reviews from Redux store
      dispatch(fetchProductReviews(id));
    }
  }, [id, dispatch]);

  const handleBackPress = () => {
    router.back();
  };

  const handleWriteReview = () => {
    if (requireAuth('write a review')) {
      setShowReviewForm(true);
    }
  };

  const handleReviewSubmitSuccess = () => {
    // Refresh reviews after successful submission
    if (id) {
      dispatch(fetchProductReviews(id));
    }
  };

  const handleHelpfulPress = (reviewId: string) => {
    dispatch(markReviewHelpful(reviewId));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <LinearGradient
        colors={['rgba(21, 107, 255, 0.95)', 'rgba(21, 107, 255, 0.8)']}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <BlurView intensity={20} style={styles.backButtonBlur}>
              <IconSymbol name="arrow-back" size={20} color="white" />
            </BlurView>
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Customer Reviews</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>
      </LinearGradient>
    </View>
  );

  const renderProductInfo = () => (
    <View style={styles.productInfoCard}>
      <Image source={{ uri: product?.image }} style={styles.productImage} />
      <View style={styles.productDetails}>
        <Text style={styles.productBrand}>{product?.brand}</Text>
        <Text style={styles.productName}>{product?.name}</Text>
        <View style={styles.ratingContainer}>
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <IconSymbol
                key={star}
                name={star <= Math.floor(product?.rating || 0) ? 'star' : 'star-outline'}
                size={16}
                color={star <= (product?.rating || 0) ? '#FFD700' : '#E0E0E0'}
              />
            ))}
          </View>
          <Text style={styles.ratingText}>{product?.rating}</Text>
          <Text style={styles.reviewsCount}>({product?.reviews} reviews)</Text>
        </View>
      </View>
    </View>
  );

  const renderWriteReviewButton = () => (
    <TouchableOpacity style={styles.writeReviewButton} onPress={handleWriteReview}>
      <LinearGradient
        colors={[theme.colors.primary, '#0056CC']}
        style={styles.writeReviewGradient}
      >
        <IconSymbol name="edit" size={20} color="white" />
        <Text style={styles.writeReviewText}>Write a Review</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderReviewItem = (review: Review) => (
    <View key={review.id} style={styles.reviewCard}>
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
        <Text style={styles.reviewDate}>{formatDate(review.date)}</Text>
      </View>
      
      <Text style={styles.reviewComment}>{review.comment}</Text>
      
      <View style={styles.reviewActions}>
        <TouchableOpacity 
          style={styles.helpfulButton}
          onPress={() => handleHelpfulPress(review.id)}
        >
          <IconSymbol name="thumb-up" size={14} color={theme.colors.subtitle} />
          <Text style={styles.helpfulText}>Helpful ({review.helpful})</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading reviews...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      {renderHeader()}
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderProductInfo()}
        
        {renderWriteReviewButton()}
        
        <View style={styles.reviewsSection}>
          <Text style={styles.sectionTitle}>
            All Reviews ({reviews.length})
          </Text>
          {reviews.length > 0 ? (
            reviews.map(renderReviewItem)
          ) : (
            <View style={styles.emptyReviews}>
              <IconSymbol name="star-outline" size={48} color={theme.colors.subtitle} />
              <Text style={styles.emptyReviewsTitle}>No Reviews Yet</Text>
              <Text style={styles.emptyReviewsText}>
                Be the first to review this product!
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.bottomSpacing} />
      </ScrollView>

      <ReviewForm
        productId={id || ''}
        productName={product?.name || ''}
        visible={showReviewForm}
        onClose={() => setShowReviewForm(false)}
        onSubmitSuccess={handleReviewSubmitSuccess}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFF',
  },
  header: {
    paddingTop: 60,
  },
  headerGradient: {
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonBlur: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
    fontFamily: theme.fonts.bold,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  productInfoCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    margin: theme.spacing.lg,
    borderRadius: 16,
    padding: theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: theme.spacing.md,
  },
  productDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  productBrand: {
    fontSize: 14,
    color: theme.colors.subtitle,
    fontFamily: theme.fonts.regular,
    marginBottom: 4,
  },
  productName: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '600',
    fontFamily: theme.fonts.bold,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingText: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '600',
    fontFamily: theme.fonts.bold,
    marginRight: 4,
  },
  reviewsCount: {
    fontSize: 14,
    color: theme.colors.subtitle,
    fontFamily: theme.fonts.regular,
  },
  writeReviewButton: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderRadius: 25,
    overflow: 'hidden',
  },
  writeReviewGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: theme.spacing.sm,
  },
  writeReviewText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
    fontFamily: theme.fonts.bold,
  },
  reviewsSection: {
    paddingHorizontal: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    color: theme.colors.text,
    fontWeight: 'bold',
    fontFamily: theme.fonts.bold,
    marginBottom: theme.spacing.md,
  },
  emptyReviews: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyReviewsTitle: {
    fontSize: 18,
    color: theme.colors.text,
    fontWeight: '600',
    fontFamily: theme.fonts.bold,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  emptyReviewsText: {
    fontSize: 14,
    color: theme.colors.subtitle,
    fontFamily: theme.fonts.regular,
    textAlign: 'center',
  },
  reviewCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '600',
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
    fontFamily: theme.fonts.regular,
    lineHeight: 20,
    marginBottom: theme.spacing.sm,
  },
  reviewActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  helpfulButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  helpfulText: {
    fontSize: 12,
    color: theme.colors.subtitle,
    fontFamily: theme.fonts.regular,
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFF',
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.subtitle,
    fontFamily: theme.fonts.regular,
  },
  bottomSpacing: {
    height: 100,
  },
});

export default ProductReviewsScreen; 