import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Types
interface TimeSlot {
  hour: number;
  minute: number;
}

interface DishTiming {
  id: string;
  createdAt: TimeSlot;
  preparedAt: TimeSlot;
  servedFrom: TimeSlot;
  servedUntil: TimeSlot;
}

interface Dish {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrls: string[];
  price: number;
  isEggless: boolean;
  isPremium: boolean;
  isSpecialToday: boolean;
  isFavorite: boolean;
  shop: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string;
    description?: string;
    address?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
    bannerImage?: string;
    imageUrls?: string[];
    contactPhone?: string | null;
    whatsapp?: string | null;
  };
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
  timings: DishTiming[];
  createdAt?: string;
}

interface DishDetailState {
  dish: Dish | null;
  loading: boolean;
  error: string | null;
  relatedDishes: Dish[];
  relatedLoading: boolean;
  relatedError: string | null;
  createdAt?: string; // ISO date string
}

// Initial state
const initialState: DishDetailState = {
  dish: null,
  loading: false,
  error: null,
  relatedDishes: [],
  relatedLoading: false,
  relatedError: null,
  createdAt: undefined
};

// Async thunks
export const fetchDishDetail = createAsyncThunk(
  'publicDishDetail/fetchDishDetail',
  async (slug: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/dishes/${slug}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch dish details');
      }
      
      const data = await response.json();
      return data.dish;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const fetchRelatedDishes = createAsyncThunk(
  'publicDishDetail/fetchRelatedDishes',
  async ({ shopId, categoryId, currentDishId }: { shopId: string; categoryId: string; currentDishId: string }, { rejectWithValue }) => {
    try {
      // Fetch dishes from the same shop and category, excluding the current dish
      const response = await fetch(`/api/shops/${shopId}/dishes?categoryId=${categoryId}&limit=4`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch related dishes');
      }
      
      const data = await response.json();
      // Filter out the current dish from related dishes
      const filteredDishes = data.dishes.filter((dish: any) => dish.id !== currentDishId);
      return filteredDishes;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const toggleFavoriteDish = createAsyncThunk(
  'publicDishDetail/toggleFavoriteDish',
  async (dishId: string, { getState, rejectWithValue }) => {
    try {
      const { publicDishDetail } = getState() as { publicDishDetail: DishDetailState };
      const dish = publicDishDetail.dish;
      
      if (!dish) {
        throw new Error('Dish not found');
      }
      
      // If dish is already a favorite, remove it
      if (dish.isFavorite) {
        const response = await fetch(`/api/favorites/dishes?dishId=${dishId}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          throw new Error('Failed to remove from favorites');
        }
        
        return { isFavorite: false };
      } 
      // Otherwise, add it to favorites
      else {
        const response = await fetch('/api/favorites/dishes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ dishId })
        });
        
        if (!response.ok) {
          throw new Error('Failed to add to favorites');
        }
        
        return { isFavorite: true };
      }
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Slice
const publicDishDetailSlice = createSlice({
  name: 'publicDishDetail',
  initialState,
  reducers: {
    resetDishDetail: () => initialState
  },
  extraReducers: (builder) => {
    builder
      // Dish detail
      .addCase(fetchDishDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDishDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.dish = action.payload;
        state.createdAt = action.payload.createdAt;
      })
      .addCase(fetchDishDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Related dishes
      .addCase(fetchRelatedDishes.pending, (state) => {
        state.relatedLoading = true;
        state.relatedError = null;
      })
      .addCase(fetchRelatedDishes.fulfilled, (state, action) => {
        state.relatedLoading = false;
        state.relatedDishes = action.payload;
      })
      .addCase(fetchRelatedDishes.rejected, (state, action) => {
        state.relatedLoading = false;
        state.relatedError = action.payload as string;
      })
      
      // Toggle favorite
      .addCase(toggleFavoriteDish.fulfilled, (state, action) => {
        if (state.dish) {
          state.dish.isFavorite = action.payload.isFavorite;
        }
      });
  }
});

export const { resetDishDetail } = publicDishDetailSlice.actions;

export default publicDishDetailSlice.reducer;