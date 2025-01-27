import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SettingsPage from '../settingsPage'; 
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

// code to run only this file through the terminal:
// npm run test ./src/screens/settingsPage/__tests__/settingsPage.test.js
// or
// npm run test-coverage ./src/screens/settingsPage/__tests__/settingsPage.test.js

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(() => ({
    goBack: jest.fn(),
  })),
}));
jest.mock('@expo/vector-icons', () => ({
    Ionicons: jest.fn(),
}));  
jest.mock('@react-native-async-storage/async-storage', () => ({
  removeItem: jest.fn(),
}));

jest.spyOn(Alert, 'alert');

describe('SettingsPage Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders all options correctly', () => {
        const { getByText } = render(<SettingsPage />);

        // Check if all options are rendered
        expect(getByText('Account Settings')).toBeTruthy();
        expect(getByText('Appearance')).toBeTruthy();
        expect(getByText('Language')).toBeTruthy();
        expect(getByText('Wallet')).toBeTruthy();
        expect(getByText('Notifications')).toBeTruthy();
        expect(getByText('View Tax Documents')).toBeTruthy();
        expect(getByText('Privacy Policy')).toBeTruthy();
        expect(getByText('Terms & Conditions')).toBeTruthy();
        expect(getByText('Logout')).toBeTruthy();
    });

    test('shows alert when feature is unavailable', () => {
        const { getByText } = render(<SettingsPage />);

        const accountSettingsButton = getByText('Account Settings');
        fireEvent.press(accountSettingsButton);

        expect(Alert.alert).toHaveBeenCalledWith('Feature Unavailable', 'Account Settings is not available yet.');
    });

    test('navigates back when back button is pressed', () => {
        const mockGoBack = jest.fn();
        useNavigation.mockReturnValue({ goBack: mockGoBack });
    
        const { getByTestId } = render(<SettingsPage />);
    
        // Locate the back button using the testID
        const backButton = getByTestId('back-button');
        fireEvent.press(backButton);
    
        // Verify that goBack was called
        expect(mockGoBack).toHaveBeenCalled();
    });    

    test('handles logout correctly', async () => {
        const { getByText } = render(<SettingsPage />);

        const logoutButton = getByText('Logout');
        fireEvent.press(logoutButton);

        await waitFor(() => {
        expect(AsyncStorage.removeItem).toHaveBeenCalledTimes(4);
        expect(AsyncStorage.removeItem).toHaveBeenCalledWith('token');
        expect(AsyncStorage.removeItem).toHaveBeenCalledWith('streamToken');
        expect(AsyncStorage.removeItem).toHaveBeenCalledWith('userId');
        expect(AsyncStorage.removeItem).toHaveBeenCalledWith('userName');
        });

        expect(Alert.alert).toHaveBeenCalledWith('Logged out', 'You have been logged out successfully');
    });



    // all of the followinf tests will have to change when the buttons will actualy navigate to somewhere new

    test('shows alert when Appearance is pressed', () => {
        const { getByText } = render(<SettingsPage />);
    
        const appearanceButton = getByText('Appearance');
        fireEvent.press(appearanceButton);
    
        expect(Alert.alert).toHaveBeenCalledWith(
          'Feature Unavailable',
          'Appearance is not available yet.'
        );
    });

    test('shows alert when Language is pressed', () => {
        const { getByText } = render(<SettingsPage />);
    
        const languageButton = getByText('Language');
        fireEvent.press(languageButton);
    
        expect(Alert.alert).toHaveBeenCalledWith(
          'Feature Unavailable',
          'Language is not available yet.'
        );
    });

    test('shows alert when Wallet is pressed', () => {
        const { getByText } = render(<SettingsPage />);
    
        const walletButton = getByText('Wallet');
        fireEvent.press(walletButton);
    
        expect(Alert.alert).toHaveBeenCalledWith(
          'Feature Unavailable',
          'Wallet is not available yet.'
        );
    });
    
    test('shows alert when Notifications is pressed', () => {
        const { getByText } = render(<SettingsPage />);
    
        const notificationsButton = getByText('Notifications');
        fireEvent.press(notificationsButton);
    
        expect(Alert.alert).toHaveBeenCalledWith(
          'Feature Unavailable',
          'Notifications is not available yet.'
        );
    });
    
    test('shows alert when View Tax Documents is pressed', () => {
        const { getByText } = render(<SettingsPage />);
    
        const taxDocumentsButton = getByText('View Tax Documents');
        fireEvent.press(taxDocumentsButton);
    
        expect(Alert.alert).toHaveBeenCalledWith(
          'Feature Unavailable',
          'View Tax Documents is not available yet.'
        );
    });
    
    test('shows alert when Privacy Policy is pressed', () => {
        const { getByText } = render(<SettingsPage />);
    
        const privacyPolicyButton = getByText('Privacy Policy');
        fireEvent.press(privacyPolicyButton);
    
        expect(Alert.alert).toHaveBeenCalledWith(
          'Feature Unavailable',
          'Privacy Policy is not available yet.'
        );
    });
    
    test('shows alert when Terms & Conditions is pressed', () => {
        const { getByText } = render(<SettingsPage />);
    
        const termsButton = getByText('Terms & Conditions');
        fireEvent.press(termsButton);
    
        expect(Alert.alert).toHaveBeenCalledWith(
          'Feature Unavailable',
          'Terms & Conditions is not available yet.'
        );
    });
});
