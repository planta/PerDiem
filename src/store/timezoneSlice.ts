import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TimezoneState {
  useDeviceTimezone: boolean;
}

const initialState: TimezoneState = {
  useDeviceTimezone: false,
};

const timezoneSlice = createSlice({
  name: 'timezone',
  initialState,
  reducers: {
    setUseDeviceTimezone: (state, action: PayloadAction<boolean>) => {
      state.useDeviceTimezone = action.payload;
    },
    toggleTimezone: state => {
      state.useDeviceTimezone = !state.useDeviceTimezone;
    },
  },
});

export const { setUseDeviceTimezone, toggleTimezone } = timezoneSlice.actions;
export default timezoneSlice.reducer;
