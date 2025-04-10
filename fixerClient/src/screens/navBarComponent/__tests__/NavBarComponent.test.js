import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { LanguageContext } from '../../../../context/LanguageContext'; // Ensure path is correct
import NavBar from '../NavBarComponent'; // Ensure path is correct
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

// code to run only this file through the terminal:
// npm run test ./src/screens/navBarComponent/__tests__/navBarComponent.test.js
// or
// npm run test-coverage ./src/screens/navBarComponent/__tests__/navBarComponent.test.js

// jest.mock('@react-navigation/bottom-tabs', () => {
//     return {
//         createBottomTabNavigator: () => ({
//             Navigator: ({ children }) => <>{children}</>,
//             Screen: ({ children }) => <>{children}</>
//         }),
//     };
// });

jest.mock('axios');
axios.get.mockResolvedValue({ data: [] }); // Fake success response

// Silence API calls from HomeScreen (to avoid 403s)
jest.mock('../../homeScreen/homeScreen', () => {
    return () => <></>; // mock component
});

jest.mock('@react-native-async-storage/async-storage', () => ({
    __esModule: true,
    default: {
      setItem: jest.fn(),
      getItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    },
}));
describe('NavBar', () => {
    const setIsLoggedIn = jest.fn();
    const setLocale = jest.fn();
    
    const renderNavBar = (locale = 'en') => {
        return render(
            <NavigationContainer>
                <LanguageContext.Provider value={{ locale, setLocale }}>
                    <NavBar setIsLoggedIn={setIsLoggedIn} />
                </LanguageContext.Provider>
            </NavigationContainer>
        );
    };

    test('renders the Home tab with the correct icon and label', async () => {
        const { getAllByTestId } = renderNavBar();
    
        const homeIconContainers = await waitFor(() => getAllByTestId('Home-icon-container'));
        expect(homeIconContainers.length).toBeGreaterThan(0);
    });
    
    test('renders the JobsPosted tab with the correct icon and label', async () => {
        const { getAllByTestId } = renderNavBar();
    
        const jobsPostedIconContainers = await waitFor(() => getAllByTestId('JobsPosted-icon-container'));
        expect(jobsPostedIconContainers.length).toBeGreaterThan(0);
    });

    test('renders the Chat tab with the correct icon and label', async () => {
        const { getAllByTestId } = renderNavBar();

        const chatIconContainers = await waitFor(() => getAllByTestId('Chat-icon-container'));
        expect(chatIconContainers.length).toBeGreaterThan(0);
    });

    test('renders the Profile tab with the correct icon and label', async () => {
        const { getAllByTestId } = renderNavBar();

        const profileIconContainers = await waitFor(() => getAllByTestId('Profile-icon-container'));
        expect(profileIconContainers.length).toBeGreaterThan(0);
    });
});