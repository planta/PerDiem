export interface StoreTime {
  id: string;
  day_of_week: number;
  is_open: boolean;
  start_time: string;
  end_time: string;
}

export interface StoreOverride {
  id: string;
  day: number;
  month: number;
  is_open: boolean;
  start_time: string;
  end_time: string;
}

export interface GroupedStoreTime {
  day_of_week: number;
  dayName: string;
  timeSlots: StoreTime[];
  isOpen: boolean;
}

export const storeService = {
  // Get store times (direct request without authentication)
  getStoreTimes: async (): Promise<StoreTime[]> => {
    try {
      const response = await fetch(
        'https://coding-challenge-pd-1a25b1a14f34.herokuapp.com/store-times/',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch store times');
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch store times');
    }
  },

  // Get store overrides (direct request without authentication)
  getStoreOverrides: async (): Promise<StoreOverride[]> => {
    try {
      const response = await fetch(
        'https://coding-challenge-pd-1a25b1a14f34.herokuapp.com/store-overrides/',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch store overrides');
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch store overrides');
    }
  },

  // Helper function to get day name from day_of_week number
  getDayName: (dayOfWeek: number): string => {
    const days = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    return days[dayOfWeek] || 'Unknown';
  },

  // Helper function to format time
  formatTime: (time: string): string => {
    // Convert 24-hour format to 12-hour format
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  },

  // Group store times by day and determine if day is open
  groupStoreTimesByDay: (storeTimes: StoreTime[]): GroupedStoreTime[] => {
    const groupedByDay: { [key: number]: StoreTime[] } = {};

    // Group times by day
    storeTimes.forEach(storeTime => {
      if (!groupedByDay[storeTime.day_of_week]) {
        groupedByDay[storeTime.day_of_week] = [];
      }
      groupedByDay[storeTime.day_of_week].push(storeTime);
    });

    // Convert to array and determine if day is open
    return Object.keys(groupedByDay)
      .map(dayKey => {
        const dayOfWeek = parseInt(dayKey, 10);
        const timeSlots = groupedByDay[dayOfWeek];
        const isOpen = timeSlots.some(slot => slot.is_open);

        return {
          day_of_week: dayOfWeek,
          dayName: storeService.getDayName(dayOfWeek),
          timeSlots,
          isOpen,
        };
      })
      .sort((a, b) => a.day_of_week - b.day_of_week); // Sort by day of week
  },

  // Merge store times with overrides for a specific date
  mergeStoreTimesWithOverrides: (
    storeTimes: StoreTime[],
    overrides: StoreOverride[],
    targetDate: string, // YYYY-MM-DD format
  ): StoreTime[] => {
    const date = new Date(targetDate);
    const day = date.getDate();
    const month = date.getMonth() + 1; // JavaScript months are 0-indexed
    const dayOfWeek = date.getDay();

    // Find override for this specific date
    const override = overrides.find(o => o.day === day && o.month === month);

    if (override) {
      // If there's an override, return it as a StoreTime object
      return [
        {
          id: override.id,
          day_of_week: dayOfWeek,
          is_open: override.is_open,
          start_time: override.start_time,
          end_time: override.end_time,
        },
      ];
    }

    // If no override, return regular store times for this day
    return storeTimes.filter(time => time.day_of_week === dayOfWeek);
  },

  // Format time slots for display
  formatTimeSlots: (timeSlots: StoreTime[]): string => {
    const openSlots = timeSlots.filter(slot => slot.is_open);

    if (openSlots.length === 0) {
      return 'Closed';
    }

    return openSlots
      .map(slot => {
        const startTime = storeService.formatTime(slot.start_time);
        const endTime = storeService.formatTime(slot.end_time);
        return `${startTime} - ${endTime}`;
      })
      .join(', ');
  },
};
