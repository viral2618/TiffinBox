import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { toggleFavoriteShop } from './favoritesSlice';

// This slice is specifically for public-facing shop functionality
// It is separate from the owner's shop management functionality

interface GeoLocation {
  lat: number;
  lng: number;
}

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
  coordinates?: GeoLocation;
  bannerImage?: string;
  logoUrl?: string;
  imageUrls: string[];
  contactPhone?: string;
  whatsapp?: string;
  openingHours?: OpeningHours;
  distance?: number;
  isFavorite: boolean;
  dishes: any[];
  shopTags: any[];
}

interface ShopsState {
  shops: Shop[];
  loading: boolean;
  error: string | null;
  isNearby: boolean | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  filters: {
    search: string;
    location: GeoLocation | null;
    radius: number;
    minRating?: number;
    isOpen?: boolean;
    tagIds?: string[];
    categoryId?: string | null;
    subcategoryId?: string | null;
  };
}

const initialState: ShopsState = {
  shops: [],
  loading: false,
  error: null,
  isNearby: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    pages: 0
  },
  filters: {
    search: '',
    location: null,
    radius: 5,
    minRating: undefined,
    isOpen: undefined,
    tagIds: undefined,
    categoryId: null,
    subcategoryId: null
  }
};

export const fetchShops = createAsyncThunk(
  'publicShops/fetchShops',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { publicShop } = getState() as { publicShop: ShopsState };
      const { filters, pagination } = publicShop;
      
      // Build query parameters
      const params = new URLSearchParams();
      
      // Add location parameters (required)
      if (filters.location) {
        params.append('lat', filters.location.lat.toString());
        params.append('lng', filters.location.lng.toString());
        
    // Add rating filter if provided
    if (filters.minRating) {
      params.append('minRating', filters.minRating.toString());
    }
    
    // Add isOpen filter if provided
    if (filters.isOpen !== undefined) {
      params.append('isOpen', filters.isOpen.toString());
    }
    
    // Add tag filters if provided
    if (filters.tagIds && filters.tagIds.length > 0) {
      filters.tagIds.forEach(tagId => params.append('tagIds', tagId));
    }
    
    // Only add radius if location is provided
    const hasActiveFilters = filters.search || filters.minRating || filters.isOpen || (filters.tagIds && filters.tagIds.length > 0);
    if (filters.radius !== 5 || hasActiveFilters) {
      params.append('radius', filters.radius.toString());
    }
      } else {
        // Default to a location if none provided
        params.append('lat', '0');
        params.append('lng', '0');
      }
      
      // Add search parameter if provided
      if (filters.search) {
        params.append('search', filters.search);
      }
      
      // Add pagination parameters
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());
      
      // Make API request
      const response = await fetch(`/api/shops?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch shops');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const publicShopSlice = createSlice({
  name: 'publicShop',
  initialState,
  reducers: {
    setSearchFilter: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
      state.pagination.page = 1; // Reset to first page when filter changes
      state.shops = []; // Clear shops when filter changes
    },

    setLocation: (state, action: PayloadAction<GeoLocation | null>) => {
      state.filters.location = action.payload;
      state.pagination.page = 1; // Reset to first page when location changes
      state.shops = []; // Clear shops when filter changes
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },
    setRadius: (state, action: PayloadAction<number>) => {
      state.filters.radius = action.payload;
      state.pagination.page = 1; // Reset to first page when filter changes
      state.shops = []; // Clear shops when filter changes
    },
    setFilter: (state, action: PayloadAction<{ key: string; value: any }>) => {
      const { key, value } = action.payload;
      if (key === 'search') state.filters.search = value;
      if (key === 'location') state.filters.location = value;
      if (key === 'radius') state.filters.radius = value;
      if (key === 'minRating') state.filters.minRating = value;
      if (key === 'isOpen') state.filters.isOpen = value;
      if (key === 'tagIds') state.filters.tagIds = value;
      if (key === 'categoryId') state.filters.categoryId = value;
      if (key === 'subcategoryId') state.filters.subcategoryId = value;
      state.pagination.page = 1; // Reset to first page when filter changes
      state.shops = []; // Clear shops when filter changes
    },
    clearFilters: (state) => {
      state.filters.search = '';
      state.filters.radius = 5; // Reset to default radius
      state.filters.minRating = undefined;
      state.filters.isOpen = undefined;
      state.filters.tagIds = undefined;
      state.pagination.page = 1;
      state.shops = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchShops.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchShops.fulfilled, (state, action) => {
        state.loading = false;
        
        // If it's page 1, replace the shops array
        // If it's page > 1, append the new shops to the existing array
        if (state.pagination.page === 1) {
          state.shops = action.payload.shops;
        } else {
          // Get existing shop IDs to avoid duplicates
          const existingIds = new Set(state.shops.map(shop => shop.id));
          
          // Filter out any duplicates from the new shops
          const newShops = action.payload.shops.filter((shop: Shop) => !existingIds.has(shop.id));
          
          // Append new shops to the existing array
          state.shops = [...state.shops, ...newShops];
        }
        
        state.isNearby = action.payload.isNearby;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchShops.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Handle the toggleFavoriteShop action from favoritesSlice
      .addCase(toggleFavoriteShop.fulfilled, (state, action) => {
        const { shopId, isFavorite } = action.payload;
        const shopIndex = state.shops.findIndex(shop => shop.id === shopId);
        if (shopIndex !== -1) {
          state.shops[shopIndex].isFavorite = isFavorite;
        }
      });
  }
});

export const { 
  setSearchFilter, 
  setLocation, 
  setRadius,
  setPage,
  setFilter,
  clearFilters
} = publicShopSlice.actions;

export default publicShopSlice.reducer;