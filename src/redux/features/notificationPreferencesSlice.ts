import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface NotificationPreferences {
  general: boolean;
  emailAlerts: boolean;
  notificationAlert: boolean;
}

interface NotificationPreferencesState {
  preferences: NotificationPreferences;
  loading: boolean;
  error: string | null;
}

const initialState: NotificationPreferencesState = {
  preferences: {
    general: true,
    emailAlerts: false,
    notificationAlert: true,
  },
  loading: false,
  error: null,
};

// Fetch notification preferences
export const fetchNotificationPreferences = createAsyncThunk(
  'notificationPreferences/fetch',
  async (userType: 'user' | 'owner' = 'user', { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/${userType}/notification-preferences`);
      if (!response.ok) {
        throw new Error('Failed to fetch notification preferences');
      }
      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch preferences');
    }
  }
);

// Update notification preferences
export const updateNotificationPreference = createAsyncThunk(
  'notificationPreferences/update',
  async (
    { preferences, userType = 'user' }: { preferences: Partial<NotificationPreferences>, userType?: 'user' | 'owner' },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as { notificationPreferences: NotificationPreferencesState };
      const updatedPreferences = { ...state.notificationPreferences.preferences, ...preferences };
      
      const response = await fetch(`/api/${userType}/notification-preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedPreferences),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update notification preferences');
      }
      
      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update preferences');
    }
  }
);

const notificationPreferencesSlice = createSlice({
  name: 'notificationPreferences',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Fetch preferences
    builder.addCase(fetchNotificationPreferences.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchNotificationPreferences.fulfilled, (state, action) => {
      state.loading = false;
      state.preferences = action.payload;
    });
    builder.addCase(fetchNotificationPreferences.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    
    // Update preferences
    builder.addCase(updateNotificationPreference.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateNotificationPreference.fulfilled, (state, action) => {
      state.loading = false;
      state.preferences = action.payload;
    });
    builder.addCase(updateNotificationPreference.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export default notificationPreferencesSlice.reducer;