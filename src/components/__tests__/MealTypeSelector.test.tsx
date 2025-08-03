import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { MealTypeSelector } from '../MealTypeSelector';

describe('MealTypeSelector', () => {
  const mockOnMealTypeChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all three meal type options', () => {
    const { getByText } = render(
      <MealTypeSelector
        selectedMealType="breakfast"
        onMealTypeChange={mockOnMealTypeChange}
      />,
    );

    expect(getByText('Breakfast')).toBeTruthy();
    expect(getByText('Lunch')).toBeTruthy();
    expect(getByText('Dinner')).toBeTruthy();
  });

  it('should show breakfast as selected by default', () => {
    const { getByText } = render(
      <MealTypeSelector
        selectedMealType="breakfast"
        onMealTypeChange={mockOnMealTypeChange}
      />,
    );

    const breakfastButton = getByText('Breakfast');
    expect(breakfastButton).toBeTruthy();
  });

  it('should call onMealTypeChange when lunch is pressed', () => {
    const { getByText } = render(
      <MealTypeSelector
        selectedMealType="breakfast"
        onMealTypeChange={mockOnMealTypeChange}
      />,
    );

    const lunchButton = getByText('Lunch');
    fireEvent.press(lunchButton);

    expect(mockOnMealTypeChange).toHaveBeenCalledWith('lunch');
  });

  it('should call onMealTypeChange when dinner is pressed', () => {
    const { getByText } = render(
      <MealTypeSelector
        selectedMealType="breakfast"
        onMealTypeChange={mockOnMealTypeChange}
      />,
    );

    const dinnerButton = getByText('Dinner');
    fireEvent.press(dinnerButton);

    expect(mockOnMealTypeChange).toHaveBeenCalledWith('dinner');
  });

  it('should call onMealTypeChange when breakfast is pressed', () => {
    const { getByText } = render(
      <MealTypeSelector
        selectedMealType="lunch"
        onMealTypeChange={mockOnMealTypeChange}
      />,
    );

    const breakfastButton = getByText('Breakfast');
    fireEvent.press(breakfastButton);

    expect(mockOnMealTypeChange).toHaveBeenCalledWith('breakfast');
  });
});
