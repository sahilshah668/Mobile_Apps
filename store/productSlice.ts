import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getCategories, getProducts, getProduct, getBanners, trackBannerClick, searchProducts as searchProductsAPI, getCategoryProducts } from '../services/api';
import { APP_CONFIG } from '../config/appConfig';

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
  isFeatured?: boolean;
  discount?: number;
  tags?: string[];
  description?: string;
  slug?: string;
  status?: string;
  returnable?: boolean;
  returnWindowDays?: number;
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
  categoryDetails: {
    category: Category | null;
    products: Product[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  } | null;
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
  categoryDetails: null,
};

// Async thunks for API calls
export const fetchHomeData = createAsyncThunk(
  'products/fetchHomeData',
  async (_, { rejectWithValue }) => {
    try {
      console.log('fetching home data 2');
      const storeId = APP_CONFIG?.store?.id;
      console.log('storeId', storeId);
      if (!storeId) {
        throw new Error('Store ID not found in app configuration');
      }

      console.log('About to make API calls...');
      
      // Test each API call individually to identify which one fails
      try {
        console.log('Testing getCategories...');
        const cats = await getCategories();
        console.log('getCategories success:', cats);
      } catch (error) {
        console.log('getCategories error:', error);
      }
      
      try {
        console.log('Testing getProducts...');
        const prods = await getProducts({ limit: 12 });
        console.log('getProducts success:', prods);
      } catch (error) {
        console.log('getProducts error:', error);
      }
      
      try {
        console.log('Testing getBanners...');
        const banners = await getBanners(storeId);
        console.log('getBanners success:', banners);
      } catch (error) {
        console.log('getBanners error:', error);
      }
      
      // Use Promise.allSettled to handle partial failures gracefully
      console.log('Making Promise.allSettled call...');
      const results = await Promise.allSettled([
        getCategories(),
        getProducts({ limit: 12 }),
        getBanners(storeId),
      ]);
      
      const [catsResult, prodsResult, bannersResult] = results;
      
      console.log('Promise.allSettled completed');
      console.log('Categories result:', catsResult.status, catsResult.status === 'fulfilled' ? catsResult.value : catsResult.reason);
      console.log('Products result:', prodsResult.status, prodsResult.status === 'fulfilled' ? prodsResult.value : prodsResult.reason);
      console.log('Banners result:', bannersResult.status, bannersResult.status === 'fulfilled' ? bannersResult.value : bannersResult.reason);
      
      // Handle categories
      let categories: any[] = [];
      if (catsResult.status === 'fulfilled') {
        const cats = catsResult.value as any;
        categories = (cats?.categories || cats?.data || cats || []).map((c: any) => ({
          id: c._id || c.id,
          name: c.name,
          image: c.image || '',
          productCount: c.productCount || 0,
        }));
      }
      
      // Handle products
      let featured: any[] = [];
      if (prodsResult.status === 'fulfilled') {
        const prods = prodsResult.value as any;
        featured = (prods?.products || prods?.data?.products || prods || []);
      }
      
      const mapP = (p: any) => ({
        id: p._id || p.id,
        name: p.name,
        price: p.price,
        image: (p.images && p.images[0]) || p.image || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop',
        category: p.category?.name || p.category || 'Uncategorized',
        inStock: p.inStock ?? true,
        rating: p.rating || 0,
        reviews: p.reviews || 0,
        createdAt: p.createdAt || '',
        updatedAt: p.updatedAt || '',
      });

      // Handle banners
      let mappedBanners: any[] = [];
      if (bannersResult.status === 'fulfilled') {
        const banners = bannersResult.value as any;
        mappedBanners = (banners?.data || banners || []).map((b: any) => ({
          id: b._id || b.id,
          title: b.title,
          subtitle: b.subtitle,
          image: b.image,
          backgroundColor: b.backgroundColor,
          link: b.link,
        }));
      }
      console.log('featured', featured);
      const home: HomeData = {
        banners: mappedBanners,
        categories,
        featuredProducts: featured.slice(0, 6).map(mapP),
        newArrivals: featured.slice(6, 9).map(mapP),
        flashSale: [],
        mostPopular: featured.slice(9, 12).map(mapP),
        recommendations: featured.slice(0, 6).map(mapP),
      };
      console.log('home', home);
      console.log('Featured products:', home.featuredProducts.map(p => ({ id: p.id, name: p.name, price: p.price })));
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
      console.log('fetching explore data');
      const storeId = APP_CONFIG?.store?.id;
      if (!storeId) {
        throw new Error('Store ID not found in app configuration');
      }

      // Fetch categories
      const categoriesRes: any = await getCategories();
      console.log('📋 Raw categories response:', categoriesRes);
      
      const categories = (categoriesRes?.categories || categoriesRes?.data || categoriesRes || []).map((cat: any) => ({
        id: cat._id || cat.id,
        name: cat.name,
        image: cat.image || 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=200&h=200&fit=crop',
        productCount: cat.productCount || 0,
      }));
      
      console.log('📋 Mapped categories:', categories);

      // Fetch all products (same as home data)
      const productsRes: any = await getProducts({ limit: 20 });
      const allProducts = (productsRes?.products || productsRes?.data?.products || productsRes || []);

      const mapProduct = (p: any) => ({
        id: p._id || p.id,
        name: p.name,
        price: p.price,
        image: (p.images && p.images[0]) || p.image || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop',
        category: p.category?.name || p.category || 'Uncategorized',
        inStock: p.inStock ?? true,
        rating: p.rating || 0,
        reviews: p.reviews || 0,
        createdAt: p.createdAt || '',
        updatedAt: p.updatedAt || '',
      });

      // Categorize products based on their properties
      const mappedProducts = allProducts.map(mapProduct);
      
      // Split products into different categories
      const featuredProducts = mappedProducts.slice(0, 6);
      const trendingProducts = mappedProducts.slice(6, 12);
      const newArrivals = mappedProducts.slice(12, 18);
      const saleProducts = mappedProducts.slice(18, 24);

      const exploreData: ExploreData = {
        categories,
        featuredProducts,
        trendingProducts,
        newArrivals,
        saleProducts,
      };

      console.log('explore data loaded:', {
        categoriesCount: categories.length,
        featuredCount: featuredProducts.length,
        trendingCount: trendingProducts.length,
        newArrivalsCount: newArrivals.length,
        saleCount: saleProducts.length,
      });

      return exploreData;
    } catch (error) {
      console.error('Error fetching explore data:', error);
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
      const res: any = await searchProductsAPI(params.query, params.filters);
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
      
      return {
        products: mapped,
        total: Number(res?.total || mapped.length),
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
      console.log('fetchProductDetails called with ID:', productId);
      const res: any = await getProduct(productId);
      console.log('getProduct result:', res);
      
      // Extract product data from the response structure
      // The API returns: { product: { ... } }
      const productData = res?.product || res?.data || res || {};
      console.log('Product data extracted:', productData);
      
      const mapped = {
        id: productData._id || productData.id,
        name: productData.name || '',
        price: productData.price || 0,
        originalPrice: productData.compareAtPrice || productData.originalPrice || 0,
        discount: productData.discount || 0,
        image: (productData.images && productData.images[0]) || productData.image || '',
        images: productData.images || [],
        category: productData.category?.name || productData.category || '',
        brand: productData.brand || '',
        rating: productData.rating || 0,
        reviews: productData.reviews || 0,
        isNew: productData.isNew || false,
        isFeatured: productData.isFeatured || false,
        inStock: productData.inStock ?? true,
        description: productData.description || '',
        sizes: productData.sizes || [],
        colors: productData.colors || [],
        tags: productData.tags || [],
        slug: productData.slug || '',
        status: productData.status || 'published',
        returnable: productData.returnable || false,
        returnWindowDays: productData.returnWindowDays || 0,
        createdAt: productData.createdAt || '',
        updatedAt: productData.updatedAt || '',
      } as Product;
      
      console.log('Mapped product:', mapped);
      console.log('Mapped product name:', mapped.name);
      console.log('Mapped product price:', mapped.price);
      console.log('Mapped product description:', mapped.description);
      return mapped;
    } catch (error) {
      console.error('Error in fetchProductDetails:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch product details');
    }
  }
);

export const fetchCategoryDetails = createAsyncThunk(
  'products/fetchCategoryDetails',
  async (categoryId: string, { rejectWithValue }) => {
    try {
      console.log('Fetching category details for:', categoryId);
      const result = await getCategoryProducts(categoryId, {
        page: 1,
        limit: 50,
        sort: 'newest',
        order: 'desc'
      });
      
      console.log('Category details result:', result);
      return result;
    } catch (error) {
      console.error('Error fetching category details:', error);
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
        state.categoryDetails = action.payload as any;
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

// Banner click tracking thunk
export const trackBannerClickThunk = createAsyncThunk(
  'products/trackBannerClick',
  async (bannerId: string, { rejectWithValue }) => {
    try {
      await trackBannerClick(bannerId);
      return bannerId;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to track banner click');
    }
  }
);

export default productSlice.reducer; 