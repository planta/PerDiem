import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import {
  StoreTime,
  StoreOverride,
  storeService,
} from '../services/storeService';

interface DateSelectorProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  onOpenCalendar: () => void;
  storeTimes: StoreTime[];
  storeOverrides: StoreOverride[];
}

export const DateSelector: React.FC<DateSelectorProps> = ({
  selectedDate,
  onDateChange,
  onOpenCalendar,
  storeTimes,
  storeOverrides,
}) => {
  // Base date for the 4-day range - only changes when calendar is used
  const [baseDate, setBaseDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // YYYY-MM-DD format
  });

  // Update base date when selectedDate changes from calendar
  useEffect(() => {
    // Only update base date if the selected date is not within the current range
    const baseDateObj = new Date(baseDate);
    const selectedDateObj = new Date(selectedDate);

    // Check if selected date is within the current 4-day range
    const isInCurrentRange =
      selectedDateObj >= baseDateObj &&
      selectedDateObj <
        new Date(baseDateObj.getTime() + 4 * 24 * 60 * 60 * 1000);

    // If not in current range, update base date to start from selected date
    if (!isInCurrentRange) {
      setBaseDate(selectedDate);
    }
  }, [selectedDate, baseDate]);

  // Check if store is open on a given date (with overrides)
  const isStoreOpen = (dateString: string): boolean => {
    const mergedStoreTimes = storeService.mergeStoreTimesWithOverrides(
      storeTimes,
      storeOverrides,
      dateString,
    );
    return mergedStoreTimes.some(time => time.is_open);
  };

  const getNextDays = () => {
    const days = [];
    const baseDateObj = new Date(baseDate);
    const today = new Date();
    const todayString = today.toISOString().split('T')[0]; // YYYY-MM-DD format

    for (let i = 0; i < 4; i++) {
      const date = new Date(baseDateObj);
      date.setDate(baseDateObj.getDate() + i);

      const dayOfMonth = date.getDate();
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD format

      const isToday = dateString === todayString;
      const isSelected = dateString === selectedDate;
      const isOpen = isStoreOpen(dateString);

      days.push({
        date: dateString,
        dayOfMonth,
        monthName,
        dayName,
        isToday,
        isSelected,
        isOpen,
      });
    }

    return days;
  };

  const nextDays = getNextDays();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select a date</Text>

      <View style={styles.datesContainer}>
        {nextDays.map(day => (
          <TouchableOpacity
            key={day.date}
            style={[
              styles.dateCard,
              day.isOpen ? styles.openDateCard : styles.closedDateCard,
              day.isSelected && styles.selectedDateCard,
            ]}
            onPress={() => onDateChange(day.date)}
            activeOpacity={0.8}
          >
            <Text style={styles.dayNumber}>{day.dayOfMonth}</Text>
            <Text style={styles.monthName}>{day.monthName}</Text>
            <View style={[styles.dayLabel, styles.weekdayLabel]}>
              <Text style={styles.dayLabelText}>
                {day.isToday ? 'Today' : day.dayName}
              </Text>
            </View>
            <View
              style={[
                styles.statusIndicator,
                day.isOpen ? styles.openIndicator : styles.closedIndicator,
              ]}
            />
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={styles.addButton}
          onPress={onOpenCalendar}
          activeOpacity={0.8}
        >
          <View style={styles.plusIcon}>
            <Text style={styles.plusText}>+</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  datesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateCard: {
    width: 70,
    height: 90,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
    position: 'relative',
  },
  selectedDateCard: {
    backgroundColor: '#ffffff',
    borderWidth: 3,
    borderColor: '#0171EA',
  },
  openDateCard: {
    borderColor: '#28a745',
  },
  closedDateCard: {
    borderColor: '#dc3545',
  },
  dayNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  monthName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  dayLabel: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  weekdayLabel: {
    backgroundColor: '#f8f9fa',
  },
  dayLabelText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#333',
  },
  statusIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  openIndicator: {
    backgroundColor: '#28a745',
  },
  closedIndicator: {
    backgroundColor: '#dc3545',
  },
  addButton: {
    width: 70,
    height: 90,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusIcon: {
    width: 32,
    height: 32,
    backgroundColor: '#333',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});
