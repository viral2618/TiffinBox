import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { CurrencyCode, FALLBACK_RATES } from '@/lib/currency';

interface CurrencyState {
  currency: CurrencyCode;
  rates: Record<string, number>;
  loading: boolean;
}

const initialState: CurrencyState = {
  currency: 'INR',
  rates: FALLBACK_RATES,
  loading: false,
};

export const fetchRates = createAsyncThunk('currency/fetchRates', async () => {
  const response = await fetch('/api/currency/rates');
  const data = await response.json();
  return data.rates;
});

const currencySlice = createSlice({
  name: 'currency',
  initialState,
  reducers: {
    setCurrency: (state, action: PayloadAction<CurrencyCode>) => {
      state.currency = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRates.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRates.fulfilled, (state, action) => {
        state.rates = action.payload;
        state.loading = false;
      })
      .addCase(fetchRates.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { setCurrency } = currencySlice.actions;
export default currencySlice.reducer;
