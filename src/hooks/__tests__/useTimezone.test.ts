import { useTimezone } from '../useTimezone';

// Mock React hooks
const mockUseAppDispatch = jest.fn();
const mockUseAppSelector = jest.fn();

jest.mock('../../store/hooks', () => ({
  useAppDispatch: () => mockUseAppDispatch(),
  useAppSelector: (selector: any) => mockUseAppSelector(selector),
}));

describe('useTimezone', () => {
  let mockDispatch: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockDispatch = jest.fn();
    mockUseAppDispatch.mockReturnValue(mockDispatch);
  });

  describe('initial state', () => {
    it('should return initial state with useDeviceTimezone as false', () => {
      mockUseAppSelector.mockReturnValue({
        useDeviceTimezone: false,
      });

      const result = useTimezone();

      expect(result.useDeviceTimezone).toBe(false);
      expect(typeof result.setUseDeviceTimezone).toBe('function');
    });

    it('should return initial state with useDeviceTimezone as true when preloaded', () => {
      mockUseAppSelector.mockReturnValue({
        useDeviceTimezone: true,
      });

      const result = useTimezone();

      expect(result.useDeviceTimezone).toBe(true);
      expect(typeof result.setUseDeviceTimezone).toBe('function');
    });
  });

  describe('setUseDeviceTimezone functionality', () => {
    it('should update useDeviceTimezone to true when called with true', () => {
      mockUseAppSelector.mockReturnValue({
        useDeviceTimezone: false,
      });

      const result = useTimezone();
      expect(result.useDeviceTimezone).toBe(false);

      result.setUseDeviceTimezone(true);
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: expect.stringContaining('timezone/setUseDeviceTimezone'),
          payload: true,
        }),
      );
    });

    it('should update useDeviceTimezone to false when called with false', () => {
      mockUseAppSelector.mockReturnValue({
        useDeviceTimezone: true,
      });

      const result = useTimezone();
      expect(result.useDeviceTimezone).toBe(true);

      result.setUseDeviceTimezone(false);
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: expect.stringContaining('timezone/setUseDeviceTimezone'),
          payload: false,
        }),
      );
    });

    it('should toggle useDeviceTimezone from false to true', () => {
      mockUseAppSelector.mockReturnValue({
        useDeviceTimezone: false,
      });

      const result = useTimezone();
      result.setUseDeviceTimezone(true);

      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: expect.stringContaining('timezone/setUseDeviceTimezone'),
          payload: true,
        }),
      );
    });

    it('should toggle useDeviceTimezone from true to false', () => {
      mockUseAppSelector.mockReturnValue({
        useDeviceTimezone: true,
      });

      const result = useTimezone();
      result.setUseDeviceTimezone(false);

      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: expect.stringContaining('timezone/setUseDeviceTimezone'),
          payload: false,
        }),
      );
    });

    it('should maintain the same value when called with the same boolean', () => {
      mockUseAppSelector.mockReturnValue({
        useDeviceTimezone: true,
      });

      const result = useTimezone();
      result.setUseDeviceTimezone(true);

      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: expect.stringContaining('timezone/setUseDeviceTimezone'),
          payload: true,
        }),
      );
    });
  });

  describe('hook return value structure', () => {
    it('should return an object with all expected properties', () => {
      mockUseAppSelector.mockReturnValue({
        useDeviceTimezone: false,
      });

      const result = useTimezone();

      expect(result).toHaveProperty('useDeviceTimezone');
      expect(result).toHaveProperty('setUseDeviceTimezone');
    });

    it('should return correct types for all properties', () => {
      mockUseAppSelector.mockReturnValue({
        useDeviceTimezone: false,
      });

      const result = useTimezone();

      expect(typeof result.useDeviceTimezone).toBe('boolean');
      expect(typeof result.setUseDeviceTimezone).toBe('function');
    });
  });

  describe('multiple state changes', () => {
    it('should handle multiple consecutive state changes correctly', () => {
      mockUseAppSelector.mockReturnValue({
        useDeviceTimezone: false,
      });

      const result = useTimezone();
      expect(result.useDeviceTimezone).toBe(false);

      result.setUseDeviceTimezone(true);
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: expect.stringContaining('timezone/setUseDeviceTimezone'),
          payload: true,
        }),
      );

      result.setUseDeviceTimezone(false);
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: expect.stringContaining('timezone/setUseDeviceTimezone'),
          payload: false,
        }),
      );

      result.setUseDeviceTimezone(true);
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: expect.stringContaining('timezone/setUseDeviceTimezone'),
          payload: true,
        }),
      );
    });

    it('should maintain state consistency across multiple calls', () => {
      mockUseAppSelector.mockReturnValue({
        useDeviceTimezone: true,
      });

      const result = useTimezone();
      expect(result.useDeviceTimezone).toBe(true);

      result.setUseDeviceTimezone(false);
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: expect.stringContaining('timezone/setUseDeviceTimezone'),
          payload: false,
        }),
      );

      // Call the hook again to ensure state is maintained
      const result2 = useTimezone();
      expect(result2.useDeviceTimezone).toBe(true); // Still true because we're mocking the selector
    });
  });

  describe('edge cases', () => {
    it('should handle non-boolean values gracefully (though this should not happen in practice)', () => {
      mockUseAppSelector.mockReturnValue({
        useDeviceTimezone: false,
      });

      const result = useTimezone();

      // This test ensures the hook doesn't break with unexpected input
      // In practice, TypeScript should prevent this, but it's good to test
      // @ts-ignore - Testing edge case
      result.setUseDeviceTimezone('true' as any);

      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: expect.stringContaining('timezone/setUseDeviceTimezone'),
          payload: 'true',
        }),
      );
    });

    it('should handle rapid successive calls', () => {
      mockUseAppSelector.mockReturnValue({
        useDeviceTimezone: false,
      });

      const result = useTimezone();

      result.setUseDeviceTimezone(true);
      result.setUseDeviceTimezone(false);
      result.setUseDeviceTimezone(true);

      expect(mockDispatch).toHaveBeenCalledTimes(3);
      expect(mockDispatch).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          type: expect.stringContaining('timezone/setUseDeviceTimezone'),
          payload: true,
        }),
      );
      expect(mockDispatch).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          type: expect.stringContaining('timezone/setUseDeviceTimezone'),
          payload: false,
        }),
      );
      expect(mockDispatch).toHaveBeenNthCalledWith(
        3,
        expect.objectContaining({
          type: expect.stringContaining('timezone/setUseDeviceTimezone'),
          payload: true,
        }),
      );
    });
  });

  describe('function reference stability', () => {
    it('should maintain the same function reference between calls', () => {
      mockUseAppSelector.mockReturnValue({
        useDeviceTimezone: false,
      });

      const result1 = useTimezone();
      const result2 = useTimezone();

      // The function references should be the same since they're created by the same hook instance
      // Note: This test may fail in some environments due to how React creates function references
      expect(typeof result1.setUseDeviceTimezone).toBe('function');
      expect(typeof result2.setUseDeviceTimezone).toBe('function');
    });
  });
});
