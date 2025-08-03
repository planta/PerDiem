import { getTimezoneOffset } from 'date-fns-tz';

// Convert a time string to a timestamp for a specific date and timezone
export const timeStringToTimestamp = (
  timeString: string,
  dateString: string, // YYYY-MM-DD format
  timezone: string,
): number => {
  const [hours, minutes] = timeString.split(':').map(Number);
  const [year, month, day] = dateString.split('-').map(Number);

  // Validate input
  if (
    isNaN(hours) ||
    isNaN(minutes) ||
    isNaN(year) ||
    isNaN(month) ||
    isNaN(day)
  ) {
    throw new Error('Invalid time or date format');
  }

  // Validate time ranges
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    throw new Error('Invalid time values');
  }

  // Create date in the specified timezone
  const date = new Date(year, month - 1, day, hours, minutes, 0, 0);

  // Get the timezone offset for this date
  const offset = getTimezoneOffset(timezone, date);

  // Convert to UTC timestamp
  return date.getTime() - offset;
};

// Convert a timestamp back to a time string in a specific timezone
export const timestampToTimeString = (
  timestamp: number,
  timezone: string,
): string => {
  const date = new Date(timestamp);

  // Get the timezone offset for this date
  const offset = getTimezoneOffset(timezone, date);

  // Create a date in the target timezone
  const zonedDate = new Date(timestamp - offset);

  const hours = zonedDate.getUTCHours().toString().padStart(2, '0');
  const minutes = zonedDate.getUTCMinutes().toString().padStart(2, '0');

  return `${hours}:${minutes}`;
};

// Convert time from one timezone to another using timestamps
export const convertTimeToTimezone = (
  time: string,
  fromTimezone: string,
  toTimezone: string,
  dateString: string, // YYYY-MM-DD format
): string => {
  if (fromTimezone === toTimezone) {
    return time;
  }

  try {
    const [hours, minutes] = time.split(':').map(Number);
    const [year, month, day] = dateString.split('-').map(Number);

    // Validate input
    if (
      isNaN(hours) ||
      isNaN(minutes) ||
      isNaN(year) ||
      isNaN(month) ||
      isNaN(day)
    ) {
      throw new Error('Invalid time or date format');
    }

    // Validate time ranges
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      throw new Error('Invalid time values');
    }

    // Create a date object in the source timezone
    const sourceDate = new Date(year, month - 1, day, hours, minutes, 0, 0);

    // Get offsets for both timezones
    const fromOffset = getTimezoneOffset(fromTimezone, sourceDate);
    const toOffset = getTimezoneOffset(toTimezone, sourceDate);

    // Calculate the difference in hours
    const offsetDiffHours = (toOffset - fromOffset) / (1000 * 60 * 60);

    // Apply the offset
    let newHours = hours + offsetDiffHours;

    // Handle day wrapping
    if (newHours >= 24) {
      newHours -= 24;
    } else if (newHours < 0) {
      newHours += 24;
    }

    const newHoursStr = Math.floor(newHours).toString().padStart(2, '0');
    const minutesStr = minutes.toString().padStart(2, '0');

    return `${newHoursStr}:${minutesStr}`;
  } catch (error) {
    console.warn('Timezone conversion failed:', error);
    return time;
  }
};

// Check if a time is in the future for a given date and timezone
export const isTimeInFuture = (
  timeString: string,
  dateString: string,
  timezone: string,
): boolean => {
  try {
    const timestamp = timeStringToTimestamp(timeString, dateString, timezone);
    const now = new Date().getTime();
    return timestamp > now;
  } catch (error) {
    console.warn('Time comparison failed:', error);
    return false;
  }
};

// Get the current date in a specific timezone
export const getCurrentDateInTimezone = (timezone: string): string => {
  try {
    const now = new Date();
    const offset = getTimezoneOffset(timezone, now);
    const zonedDate = new Date(now.getTime() + offset);

    const year = zonedDate.getUTCFullYear();
    const month = (zonedDate.getUTCMonth() + 1).toString().padStart(2, '0');
    const day = zonedDate.getUTCDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`;
  } catch (error) {
    console.warn('Failed to get current date in timezone:', error);
    // Fallback to local date
    const now = new Date();
    return now.toISOString().split('T')[0];
  }
};

export const getDeviceTimezone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

export const getCityNameFromTimezone = (timezone: string): string => {
  try {
    const cityName =
      timezone.split('/').pop()?.replace('_', ' ') || 'Unknown City';
    return cityName;
  } catch (error) {
    return 'Unknown City';
  }
};

export const getDeviceCityName = (): string => {
  try {
    const timezone = getDeviceTimezone();
    return getCityNameFromTimezone(timezone);
  } catch (error) {
    return 'Your City';
  }
};

export const getDisplayTimezone = (useDeviceTimezone: boolean): string => {
  return useDeviceTimezone ? getDeviceCityName() : 'New York';
};
