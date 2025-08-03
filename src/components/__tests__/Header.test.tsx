import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Header } from '../Header';

// Mock the useSafeAreaInsets hook
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  }),
}));

describe('Header', () => {
  const mockOnLogoutPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly with default props', () => {
    const { getByText } = render(<Header onLogoutPress={mockOnLogoutPress} />);

    expect(getByText('Logout')).toBeTruthy();
  });

  it('should call onLogoutPress when logout button is pressed', () => {
    const { getByText } = render(<Header onLogoutPress={mockOnLogoutPress} />);

    fireEvent.press(getByText('Logout'));
    expect(mockOnLogoutPress).toHaveBeenCalledTimes(1);
  });

  it('should disable logout button when loading is true', () => {
    const { getByTestId } = render(
      <Header onLogoutPress={mockOnLogoutPress} loading={true} />,
    );

    const logoutButton = getByTestId('logout-button');

    fireEvent.press(logoutButton);
    expect(mockOnLogoutPress).not.toHaveBeenCalled();
  });
});
