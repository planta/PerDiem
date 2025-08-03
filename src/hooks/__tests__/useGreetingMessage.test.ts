import { useGreetingMessage } from '../useGreetingMessage';

// Mock the timezone utilities
jest.mock('../../utils/timezoneUtils', () => ({
  getDeviceCityName: jest.fn(() => 'Test City'),
}));

describe('useGreetingMessage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('with device timezone (useDeviceTimezone = true)', () => {
    it('should return "Good Morning" for early morning hours (5-9 AM NY time)', () => {
      // Mock toLocaleString to return the expected hour
      const mockToLocaleString = jest.fn().mockReturnValue('7');
      jest
        .spyOn(Date.prototype, 'toLocaleString')
        .mockImplementation(mockToLocaleString);

      const result = useGreetingMessage(true);
      expect(result.greetingMessage).toBe('Good Morning, Test City!');
    });

    it('should return "Late Morning Vibes" for late morning hours (10-11 AM NY time)', () => {
      const mockToLocaleString = jest.fn().mockReturnValue('10');
      jest
        .spyOn(Date.prototype, 'toLocaleString')
        .mockImplementation(mockToLocaleString);

      const result = useGreetingMessage(true);
      expect(result.greetingMessage).toBe('Late Morning Vibes! Test City');
    });

    it('should return "Good Afternoon" for afternoon hours (12-4 PM NY time)', () => {
      const mockToLocaleString = jest.fn().mockReturnValue('14');
      jest
        .spyOn(Date.prototype, 'toLocaleString')
        .mockImplementation(mockToLocaleString);

      const result = useGreetingMessage(true);
      expect(result.greetingMessage).toBe('Good Afternoon, Test City!');
    });

    it('should return "Good Evening" for evening hours (5-8 PM NY time)', () => {
      const mockToLocaleString = jest.fn().mockReturnValue('19');
      jest
        .spyOn(Date.prototype, 'toLocaleString')
        .mockImplementation(mockToLocaleString);

      const result = useGreetingMessage(true);
      expect(result.greetingMessage).toBe('Good Evening, Test City!');
    });

    it('should return "Night Owl" for late night hours (9 PM - 4 AM NY time)', () => {
      const mockToLocaleString = jest.fn().mockReturnValue('23');
      jest
        .spyOn(Date.prototype, 'toLocaleString')
        .mockImplementation(mockToLocaleString);

      const result = useGreetingMessage(true);
      expect(result.greetingMessage).toBe('Night Owl in Test City!');
    });

    it('should return "Night Owl" for very early morning hours (1 AM NY time)', () => {
      const mockToLocaleString = jest.fn().mockReturnValue('1');
      jest
        .spyOn(Date.prototype, 'toLocaleString')
        .mockImplementation(mockToLocaleString);

      const result = useGreetingMessage(true);
      expect(result.greetingMessage).toBe('Night Owl in Test City!');
    });
  });

  describe('with NY timezone (useDeviceTimezone = false)', () => {
    it('should return "Good Morning" for early morning hours (5-9 AM NY time)', () => {
      const mockToLocaleString = jest.fn().mockReturnValue('7');
      jest
        .spyOn(Date.prototype, 'toLocaleString')
        .mockImplementation(mockToLocaleString);

      const result = useGreetingMessage(false);
      expect(result.greetingMessage).toBe('Good Morning, NYC!');
    });

    it('should return "Late Morning Vibes" for late morning hours (10-11 AM NY time)', () => {
      const mockToLocaleString = jest.fn().mockReturnValue('10');
      jest
        .spyOn(Date.prototype, 'toLocaleString')
        .mockImplementation(mockToLocaleString);

      const result = useGreetingMessage(false);
      expect(result.greetingMessage).toBe('Late Morning Vibes! NYC');
    });

    it('should return "Good Afternoon" for afternoon hours (12-4 PM NY time)', () => {
      const mockToLocaleString = jest.fn().mockReturnValue('14');
      jest
        .spyOn(Date.prototype, 'toLocaleString')
        .mockImplementation(mockToLocaleString);

      const result = useGreetingMessage(false);
      expect(result.greetingMessage).toBe('Good Afternoon, NYC!');
    });

    it('should return "Good Evening" for evening hours (5-8 PM NY time)', () => {
      const mockToLocaleString = jest.fn().mockReturnValue('19');
      jest
        .spyOn(Date.prototype, 'toLocaleString')
        .mockImplementation(mockToLocaleString);

      const result = useGreetingMessage(false);
      expect(result.greetingMessage).toBe('Good Evening, NYC!');
    });

    it('should return "Night Owl" for late night hours (9 PM - 4 AM NY time)', () => {
      const mockToLocaleString = jest.fn().mockReturnValue('23');
      jest
        .spyOn(Date.prototype, 'toLocaleString')
        .mockImplementation(mockToLocaleString);

      const result = useGreetingMessage(false);
      expect(result.greetingMessage).toBe('Night Owl in NYC!');
    });
  });

  describe('edge cases', () => {
    it('should handle boundary time at 5 AM (Good Morning)', () => {
      const mockToLocaleString = jest.fn().mockReturnValue('5');
      jest
        .spyOn(Date.prototype, 'toLocaleString')
        .mockImplementation(mockToLocaleString);

      const result = useGreetingMessage(true);
      expect(result.greetingMessage).toBe('Good Morning, Test City!');
    });

    it('should handle boundary time at 9:59 AM (Good Morning)', () => {
      const mockToLocaleString = jest.fn().mockReturnValue('9');
      jest
        .spyOn(Date.prototype, 'toLocaleString')
        .mockImplementation(mockToLocaleString);

      const result = useGreetingMessage(true);
      expect(result.greetingMessage).toBe('Good Morning, Test City!');
    });

    it('should handle boundary time at 10 AM (Late Morning Vibes)', () => {
      const mockToLocaleString = jest.fn().mockReturnValue('10');
      jest
        .spyOn(Date.prototype, 'toLocaleString')
        .mockImplementation(mockToLocaleString);

      const result = useGreetingMessage(true);
      expect(result.greetingMessage).toBe('Late Morning Vibes! Test City');
    });

    it('should handle boundary time at 11:59 AM (Late Morning Vibes)', () => {
      const mockToLocaleString = jest.fn().mockReturnValue('11');
      jest
        .spyOn(Date.prototype, 'toLocaleString')
        .mockImplementation(mockToLocaleString);

      const result = useGreetingMessage(true);
      expect(result.greetingMessage).toBe('Late Morning Vibes! Test City');
    });

    it('should handle boundary time at 12 PM (Good Afternoon)', () => {
      const mockToLocaleString = jest.fn().mockReturnValue('12');
      jest
        .spyOn(Date.prototype, 'toLocaleString')
        .mockImplementation(mockToLocaleString);

      const result = useGreetingMessage(true);
      expect(result.greetingMessage).toBe('Good Afternoon, Test City!');
    });

    it('should handle boundary time at 4:59 PM (Good Afternoon)', () => {
      const mockToLocaleString = jest.fn().mockReturnValue('16');
      jest
        .spyOn(Date.prototype, 'toLocaleString')
        .mockImplementation(mockToLocaleString);

      const result = useGreetingMessage(true);
      expect(result.greetingMessage).toBe('Good Afternoon, Test City!');
    });

    it('should handle boundary time at 5 PM (Good Evening)', () => {
      const mockToLocaleString = jest.fn().mockReturnValue('17');
      jest
        .spyOn(Date.prototype, 'toLocaleString')
        .mockImplementation(mockToLocaleString);

      const result = useGreetingMessage(true);
      expect(result.greetingMessage).toBe('Good Evening, Test City!');
    });

    it('should handle boundary time at 8:59 PM (Good Evening)', () => {
      const mockToLocaleString = jest.fn().mockReturnValue('20');
      jest
        .spyOn(Date.prototype, 'toLocaleString')
        .mockImplementation(mockToLocaleString);

      const result = useGreetingMessage(true);
      expect(result.greetingMessage).toBe('Good Evening, Test City!');
    });

    it('should handle boundary time at 9 PM (Night Owl)', () => {
      const mockToLocaleString = jest.fn().mockReturnValue('21');
      jest
        .spyOn(Date.prototype, 'toLocaleString')
        .mockImplementation(mockToLocaleString);

      const result = useGreetingMessage(true);
      expect(result.greetingMessage).toBe('Night Owl in Test City!');
    });

    it('should handle boundary time at 4:59 AM (Night Owl)', () => {
      const mockToLocaleString = jest.fn().mockReturnValue('4');
      jest
        .spyOn(Date.prototype, 'toLocaleString')
        .mockImplementation(mockToLocaleString);

      const result = useGreetingMessage(true);
      expect(result.greetingMessage).toBe('Night Owl in Test City!');
    });
  });

  describe('hook return value', () => {
    it('should return an object with greetingMessage property', () => {
      const mockToLocaleString = jest.fn().mockReturnValue('14'); // 2 PM
      jest
        .spyOn(Date.prototype, 'toLocaleString')
        .mockImplementation(mockToLocaleString);

      const result = useGreetingMessage(true);
      expect(result).toHaveProperty('greetingMessage');
      expect(typeof result.greetingMessage).toBe('string');
    });

    it('should return different messages for different timezone preferences', () => {
      const mockToLocaleString = jest.fn().mockReturnValue('14'); // 2 PM
      jest
        .spyOn(Date.prototype, 'toLocaleString')
        .mockImplementation(mockToLocaleString);

      const resultDevice = useGreetingMessage(true);
      const resultNY = useGreetingMessage(false);
      expect(resultDevice.greetingMessage).toBe('Good Afternoon, Test City!');
      expect(resultNY.greetingMessage).toBe('Good Afternoon, NYC!');
    });
  });
});
