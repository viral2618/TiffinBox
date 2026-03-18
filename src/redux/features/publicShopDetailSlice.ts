import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { toggleFavoriteShop, toggleFavoriteDish } from './favoritesSlice';

// Types
interface TimeSlot {
  hour: number;
  minute: number;
}

interface DayHours {
  open: TimeSlot;
  close: TimeSlot;
  isClosed: boolean;
}

interface OpeningHours {
  monday?: DayHours;
  tuesday?: DayHours;
  wednesday?: DayHours;
  thursday?: DayHours;
  friday?: DayHours;
  saturday?: DayHours;
  sunday?: DayHours;
}

interface Shop {
  id: string;
  name: string;
  slug: string;
  description?: string;
  address: string;
  coordinates?: { lat: number; lng: number };
  bannerImage?: string;
  logoUrl?: string;
  imageUrls: string[];
  contactPhone?: string;
  whatsapp?: string;
  openingHours?: OpeningHours;
  isFavorite: boolean;
  shopTags: {
    tag: {
      id: string;
      name: string;
    }
  }[];
}

interface Dish {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrls: string[];
  price: number;
  isVeg: boolean;
  isOutOfStock: boolean;
  isMarketingEnabled: boolean;
  isFavorite: boolean;
  category: {
    id: string;
    name: string;
  };
  subcategory?: {
    id: string;
    name: string;
  } | null;
  dishTags: {
    tag: {
      id: string;
      name: string;
    }
  }[];
  timings: {
    createdAt: { hour: number; minute: number };
    preparedAt: { hour: number; minute: number };
    servedFrom: { hour: number; minute: number };
    servedUntil: { hour: number; minute: number };
  }[];
}

interface ShopDetailState {
  shop: Shop | null;
  dishes: Dish[];
  shopLoading: boolean;
  dishesLoading: boolean;
  shopError: string | null;
  dishesError: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  filters: {
    search: string;
    categoryId: string | null;
    subcategoryId: string | null;
    tagId: string | null;
    isVeg: boolean;
    isOutOfStock: boolean;
    isMarketingEnabled: boolean;
  };
}

// Initial state
const initialState: ShopDetailState = {
  shop: null,
  dishes: [],
  shopLoading: false,
  dishesLoading: false,
  shopError: null,
  dishesError: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    pages: 0
  },
  filters: {
    search: '',
    categoryId: null,
    subcategoryId: null,
    tagId: null,
    isVeg: false,
    isOutOfStock: false,
    isMarketingEnabled: false
  }
};

// Async thunks
export const fetchShopDetail = createAsyncThunk(
  'publicShopDetail/fetchShopDetail',
  async (slug: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/shops/${slug}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch shop details');
      }
      
      const data = await response.json();
      return data.shop;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const fetchShopDishes = createAsyncThunk(
  'publicShopDetail/fetchShopDishes',
  async (slug: string, { getState, rejectWithValue }) => {
    try {
      const { publicShopDetail } = getState() as { publicShopDetail: ShopDetailState };
      const { filters, pagination } = publicShopDetail;
      
      // Build query parameters
      const params = new URLSearchParams();
      
      // Add search parameter if provided
      if (filters.search) {
        params.append('search', filters.search);
      }
      
      // Add category filter if provided
      if (filters.categoryId) {
        params.append('categoryId', filters.categoryId);
      }
      
      // Add subcategory filter if provided
      if (filters.subcategoryId) {
        params.append('subcategoryId', filters.subcategoryId);
      }
      
      // Add tag filter if provided
      if (filters.tagId) {
        params.append('tagId', filters.tagId);
      }
      
      // Add special filters if enabled
      if (filters.isVeg) {
        params.append('isVeg', 'true');
      }
      
      if (filters.isOutOfStock) {
        params.append('isOutOfStock', 'true');
      }
      
      if (filters.isMarketingEnabled) {
        params.append('isMarketingEnabled', 'true');
      }
      
      // Add pagination parameters
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());
      
      // Make API request
      const response = await fetch(`/api/shops/${slug}/dishes?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch shop dishes');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// toggleFavoriteDish is now imported from favoritesSlice

// Slice
const publicShopDetailSlice = createSlice({
  name: 'publicShopDetail',
  initialState,
  reducers: {
    setDishSearchFilter: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
      state.pagination.page = 1; // Reset to first page when filter changes
    },
    setDishCategoryFilter: (state, action: PayloadAction<string | null>) => {
      state.filters.categoryId = action.payload;
      state.filters.subcategoryId = null; // Reset subcategory when category changes
      state.pagination.page = 1; // Reset to first page when filter changes
    },
    setDishSubcategoryFilter: (state, action: PayloadAction<string | null>) => {
      state.filters.subcategoryId = action.payload;
      state.pagination.page = 1; // Reset to first page when filter changes
    },
    setDishTagFilter: (state, action: PayloadAction<string | null>) => {
      state.filters.tagId = action.payload;
      state.pagination.page = 1; // Reset to first page when filter changes
    },
    setDishPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },
    setFilter: (state, action: PayloadAction<{ key: string; value: any }>) => {
      const { key, value } = action.payload;
      if (key === 'search') state.filters.search = value;
      if (key === 'categoryId') state.filters.categoryId = value;
      if (key === 'subcategoryId') state.filters.subcategoryId = value;
      if (key === 'tagId') state.filters.tagId = value;
      if (key === 'isVeg') state.filters.isVeg = value;
      if (key === 'isOutOfStock') state.filters.isOutOfStock = value;
      if (key === 'isMarketingEnabled') state.filters.isMarketingEnabled = value;
      state.pagination.page = 1; // Reset to first page when filter changes
    },
    resetShopDetail: () => initialState
  },
  extraReducers: (builder) => {
    builder
      // Shop detail
      .addCase(fetchShopDetail.pending, (state) => {
        state.shopLoading = true;
        state.shopError = null;
      })
      .addCase(fetchShopDetail.fulfilled, (state, action) => {
        state.shopLoading = false;
        state.shop = action.payload;
      })
      .addCase(fetchShopDetail.rejected, (state, action) => {
        state.shopLoading = false;
        state.shopError = action.payload as string;
      })
      
      // Shop dishes
      .addCase(fetchShopDishes.pending, (state) => {
        state.dishesLoading = true;
        state.dishesError = null;
      })
      .addCase(fetchShopDishes.fulfilled, (state, action) => {
        state.dishesLoading = false;
        state.dishes = action.payload.dishes;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchShopDishes.rejected, (state, action) => {
        state.dishesLoading = false;
        state.dishesError = action.payload as string;
      })
      
      // Toggle favorite dish from favoritesSlice
      .addCase(toggleFavoriteDish.fulfilled, (state, action) => {
        const { dishId, isFavorite } = action.payload;
        const dishIndex = state.dishes.findIndex(dish => dish.id === dishId);
        if (dishIndex !== -1) {
          state.dishes[dishIndex].isFavorite = isFavorite;
        }
      })
      
      // Handle shop favorite toggle from favoritesSlice
      .addCase(toggleFavoriteShop.fulfilled, (state, action) => {
        const { shopId, isFavorite } = action.payload;
        if (state.shop && state.shop.id === shopId) {
          state.shop.isFavorite = isFavorite;
        }
      });
  }
});

export const { 
  setDishSearchFilter, 
  setDishCategoryFilter, 
  setDishSubcategoryFilter, 
  setDishTagFilter,
  setDishPage,
  setFilter,
  resetShopDetail
} = publicShopDetailSlice.actions;

export default publicShopDetailSlice.reducer;