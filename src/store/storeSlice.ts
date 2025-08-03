import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  storeService,
  StoreTime,
  StoreOverride,
} from '../services/storeService';

interface StoreTimesState {
  storeTimes: StoreTime[];
  storeOverrides: StoreOverride[];
  loading: boolean;
  loadingStoreTimes: boolean;
  loadingStoreOverrides: boolean;
  error: string | null;
}

const initialState: StoreTimesState = {
  storeTimes: [],
  storeOverrides: [],
  loading: false,
  loadingStoreTimes: false,
  loadingStoreOverrides: false,
  error: null,
};

// Async thunk for fetching store times
export const fetchStoreTimes = createAsyncThunk(
  'storeTimes/fetchStoreTimes',
  async () => {
    const storeTimes = await storeService.getStoreTimes();
    return storeTimes;
  },
);

// Async thunk for fetching store overrides
export const fetchStoreOverrides = createAsyncThunk(
  'storeTimes/fetchStoreOverrides',
  async () => {
    const storeOverrides = await storeService.getStoreOverrides();
    return storeOverrides;
  },
);

const storeTimesSlice = createSlice({
  name: 'storeTimes',
  initialState,
  reducers: {
    clearStoreTimes: state => {
      state.storeTimes = [];
      state.storeOverrides = [];
      state.error = null;
    },
    clearError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchStoreTimes.pending, state => {
        state.loadingStoreTimes = true;
        state.loading = state.loadingStoreTimes || state.loadingStoreOverrides;
        state.error = null;
      })
      .addCase(fetchStoreTimes.fulfilled, (state, action) => {
        state.loadingStoreTimes = false;
        state.loading = state.loadingStoreTimes || state.loadingStoreOverrides;
        state.storeTimes = action.payload;
        state.error = null;
      })
      .addCase(fetchStoreTimes.rejected, (state, action) => {
        state.loadingStoreTimes = false;
        state.loading = state.loadingStoreTimes || state.loadingStoreOverrides;
        state.error = action.error.message || 'Failed to fetch store times';
      })
      .addCase(fetchStoreOverrides.pending, state => {
        state.loadingStoreOverrides = true;
        state.loading = state.loadingStoreTimes || state.loadingStoreOverrides;
        state.error = null;
      })
      .addCase(fetchStoreOverrides.fulfilled, (state, action) => {
        state.loadingStoreOverrides = false;
        state.loading = state.loadingStoreTimes || state.loadingStoreOverrides;
        state.storeOverrides = action.payload;
      })
      .addCase(fetchStoreOverrides.rejected, (state, action) => {
        state.loadingStoreOverrides = false;
        state.loading = state.loadingStoreTimes || state.loadingStoreOverrides;
        state.error = action.error.message || 'Failed to fetch store overrides';
      });
  },
});

export const { clearStoreTimes, clearError } = storeTimesSlice.actions;
export default storeTimesSlice.reducer;
