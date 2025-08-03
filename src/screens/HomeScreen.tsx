import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Switch,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { signOut } from '../store/authSlice';
import {
  checkNotificationPermissions,
  scheduleStoreNotifications,
} from '../store/notificationSlice';
import { useStoreTimes } from '../hooks/useStoreTimes';
import { useTimezone } from '../hooks/useTimezone';
import { useGreetingMessage } from '../hooks/useGreetingMessage';
import { DateSelector } from '../components/DateSelector';
import { Header } from '../components/Header';
import { MealTypeSelector, MealType } from '../components/MealTypeSelector';
import { TimeSlotSelector } from '../components/TimeSlotSelector';
import { CalendarBottomSheet } from '../components/CalendarBottomSheet';
import { notificationService } from '../services/notificationService';
import {
  getSelectedDateInfo,
  getStoreTimesForTimeSlots,
} from '../utils/storeUtils';
import { getDisplayTimezone } from '../utils/timezoneUtils';
import BottomSheet from '@gorhom/bottom-sheet';

const HomeScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const { user, loading } = useAppSelector(state => state.auth);
  const { permissionsGranted } = useAppSelector(state => state.notification);
  const {
    storeTimes,
    storeOverrides,
    loading: loadingStoreTimes,
    error,
    refetch,
  } = useStoreTimes();

  const memoizedStoreTimes = useMemo(() => storeTimes, [storeTimes]);

  const { useDeviceTimezone, setUseDeviceTimezone } = useTimezone();
  const { greetingMessage } = useGreetingMessage(useDeviceTimezone);
  const [mealType, setMealType] = useState<MealType>('breakfast');
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // YYYY-MM-DD format
  });
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<
    string | undefined
  >();

  const calendarBottomSheetRef = useRef<BottomSheet>(null);

  // Memoize timezone display
  const timezoneDisplay = useMemo(
    () => getDisplayTimezone(useDeviceTimezone),
    [useDeviceTimezone],
  );

  // Memoize content style
  const contentStyle = useMemo(
    () => ({ paddingBottom: insets.bottom + 15 }),
    [insets.bottom],
  );

  useEffect(() => {
    dispatch(checkNotificationPermissions());
  }, [dispatch]);

  useEffect(() => {
    if (permissionsGranted && memoizedStoreTimes.length > 0) {
      dispatch(scheduleStoreNotifications(memoizedStoreTimes));
    }
  }, [permissionsGranted, memoizedStoreTimes, dispatch]);

  const onLogoutPress = async () => {
    try {
      await dispatch(signOut()).unwrap();
    } catch (error: any) {
      console.error('Logout failed:', error.message);
    }
  };

  const onTestNotificationPress = async () => {
    try {
      await notificationService.scheduleTestNotification();
    } catch (error) {
      console.error('Failed to schedule test notification:', error);
    }
  };

  const openCalendar = useCallback(() => {
    calendarBottomSheetRef.current?.expand();
  }, []);

  const closeCalendar = useCallback(() => {
    calendarBottomSheetRef.current?.close();
  }, []);

  const handleDateSelect = useCallback(
    (date: string) => {
      setSelectedDate(date);
      closeCalendar();
    },
    [closeCalendar],
  );

  const selectedDateInfo = useMemo(
    () =>
      getSelectedDateInfo(
        selectedDate,
        memoizedStoreTimes,
        storeOverrides,
        useDeviceTimezone,
      ),
    [selectedDate, memoizedStoreTimes, storeOverrides, useDeviceTimezone],
  );

  return (
    <View style={styles.container}>
      <Header onLogoutPress={onLogoutPress} loading={loading} />

      <View style={styles.container}>
        <ScrollView style={styles.container}>
          <View style={[styles.content, contentStyle]}>
            <Text style={styles.title}>{greetingMessage}</Text>
            <Text style={styles.subtitle}>
              You are now logged in as{' '}
              {user?.displayName || user?.email || 'User'}
            </Text>

            <View style={styles.infoCard}>
              <View style={styles.timezoneInfo}>
                <View>
                  <Text style={styles.timezoneLabel}>Timezone</Text>
                  <Text style={styles.timezoneValue}>{timezoneDisplay}</Text>
                </View>
                <TouchableOpacity
                  style={styles.testButton}
                  onPress={onTestNotificationPress}
                >
                  <Text style={styles.testButtonText}>
                    Send a test notification
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.toggleContainer}>
                <Text style={styles.toggleLabel}>NY Time</Text>
                <Switch
                  value={useDeviceTimezone}
                  onValueChange={setUseDeviceTimezone}
                  trackColor={{ false: '#767577', true: '#81b0ff' }}
                  thumbColor={useDeviceTimezone ? '#007AFF' : '#f4f3f4'}
                />
                <Text style={styles.toggleLabel}>Local Time</Text>
              </View>
            </View>

            {loadingStoreTimes ||
            (!error && memoizedStoreTimes.length === 0) ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#000000" />
                <Text style={styles.loadingText}>Loading store times...</Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>
                  Failed to load store times. Please try again.
                </Text>
                <TouchableOpacity style={styles.retryButton} onPress={refetch}>
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.bookingContainer}>
                <MealTypeSelector
                  selectedMealType={mealType}
                  onMealTypeChange={setMealType}
                />

                <DateSelector
                  selectedDate={selectedDate}
                  onDateChange={setSelectedDate}
                  onOpenCalendar={openCalendar}
                  storeTimes={memoizedStoreTimes}
                  storeOverrides={storeOverrides}
                />

                <View style={styles.infoCard}>
                  <Text style={styles.infoTitle}>
                    {selectedDateInfo.dayName} - {selectedDateInfo.dateString}
                  </Text>
                  {selectedDateInfo.isOpen ? (
                    selectedDateInfo.storeTimes && (
                      <Text style={styles.timeText}>
                        Store hours: {selectedDateInfo.storeTimes}
                      </Text>
                    )
                  ) : (
                    <Text style={styles.timeText}>Store hours: Closed</Text>
                  )}

                  {selectedDateInfo.isOpen && (
                    <View style={styles.timeslotsContainer}>
                      <TimeSlotSelector
                        selectedMealType={mealType}
                        selectedDate={selectedDate}
                        storeTimes={getStoreTimesForTimeSlots(
                          selectedDate,
                          memoizedStoreTimes,
                          storeOverrides,
                        )}
                        selectedTimeSlot={selectedTimeSlot}
                        onTimeSlotSelect={setSelectedTimeSlot}
                      />
                    </View>
                  )}
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </View>

      <CalendarBottomSheet
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
        onClose={closeCalendar}
        bottomSheetRef={calendarBottomSheetRef}
        storeTimes={memoizedStoreTimes}
        storeOverrides={storeOverrides}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  timeslotsContainer: {
    marginTop: 20,
  },
  timezoneToggleContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  timezoneInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  timezoneLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  timezoneValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  testButton: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  testButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    elevation: 5,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  errorText: {
    fontSize: 14,
    color: '#F44336',
    textAlign: 'center',
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  timeText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  bookingContainer: {
    marginTop: 20,
  },
});

export default HomeScreen;
