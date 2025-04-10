import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import LanguageModal from '../LanguageModal'; // Update the path if needed
import { LanguageContext } from '../../context/LanguageContext'; // Adjust path

// code to run only this file through the terminal:
// npm run test ./components/__tests__/LanguageModal.test.js
// or
// npm run test-coverage ./components/__tests__/LanguageModal.test.js

jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn(),
}));

describe('LanguageModal', () => {
  const mockChangeLanguage = jest.fn();
  const mockOnClose = jest.fn();

  const renderComponent = (visible = true) =>
    render(
      <LanguageContext.Provider value={{ changeLanguage: mockChangeLanguage }}>
        <LanguageModal visible={visible} onClose={mockOnClose} />
      </LanguageContext.Provider>
    );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders when visible', () => {
    const { getByText } = renderComponent(true);
    expect(getByText('🌍 Choose Language')).toBeTruthy();
    expect(getByText('English')).toBeTruthy();
    expect(getByText('Français')).toBeTruthy();
    expect(getByText('✖ Close')).toBeTruthy();
  });

  test('does not render when not visible', () => {
    const { queryByText } = renderComponent(false);
    expect(queryByText('🌍 Choose Language')).toBeNull();
  });

  test('pressing English calls changeLanguage and onClose', () => {
    const { getByText } = renderComponent(true);
    fireEvent.press(getByText('English'));
    expect(mockChangeLanguage).toHaveBeenCalledWith('en');
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('pressing Français calls changeLanguage and onClose', () => {
    const { getByText } = renderComponent(true);
    fireEvent.press(getByText('Français'));
    expect(mockChangeLanguage).toHaveBeenCalledWith('fr');
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('pressing close only calls onClose', () => {
    const { getByText } = renderComponent(true);
    fireEvent.press(getByText('✖ Close'));
    expect(mockChangeLanguage).not.toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });
});
