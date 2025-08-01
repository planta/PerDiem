import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { firebaseService } from '../services/firebaseService';
import { authService } from '../services/authService';

interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
}

type LoginMethod = 'email' | 'google' | null;

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loginMethod: LoginMethod;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loginMethod: null,
  loading: false,
  error: null,
};

// Async thunks for authentication
export const signInWithEmailAndPassword = createAsyncThunk(
  'auth/signInWithEmailAndPassword',
  async ({ email, password }: { email: string; password: string }) => {
    const result = await authService.signInWithEmailAndPassword(
      email,
      password,
    );
    if (!result.success) {
      throw new Error(result.error);
    }
    return {
      user: result.user,
      token: result.token,
      loginMethod: 'email' as const,
    };
  },
);

export const signInWithGoogle = createAsyncThunk(
  'auth/signInWithGoogle',
  async () => {
    const result = await firebaseService.signInWithGoogle();
    if (!result.success) {
      throw new Error(result.error);
    }
    return { user: result.user, loginMethod: 'google' as const };
  },
);

export const signOut = createAsyncThunk(
  'auth/signOut',
  async (_, { getState }) => {
    const state = getState() as { auth: AuthState };
    const { loginMethod } = state.auth;

    // Remove stored token for email login
    if (loginMethod === 'email') {
      await authService.removeStoredToken();
    }

    // Sign out from Firebase for Google login
    if (loginMethod === 'google') {
      const result = await firebaseService.signOut();
      if (!result.success) {
        throw new Error(result.error);
      }
    }

    // If no specific login method, try both
    if (!loginMethod) {
      await authService.removeStoredToken();
      const result = await firebaseService.signOut();
      if (!result.success) {
        throw new Error(result.error);
      }
    }
  },
);

// Check authentication status on app start
export const checkAuthStatus = createAsyncThunk(
  'auth/checkAuthStatus',
  async () => {
    const hasToken = await authService.hasValidToken();
    if (hasToken) {
      const token = await authService.getStoredToken();
      return { token, loginMethod: 'email' as const };
    }
    return null;
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.loading = false;
      state.error = null;
    },
    setToken: (state, action: PayloadAction<string | null>) => {
      state.token = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    setLoginMethod: (state, action: PayloadAction<LoginMethod>) => {
      state.loginMethod = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    clearError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    // Email/Password Sign In
    builder
      .addCase(signInWithEmailAndPassword.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signInWithEmailAndPassword.fulfilled, (state, action) => {
        if (action.payload && action.payload.user) {
          state.isAuthenticated = true;
          state.user = {
            uid: action.payload.user.uid,
            email: action.payload.user.email,
            displayName: action.payload.user.displayName,
          };
          state.token = action.payload.token;
          state.loginMethod = action.payload.loginMethod;
        }
        state.loading = false;
        state.error = null;
      })
      .addCase(signInWithEmailAndPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Sign in failed';
      });

    // Google Sign In
    builder
      .addCase(signInWithGoogle.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signInWithGoogle.fulfilled, (state, action) => {
        if (action.payload && action.payload.user) {
          state.isAuthenticated = true;
          state.user = {
            uid: action.payload.user.uid,
            email: action.payload.user.email,
            displayName: action.payload.user.displayName,
          };
          state.loginMethod = action.payload.loginMethod;
        }
        state.loading = false;
        state.error = null;
      })
      .addCase(signInWithGoogle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Google sign in failed';
      });

    // Sign Out
    builder
      .addCase(signOut.pending, state => {
        state.loading = true;
      })
      .addCase(signOut.fulfilled, state => {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.loginMethod = null;
        state.loading = false;
        state.error = null;
      })
      .addCase(signOut.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Sign out failed';
      });

    // Check Auth Status
    builder
      .addCase(checkAuthStatus.pending, state => {
        state.loading = true;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        if (action.payload) {
          state.token = action.payload.token;
          state.loginMethod = action.payload.loginMethod;
          state.isAuthenticated = true;
        } else {
          state.isAuthenticated = false;
          state.token = null;
          state.loginMethod = null;
        }
        state.loading = false;
      })
      .addCase(checkAuthStatus.rejected, state => {
        state.isAuthenticated = false;
        state.token = null;
        state.loginMethod = null;
        state.loading = false;
      });
  },
});

export const { setUser, setToken, setLoginMethod, setLoading, clearError } =
  authSlice.actions;
export default authSlice.reducer;
