import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { storeService, StoreTime } from '../services/storeService';

interface StoreTimesState {
  storeTimes: StoreTime[];
  loading: boolean;
  error: string | null;
}

const initialState: StoreTimesState = {
  storeTimes: [],
  loading: false,
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

const storeTimesSlice = createSlice({
  name: 'storeTimes',
  initialState,
  reducers: {
    clearStoreTimes: state => {
      state.storeTimes = [];
      state.error = null;
    },
    clearError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchStoreTimes.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStoreTimes.fulfilled, (state, action) => {
        state.loading = false;
        state.storeTimes = action.payload;
        state.error = null;
      })
      .addCase(fetchStoreTimes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch store times';
      });
  },
});

export const { clearStoreTimes, clearError } = storeTimesSlice.actions;
export default storeTimesSlice.reducer;
