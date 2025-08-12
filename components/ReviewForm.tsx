import { IconSymbol } from '@/components/ui/IconSymbol';
import theme from '@/constants/theme';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useAuth } from '@/hooks/useAuth';
import { selectReviewSubmitting, submitReview } from '@/store/reviewSlice';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSelector } from 'react-redux';

interface ReviewFormProps {
  productId: string;
  productName: string;
  visible: boolean;
  onClose: () => void;
  onSubmitSuccess?: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  productId,
  productName,
  visible,
  onClose,
  onSubmitSuccess,
}) => {
  const dispatch = useAppDispatch();
  const { requireAuth } = useAuth();
  const submitting = useSelector(selectReviewSubmitting);
  
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleStarPress = (starRating: number) => {
    setRating(starRating);
  };

  const handleStarHover = (starRating: number) => {
    setHoveredRating(starRating);
  };

  const handleSubmit = async () => {
    if (!requireAuth('submit a review')) {
      return;
    }

    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a rating before submitting your review.');
      return;
    }

    if (comment.trim().length < 10) {
      Alert.alert('Review Too Short', 'Please write at least 10 characters in your review.');
      return;
    }

    try {
      await dispatch(submitReview({
        productId,
        rating,
        comment: comment.trim(),
      })).unwrap();

      // Reset form
      setRating(0);
      setComment('');
      
      Alert.alert(
        'Review Submitted!',
        'Thank you for your review. It will be visible to other customers shortly.',
        [
          {
            text: 'OK',
            onPress: () => {
              onClose();
              onSubmitSuccess?.();
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to submit review. Please try again.');
    }
  };

  const handleCancel = () => {
    if (rating > 0 || comment.trim().length > 0) {
      Alert.alert(
        'Discard Review?',
        'Are you sure you want to discard your review?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => {
              setRating(0);
              setComment('');
              onClose();
            },
          },
        ]
      );
    } else {
      onClose();
    }
  };

  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((star) => (
      <TouchableOpacity
        key={star}
        onPress={() => handleStarPress(star)}
        onPressIn={() => handleStarHover(star)}
        onPressOut={() => setHoveredRating(0)}
        style={styles.starButton}
      >
        <IconSymbol
          name={star <= (hoveredRating || rating) ? 'star' : 'star-outline'}
          size={32}
          color={star <= (hoveredRating || rating) ? '#FFD700' : '#E0E0E0'}
        />
      </TouchableOpacity>
    ));
  };

  const getRatingText = () => {
    const currentRating = hoveredRating || rating;
    switch (currentRating) {
      case 1: return 'Poor';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Very Good';
      case 5: return 'Excellent';
      default: return 'Select Rating';
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleCancel}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Write a Review</Text>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={submitting || rating === 0 || comment.trim().length < 10}
            style={[
              styles.submitButton,
              (submitting || rating === 0 || comment.trim().length < 10) && styles.submitButtonDisabled
            ]}
          >
            <Text style={[
              styles.submitText,
              (submitting || rating === 0 || comment.trim().length < 10) && styles.submitTextDisabled
            ]}>
              {submitting ? 'Submitting...' : 'Submit'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{productName}</Text>
          </View>

          <View style={styles.ratingSection}>
            <Text style={styles.sectionTitle}>Your Rating</Text>
            <View style={styles.starsContainer}>
              {renderStars()}
            </View>
            <Text style={styles.ratingText}>{getRatingText()}</Text>
          </View>

          <View style={styles.commentSection}>
            <Text style={styles.sectionTitle}>Your Review</Text>
            <TextInput
              style={styles.commentInput}
              placeholder="Share your experience with this product..."
              placeholderTextColor={theme.colors.subtitle}
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              maxLength={500}
            />
            <Text style={styles.characterCount}>
              {comment.length}/500 characters
            </Text>
          </View>

          <View style={styles.guidelines}>
            <Text style={styles.guidelinesTitle}>Review Guidelines</Text>
            <Text style={styles.guidelinesText}>
              • Be honest and specific about your experience{'\n'}
              • Focus on the product quality and features{'\n'}
              • Avoid personal information or inappropriate content{'\n'}
              • Minimum 10 characters required
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    paddingTop: theme.spacing.lg + 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: theme.colors.background,
  },
  cancelButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  cancelText: {
    fontSize: 16,
    color: theme.colors.subtitle,
    fontFamily: theme.fonts.regular,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
  },
  submitButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitText: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: '600',
    fontFamily: theme.fonts.bold,
  },
  submitTextDisabled: {
    color: theme.colors.subtitle,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  productInfo: {
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
  },
  ratingSection: {
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
    marginBottom: theme.spacing.md,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: theme.spacing.sm,
  },
  starButton: {
    padding: theme.spacing.xs,
  },
  ratingText: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: '600',
    fontFamily: theme.fonts.bold,
  },
  commentSection: {
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
    minHeight: 120,
    backgroundColor: 'white',
  },
  characterCount: {
    fontSize: 12,
    color: theme.colors.subtitle,
    textAlign: 'right',
    marginTop: theme.spacing.xs,
    fontFamily: theme.fonts.regular,
  },
  guidelines: {
    paddingVertical: theme.spacing.lg,
  },
  guidelinesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
    marginBottom: theme.spacing.sm,
  },
  guidelinesText: {
    fontSize: 14,
    color: theme.colors.subtitle,
    lineHeight: 20,
    fontFamily: theme.fonts.regular,
  },
});

export default ReviewForm; 