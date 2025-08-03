import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { StoreTime, StoreOverride } from '../../services/storeService';
import { DateSelector } from '../DateSelector';

jest.mock('@gorhom/bottom-sheet', () => ({
  BottomSheet: ({ children }: any) => children,
  BottomSheetView: ({ children }: any) => children,
}));

jest.mock('react-native-calendars', () => ({
  Calendar: () => null,
}));

describe('DateSelector', () => {
  const mockOnDateChange = jest.fn();
  const mockOnOpenCalendar = jest.fn();

  const mockStoreTimes: StoreTime[] = [
    {
      id: '1',
      day_of_week: 0, // Sunday
      start_time: '09:00',
      end_time: '17:00',
      is_open: true,
    },
    {
      id: '2',
      day_of_week: 1, // Monday
      start_time: '09:00',
      end_time: '17:00',
      is_open: true,
    },
    {
      id: '3',
      day_of_week: 2, // Tuesday
      start_time: '09:00',
      end_time: '17:00',
      is_open: false,
    },
  ];

  const mockStoreOverrides: StoreOverride[] = [
    {
      id: 'override1',
      day: 15,
      month: 1,
      is_open: false,
      start_time: '00:00',
      end_time: '00:00',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the title correctly', () => {
    const { getByText } = render(
      <DateSelector
        selectedDate="2024-01-15"
        onDateChange={mockOnDateChange}
        onOpenCalendar={mockOnOpenCalendar}
        storeTimes={mockStoreTimes}
        storeOverrides={mockStoreOverrides}
      />,
    );

    expect(getByText('Select a date')).toBeTruthy();
  });

  it('should render 4 date cards', () => {
    const { getAllByText } = render(
      <DateSelector
        selectedDate="2024-01-15"
        onDateChange={mockOnDateChange}
        onOpenCalendar={mockOnOpenCalendar}
        storeTimes={mockStoreTimes}
        storeOverrides={mockStoreOverrides}
      />,
    );

    const dayNumbers = getAllByText(/\d+/);
    expect(dayNumbers.length).toBeGreaterThanOrEqual(4);
  });

  it('should render the add button with plus icon', () => {
    const { getByText } = render(
      <DateSelector
        selectedDate="2024-01-15"
        onDateChange={mockOnDateChange}
        onOpenCalendar={mockOnOpenCalendar}
        storeTimes={mockStoreTimes}
        storeOverrides={mockStoreOverrides}
      />,
    );

    expect(getByText('+')).toBeTruthy();
  });

  it('should show "Today" label for the first card', () => {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const { getByText } = render(
      <DateSelector
        selectedDate={today}
        onDateChange={mockOnDateChange}
        onOpenCalendar={mockOnOpenCalendar}
        storeTimes={mockStoreTimes}
        storeOverrides={mockStoreOverrides}
      />,
    );

    expect(getByText('Today')).toBeTruthy();
  });

  it('calls onDateChange when a date card is pressed', () => {
    const { getAllByText } = render(
      <DateSelector
        selectedDate="2024-01-15"
        onDateChange={mockOnDateChange}
        onOpenCalendar={mockOnOpenCalendar}
        storeTimes={mockStoreTimes}
        storeOverrides={mockStoreOverrides}
      />,
    );

    const firstDayNumber = getAllByText(/\d+/)[0];
    fireEvent.press(firstDayNumber);

    expect(mockOnDateChange).toHaveBeenCalled();
  });

  it('should call onOpenCalendar when add button is pressed', () => {
    const { getByText } = render(
      <DateSelector
        selectedDate="2024-01-15"
        onDateChange={mockOnDateChange}
        onOpenCalendar={mockOnOpenCalendar}
        storeTimes={mockStoreTimes}
        storeOverrides={mockStoreOverrides}
      />,
    );

    const addButton = getByText('+');
    fireEvent.press(addButton);

    expect(mockOnOpenCalendar).toHaveBeenCalled();
  });
});
