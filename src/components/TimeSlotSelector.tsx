import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MealType } from './MealTypeSelector';
import { StoreTime } from '../services/storeService';

interface TimeSlotSelectorProps {
  selectedMealType: MealType;
  selectedDate: string;
  storeTimes: StoreTime[];
  selectedTimeSlot?: string;
  onTimeSlotSelect: (timeSlot: string) => void;
}

export const TimeSlotSelector: React.FC<TimeSlotSelectorProps> = ({
  selectedMealType,
  selectedDate,
  storeTimes,
  selectedTimeSlot,
  onTimeSlotSelect,
}) => {
  // Get the day of week for the selected date
  const getDayOfWeek = (dateString: string): number => {
    const date = new Date(dateString);
    return date.getDay();
  };

  // Generate 30-minute time slots for a given time range
  const generateTimeSlots = (startHour: number, endHour: number): string[] => {
    const slots: string[] = [];

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute
          .toString()
          .padStart(2, '0')}`;
        slots.push(timeString);
      }
    }

    return slots;
  };

  // Get meal type time ranges
  const getMealTypeTimeRange = (
    mealType: MealType,
  ): { startHour: number; endHour: number } => {
    switch (mealType) {
      case 'breakfast':
        return { startHour: 6, endHour: 12 }; // 6:00 AM to 11:59 AM
      case 'lunch':
        return { startHour: 12, endHour: 18 }; // 12:00 PM to 5:59 PM
      case 'dinner':
        return { startHour: 18, endHour: 24 }; // 6:00 PM to 11:59 PM
      default:
        return { startHour: 6, endHour: 12 };
    }
  };

  // Check if a time slot is within store hours
  const isTimeSlotAvailable = (
    timeSlot: string,
    dayStoreTimes: StoreTime[],
  ): boolean => {
    if (dayStoreTimes.length === 0) return false;

    const [slotHour, slotMinute] = timeSlot.split(':').map(Number);
    const slotMinutes = slotHour * 60 + slotMinute;

    return dayStoreTimes.some(storeTime => {
      if (!storeTime.is_open) return false;

      const [startHour, startMinute] = storeTime.start_time
        .split(':')
        .map(Number);
      const [endHour, endMinute] = storeTime.end_time.split(':').map(Number);

      const startMinutes = startHour * 60 + startMinute;
      const endMinutes = endHour * 60 + endMinute;

      // Handle cases where end time is on the next day
      const adjustedEndMinutes =
        endMinutes < startMinutes ? endMinutes + 24 * 60 : endMinutes;
      const adjustedSlotMinutes =
        slotMinutes < startMinutes ? slotMinutes + 24 * 60 : slotMinutes;

      return (
        adjustedSlotMinutes >= startMinutes &&
        adjustedSlotMinutes < adjustedEndMinutes
      );
    });
  };

  // Check if a time slot is in the future
  const isTimeSlotInFuture = (
    timeSlot: string,
    dateString: string,
  ): boolean => {
    const [hours, minutes] = timeSlot.split(':').map(Number);
    const slotDate = new Date(dateString);
    slotDate.setHours(hours, minutes, 0, 0);

    const now = new Date();

    return slotDate > now;
  };

  // Format time for display (12-hour format) - always in NY timezone
  const formatTimeForDisplay = (timeSlot: string): string => {
    // Always display time slots in NY timezone (store time)
    const [hours, minutes] = timeSlot.split(':').map(Number);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours % 12 || 12;
    return `${displayHour}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  // Get available time slots
  const availableTimeSlots = useMemo(() => {
    const dayOfWeek = getDayOfWeek(selectedDate);
    const dayStoreTimes = storeTimes.filter(
      time => time.day_of_week === dayOfWeek,
    );
    const { startHour, endHour } = getMealTypeTimeRange(selectedMealType);

    const allTimeSlots = generateTimeSlots(startHour, endHour);

    return allTimeSlots.filter(
      timeSlot =>
        isTimeSlotAvailable(timeSlot, dayStoreTimes) &&
        isTimeSlotInFuture(timeSlot, selectedDate),
    );
  }, [selectedMealType, selectedDate, storeTimes]);

  // Don't render if no time slots are available
  if (availableTimeSlots.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noSlotsText}>
          No available time slots for {selectedMealType} on this day
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.timeSlotsContainer}>
        {availableTimeSlots.map(timeSlot => {
          const isSelected = selectedTimeSlot === timeSlot;
          const displayTime = formatTimeForDisplay(timeSlot);

          return (
            <TouchableOpacity
              key={timeSlot}
              style={[styles.timeSlot, isSelected && styles.selectedTimeSlot]}
              onPress={() => onTimeSlotSelect(timeSlot)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.timeSlotText,
                  isSelected && styles.selectedTimeSlotText,
                ]}
              >
                {displayTime}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
  },
  timeSlotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 8,
  },
  timeSlot: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    minWidth: 80,
    alignItems: 'center',
    flex: 0,
  },
  selectedTimeSlot: {
    backgroundColor: '#0171EA',
    borderColor: '#0171EA',
  },
  timeSlotText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  selectedTimeSlotText: {
    color: '#ffffff',
  },
  noSlotsText: {
    fontSize: 14,
    color: '#666',
  },
});
