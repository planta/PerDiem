# JWT Token Authentication Guide

This guide explains how the JWT token authentication system works in the PerDiem app.

## Overview

The app supports JWT token-based authentication for login functionality with differentiated handling for Google and email/password logins. Store times are fetched without authentication since they are public data.

## Components

### 1. Token Storage (`src/services/tokenStorage.ts`)

Handles persistent storage of JWT tokens using AsyncStorage:

```typescript
import { tokenStorage } from './services/tokenStorage';

// Store a token
await tokenStorage.setToken('your-jwt-token');

// Retrieve a token
const token = await tokenStorage.getToken();

// Remove a token (for logout)
await tokenStorage.removeToken();

// Check if token exists
const hasToken = await tokenStorage.hasToken();
```

### 2. Authentication Service (`src/services/authService.ts`)

Enhanced to handle JWT tokens from login responses:

```typescript
import { authService } from './services/authService';

// Sign in with email/password - automatically stores JWT token
const result = await authService.signInWithEmailAndPassword(email, password);
if (result.success) {
  console.log('Token stored:', result.token);
}

// Get stored token
const token = await authService.getStoredToken();

// Remove stored token (for logout)
await authService.removeStoredToken();
```

### 3. Store Service (`src/services/storeService.ts`)

Handles store times API without authentication (public data):

```typescript
import { storeService } from './services/storeService';

// Get store times (public endpoint, no authentication required)
const storeTimes = await storeService.getStoreTimes();

// Helper functions
const dayName = storeService.getDayName(5); // Returns "Friday"
const formattedTime = storeService.formatTime('09:00'); // Returns "9:00 AM"
```

### 4. Redux Store

#### Auth Slice (`src/store/authSlice.ts`)

Manages authentication state including tokens and login method:

```typescript
import { useAppSelector } from './store/hooks';

const { isAuthenticated, user, token, loginMethod, loading } = useAppSelector(
  state => state.auth,
);
```

#### Store Times Slice (`src/store/storeSlice.ts`)

Manages store times state with async thunks:

```typescript
import { useAppSelector, useAppDispatch } from './store/hooks';
import { fetchStoreTimes } from './store/storeSlice';

const dispatch = useAppDispatch();
const { storeTimes, loading, error } = useAppSelector(
  state => state.storeTimes,
);

// Fetch store times
await dispatch(fetchStoreTimes()).unwrap();
```

## Login Method Tracking

The app now tracks how users logged in to handle logout correctly:

### **Email/Password Login**

- Stores JWT token in AsyncStorage
- `loginMethod` is set to `'email'`
- Logout removes stored token

### **Google Login**

- Uses Firebase authentication
- `loginMethod` is set to `'google'`
- Logout calls Firebase signOut

### **Usage Example**

```typescript
const { loginMethod } = useAppSelector(state => state.auth);

// Check login method
if (loginMethod === 'email') {
  console.log('User logged in with email/password');
} else if (loginMethod === 'google') {
  console.log('User logged in with Google');
}
```

## Usage Examples

### Using Store Times in Components

```typescript
import React, { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { fetchStoreTimes } from './store/storeSlice';

const MyComponent = () => {
  const dispatch = useAppDispatch();
  const { storeTimes, loading, error } = useAppSelector(
    state => state.storeTimes,
  );

  const handleFetchStoreTimes = useCallback(async () => {
    try {
      await dispatch(fetchStoreTimes()).unwrap();
    } catch (error) {
      console.error('Failed to fetch store times:', error);
    }
  }, [dispatch]);

  useEffect(() => {
    handleFetchStoreTimes();
  }, [handleFetchStoreTimes]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <View>
      {storeTimes.map(storeTime => (
        <StoreTimeCard key={storeTime.id} storeTime={storeTime} />
      ))}
    </View>
  );
};
```

### Handling Different Logout Methods

```typescript
import { useAppDispatch, useAppSelector } from './store/hooks';
import { signOut } from './store/authSlice';

const MyComponent = () => {
  const dispatch = useAppDispatch();
  const { loginMethod } = useAppSelector(state => state.auth);

  const handleLogout = async () => {
    try {
      await dispatch(signOut()).unwrap();
      // Logout automatically handles the correct method based on loginMethod
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <TouchableOpacity onPress={handleLogout}>
      <Text>Logout ({loginMethod})</Text>
    </TouchableOpacity>
  );
};
```

### Handling Token Expiration

The authentication system handles token expiration:

```typescript
// If a request returns 401, the token is automatically removed
// and an error is thrown with the message "Token expired. Please sign in again."
try {
  const response = await authService.signInWithEmailAndPassword(
    email,
    password,
  );
} catch (error) {
  if (error.message.includes('Token expired')) {
    // Redirect to login screen
    // The token has already been removed from storage
  }
}
```

## API Response Format

### Authentication Endpoint

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVzZXJAdHJ5cGVyZGllbS5jb20iLCJpYXQiOjE3NTQwMzE0MTYsImV4cCI6MTc1NDAzNTAxNn0.bbAvYuShbgp-rcexZe2yiZAdqCVx7taxQp4ysM2ZLPw"
}
```

### Store Times Endpoint (Public)

```json
[
  {
    "id": "905f8a19-b9f0-4d59-8ff8-d31718c33d95",
    "day_of_week": 5,
    "is_open": true,
    "start_time": "09:00",
    "end_time": "17:00"
  }
]
```

The token is automatically:

1. Stored in AsyncStorage
2. Added to Redux state
3. Used for authenticated endpoints (login)

## Redux State Structure

```typescript
interface RootState {
  auth: {
    isAuthenticated: boolean;
    user: User | null;
    token: string | null;
    loginMethod: 'email' | 'google' | null;
    loading: boolean;
    error: string | null;
  };
  storeTimes: {
    storeTimes: StoreTime[];
    loading: boolean;
    error: string | null;
  };
}
```

## Security Features

1. **Automatic Token Storage**: Tokens are securely stored using AsyncStorage
2. **Differentiated Logout**: Correct logout method based on login type
3. **Secure Logout**: Tokens are properly removed on logout
4. **Persistent Authentication**: App remembers authentication state across restarts
5. **Redux State Management**: Store times and other data are managed centrally
6. **Public Data Access**: Store times are fetched without authentication
7. **Login Method Tracking**: Tracks how user authenticated for proper logout

## Error Handling

The system handles various error scenarios:

- **Network errors**: Thrown as errors with descriptive messages
- **Token expiration**: Automatically removes expired tokens
- **Invalid responses**: Parses error messages from API responses
- **Storage errors**: Logs errors but doesn't crash the app
- **Redux errors**: Managed in slice state with loading and error states
- **Login method errors**: Handles different authentication flows

## Testing

To test the JWT token system:

1. Sign in with valid credentials (email/password)
2. Check that the token is stored and loginMethod is 'email'
3. Sign out and verify token is removed
4. Sign in with Google and check loginMethod is 'google'
5. Sign out and verify Firebase signOut is called
6. Test app restart to ensure authentication state is preserved
7. Test store times fetching and display
