import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

interface Dish {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrls?: string[];
  price: number;
  isEggless: boolean;
  isPremium: boolean;
  isSpecialToday: boolean;
  shop: {
    id: string;
    name: string;
    slug: string;
    distance?: number;
  };
  isFavorite: boolean;
  timings: {
    preparedAt: { hour: number; minute: number };
    servedFrom: { hour: number; minute: number };
    servedUntil: { hour: number; minute: number };
  }[];
}

interface Filters {
  search: string;
  categoryId: string | null;
  subcategoryId: string | null;
  isEggless: boolean;
  isPremium: boolean;
  isSpecialToday: boolean;
  location: { lat: number; lng: number } | null;
  radius: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface PublicDishState {
  dishes: Dish[];
  loading: boolean;
  error: string | null;
  filters: Filters;
  pagination: Pagination;
}

const initialState: PublicDishState = {
  dishes: [],
  loading: false,
  error: null,
  filters: {
    search: '',
    categoryId: null,
    subcategoryId: null,
    isEggless: false,
    isPremium: false,
    isSpecialToday: false,
    location: null,
    radius: 5,
  },
  pagination: {
    page: 1,
    limit: 12,
    total: 0,
    pages: 1,
  },
};

export const fetchDishes = createAsyncThunk(
  'publicDish/fetchDishes',
  async (_, { getState }) => {
    const state = getState() as RootState;
    const { filters, pagination } = state.publicDish;
    
    const params = new URLSearchParams();
    if (filters.location) {
      params.append('lat', filters.location.lat.toString());
      params.append('lng', filters.location.lng.toString());
      params.append('radius', filters.radius.toString());
    }
    if (filters.search) {
      params.append('search', filters.search);
    }
    if (filters.categoryId) {
      params.append('categoryId', filters.categoryId);
    }
    if (filters.subcategoryId) {
      params.append('subcategoryId', filters.subcategoryId);
    }
    if (filters.isEggless) {
      params.append('isEggless', 'true');
    }
    if (filters.isPremium) {
      params.append('isPremium', 'true');
    }
    if (filters.isSpecialToday) {
      params.append('isSpecialToday', 'true');
    }
    params.append('page', pagination.page.toString());
    params.append('limit', pagination.limit.toString());

    const url = `/api/dishes?${params.toString()}`;
    console.log('Fetching dishes from:', url);
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch dishes');
    }
    const result = await response.json();
    console.log('Received dishes:', result.dishes.length, 'Page:', result.pagination.page);
    return result;
  }
);

const publicDishSlice = createSlice({
  name: 'publicDish',
  initialState,
  reducers: {
    setFilter: (state, action: PayloadAction<{ key: keyof Filters; value: Filters[keyof Filters] }>) => {
      const { key, value } = action.payload;
      (state.filters[key] as any) = value;
      state.pagination.page = 1; // Reset page when filters change
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDishes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDishes.fulfilled, (state, action) => {
        state.loading = false;
        // Always replace dishes for pagination
        state.dishes = action.payload.dishes;
        state.pagination.total = action.payload.pagination.total;
        state.pagination.pages = action.payload.pagination.pages;
      })
      .addCase(fetchDishes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch dishes';
      });
  },
});

export const { setFilter, setPage } = publicDishSlice.actions;
export default publicDishSlice.reducer;