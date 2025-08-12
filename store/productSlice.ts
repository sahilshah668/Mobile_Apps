import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getCategories, getProduct, getProducts } from '../services/api';

// Types
export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  category: string;
  subcategory?: string;
  brand?: string;
  sizes?: string[];
  colors?: string[];
  inStock: boolean;
  rating?: number;
  reviews?: number;
  isNew?: boolean;
  isHot?: boolean;
  isSale?: boolean;
  discount?: number;
  tags?: string[];
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
  parentId?: string;
  children?: Category[];
  productCount: number;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  backgroundColor: string;
  link?: string;
}

export interface HomeData {
  banners: Banner[];
  categories: Category[];
  featuredProducts: Product[];
  newArrivals: Product[];
  flashSale: Product[];
  mostPopular: Product[];
  recommendations: Product[];
}

export interface ExploreData {
  categories: Category[];
  featuredProducts: Product[];
  trendingProducts: Product[];
  newArrivals: Product[];
  saleProducts: Product[];
}

export interface FilterOptions {
  priceRange: [number, number];
  categories: string[];
  brands: string[];
  sizes: string[];
  colors: string[];
  sortBy: 'price' | 'name' | 'rating' | 'newest' | 'popular';
  sortOrder: 'asc' | 'desc';
}

export interface SearchFilters {
  query: string;
  filters: FilterOptions;
  results: Product[];
  totalResults: number;
  currentPage: number;
  itemsPerPage: number;
}

interface ProductState {
  homeData: HomeData | null;
  exploreData: ExploreData | null;
  searchFilters: SearchFilters;
  loading: boolean;
  error: string | null;
  searchQuery: string;
  selectedCategory: string | null;
  selectedProduct: Product | null;
  currentProducts: Product[];
  totalProducts: number;
  currentPage: number;
}

const initialState: ProductState = {
  homeData: null,
  exploreData: null,
  searchFilters: {
    query: '',
    filters: {
      priceRange: [0, 1000],
      categories: [],
      brands: [],
      sizes: [],
      colors: [],
      sortBy: 'popular',
      sortOrder: 'desc',
    },
    results: [],
    totalResults: 0,
    currentPage: 1,
    itemsPerPage: 20,
  },
  loading: false,
  error: null,
  searchQuery: '',
  selectedCategory: null,
  selectedProduct: null,
  currentProducts: [],
  totalProducts: 0,
  currentPage: 1,
};

// Async thunks for API calls
export const fetchHomeData = createAsyncThunk(
  'products/fetchHomeData',
  async (_, { rejectWithValue }) => {
    try {
      const [cats, prods]: any = await Promise.all([
        getCategories(),
        getProducts({ limit: 12, sort: 'popular' }),
      ]);
      const categories = (cats?.data || cats || []).map((c: any) => ({
        id: c._id || c.id,
        name: c.name,
        image: c.image || '',
        productCount: c.productCount || 0,
      }));
      const featured = (prods?.data || prods || [])?.products || (prods?.products || prods) || [];
      const mapP = (p: any) => ({
        id: p._id || p.id,
        name: p.name,
        price: p.price,
        image: (p.images && p.images[0]) || p.image || '',
        category: p.category?.name || p.category || '',
        inStock: p.inStock ?? true,
        rating: p.rating || 0,
        reviews: p.reviews || 0,
        createdAt: p.createdAt || '',
        updatedAt: p.updatedAt || '',
      });
      const home: HomeData = {
        banners: [],
        categories,
        featuredProducts: featured.slice(0, 6).map(mapP),
        newArrivals: featured.slice(6, 9).map(mapP),
        flashSale: [],
        mostPopular: featured.slice(9, 12).map(mapP),
        recommendations: featured.slice(0, 6).map(mapP),
      };
      return home;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch home data');
    }
  }
);

