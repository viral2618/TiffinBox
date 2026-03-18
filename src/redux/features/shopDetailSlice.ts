import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

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

export interface Shop {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  address: string;
  logoUrl: string | null;
  bannerImage: string | null;
  contactPhone: string | null;
  whatsapp: string | null;
  openingHours: OpeningHours | null;
  imageUrls?: string[];
  shopTags: {
    tag: {
      id: string;
      name: string;
    }
  }[];
}

export interface Dish {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrls: string[];
  price: number;
  isVeg: boolean;
  isOutOfStock: boolean;
  isMarketingEnabled: boolean;
  category: {
    id: string;
    name: string;
  };
  subcategory: {
    id: string;
    name: string;
  } | null;
  dishTags: {
    tag: {
      id: string;
      name: string;
    }
  }[];
}

interface ShopDetailState {
  shop: Shop | null;
  dishes: Dish[];
  pagination: PaginationData | null;
  shopLoading: boolean;
  dishesLoading: boolean;
  shopError: string | null;
  dishesError: string | null;
}

const initialState: ShopDetailState = {
  shop: null,
  dishes: [],
  pagination: null,
  shopLoading: false,
  dishesLoading: false,
  shopError: null,
  dishesError: null,
};

export const fetchShopDetail = createAsyncThunk(
  'shopDetail/fetchShopDetail',
  async (shopId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/owner/shop/${shopId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch shop details');
      }
      const data = await response.json();
      return data.shop;
    } catch (error) {
      return rejectWithValue('Error loading shop details. Please try again.');
    }
  }
);

export const updateShopOpeningHours = createAsyncThunk(
  'shopDetail/updateShopOpeningHours',
  async ({ shopId, openingHours }: { shopId: string; openingHours: any }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/owner/shop/${shopId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ openingHours })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update shop opening hours');
      }
      
      const data = await response.json();
      return data.shop;
    } catch (error) {
      return rejectWithValue('Error updating opening hours. Please try again.');
    }
  }
);

export interface DishFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  subcategory?: string;
  isVeg?: boolean;
  isOutOfStock?: boolean;
  isMarketingEnabled?: boolean;
  minPrice?: number;
  maxPrice?: number;
  tagId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationData {
  page: number;
  limit: number;
  totalDishes: number;
  totalPages: number;
}

export const fetchShopDishes = createAsyncThunk(
  'shopDetail/fetchShopDishes',
  async (arg: string | { shopId: string; filters?: DishFilters }, { rejectWithValue }) => {
    try {
      // Handle both string shopId and object with shopId and filters
      let shopId: string;
      let filters = {};
      
      if (typeof arg === 'string') {
        shopId = arg;
      } else {
        shopId = arg.shopId;
        filters = arg.filters || {};
      }
      
      // Ensure shopId is valid
      if (!shopId) {
        console.error('Shop ID is missing');
        return rejectWithValue('Shop ID is required');
      }
      
      // Build query string from filters
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
      
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
      console.log(`Fetching dishes for shop: ${shopId}`);
      const response = await fetch(`/api/owner/shop/${shopId}/dishes${queryString}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch shop dishes');
      }
      
      const data = await response.json();
      return { dishes: data.dishes || [], pagination: data.pagination };
    } catch (error) {
      console.error('Error fetching dishes:', error);
      return rejectWithValue('Error loading dishes. Please try again.');
    }
  }
);

export const shopDetailSlice = createSlice({
  name: 'shopDetail',
  initialState,
  reducers: {
    clearShopDetail: (state) => {
      state.shop = null;
      state.dishes = [];
      state.shopError = null;
      state.dishesError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Shop detail cases
      .addCase(fetchShopDetail.pending, (state) => {
        state.shopLoading = true;
        state.shopError = null;
      })
      .addCase(fetchShopDetail.fulfilled, (state, action: PayloadAction<Shop>) => {
        state.shop = action.payload;
        state.shopLoading = false;
      })
      .addCase(fetchShopDetail.rejected, (state, action) => {
        state.shopLoading = false;
        state.shopError = action.payload as string;
      })
      // Shop dishes cases
      .addCase(fetchShopDishes.pending, (state) => {
        state.dishesLoading = true;
        state.dishesError = null;
      })
      .addCase(fetchShopDishes.fulfilled, (state, action: PayloadAction<{ dishes: Dish[], pagination: PaginationData }>) => {
        state.dishes = action.payload.dishes;
        state.pagination = action.payload.pagination;
        state.dishesLoading = false;
      })
      .addCase(fetchShopDishes.rejected, (state, action) => {
        state.dishesLoading = false;
        state.dishesError = action.payload as string;
      })
      // Update shop opening hours cases
      .addCase(updateShopOpeningHours.pending, (state) => {
        state.shopLoading = true;
        state.shopError = null;
      })
      .addCase(updateShopOpeningHours.fulfilled, (state, action: PayloadAction<Shop>) => {
        state.shop = action.payload;
        state.shopLoading = false;
      })
      .addCase(updateShopOpeningHours.rejected, (state, action) => {
        state.shopLoading = false;
        state.shopError = action.payload as string;
      });
  },
});

export const { clearShopDetail } = shopDetailSlice.actions;
export default shopDetailSlice.reducer;