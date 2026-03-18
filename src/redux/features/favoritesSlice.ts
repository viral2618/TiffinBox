import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../store';

interface FavoritesState {
  loading: boolean;
  error: string | null;
}

const initialState: FavoritesState = {
  loading: false,
  error: null,
};

export const toggleFavoriteShop = createAsyncThunk(
  'favorites/toggleShop',
  async ({ shopId, currentFavoriteStatus }: { shopId: string; currentFavoriteStatus: boolean }, { rejectWithValue }) => {
    try {
      if (currentFavoriteStatus) {
        // Remove from favorites
        const response = await fetch(`/api/favorites/shops?shopId=${shopId}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error('Failed to remove from favorites');
        }
        
        return { shopId, isFavorite: false };
      } else {
        // Add to favorites
        const response = await fetch('/api/favorites/shops', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ shopId }),
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

export const toggleFavoriteDish = createAsyncThunk(
  'favorites/toggleDish',
  async ({ dishId, currentFavoriteStatus }: { dishId: string; currentFavoriteStatus: boolean }, { rejectWithValue }) => {
    try {
      if (currentFavoriteStatus) {
        // Remove from favorites
        const response = await fetch(`/api/favorites/dishes?dishId=${dishId}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error('Failed to remove from favorites');
        }
        
        return { dishId, isFavorite: false };
      } else {
        // Add to favorites
        const response = await fetch('/api/favorites/dishes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ dishId }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to add to favorites');
        }
        
        return { dishId, isFavorite: true };
      }
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Shop favorites
      .addCase(toggleFavoriteShop.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleFavoriteShop.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(toggleFavoriteShop.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Dish favorites
      .addCase(toggleFavoriteDish.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleFavoriteDish.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(toggleFavoriteDish.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default favoritesSlice.reducer;