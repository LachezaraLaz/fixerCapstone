import React, { useContext } from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { LanguageProvider, LanguageContext } from './LanguageContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import { Text } from 'react-native'; 

// code to run only this file through the terminal:
// npm run test ./context/LanguageContext.test.js
// or
// npm run test-coverage ./context/LanguageContext.test.js

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

jest.mock('expo-localization', () => ({
  getLocales: () => [{ languageCode: 'en' }],
}));

const TestComponent = () => {
  const { locale, changeLanguage } = useContext(LanguageContext);

  return (
    <>
      <Text testID="locale">{locale}</Text>
      <Text testID="change-language" onPress={() => changeLanguage('fr')}>
        Change Language
      </Text>
    </>
  );
};

describe('LanguageContext', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('uses default locale from Localization', async () => {
    AsyncStorage.getItem.mockResolvedValue(null);

    const { getByTestId } = render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    await waitFor(() => {
      expect(getByTestId('locale').props.children).toBe('en');
    });
  });

  test('loads persisted language from AsyncStorage', async () => {
    AsyncStorage.getItem.mockResolvedValue('fr');

    const { getByTestId } = render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    await waitFor(() => {
      expect(getByTestId('locale').props.children).toBe('fr');
    });
  });

  test('changeLanguage updates locale and saves to AsyncStorage', async () => {
    AsyncStorage.getItem.mockResolvedValue(null);

    const { getByTestId } = render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    await waitFor(() => {
      expect(getByTestId('locale').props.children).toBe('en');
    });

    const changeLangButton = getByTestId('change-language');
    changeLangButton.props.onPress();

    await waitFor(() => {
      expect(getByTestId('locale').props.children).toBe('fr');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('appLanguage', 'fr');
    });
  });
});
