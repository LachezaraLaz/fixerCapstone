import React from 'react';
import {render, fireEvent, waitFor, act} from '@testing-library/react-native';
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
    let mockNavigation;
    let mockSetIsLoggedIn;

    beforeEach(() => {
        mockNavigation = {
            navigate: jest.fn(),
            canGoBack: jest.fn().mockReturnValue(true),
            goBack: jest.fn(),
        };
        mockSetIsLoggedIn = jest.fn();

        jest.clearAllMocks();
    });

    test('renders all options correctly', () => {
        const { getByText } = render(<SettingsPage navigation={mockNavigation} setIsLoggedIn={mockSetIsLoggedIn} />);

        // Check if all options are rendered
        expect(getByText('Edit Profile')).toBeTruthy();
        expect(getByText('Appearance')).toBeTruthy();
        expect(getByText('Language')).toBeTruthy();
        expect(getByText('View Tax Documents')).toBeTruthy();
        expect(getByText('Privacy Policy')).toBeTruthy();
        expect(getByText('Terms & Conditions')).toBeTruthy();
        expect(getByText('Logout')).toBeTruthy();
    });

    test('navigates to Edit Profile settings', () => {
        const { getByText } = render(
            <SettingsPage navigation={mockNavigation} setIsLoggedIn={mockSetIsLoggedIn} />
        );

        const editProfileButton = getByText('Edit Profile');
        fireEvent.press(editProfileButton);

        expect(mockNavigation.navigate).toHaveBeenCalledWith('ProfessionalAccountSettingsPage');
    });


    test('navigates back when back button is pressed', () => {
        const { getByTestId } = render(
            <SettingsPage navigation={mockNavigation} setIsLoggedIn={mockSetIsLoggedIn} />
        );

        const backButton = getByTestId('back-button');
        fireEvent.press(backButton);

        expect(mockNavigation.goBack).toHaveBeenCalled();
    });


    test('handles logout correctly', async () => {
        const { getByText } = render(<SettingsPage navigation={mockNavigation} setIsLoggedIn={mockSetIsLoggedIn} />);

        const logoutButton = getByText('Logout');
        await act(async () => {
            fireEvent.press(logoutButton);
        });

        await waitFor(() => {
        expect(AsyncStorage.removeItem).toHaveBeenCalledTimes(4);
        expect(AsyncStorage.removeItem).toHaveBeenCalledWith('token');
        expect(AsyncStorage.removeItem).toHaveBeenCalledWith('streamToken');
        expect(AsyncStorage.removeItem).toHaveBeenCalledWith('userId');
        expect(AsyncStorage.removeItem).toHaveBeenCalledWith('userName');
        });
    });



    // all following tests will have to change when the buttons will actually navigate to somewhere new

    test('shows alert when Appearance is pressed', () => {
        const { getByText } = render(<SettingsPage navigation={mockNavigation} setIsLoggedIn={mockSetIsLoggedIn} />);
    
        const appearanceButton = getByText('Appearance');
        fireEvent.press(appearanceButton);

        expect(getByText('Coming Soon')).toBeTruthy();
        expect(getByText('Appearance customization will be available in a future update.')).toBeTruthy();
        // expect(Alert.alert).toHaveBeenCalledWith(
        //   'Feature Unavailable',
        //   'Appearance is not available yet.'
        // );
    });

    test('shows alert when Language is pressed', () => {
        const { getByText } = render(<SettingsPage navigation={mockNavigation} setIsLoggedIn={mockSetIsLoggedIn} />);
    
        const languageButton = getByText('Language');
        fireEvent.press(languageButton);

        expect(getByText('Coming Soon')).toBeTruthy();
        expect(getByText('Additional language options will be available soon.')).toBeTruthy();
        // expect(Alert.alert).toHaveBeenCalledWith(
        //   'Feature Unavailable',
        //   'Language is not available yet.'
        // );
    });
    
    test('shows alert when View Tax Documents is pressed', () => {
        const { getByText } = render(<SettingsPage navigation={mockNavigation} setIsLoggedIn={mockSetIsLoggedIn} />);
    
        const taxDocumentsButton = getByText('View Tax Documents');
        fireEvent.press(taxDocumentsButton);

        expect(getByText('Coming Soon')).toBeTruthy();
        expect(getByText('Tax document viewing will be implemented soon.')).toBeTruthy();
        // expect(Alert.alert).toHaveBeenCalledWith(
        //   'Feature Unavailable',
        //   'View Tax Documents is not available yet.'
        // );
    });
    
    test('shows alert when Privacy Policy is pressed', () => {
        const { getByText } = render(<SettingsPage navigation={mockNavigation} setIsLoggedIn={mockSetIsLoggedIn} />);
    
        const privacyPolicyButton = getByText('Privacy Policy');
        fireEvent.press(privacyPolicyButton);

        expect(getByText('Coming Soon')).toBeTruthy();
        expect(getByText('Our privacy policy document will be available soon.')).toBeTruthy();
        // expect(Alert.alert).toHaveBeenCalledWith(
        //   'Feature Unavailable',
        //   'Privacy Policy is not available yet.'
        // );
    });
    
    test('shows alert when Terms & Conditions is pressed', () => {
        const { getByText } = render(<SettingsPage navigation={mockNavigation} setIsLoggedIn={mockSetIsLoggedIn} />);
    
        const termsButton = getByText('Terms & Conditions');
        fireEvent.press(termsButton);

        expect(getByText('Coming Soon')).toBeTruthy();
        expect(getByText('Our terms and conditions document will be available soon.')).toBeTruthy();
        // expect(Alert.alert).toHaveBeenCalledWith(
        //   'Feature Unavailable',
        //   'Terms & Conditions is not available yet.'
        // );
    });
});
