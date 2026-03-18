import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

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
    location: GeoLocation | null;
  };
}

const initialState: ShopsState = {
  shops: [],
  loading: false,
  error: null,
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
    location: null
  }
};

export const fetchShops = createAsyncThunk(
  'shops/fetchShops',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { shop } = getState() as { shop: ShopsState };
      const { filters, pagination } = shop;
      
      // Build query parameters
      const params = new URLSearchParams();
      
      // Add location parameters (required)
      if (filters.location) {
        params.append('lat', filters.location.lat.toString());
        params.append('lng', filters.location.lng.toString());
      } else {
        // Default to a location if none provided
        params.append('lat', '0');
        params.append('lng', '0');
      }
      
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

export const toggleFavoriteShop = createAsyncThunk(
  'shops/toggleFavorite',
  async (shopId: string, { getState, rejectWithValue }) => {
    try {
      const { shop } = getState() as { shop: ShopsState };
      const shopToToggle = shop.shops.find(s => s.id === shopId);
      
      if (!shopToToggle) {
        throw new Error('Shop not found');
      }
      
      // If shop is already a favorite, remove it
      if (shopToToggle.isFavorite) {
        const response = await fetch(`/api/favorites/shops?shopId=${shopId}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          throw new Error('Failed to remove from favorites');
        }
        
        return { shopId, isFavorite: false };
      } 
      // Otherwise, add it to favorites
      else {
        const response = await fetch('/api/favorites/shops', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ shopId })
        });
        
        if (!response.ok) {
          throw new Error('Failed to add to favorites');
        }
        
        return { shopId, isFavorite: true };
      }
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const shopSlice = createSlice({
  name: 'shop',
  initialState,
  reducers: {
    setSearchFilter: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
      state.pagination.page = 1; // Reset to first page when filter changes
    },
    setCategoryFilter: (state, action: PayloadAction<string | null>) => {
      state.filters.categoryId = action.payload;
      state.filters.subcategoryId = null; // Reset subcategory when category changes
      state.pagination.page = 1; // Reset to first page when filter changes
    },
    setSubcategoryFilter: (state, action: PayloadAction<string | null>) => {
      state.filters.subcategoryId = action.payload;
      state.pagination.page = 1; // Reset to first page when filter changes
    },
    setLocation: (state, action: PayloadAction<GeoLocation>) => {
      state.filters.location = action.payload;
      state.pagination.page = 1; // Reset to first page when location changes
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
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
        state.shops = action.payload.shops;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchShops.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
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
  setCategoryFilter, 
  setSubcategoryFilter, 
  setLocation, 
  setPage 
} = shopSlice.actions;

export default shopSlice.reducer;