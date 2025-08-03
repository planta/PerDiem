import {
  StoreTime,
  StoreOverride,
  storeService,
} from '../services/storeService';
import { convertTimeToTimezone, getDeviceTimezone } from './timezoneUtils';

export interface SelectedDateInfo {
  dayName: string;
  dateString: string;
  isOpen: boolean;
  storeTimes: StoreTime[];
}

export const getSelectedDateInfo = (
  selectedDate: string,
  storeTimes: StoreTime[],
  storeOverrides: StoreOverride[],
  useDeviceTimezone: boolean,
): SelectedDateInfo => {
  const date = new Date(selectedDate);
  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
  const dateString = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Merge store times with overrides for this specific date
  const mergedStoreTimes = storeService.mergeStoreTimesWithOverrides(
    storeTimes,
    storeOverrides,
    selectedDate,
  );

  // Filter for open times
  const dayStoreTimes = mergedStoreTimes.filter(
    (time: StoreTime) => time.is_open,
  );
  const isOpen = dayStoreTimes.length > 0;

  // Convert times if using device timezone
  const convertedStoreTimes = dayStoreTimes.map(time => ({
    ...time,
    start_time: useDeviceTimezone
      ? convertTimeToTimezone(
          time.start_time,
          'America/New_York',
          getDeviceTimezone(),
          selectedDate,
        )
      : time.start_time,
    end_time: useDeviceTimezone
      ? convertTimeToTimezone(
          time.end_time,
          'America/New_York',
          getDeviceTimezone(),
          selectedDate,
        )
      : time.end_time,
  }));

  return {
    dayName,
    dateString,
    isOpen,
    storeTimes: convertedStoreTimes,
  };
};

// Get store times for time slot generation (always in NY time)
export const getStoreTimesForTimeSlots = (
  selectedDate: string,
  storeTimes: StoreTime[],
  storeOverrides: StoreOverride[],
): StoreTime[] => {
  // Merge store times with overrides for this specific date
  const mergedStoreTimes = storeService.mergeStoreTimesWithOverrides(
    storeTimes,
    storeOverrides,
    selectedDate,
  );

  // Return only open times, but keep them in NY timezone
  return mergedStoreTimes.filter((time: StoreTime) => time.is_open);
};

export const formatStoreHours = (storeTimes: StoreTime[]): string => {
  return storeTimes
    .filter((time: StoreTime) => time.is_open)
    .map((time: StoreTime) => {
      // Use the timezone-converted times that are already in the storeTimes array
      const startTime = time.start_time;
      const endTime = time.end_time;
      const [startHour, startMin] = startTime.split(':');
      const [endHour, endMin] = endTime.split(':');
      const startAMPM = parseInt(startHour) >= 12 ? 'PM' : 'AM';
      const endAMPM = parseInt(endHour) >= 12 ? 'PM' : 'AM';
      const startDisplayHour = parseInt(startHour) % 12 || 12;
      const endDisplayHour = parseInt(endHour) % 12 || 12;
      return `${startDisplayHour}:${startMin} ${startAMPM} - ${endDisplayHour}:${endMin} ${endAMPM}`;
    })
    .join(', ');
};
