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
  shopTags: {
    tag: {
      id: string;
      name: string;
    }
  }[];
}

interface OwnerShopsState {
  shops: Shop[];
  loading: boolean;
  error: string | null;
}

const initialState: OwnerShopsState = {
  shops: [],
  loading: false,
  error: null
};

export const fetchOwnerShops = createAsyncThunk(
  'ownerShops/fetchOwnerShops',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/owner/shop/my-shops');
      
      if (!response.ok) {
        throw new Error('Failed to fetch shops');
      }
      
      const data = await response.json();
      return data.shops;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const ownerShopsSlice = createSlice({
  name: 'ownerShops',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOwnerShops.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOwnerShops.fulfilled, (state, action: PayloadAction<Shop[]>) => {
        state.shops = action.payload;
        state.loading = false;
      })
      .addCase(fetchOwnerShops.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export default ownerShopsSlice.reducer;