import { tokenStorage } from './tokenStorage';

export const authService = {
  signInWithEmailAndPassword: async (email: string, password: string) => {
    try {
      const response = await fetch(
        'https://coding-challenge-pd-1a25b1a14f34.herokuapp.com/auth/',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      // Store the JWT token
      if (data.token) {
        await tokenStorage.setToken(data.token);
      }

      return {
        success: true,
        user: {
          uid: data.user?.id || 'custom-user-id',
          email: data.user?.email || email,
          displayName: data.user?.name || email.split('@')[0],
        },
        token: data.token,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Get stored token
  getStoredToken: async () => {
    return await tokenStorage.getToken();
  },

  // Remove stored token (for logout)
  removeStoredToken: async () => {
    await tokenStorage.removeToken();
  },

  // Check if user has a valid token
  hasValidToken: async () => {
    return await tokenStorage.hasToken();
  },
};
