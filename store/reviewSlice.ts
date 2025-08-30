import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { apiFetch, json } from '../services/api';

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
  verified: boolean;
}

export interface ReviewForm {
  productId: string;
  rating: number;
  comment: string;
}

interface ReviewState {
  reviews: Review[];
  loading: boolean;
  error: string | null;
  submitting: boolean;
  submitError: string | null;
}

const initialState: ReviewState = {
  reviews: [],
  loading: false,
  error: null,
  submitting: false,
  submitError: null,
};

// Async thunks
export const fetchProductReviews = createAsyncThunk(
  'review/fetchProductReviews',
  async (productId: string, { rejectWithValue }) => {
    try {
      const response = await apiFetch(`/public/reviews/${productId}`, {}, true);
      const result = await json(response);
      
      // Map backend response to frontend format
      const reviews = (result.data || result || []).map((review: any) => ({
        id: review._id || review.id,
        productId: review.productId || productId,
        userId: review.userId,
        userName: review.userName || review.user?.name || 'Anonymous',
        userAvatar: review.userAvatar || review.user?.avatar || '',
        rating: review.rating,
        comment: review.comment || review.review,
        date: review.createdAt || review.date,
        helpful: review.helpful || 0,
        verified: review.verified || false,
      }));
      
      return reviews;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch reviews');
    }
  }
);

export const submitReview = createAsyncThunk(
  'review/submitReview',
  async (reviewData: ReviewForm, { rejectWithValue }) => {
    let retryCount = 0;
    const maxRetries = 2;

    while (retryCount <= maxRetries) {
      try {
        console.log(`Review submission attempt ${retryCount + 1}/${maxRetries + 1}`);
        console.log('Submitting review with data:', reviewData);
        
        const response = await apiFetch('api/public/reviews', {
          method: 'POST',
          body: JSON.stringify({
            productId: reviewData.productId,
            rating: reviewData.rating,
            comment: reviewData.comment,
          }),
        }, false); // false for authenticated request
        
        const result = await json(response);
        console.log('Review submission successful:', result);
        
        // Map backend response to frontend format
        const newReview: Review = {
          id: result.data._id || result.data.id,
          productId: result.data.productId || reviewData.productId,
          userId: result.data.userId,
          userName: result.data.userName || result.data.user?.name || 'Current User',
          userAvatar: result.data.userAvatar || result.data.user?.avatar || '',
          rating: result.data.rating,
          comment: result.data.comment,
          date: result.data.createdAt || new Date().toISOString().split('T')[0],
          helpful: result.data.helpful || 0,
          verified: result.data.verified || false,
        };
        
        return newReview;
      } catch (error) {
        console.error(`Review submission attempt ${retryCount + 1} failed:`, error);
        
        if (retryCount === maxRetries) {
          console.error('All review submission attempts failed');
          return rejectWithValue(error instanceof Error ? error.message : 'Failed to submit review');
        }
        
        // Wait before retry with exponential backoff
        const delay = 1000 * Math.pow(2, retryCount); // 1s, 2s, 4s
        console.log(`Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        retryCount++;
      }
    }
  }
);

const reviewSlice = createSlice({
  name: 'review',
  initialState,
  reducers: {
    clearReviewError: (state) => {
      state.error = null;
      state.submitError = null;
    },
    
    markReviewHelpful: (state, action: PayloadAction<string>) => {
      const review = state.reviews.find(r => r.id === action.payload);
      if (review) {
        review.helpful += 1;
      }
    },
    
    clearReviews: (state) => {
      state.reviews = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch reviews
      .addCase(fetchProductReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload;
      })
      .addCase(fetchProductReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch reviews';
      })
      
      // Submit review
      .addCase(submitReview.pending, (state) => {
        state.submitting = true;
        state.submitError = null;
      })
      .addCase(submitReview.fulfilled, (state, action) => {
        state.submitting = false;
        state.reviews.unshift(action.payload); // Add new review at the beginning
      })
      .addCase(submitReview.rejected, (state, action) => {
        state.submitting = false;
        state.submitError = action.error.message || 'Failed to submit review';
      });
  },
});

export const {
  clearReviewError,
  markReviewHelpful,
  clearReviews,
} = reviewSlice.actions;

// Selectors
export const selectReviews = (state: { review: ReviewState }) => state.review.reviews;
export const selectReviewsLoading = (state: { review: ReviewState }) => state.review.loading;
export const selectReviewsError = (state: { review: ReviewState }) => state.review.error;
export const selectReviewSubmitting = (state: { review: ReviewState }) => state.review.submitting;
export const selectReviewSubmitError = (state: { review: ReviewState }) => state.review.submitError;

export const selectProductReviews = (state: { review: ReviewState }, productId: string) => 
  state.review.reviews.filter(review => review.productId === productId);

export const selectAverageRating = (state: { review: ReviewState }, productId: string) => {
  const productReviews = state.review.reviews.filter(review => review.productId === productId);
  if (productReviews.length === 0) return 0;
  
  const totalRating = productReviews.reduce((sum, review) => sum + review.rating, 0);
  return totalRating / productReviews.length;
};

export default reviewSlice.reducer; 