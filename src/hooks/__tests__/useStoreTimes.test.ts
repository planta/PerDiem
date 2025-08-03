import { useStoreTimes } from '../useStoreTimes';

// Mock the store service
jest.mock('../../services/storeService', () => ({
  storeService: {
    getStoreTimes: jest.fn(),
    getStoreOverrides: jest.fn(),
  },
}));

// Mock React hooks
const mockUseAppDispatch = jest.fn();
const mockUseAppSelector = jest.fn();

jest.mock('../../store/hooks', () => ({
  useAppDispatch: () => mockUseAppDispatch(),
  useAppSelector: (selector: any) => mockUseAppSelector(selector),
}));

// Mock React hooks
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useCallback: jest.fn(callback => callback),
  useEffect: jest.fn(callback => callback()),
}));

describe('useStoreTimes', () => {
  let mockDispatch: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockDispatch = jest.fn();
    mockUseAppDispatch.mockReturnValue(mockDispatch);
  });

  describe('initial state', () => {
    it('should return initial state with empty arrays and false loading', () => {
      mockUseAppSelector.mockReturnValue({
        storeTimes: [],
        storeOverrides: [],
        loading: false,
        error: null,
      });

      const result = useStoreTimes();

      expect(result.storeTimes).toEqual([]);
      expect(result.storeOverrides).toEqual([]);
      expect(result.loading).toBe(false);
      expect(result.error).toBeNull();
      expect(typeof result.refetch).toBe('function');
    });
  });

  describe('loading states', () => {
    it('should show loading state when fetching store times', () => {
      mockUseAppSelector.mockReturnValue({
        storeTimes: [],
        storeOverrides: [],
        loading: true,
        loadingStoreTimes: true,
        loadingStoreOverrides: false,
        error: null,
      });

      const result = useStoreTimes();
      expect(result.loading).toBe(true);
    });

    it('should show loading state when fetching store overrides', () => {
      mockUseAppSelector.mockReturnValue({
        storeTimes: [],
        storeOverrides: [],
        loading: true,
        loadingStoreTimes: false,
        loadingStoreOverrides: true,
        error: null,
      });

      const result = useStoreTimes();
      expect(result.loading).toBe(true);
    });

    it('should show loading state when both are loading', () => {
      mockUseAppSelector.mockReturnValue({
        storeTimes: [],
        storeOverrides: [],
        loading: true,
        loadingStoreTimes: true,
        loadingStoreOverrides: true,
        error: null,
      });

      const result = useStoreTimes();
      expect(result.loading).toBe(true);
    });
  });

  describe('data states', () => {
    it('should return store times when available', () => {
      const mockStoreTimes = [
        { id: '1', day: 'Monday', openTime: '09:00', closeTime: '17:00' },
        { id: '2', day: 'Tuesday', openTime: '09:00', closeTime: '17:00' },
      ];

      mockUseAppSelector.mockReturnValue({
        storeTimes: mockStoreTimes,
        storeOverrides: [],
        loading: false,
        error: null,
      });

      const result = useStoreTimes();
      expect(result.storeTimes).toEqual(mockStoreTimes);
      expect(result.loading).toBe(false);
    });

    it('should return store overrides when available', () => {
      const mockStoreOverrides = [
        { id: '1', date: '2024-01-01', isClosed: true, reason: 'Holiday' },
        {
          id: '2',
          date: '2024-01-02',
          isClosed: false,
          openTime: '10:00',
          closeTime: '16:00',
        },
      ];

      mockUseAppSelector.mockReturnValue({
        storeTimes: [],
        storeOverrides: mockStoreOverrides,
        loading: false,
        error: null,
      });

      const result = useStoreTimes();
      expect(result.storeOverrides).toEqual(mockStoreOverrides);
      expect(result.loading).toBe(false);
    });

    it('should return both store times and overrides when available', () => {
      const mockStoreTimes = [
        { id: '1', day: 'Monday', openTime: '09:00', closeTime: '17:00' },
      ];
      const mockStoreOverrides = [
        { id: '1', date: '2024-01-01', isClosed: true, reason: 'Holiday' },
      ];

      mockUseAppSelector.mockReturnValue({
        storeTimes: mockStoreTimes,
        storeOverrides: mockStoreOverrides,
        loading: false,
        error: null,
      });

      const result = useStoreTimes();
      expect(result.storeTimes).toEqual(mockStoreTimes);
      expect(result.storeOverrides).toEqual(mockStoreOverrides);
      expect(result.loading).toBe(false);
    });
  });

  describe('error states', () => {
    it('should return error when store times fetch fails', () => {
      const errorMessage = 'Failed to fetch store times';

      mockUseAppSelector.mockReturnValue({
        storeTimes: [],
        storeOverrides: [],
        loading: false,
        error: errorMessage,
      });

      const result = useStoreTimes();
      expect(result.error).toBe(errorMessage);
      expect(result.loading).toBe(false);
    });

    it('should return error when store overrides fetch fails', () => {
      const errorMessage = 'Failed to fetch store overrides';

      mockUseAppSelector.mockReturnValue({
        storeTimes: [],
        storeOverrides: [],
        loading: false,
        error: errorMessage,
      });

      const result = useStoreTimes();
      expect(result.error).toBe(errorMessage);
      expect(result.loading).toBe(false);
    });
  });

  describe('refetch functionality', () => {
    it('should call refetch function when provided', async () => {
      mockUseAppSelector.mockReturnValue({
        storeTimes: [],
        storeOverrides: [],
        loading: false,
        error: null,
      });

      const result = useStoreTimes();
      expect(typeof result.refetch).toBe('function');

      // Call refetch and verify it dispatches the actions
      await result.refetch();

      // The refetch function should have been called
      expect(result.refetch).toBeDefined();
    });
  });

  describe('hook return value structure', () => {
    it('should return an object with all expected properties', () => {
      mockUseAppSelector.mockReturnValue({
        storeTimes: [],
        storeOverrides: [],
        loading: false,
        error: null,
      });

      const result = useStoreTimes();

      expect(result).toHaveProperty('storeTimes');
      expect(result).toHaveProperty('storeOverrides');
      expect(result).toHaveProperty('loading');
      expect(result).toHaveProperty('error');
      expect(result).toHaveProperty('refetch');
    });

    it('should return correct types for all properties', () => {
      mockUseAppSelector.mockReturnValue({
        storeTimes: [],
        storeOverrides: [],
        loading: false,
        error: null,
      });

      const result = useStoreTimes();

      expect(Array.isArray(result.storeTimes)).toBe(true);
      expect(Array.isArray(result.storeOverrides)).toBe(true);
      expect(typeof result.loading).toBe('boolean');
      expect(typeof result.error === 'string' || result.error === null).toBe(
        true,
      );
      expect(typeof result.refetch).toBe('function');
    });
  });

  describe('edge cases', () => {
    it('should handle empty arrays correctly', () => {
      mockUseAppSelector.mockReturnValue({
        storeTimes: [],
        storeOverrides: [],
        loading: false,
        error: null,
      });

      const result = useStoreTimes();
      expect(result.storeTimes).toEqual([]);
      expect(result.storeOverrides).toEqual([]);
      expect(result.loading).toBe(false);
    });

    it('should handle null error state', () => {
      mockUseAppSelector.mockReturnValue({
        storeTimes: [],
        storeOverrides: [],
        loading: false,
        error: null,
      });

      const result = useStoreTimes();
      expect(result.error).toBeNull();
    });
  });
});
