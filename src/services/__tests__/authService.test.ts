import { authService } from '../authService';
import { tokenStorage } from '../tokenStorage';

// Mock fetch globally
global.fetch = jest.fn();

// Mock tokenStorage
jest.mock('../tokenStorage', () => ({
  tokenStorage: {
    setToken: jest.fn(),
    getToken: jest.fn(),
    removeToken: jest.fn(),
    hasToken: jest.fn(),
  },
}));

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signInWithEmailAndPassword', () => {
    it('should sign in successfully with valid credentials', async () => {
      const mockResponse = {
        token: 'mock-jwt-token',
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
        },
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await authService.signInWithEmailAndPassword(
        'test@example.com',
        'password123',
      );

      expect(fetch).toHaveBeenCalledWith(
        'https://coding-challenge-pd-1a25b1a14f34.herokuapp.com/auth/',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'password123',
          }),
        },
      );

      expect(tokenStorage.setToken).toHaveBeenCalledWith('mock-jwt-token');
      expect(result).toEqual({
        success: true,
        user: {
          uid: 'user-123',
          email: 'test@example.com',
          displayName: 'Test User',
        },
        token: 'mock-jwt-token',
      });
    });

    it('should handle authentication failure', async () => {
      const mockResponse = {
        message: 'Invalid credentials',
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => mockResponse,
      });

      const result = await authService.signInWithEmailAndPassword(
        'test@example.com',
        'wrongpassword',
      );

      expect(result).toEqual({
        success: false,
        error: 'Invalid credentials',
      });
      expect(tokenStorage.setToken).not.toHaveBeenCalled();
    });

    it('should handle network errors', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await authService.signInWithEmailAndPassword(
        'test@example.com',
        'password123',
      );

      expect(result).toEqual({
        success: false,
        error: 'Network error',
      });
    });

    it('should handle missing token in response', async () => {
      const mockResponse = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
        },
        // No token
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await authService.signInWithEmailAndPassword(
        'test@example.com',
        'password123',
      );

      expect(tokenStorage.setToken).not.toHaveBeenCalled();
      expect(result).toEqual({
        success: true,
        user: {
          uid: 'user-123',
          email: 'test@example.com',
          displayName: 'Test User',
        },
        token: undefined,
      });
    });

    it('should handle missing user data in response', async () => {
      const mockResponse = {
        token: 'mock-jwt-token',
        // No user data
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await authService.signInWithEmailAndPassword(
        'test@example.com',
        'password123',
      );

      expect(result).toEqual({
        success: true,
        user: {
          uid: 'custom-user-id',
          email: 'test@example.com',
          displayName: 'test', // email.split('@')[0]
        },
        token: 'mock-jwt-token',
      });
    });
  });

  describe('getStoredToken', () => {
    it('should return stored token', async () => {
      const mockToken = 'stored-jwt-token';
      (tokenStorage.getToken as jest.Mock).mockResolvedValue(mockToken);

      const result = await authService.getStoredToken();
      expect(result).toBe(mockToken);
      expect(tokenStorage.getToken).toHaveBeenCalled();
    });
  });

  describe('removeStoredToken', () => {
    it('should remove stored token', async () => {
      await authService.removeStoredToken();
      expect(tokenStorage.removeToken).toHaveBeenCalled();
    });
  });

  describe('hasValidToken', () => {
    it('should return true when token exists', async () => {
      (tokenStorage.hasToken as jest.Mock).mockResolvedValue(true);

      const result = await authService.hasValidToken();
      expect(result).toBe(true);
      expect(tokenStorage.hasToken).toHaveBeenCalled();
    });

    it('should return false when no token exists', async () => {
      (tokenStorage.hasToken as jest.Mock).mockResolvedValue(false);

      const result = await authService.hasValidToken();
      expect(result).toBe(false);
      expect(tokenStorage.hasToken).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle malformed JSON response', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      const result = await authService.signInWithEmailAndPassword(
        'test@example.com',
        'password123',
      );

      expect(result).toEqual({
        success: false,
        error: 'Invalid JSON',
      });
    });

    it('should handle response without message field', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({}), // No message field
      });

      const result = await authService.signInWithEmailAndPassword(
        'test@example.com',
        'password123',
      );

      expect(result).toEqual({
        success: false,
        error: 'Authentication failed',
      });
    });
  });
});
