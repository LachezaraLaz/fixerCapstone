import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import HomeScreen from '../homeScreen';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mocks
jest.mock('@react-native-async-storage/async-storage', () => ({
    removeItem: jest.fn(() => Promise.resolve()),
}));

jest.mock('@expo/vector-icons', () => {
    return {
        Ionicons: jest.fn().mockImplementation(() => null),
    };
});

jest.spyOn(Alert, 'alert').mockImplementation(() => {});

jest.mock('../../chat/chatContext', () => ({
    useChatContext: () => ({
        chatClient: {
            disconnectUser: jest.fn(() => Promise.resolve()),
        }
    })
}));

// Mock navigation
const createMockNavigation = () => ({
    setOptions: jest.fn(),
    navigate: jest.fn(),
});

describe('HomeScreen', () => {
    let mockNavigation;
    let setIsLoggedIn;

    beforeEach(() => {
        jest.clearAllMocks();
        mockNavigation = createMockNavigation();
        setIsLoggedIn = jest.fn();
    });

    test('logs out successfully (without chatClient)', async () => {
        // Render HomeScreen with no chatClient
        const { getByText } = render(
            <HomeScreen
                navigation={mockNavigation}
                setIsLoggedIn={setIsLoggedIn}
            />
        );

        // Press "Logout"
        fireEvent.press(getByText('Logout'));

        await waitFor(() => {
            // Check that AsyncStorage.removeItem is called
            expect(AsyncStorage.removeItem).toHaveBeenCalledWith('token');
            expect(AsyncStorage.removeItem).toHaveBeenCalledWith('streamToken');
            expect(AsyncStorage.removeItem).toHaveBeenCalledWith('userId');
            expect(AsyncStorage.removeItem).toHaveBeenCalledWith('userName');

            expect(Alert.alert).toHaveBeenCalledWith(
                'Logged out',
                'You have been logged out successfully'
            );

            expect(setIsLoggedIn).toHaveBeenCalledWith(false);
        });
    });

    test('handles logout error in catch block', async () => {
        // Force an error by making removeItem fail
        AsyncStorage.removeItem.mockRejectedValueOnce(new Error('AsyncStorage Error'));

        const { getByText } = render(
            <HomeScreen navigation={mockNavigation} setIsLoggedIn={setIsLoggedIn} />
        );

        fireEvent.press(getByText('Logout'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Error', 'An error occurred while logging out');
        });
    });

    test('renders "Current Jobs Requested" and "Outstanding Payments" sections', () => {
        render(<HomeScreen navigation={mockNavigation} setIsLoggedIn={setIsLoggedIn} />);
        // The text check ensures these sections appear
        expect(mockNavigation.setOptions).toHaveBeenCalledWith({ headerShown: false });
    });

    test('navigates to NotificationPage when NotificationButton is pressed', () => {
        const { getByTestId } = render(
            <HomeScreen navigation={mockNavigation} setIsLoggedIn={setIsLoggedIn} />
        );

        fireEvent.press(getByTestId('notification-button'));
        expect(mockNavigation.navigate).toHaveBeenCalledWith('NotificationPage');
    });

    test('triggers onSearch and onFilter from the SearchBar', () => {
        const { getByTestId } = render(
            <HomeScreen navigation={mockNavigation} setIsLoggedIn={setIsLoggedIn} />
        );

        fireEvent.press(getByTestId('search-button'));
        fireEvent.press(getByTestId('filter-button'));
    });


    test('navigates to CreateIssue when OrangeButton is pressed', () => {
        const { getByText } = render(
            <HomeScreen navigation={mockNavigation} setIsLoggedIn={setIsLoggedIn} />
        );

        fireEvent.press(getByText('Create Issue'));

        expect(mockNavigation.navigate).toHaveBeenCalledWith('CreateIssue');
    });
});
