import { getSelectedDateInfo, getStoreTimesForTimeSlots } from '../storeUtils';
import { storeService } from '../../services/storeService';

// Mock the storeService
jest.mock('../../services/storeService', () => ({
  storeService: {
    mergeStoreTimesWithOverrides: jest.fn(),
  },
}));

describe('storeUtils', () => {
  const mockStoreTimes = [
    {
      id: 1,
      day_of_week: 1, // Monday
      start_time: '09:00',
      end_time: '17:00',
      is_open: true,
    },
    {
      id: 2,
      day_of_week: 2, // Tuesday
      start_time: '10:00',
      end_time: '18:00',
      is_open: true,
    },
    {
      id: 3,
      day_of_week: 3, // Wednesday
      start_time: '09:00',
      end_time: '17:00',
      is_open: false,
    },
  ];

  const mockStoreOverrides = [
    {
      id: 1,
      date: '2025-08-04',
      is_open: false,
      start_time: null,
      end_time: null,
      reason: 'Holiday',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getSelectedDateInfo', () => {
    it('should return correct date info for a Monday', () => {
      const selectedDate = '2025-08-04'; // Monday
      const mergedTimes = [
        {
          id: 1,
          day_of_week: 1,
          start_time: '09:00',
          end_time: '17:00',
          is_open: true,
        },
      ];

      (storeService.mergeStoreTimesWithOverrides as jest.Mock).mockReturnValue(
        mergedTimes,
      );

      const result = getSelectedDateInfo(
        selectedDate,
        mockStoreTimes,
        mockStoreOverrides,
        false, // useDeviceTimezone = false
      );

      expect(result.dayName).toBe('Monday');
      expect(result.dateString).toBe('Aug 4, 2025');
      expect(result.isOpen).toBe(true);
      expect(result.storeTimes).toBe('9:00 AM - 5:00 PM');
      expect(storeService.mergeStoreTimesWithOverrides).toHaveBeenCalledWith(
        mockStoreTimes,
        mockStoreOverrides,
        selectedDate,
      );
    });

    it('should return closed status when store is not open', () => {
      const selectedDate = '2025-08-06'; // Wednesday
      const mergedTimes = [
        {
          id: 3,
          day_of_week: 3,
          start_time: '09:00',
          end_time: '17:00',
          is_open: false,
        },
      ];

      (storeService.mergeStoreTimesWithOverrides as jest.Mock).mockReturnValue(
        mergedTimes,
      );

      const result = getSelectedDateInfo(
        selectedDate,
        mockStoreTimes,
        mockStoreOverrides,
        false,
      );

      expect(result.dayName).toBe('Wednesday');
      expect(result.dateString).toBe('Aug 6, 2025');
      expect(result.isOpen).toBe(false);
      expect(result.storeTimes).toBe('');
    });

    it('should handle multiple time slots correctly', () => {
      const selectedDate = '2025-08-04';
      const mergedTimes = [
        {
          id: 1,
          day_of_week: 1,
          start_time: '09:00',
          end_time: '12:00',
          is_open: true,
        },
        {
          id: 2,
          day_of_week: 1,
          start_time: '13:00',
          end_time: '17:00',
          is_open: true,
        },
      ];

      (storeService.mergeStoreTimesWithOverrides as jest.Mock).mockReturnValue(
        mergedTimes,
      );

      const result = getSelectedDateInfo(
        selectedDate,
        mockStoreTimes,
        mockStoreOverrides,
        false,
      );

      expect(result.isOpen).toBe(true);
      expect(result.storeTimes).toBe('9:00 AM - 12:00 PM, 1:00 PM - 5:00 PM');
    });

    it('should handle timezone conversion when useDeviceTimezone is true', () => {
      const selectedDate = '2025-08-04';
      const mergedTimes = [
        {
          id: 1,
          day_of_week: 1,
          start_time: '09:00',
          end_time: '17:00',
          is_open: true,
        },
      ];

      (storeService.mergeStoreTimesWithOverrides as jest.Mock).mockReturnValue(
        mergedTimes,
      );

      const result = getSelectedDateInfo(
        selectedDate,
        mockStoreTimes,
        mockStoreOverrides,
        true, // useDeviceTimezone = true
      );

      expect(result.isOpen).toBe(true);
      // The exact time will depend on the timezone conversion
      expect(result.storeTimes).toMatch(
        /\d{1,2}:\d{2} (AM|PM) - \d{1,2}:\d{2} (AM|PM)/,
      );
    });

    it('should handle empty store times array', () => {
      const selectedDate = '2025-08-04';
      const mergedTimes: any[] = [];

      (storeService.mergeStoreTimesWithOverrides as jest.Mock).mockReturnValue(
        mergedTimes,
      );

      const result = getSelectedDateInfo(
        selectedDate,
        mockStoreTimes,
        mockStoreOverrides,
        false,
      );

      expect(result.isOpen).toBe(false);
      expect(result.storeTimes).toBe('');
    });
  });

  describe('getStoreTimesForTimeSlots', () => {
    it('should return only open times for time slot generation', () => {
      const selectedDate = '2025-08-04';
      const mergedTimes = [
        {
          id: 1,
          day_of_week: 1,
          start_time: '09:00',
          end_time: '17:00',
          is_open: true,
        },
        {
          id: 2,
          day_of_week: 1,
          start_time: '10:00',
          end_time: '18:00',
          is_open: false,
        },
      ];

      (storeService.mergeStoreTimesWithOverrides as jest.Mock).mockReturnValue(
        mergedTimes,
      );

      const result = getStoreTimesForTimeSlots(
        selectedDate,
        mockStoreTimes,
        mockStoreOverrides,
      );

      expect(result).toEqual([
        {
          id: 1,
          day_of_week: 1,
          start_time: '09:00',
          end_time: '17:00',
          is_open: true,
        },
      ]);
      expect(storeService.mergeStoreTimesWithOverrides).toHaveBeenCalledWith(
        mockStoreTimes,
        mockStoreOverrides,
        selectedDate,
      );
    });

    it('should return empty array when no open times', () => {
      const selectedDate = '2025-08-04';
      const mergedTimes = [
        {
          id: 1,
          day_of_week: 1,
          start_time: '09:00',
          end_time: '17:00',
          is_open: false,
        },
      ];

      (storeService.mergeStoreTimesWithOverrides as jest.Mock).mockReturnValue(
        mergedTimes,
      );

      const result = getStoreTimesForTimeSlots(
        selectedDate,
        mockStoreTimes,
        mockStoreOverrides,
      );

      expect(result).toEqual([]);
    });

    it('should handle empty merged times', () => {
      const selectedDate = '2025-08-04';
      const mergedTimes: any[] = [];

      (storeService.mergeStoreTimesWithOverrides as jest.Mock).mockReturnValue(
        mergedTimes,
      );

      const result = getStoreTimesForTimeSlots(
        selectedDate,
        mockStoreTimes,
        mockStoreOverrides,
      );

      expect(result).toEqual([]);
    });
  });
});
