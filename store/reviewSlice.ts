import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

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
  async (productId: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock data - in real app, this would be an API call
    const mockReviews: Review[] = [
      {
        id: '1',
        productId,
        userId: 'user1',
        userName: 'Sarah Johnson',
        userAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=50&h=50&fit=crop',
        rating: 5,
        comment: 'Absolutely love this bag! The quality is exceptional and it goes with everything. Highly recommend!',
        date: '2024-01-15',
        helpful: 12,
        verified: true,
      },
      {
        id: '2',
        productId,
        userId: 'user2',
        userName: 'Michael Chen',
        userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop',
        rating: 4,
        comment: 'Great quality leather and perfect size. The only minor issue is the strap could be a bit longer.',
        date: '2024-01-10',
        helpful: 8,
        verified: true,
      },
      {
        id: '3',
        productId,
        userId: 'user3',
        userName: 'Emma Davis',
        userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop',
        rating: 5,
        comment: 'This bag exceeded my expectations. The craftsmanship is amazing and it looks even better in person.',
        date: '2024-01-05',
        helpful: 15,
        verified: true,
      },
    ];
    
    return mockReviews;
  }
);

export const submitReview = createAsyncThunk(
  'review/submitReview',
  async (reviewData: ReviewForm) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock response - in real app, this would be an API call
    const newReview: Review = {
      id: Date.now().toString(),
      productId: reviewData.productId,
      userId: 'current-user',
      userName: 'Current User',
      userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop',
      rating: reviewData.rating,
      comment: reviewData.comment,
      date: new Date().toISOString().split('T')[0],
      helpful: 0,
      verified: false,
    };
    
    return newReview;
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