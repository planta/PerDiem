import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { signOut } from '../store/authSlice';
import { useStoreTimes, useGreetingMessage } from '../hooks';
import { StoreTime } from '../services/storeService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const DAYS_TO_RENDER_COUNT = 30;

const HomeScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user, loading } = useAppSelector(state => state.auth);
  const {
    storeTimes,
    loading: loadingStoreTimes,
    error,
    refetch,
  } = useStoreTimes();

  const insets = useSafeAreaInsets();

  const {
    greetingMessage,
    useDeviceTimezone,
    setUseDeviceTimezone,
    getDisplayTimezone,
  } = useGreetingMessage();

  const onLogoutPress = async () => {
    try {
      await dispatch(signOut()).unwrap();
    } catch (error: any) {
      console.error('Logout failed:', error.message);
    }
  };

  const convertTimeToTimezone = (
    time: string,
    fromTimezone: string,
    toTimezone: string,
  ): string => {
    if (fromTimezone === toTimezone) {
      return time;
    }

    const [hours, minutes] = time.split(':');

    // Create a date string in the source timezone
    const today = new Date();
    const dateString = today.toLocaleDateString('en-CA'); // YYYY-MM-DD format
    const timeString = `${dateString}T${hours}:${minutes}:00`;

    // Create a date object representing the time in the source timezone
    const sourceDate = new Date(`${timeString}Z`);

    // Convert to target timezone
    const targetDate = new Date(
      sourceDate.toLocaleString('en-US', { timeZone: toTimezone }),
    );

    console.log(targetDate);

    // Format the converted time
    const convertedHours = targetDate.getHours().toString().padStart(2, '0');
    console.log(convertedHours);
    const convertedMinutes = targetDate
      .getMinutes()
      .toString()
      .padStart(2, '0');

    return `${convertedHours}:${convertedMinutes}`;
  };

  const getNextDays = () => {
    const days = [];
    const today = new Date();

    for (let i = 0; i < DAYS_TO_RENDER_COUNT; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      const dayOfWeek = date.getDay();
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      const dateString = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

      // Find if this day has store times
      const dayStoreTimes = storeTimes.filter(
        (time: StoreTime) => time.day_of_week === dayOfWeek,
      );
      const isOpen = dayStoreTimes.some((time: StoreTime) => time.is_open);

      // Convert times if using device timezone
      const convertedStoreTimes = dayStoreTimes.map(time => ({
        ...time,
        start_time: useDeviceTimezone
          ? convertTimeToTimezone(
              time.start_time,
              'America/New_York',
              Intl.DateTimeFormat().resolvedOptions().timeZone,
            )
          : time.start_time,
        end_time: useDeviceTimezone
          ? convertTimeToTimezone(
              time.end_time,
              'America/New_York',
              Intl.DateTimeFormat().resolvedOptions().timeZone,
            )
          : time.end_time,
      }));

      days.push({
        date,
        dayOfWeek,
        dayName,
        dateString,
        isOpen,
        storeTimes: convertedStoreTimes,
      });
    }

    return days;
  };

  const renderDay = (day: any, index: number) => {
    const isToday = index === 0;
    const isTomorrow = index === 1;

    let dayLabel = day.dateString;
    if (isToday) {
      dayLabel = 'Today';
    } else if (isTomorrow) {
      dayLabel = 'Tomorrow';
    }

    return (
      <View key={day.date.toISOString()} style={styles.dayCard}>
        <View style={styles.dayHeader}>
          <View>
            <Text style={styles.dayName}>{day.dayName}</Text>
            <Text style={styles.dateString}>{dayLabel}</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: day.isOpen ? '#4CAF50' : '#F44336' },
            ]}
          >
            <Text style={styles.statusText}>
              {day.isOpen ? 'Open' : 'Closed'}
            </Text>
          </View>
        </View>
        {day.isOpen && day.storeTimes.length > 0 && (
          <Text style={styles.timeText}>
            {day.storeTimes
              .filter((time: StoreTime) => time.is_open)
              .map((time: StoreTime) => {
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
              .join(', ')}
          </Text>
        )}
      </View>
    );
  };

  const nextDays = getNextDays();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Image
          source={require('../assets/images/logo.png')}
          style={styles.headerLogo}
        />
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={onLogoutPress}
          disabled={loading}
        >
          <Text style={styles.logoutButtonText}>
            {loading ? 'Signing out...' : 'Logout'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        <ScrollView style={styles.content}>
          <Text style={styles.title}>{greetingMessage}</Text>
          <Text style={styles.subtitle}>
            You are now logged in as{' '}
            {user?.displayName || user?.email || 'User'}
          </Text>

          <View style={styles.timezoneToggleContainer}>
            <View style={styles.timezoneInfo}>
              <Text style={styles.timezoneLabel}>Timezone</Text>
              <Text style={styles.timezoneValue}>{getDisplayTimezone()}</Text>
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

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>
              Next {DAYS_TO_RENDER_COUNT} Days
            </Text>
            {loadingStoreTimes ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Loading store times...</Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={refetch}>
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.daysContainer}>
                {nextDays.map((day, index) => renderDay(day, index))}
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#0171EA',
  },
  headerLogo: {
    width: 70,
    height: 40,
    resizeMode: 'contain',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
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
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
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
  daysContainer: {
    gap: 12,
  },
  dayCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  dayName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  dateString: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  timeText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
});

export default HomeScreen;