export const fetchExploreData = createAsyncThunk(
  'products/fetchExploreData',
  async (_, { rejectWithValue }) => {
    try {
      // Return dummy explore data
      const dummyExploreData: ExploreData = {
        categories: [
          { id: '1', name: 'Clothing', image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=200&h=200&fit=crop', productCount: 45 },
          { id: '2', name: 'Shoes', image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=200&h=200&fit=crop', productCount: 32 },
          { id: '3', name: 'Bags', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=200&h=200&fit=crop', productCount: 28 },
          { id: '4', name: 'Accessories', image: 'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=200&h=200&fit=crop', productCount: 67 },
          { id: '5', name: 'Jewelry', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200&h=200&fit=crop', productCount: 23 },
          { id: '6', name: 'Watches', image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=200&h=200&fit=crop', productCount: 18 },
        ],
        featuredProducts: [
          { id: '1', name: 'Classic Denim Jacket', price: 65, image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=200&h=200&fit=crop', category: 'Clothing', inStock: true, rating: 4.6, reviews: 89, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
          { id: '2', name: 'Elegant Evening Dress', price: 120, image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=200&h=200&fit=crop', category: 'Clothing', inStock: true, rating: 4.9, reviews: 156, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
        ],
        trendingProducts: [
          { id: '3', name: 'Casual Summer Dress', price: 45, image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=200&h=200&fit=crop', category: 'Clothing', inStock: true, rating: 4.4, reviews: 67, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
          { id: '4', name: 'Bohemian Maxi Dress', price: 68, image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=200&h=200&fit=crop', category: 'Clothing', inStock: true, rating: 4.3, reviews: 23, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
        ],
        newArrivals: [
          { id: '5', name: 'Cozy Winter Sweater', price: 35, originalPrice: 70, image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=200&h=200&fit=crop', category: 'Clothing', inStock: true, rating: 4.4, reviews: 156, isNew: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
          { id: '6', name: 'Red Dress', price: 65, image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=200&h=200&fit=crop', category: 'Clothing', inStock: true, rating: 4.7, reviews: 89, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
        ],
        saleProducts: [
          { id: '7', name: 'Pink Top', price: 28, originalPrice: 45, image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=200&h=200&fit=crop', category: 'Clothing', inStock: true, rating: 4.5, reviews: 67, isSale: true, discount: 38, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
          { id: '8', name: 'Black Hat', price: 25, originalPrice: 40, image: 'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=200&h=200&fit=crop', category: 'Accessories', inStock: true, rating: 4.2, reviews: 45, isSale: true, discount: 37, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
        ],
      };
      
      return dummyExploreData;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch explore data');
    }
  }
);

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    sort?: string;
    filters?: any;
  }, { rejectWithValue }) => {
    try {
      const res: any = await getProducts(params || {});
      const items = (res?.data || res || {}).products || res?.products || res || [];
      const mapped = items.map((p: any) => ({
        id: p._id || p.id,
        name: p.name,
        price: p.price,
        image: (p.images && p.images[0]) || p.image || '',
        category: p.category?.name || p.category || '',
        inStock: p.inStock ?? true,
        rating: p.rating || 0,
        reviews: p.reviews || 0,
        createdAt: p.createdAt || '',
        updatedAt: p.updatedAt || '',
      }));
      return { products: mapped, total: Number(res?.total || mapped.length), page: params.page || 1 };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch products');
    }
  }
);

export const searchProducts = createAsyncThunk(
  'products/searchProducts',
  async (params: { query: string; filters?: any; page?: number }, { rejectWithValue }) => {
    try {
      // Return dummy search results
      const dummySearchResults = [
        { id: '1', name: 'Classic Denim Jacket', price: 65, image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=200&h=200&fit=crop', category: 'Clothing', inStock: true, rating: 4.6, reviews: 89, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
        { id: '2', name: 'Elegant Evening Dress', price: 120, image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=200&h=200&fit=crop', category: 'Clothing', inStock: true, rating: 4.9, reviews: 156, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
      ];
      
      return {
        products: dummySearchResults,
        total: dummySearchResults.length,
        page: params.page || 1,
        query: params.query,
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to search products');
    }
  }
);

export const fetchProductDetails = createAsyncThunk(
  'products/fetchProductDetails',
  async (productId: string, { rejectWithValue }) => {
    try {
      const res: any = await getProduct(productId);
      const p = (res?.data || res || {});
      const mapped = {
        id: p._id || p.id,
        name: p.name,
        price: p.price,
        originalPrice: p.originalPrice,
        discount: p.discount,
        image: (p.images && p.images[0]) || p.image || '',
        images: p.images || [],
        category: p.category?.name || p.category || '',
        brand: p.brand || '',
        rating: p.rating || 0,
        reviews: p.reviews || 0,
        isNew: p.isNew || false,
        inStock: p.inStock ?? true,
        description: p.description || '',
        sizes: p.sizes || [],
        colors: p.colors || [],
        createdAt: p.createdAt || '',
        updatedAt: p.updatedAt || '',
      } as Product;
      return mapped;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch product details');
    }
  }
);

export const fetchCategoryDetails = createAsyncThunk(
  'products/fetchCategoryDetails',
  async (categoryId: string, { rejectWithValue }) => {
    try {
      // Return dummy category details
      const dummyCategory = {
        id: categoryId,
        name: 'Clothing',
        description: 'Trendy fashion for every occasion',
        image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=200&fit=crop',
        productCount: 109,
      };
      
      return dummyCategory;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch category details');
    }
  }
);

// Product slice
const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setSelectedCategory: (state, action: PayloadAction<string | null>) => {
      state.selectedCategory = action.payload;
    },
    setSelectedProduct: (state, action: PayloadAction<Product | null>) => {
      state.selectedProduct = action.payload;
    },
    updateSearchFilters: (state, action: PayloadAction<Partial<FilterOptions>>) => {
      state.searchFilters.filters = { ...state.searchFilters.filters, ...action.payload };
    },
    clearSearchResults: (state) => {
      state.searchFilters.results = [];
      state.searchFilters.totalResults = 0;
      state.searchFilters.currentPage = 1;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetchHomeData
    builder
      .addCase(fetchHomeData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHomeData.fulfilled, (state, action) => {
        state.loading = false;
        state.homeData = action.payload;
      })
      .addCase(fetchHomeData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // fetchExploreData
    builder
      .addCase(fetchExploreData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExploreData.fulfilled, (state, action) => {
        state.loading = false;
        state.exploreData = action.payload;
      })
      .addCase(fetchExploreData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // fetchProducts
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProducts = action.payload.products;
        state.totalProducts = action.payload.total;
        state.currentPage = action.payload.page;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // searchProducts
    builder
      .addCase(searchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.searchFilters.results = action.payload.products;
        state.searchFilters.totalResults = action.payload.total;
        state.searchFilters.currentPage = action.payload.page;
        state.searchFilters.query = action.payload.query || '';
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // fetchProductDetails
    builder
      .addCase(fetchProductDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProduct = action.payload;
      })
      .addCase(fetchProductDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // fetchCategoryDetails
    builder
      .addCase(fetchCategoryDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategoryDetails.fulfilled, (state, action) => {
        state.loading = false;
        // You might want to store category details in a separate field
      })
      .addCase(fetchCategoryDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setSearchQuery,
  setSelectedCategory,
  setSelectedProduct,
  updateSearchFilters,
  clearSearchResults,
  setCurrentPage,
  clearError,
} = productSlice.actions;

export default productSlice.reducer; 