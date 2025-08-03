import { storeService } from '../storeService';

// Mock fetch globally
global.fetch = jest.fn();

describe('storeService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getStoreTimes', () => {
    it('should fetch store times successfully', async () => {
      const mockStoreTimes = [
        {
          id: '1',
          day_of_week: 1,
          start_time: '09:00',
          end_time: '17:00',
          is_open: true,
        },
        {
          id: '2',
          day_of_week: 2,
          start_time: '09:00',
          end_time: '17:00',
          is_open: true,
        },
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockStoreTimes,
      });

      const result = await storeService.getStoreTimes();

      expect(fetch).toHaveBeenCalledWith(
        'https://coding-challenge-pd-1a25b1a14f34.herokuapp.com/store-times/',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      expect(result).toEqual(mockStoreTimes);
    });

    it('should handle API errors', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ message: 'Internal Server Error' }),
      });

      await expect(storeService.getStoreTimes()).rejects.toThrow(
        'Internal Server Error',
      );
    });

    it('should handle network errors', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(storeService.getStoreTimes()).rejects.toThrow(
        'Network error',
      );
    });
  });

  describe('getStoreOverrides', () => {
    it('should fetch store overrides successfully', async () => {
      const mockOverrides = [
        {
          id: '1',
          day: 2,
          month: 8,
          is_open: false,
          start_time: '',
          end_time: '',
        },
        {
          id: '2',
          day: 3,
          month: 8,
          is_open: true,
          start_time: '10:00',
          end_time: '16:00',
        },
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockOverrides,
      });

      const result = await storeService.getStoreOverrides();

      expect(fetch).toHaveBeenCalledWith(
        'https://coding-challenge-pd-1a25b1a14f34.herokuapp.com/store-overrides/',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      expect(result).toEqual(mockOverrides);
    });

    it('should handle API errors for overrides', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ message: 'Not Found' }),
      });

      await expect(storeService.getStoreOverrides()).rejects.toThrow(
        'Not Found',
      );
    });
  });

  describe('mergeStoreTimesWithOverrides', () => {
    const baseStoreTimes = [
      {
        id: '1',
        day_of_week: 1, // Monday
        start_time: '09:00',
        end_time: '17:00',
        is_open: true,
      },
      {
        id: '2',
        day_of_week: 2, // Tuesday
        start_time: '09:00',
        end_time: '17:00',
        is_open: true,
      },
    ];

    it('should return base store times when no overrides exist', () => {
      const overrides: any[] = [];
      const date = '2025-08-04'; // Monday

      const result = storeService.mergeStoreTimesWithOverrides(
        baseStoreTimes,
        overrides,
        date,
      );

      expect(result).toEqual([
        {
          id: '1',
          day_of_week: 1,
          start_time: '09:00',
          end_time: '17:00',
          is_open: true,
        },
      ]);
    });

    it('should apply override to close store on specific date', () => {
      const overrides = [
        {
          id: '1',
          day: 4, // August 4th
          month: 8, // August
          is_open: false,
          start_time: '',
          end_time: '',
        },
      ];
      const date = '2025-08-04'; // Monday

      const result = storeService.mergeStoreTimesWithOverrides(
        baseStoreTimes,
        overrides,
        date,
      );

      expect(result).toEqual([
        {
          id: '1',
          day_of_week: 1,
          start_time: '',
          end_time: '',
          is_open: false, // Override applied
        },
      ]);
    });

    it('should apply override to modify hours on specific date', () => {
      const overrides = [
        {
          id: '1',
          day: 4, // August 4th
          month: 8, // August
          is_open: true,
          start_time: '10:00',
          end_time: '16:00',
        },
      ];
      const date = '2025-08-04'; // Monday

      const result = storeService.mergeStoreTimesWithOverrides(
        baseStoreTimes,
        overrides,
        date,
      );

      expect(result).toEqual([
        {
          id: '1',
          day_of_week: 1,
          start_time: '10:00', // Override applied
          end_time: '16:00', // Override applied
          is_open: true,
        },
      ]);
    });

    it('should handle multiple overrides for same date', () => {
      const overrides = [
        {
          id: '1',
          day: 4,
          month: 8,
          is_open: false,
          start_time: '',
          end_time: '',
        },
        {
          id: '2',
          day: 4,
          month: 8,
          is_open: true,
          start_time: '12:00',
          end_time: '18:00',
        },
      ];
      const date = '2025-08-04';

      const result = storeService.mergeStoreTimesWithOverrides(
        baseStoreTimes,
        overrides,
        date,
      );

      // Should use the first override (find() returns first match)
      expect(result).toEqual([
        {
          id: '1',
          day_of_week: 1,
          start_time: '',
          end_time: '',
          is_open: false,
        },
      ]);
    });

    it('should not apply overrides for different dates', () => {
      const overrides = [
        {
          id: '1',
          day: 5, // August 5th (Tuesday)
          month: 8,
          is_open: false,
          start_time: '',
          end_time: '',
        },
      ];
      const date = '2025-08-04'; // Monday

      const result = storeService.mergeStoreTimesWithOverrides(
        baseStoreTimes,
        overrides,
        date,
      );

      expect(result).toEqual([
        {
          id: '1',
          day_of_week: 1,
          start_time: '09:00',
          end_time: '17:00',
          is_open: true, // No override applied
        },
      ]);
    });
  });
});
