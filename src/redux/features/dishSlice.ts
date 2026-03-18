import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface TimeSlot {
  hour: number;
  minute: number;
}

interface DishTiming {
  createdAt: TimeSlot;
  preparedAt: TimeSlot;
  servedFrom: TimeSlot;
  servedUntil: TimeSlot;
}

interface DishFormData {
  name: string;
  description: string;
  imageUrls: string[];
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  isVeg: boolean;
  categoryId: string;
  subcategoryId?: string | null;
  selectedTags?: string[];
  customTags?: { name: string; slug: string }[];
  timings?: DishTiming[];
}

interface Dish {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrls: string[];
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  isVeg: boolean;
  categoryId: string;
  subcategoryId?: string | null;
  category?: {
    id: string;
    name: string;
  };
  subcategory?: {
    id: string;
    name: string;
  } | null;
  dishTags?: {
    id: string;
    tagId: string;
    tag: {
      id: string;
      name: string;
    };
  }[];
  timings?: {
    id: string;
    createdAt: TimeSlot;
    preparedAt: TimeSlot;
    servedFrom: TimeSlot;
    servedUntil: TimeSlot;
  }[];
}

interface DishState {
  loading: boolean;
  error: string | null;
  success: boolean;
  categories: {
    id: string;
    name: string;
    subcategories: {
      id: string;
      name: string;
    }[];
  }[];
  tags: {
    id: string;
    name: string;
  }[];
  categoriesLoading: boolean;
  categoriesError: string | null;
  dishes: Dish[];
  currentDish: Dish | null;
  dishesLoading: boolean;
  dishesError: string | null;
  updateSuccess: boolean;
  deleteSuccess: boolean;
}

const initialState: DishState = {
  loading: false,
  error: null,
  success: false,
  categories: [],
  tags: [],
  categoriesLoading: false,
  categoriesError: null,
  dishes: [],
  currentDish: null,
  dishesLoading: false,
  dishesError: null,
  updateSuccess: false,
  deleteSuccess: false,
};

export const createDish = createAsyncThunk(
  'dish/createDish',
  async ({ shopId, formData }: { shopId: string; formData: DishFormData }, { rejectWithValue }) => {
    // Generate slug from name
    const slug = formData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    try {
      const response = await fetch(`/api/owner/shop/${shopId}/dishes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          slug,
          selectedTags: formData.selectedTags || [],
          timings: formData.timings || []
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create dish');
      }

      const data = await response.json();
      return data.dish;
    } catch (error) {
      return rejectWithValue('Error creating dish. Please try again.');
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'dish/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      return data.categories;
    } catch (error) {
      return rejectWithValue('Error loading categories. Please try again.');
    }
  }
);

export const fetchTags = createAsyncThunk(
  'dish/fetchTags',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/tags');
      if (!response.ok) {
        throw new Error('Failed to fetch tags');
      }
      const data = await response.json();
      return data.tags;
    } catch (error) {
      return rejectWithValue('Error loading tags. Please try again.');
    }
  }
);

export const fetchDishes = createAsyncThunk(
  'dish/fetchDishes',
  async (shopId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/owner/shop/${shopId}/dishes`);
      if (!response.ok) {
        throw new Error('Failed to fetch dishes');
      }
      const data = await response.json();
      return data.dishes;
    } catch (error) {
      return rejectWithValue('Error loading dishes. Please try again.');
    }
  }
);

export const fetchDishById = createAsyncThunk(
  'dish/fetchDishById',
  async ({ shopId, dishId }: { shopId: string; dishId: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/owner/shop/${shopId}/dishes/${dishId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch dish');
      }
      const data = await response.json();
      return data.dish;
    } catch (error) {
      return rejectWithValue('Error loading dish. Please try again.');
    }
  }
);

export const updateDish = createAsyncThunk(
  'dish/updateDish',
  async ({ shopId, dishId, formData }: { shopId: string; dishId: string; formData: DishFormData }, { rejectWithValue }) => {
    try {
      // Validate dishId
      if (!dishId) {
        return rejectWithValue('Invalid dish ID');
      }
      
      // Generate slug from name
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      console.log('Updating dish with ID:', dishId); // Debug log
      
      // Create a new object for the request body to ensure dishId is at the top level
      const requestBody = {
        dishId: dishId,
        name: formData.name,
        description: formData.description,
        imageUrls: formData.imageUrls || [],
        price: formData.price,
        originalPrice: formData.originalPrice || null,
        discountPercentage: formData.discountPercentage || null,
        isVeg: formData.isVeg,
        categoryId: formData.categoryId || null,
        subcategoryId: formData.subcategoryId || null,
        slug: slug,
        selectedTags: formData.selectedTags || [],
        customTags: formData.customTags || [],
        timings: formData.timings || []
      };
      
      console.log('Request body:', JSON.stringify(requestBody)); // Debug log
      
      const response = await fetch(`/api/owner/shop/${shopId}/dishes`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('Failed to update dish');
      }

      const data = await response.json();
      return data.dish;
    } catch (error) {
      return rejectWithValue('Error updating dish. Please try again.');
    }
  }
);

export const deleteDish = createAsyncThunk(
  'dish/deleteDish',
  async ({ shopId, dishId }: { shopId: string; dishId: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/owner/shop/${shopId}/dishes?dishId=${dishId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete dish');
      }

      return { dishId };
    } catch (error) {
      return rejectWithValue('Error deleting dish. Please try again.');
    }
  }
);

export const dishSlice = createSlice({
  name: 'dish',
  initialState,
  reducers: {
    resetDishState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.updateSuccess = false;
      state.deleteSuccess = false;
    },
    clearCurrentDish: (state) => {
      state.currentDish = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createDish.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createDish.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(createDish.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchCategories.pending, (state) => {
        state.categoriesLoading = true;
        state.categoriesError = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
        state.categoriesLoading = false;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.categoriesLoading = false;
        state.categoriesError = action.payload as string;
      })
      .addCase(fetchTags.fulfilled, (state, action) => {
        state.tags = action.payload;
      })
      .addCase(fetchDishes.pending, (state) => {
        state.dishesLoading = true;
        state.dishesError = null;
      })
      .addCase(fetchDishes.fulfilled, (state, action) => {
        state.dishes = action.payload;
        state.dishesLoading = false;
      })
      .addCase(fetchDishes.rejected, (state, action) => {
        state.dishesLoading = false;
        state.dishesError = action.payload as string;
      })
      .addCase(fetchDishById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDishById.fulfilled, (state, action) => {
        state.currentDish = action.payload;
        state.loading = false;
      })
      .addCase(fetchDishById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateDish.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.updateSuccess = false;
      })
      .addCase(updateDish.fulfilled, (state, action) => {
        state.loading = false;
        state.updateSuccess = true;
        state.currentDish = action.payload;
        // Update the dish in the dishes array
        const index = state.dishes.findIndex(dish => dish.id === action.payload.id);
        if (index !== -1) {
          state.dishes[index] = action.payload;
        }
      })
      .addCase(updateDish.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteDish.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.deleteSuccess = false;
      })
      .addCase(deleteDish.fulfilled, (state, action) => {
        state.loading = false;
        state.deleteSuccess = true;
        // Remove the dish from the dishes array
        state.dishes = state.dishes.filter(dish => dish.id !== action.payload.dishId);
        state.currentDish = null;
      })
      .addCase(deleteDish.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetDishState, clearCurrentDish } = dishSlice.actions;
export default dishSlice.reducer;