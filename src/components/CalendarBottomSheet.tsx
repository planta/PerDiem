import React, { useCallback, useMemo } from 'react';
import { Text, StyleSheet, View } from 'react-native';
import BottomSheet, {
  BottomSheetView,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import { Calendar } from 'react-native-calendars';
import {
  StoreTime,
  StoreOverride,
  storeService,
} from '../services/storeService';

interface CalendarBottomSheetProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
  onClose: () => void;
  bottomSheetRef: React.RefObject<BottomSheet | null>;
  storeTimes: StoreTime[];
  storeOverrides: StoreOverride[];
}

export const CalendarBottomSheet: React.FC<CalendarBottomSheetProps> = ({
  selectedDate,
  onDateSelect,
  onClose,
  bottomSheetRef,
  storeTimes,
  storeOverrides,
}) => {
  const snapPoints = useMemo(() => ['50%'], []);

  const handleDateSelect = useCallback(
    (date: string) => {
      onDateSelect(date);
      onClose();
    },
    [onDateSelect, onClose],
  );

  const renderBottomSheetBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.5}
      />
    ),
    [],
  );

  const markedDates = useMemo(() => {
    const marked: any = {
      [selectedDate]: {
        selected: true,
        selectedColor: '#007AFF',
      },
    };

    // Get current month dates to mark store status
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dateString = date.toISOString().split('T')[0];

      const mergedStoreTimes = storeService.mergeStoreTimesWithOverrides(
        storeTimes,
        storeOverrides,
        dateString,
      );
      const isStoreOpen = mergedStoreTimes.some(time => time.is_open);

      // Only mark if it's not the selected date and it's today or in the future
      if (dateString !== selectedDate && date >= today) {
        marked[dateString] = {
          marked: true,
          dotColor: isStoreOpen ? '#28a745' : '#dc3545',
        };
      }
    }

    return marked;
  }, [selectedDate, storeTimes, storeOverrides]);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      backdropComponent={renderBottomSheetBackdrop}
    >
      <BottomSheetView style={styles.calendarContainer}>
        <Text style={styles.calendarTitle}>Select a date</Text>
        <Calendar
          onDayPress={day => handleDateSelect(day.dateString)}
          minDate={new Date().toISOString().split('T')[0]}
          markedDates={markedDates}
          theme={{
            selectedDayBackgroundColor: '#007AFF',
            selectedDayTextColor: '#ffffff',
            todayTextColor: '#007AFF',
            dayTextColor: '#2d4150',
            textDisabledColor: '#d9e1e8',
            arrowColor: '#007AFF',
            monthTextColor: '#2d4150',
            indicatorColor: '#007AFF',
            textDayFontWeight: '300',
            textMonthFontWeight: 'bold',
            textDayHeaderFontWeight: '300',
            textDayFontSize: 16,
            textMonthFontSize: 16,
            textDayHeaderFontSize: 13,
          }}
        />
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#28a745' }]} />
            <Text style={styles.legendText}>Store Open</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#dc3545' }]} />
            <Text style={styles.legendText}>Store Closed</Text>
          </View>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  calendarContainer: {
    flex: 1,
    padding: 20,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    gap: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 14,
    color: '#666',
  },
});
