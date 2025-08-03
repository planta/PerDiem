import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { notificationService } from '../services/notificationService';
import { StoreTime } from '../services/storeService';

interface NotificationState {
  permissionsGranted: boolean;
  scheduledNotifications: any[];
  loading: boolean;
  error: string | null;
}

const initialState: NotificationState = {
  permissionsGranted: false,
  scheduledNotifications: [],
  loading: false,
  error: null,
};

// Async thunk to request notification permissions
export const requestNotificationPermissions = createAsyncThunk(
  'notification/requestPermissions',
  async () => {
    const granted = await notificationService.requestPermissions();
    return granted;
  },
);

// Async thunk to check notification permissions
export const checkNotificationPermissions = createAsyncThunk(
  'notification/checkPermissions',
  async () => {
    const enabled = await notificationService.checkPermissions();
    return enabled;
  },
);

// Async thunk to schedule store notifications
export const scheduleStoreNotifications = createAsyncThunk(
  'notification/scheduleStoreNotifications',
  async (storeTimes: StoreTime[]) => {
    await notificationService.scheduleAllStoreNotifications(storeTimes);
    const scheduledNotifications =
      await notificationService.getScheduledNotifications();
    return scheduledNotifications;
  },
);

// Async thunk to get scheduled notifications
export const getScheduledNotifications = createAsyncThunk(
  'notification/getScheduledNotifications',
  async () => {
    const notifications = await notificationService.getScheduledNotifications();
    return notifications;
  },
);

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    clearNotifications: state => {
      notificationService.cancelAllStoreNotifications().then(() => {
        state.scheduledNotifications = [];
      });
    },
    clearError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      // Request permissions
      .addCase(requestNotificationPermissions.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(requestNotificationPermissions.fulfilled, (state, action) => {
        state.loading = false;
        state.permissionsGranted = action.payload;
      })
      .addCase(requestNotificationPermissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to request permissions';
      })
      // Check permissions
      .addCase(checkNotificationPermissions.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkNotificationPermissions.fulfilled, (state, action) => {
        state.loading = false;
        state.permissionsGranted = action.payload;
      })
      .addCase(checkNotificationPermissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to check permissions';
      })
      // Schedule notifications
      .addCase(scheduleStoreNotifications.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(scheduleStoreNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.scheduledNotifications = action.payload;
      })
      .addCase(scheduleStoreNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || 'Failed to schedule notifications';
      })
      // Get scheduled notifications
      .addCase(getScheduledNotifications.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getScheduledNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.scheduledNotifications = action.payload;
      })
      .addCase(getScheduledNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || 'Failed to get scheduled notifications';
      });
  },
});

export const { clearNotifications, clearError } = notificationSlice.actions;
export default notificationSlice.reducer;
