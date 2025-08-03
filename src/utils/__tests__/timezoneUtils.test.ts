import {
  convertTimeToTimezone,
  getDeviceTimezone,
  getDisplayTimezone,
  timeStringToTimestamp,
  timestampToTimeString,
  isTimeInFuture,
  getCurrentDateInTimezone,
} from '../timezoneUtils';

// Mock date-fns-tz
jest.mock('date-fns-tz', () => ({
  getTimezoneOffset: jest.fn(),
}));

import { getTimezoneOffset } from 'date-fns-tz';

describe('timezoneUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getDeviceTimezone', () => {
    it('should return device timezone', () => {
      const timezone = getDeviceTimezone();
      expect(typeof timezone).toBe('string');
      expect(timezone.length).toBeGreaterThan(0);
    });
  });

  describe('getDisplayTimezone', () => {
    it('should return NY timezone when useDeviceTimezone is false', () => {
      const result = getDisplayTimezone(false);
      expect(result).toBe('New York');
    });

    it('should return device timezone when useDeviceTimezone is true', () => {
      const mockDeviceTimezone = 'Europe/Zagreb';
      jest.spyOn(Intl, 'DateTimeFormat').mockReturnValue({
        resolvedOptions: () => ({ timeZone: mockDeviceTimezone }),
      } as any);

      const result = getDisplayTimezone(true);
      expect(result).toBe('Zagreb');
    });
  });

  describe('convertTimeToTimezone', () => {
    beforeEach(() => {
      (getTimezoneOffset as jest.Mock).mockImplementation((timezone, _date) => {
        if (timezone === 'America/New_York') return -4 * 60 * 60 * 1000; // -4 hours
        if (timezone === 'Europe/Zagreb') return 2 * 60 * 60 * 1000; // +2 hours
        return 0;
      });
    });

    it('should return same time when timezones are identical', () => {
      const result = convertTimeToTimezone(
        '14:30',
        'America/New_York',
        'America/New_York',
        '2025-08-04',
      );
      expect(result).toBe('14:30');
    });

    it('should handle invalid time format gracefully', () => {
      const result = convertTimeToTimezone(
        'invalid',
        'America/New_York',
        'Europe/Zagreb',
        '2025-08-04',
      );
      expect(result).toBe('invalid'); // Should return original time on error
    });

    it('should handle invalid date format gracefully', () => {
      const result = convertTimeToTimezone(
        '14:30',
        'America/New_York',
        'Europe/Zagreb',
        'invalid-date',
      );
      expect(result).toBe('14:30'); // Should return original time on error
    });

    it('should handle timezone offset errors gracefully', () => {
      (getTimezoneOffset as jest.Mock).mockImplementation(() => {
        throw new Error('Timezone error');
      });

      const result = convertTimeToTimezone(
        '14:30',
        'America/New_York',
        'Europe/Zagreb',
        '2025-08-04',
      );
      expect(result).toBe('14:30'); // Should return original time on error
    });
  });

  describe('timeStringToTimestamp', () => {
    it('should convert time string to timestamp', () => {
      (getTimezoneOffset as jest.Mock).mockReturnValue(-4 * 60 * 60 * 1000);

      const result = timeStringToTimestamp(
        '14:30',
        '2025-08-04',
        'America/New_York',
      );
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThan(0);
    });

    it('should handle invalid time format', () => {
      expect(() => {
        timeStringToTimestamp('invalid', '2025-08-04', 'America/New_York');
      }).toThrow('Invalid time or date format');
    });

    it('should handle invalid time values', () => {
      expect(() => {
        timeStringToTimestamp('25:70', '2025-08-04', 'America/New_York');
      }).toThrow('Invalid time values');
    });
  });

  describe('timestampToTimeString', () => {
    it('should convert timestamp to time string', () => {
      (getTimezoneOffset as jest.Mock).mockReturnValue(-4 * 60 * 60 * 1000);

      const timestamp = Date.UTC(2025, 7, 4, 18, 30, 0); // 14:30 NY time
      const result = timestampToTimeString(timestamp, 'America/New_York');
      expect(result).toMatch(/^\d{2}:\d{2}$/);
    });
  });

  describe('isTimeInFuture', () => {
    it('should handle errors gracefully', () => {
      (getTimezoneOffset as jest.Mock).mockImplementation(() => {
        throw new Error('Timezone error');
      });

      const result = isTimeInFuture('14:30', '2025-08-04', 'America/New_York');
      expect(result).toBe(false);
    });
  });

  describe('getCurrentDateInTimezone', () => {
    it('should return current date in specified timezone', () => {
      (getTimezoneOffset as jest.Mock).mockReturnValue(-4 * 60 * 60 * 1000);

      const result = getCurrentDateInTimezone('America/New_York');
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should handle errors gracefully', () => {
      (getTimezoneOffset as jest.Mock).mockImplementation(() => {
        throw new Error('Timezone error');
      });

      const result = getCurrentDateInTimezone('America/New_York');
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });
});
