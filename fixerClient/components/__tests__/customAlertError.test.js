import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CustomAlertError from '../customAlertError';

// code to run only this file through the terminal:
// npm run test ./components/__tests__/customAlertError.test.js
// or
// npm run test-coverage ./components/__tests__/customAlertError.test.js

describe('CustomAlertError', () => {
  const mockOnClose = jest.fn();

  const defaultProps = {
    visible: true,
    title: 'Error Occurred',
    message: 'Something went wrong!',
    onClose: mockOnClose,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders correctly when visible', () => {
    const { getByText } = render(<CustomAlertError {...defaultProps} />);

    expect(getByText('Error Occurred')).toBeTruthy();
    expect(getByText('Something went wrong!')).toBeTruthy();
    expect(getByText('OK')).toBeTruthy();
  });

  test('does not render content when not visible', () => {
    const { queryByText } = render(
      <CustomAlertError {...defaultProps} visible={false} />
    );

    expect(queryByText('Error Occurred')).toBeNull();
    expect(queryByText('Something went wrong!')).toBeNull();
  });

  test('calls onClose when OK button is pressed', () => {
    const { getByText } = render(<CustomAlertError {...defaultProps} />);
    fireEvent.press(getByText('OK'));

    expect(mockOnClose).toHaveBeenCalled();
  });
});
