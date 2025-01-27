import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ProfilePage from '../profilePage';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Alert } from 'react-native';

// code to run only this file through the terminal:
// npm run test ./src/screens/profilePage/__tests__/profilePage.test.js
// or
// npm run test-coverage ./src/screens/profilePage/__tests__/profilePage.test.js

jest.mock('axios');
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
}));
jest.mock('@expo/vector-icons', () => ({
    Ionicons: jest.fn(),
    MaterialIcons: jest.fn(),
}));  
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(() => ({
    navigate: jest.fn(),
  })),
}));
jest.spyOn(Alert, 'alert');

describe('ProfilePage Component', () => {
    const mockProfessional = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'johndoe@example.com',
        totalRating: 4.5,
        reviewCount: 10,
        formComplete: false,
        approved: false,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders loading indicator initially', () => {
        const { getByText } = render(<ProfilePage />);
        expect(getByText('Loading...')).toBeTruthy();
    });

    test('renders profile data correctly', async () => {
        AsyncStorage.getItem.mockResolvedValueOnce('mock-token');
        axios.get.mockResolvedValueOnce({ data: mockProfessional });

        const { getByText } = render(<ProfilePage />);

        await waitFor(() => {
        expect(getByText('John Doe')).toBeTruthy();
        expect(getByText('⭐ 4.5')).toBeTruthy();
        expect(getByText('(10 reviews)')).toBeTruthy();
        expect(getByText('johndoe@example.com')).toBeTruthy();
        });
    });

    test('navigates to CredentialFormPage when Verify Credentials is pressed', async () => {
        AsyncStorage.getItem.mockResolvedValueOnce('mock-token');
        axios.get.mockResolvedValueOnce({ data: mockProfessional });

        const mockNavigate = jest.fn();
        useNavigation.mockReturnValue({ navigate: mockNavigate });

        const { getByText } = render(<ProfilePage />);

        await waitFor(() => {
        expect(getByText('Verify Credentials')).toBeTruthy();
        });

        const verifyButton = getByText('Verify Credentials');
        fireEvent.press(verifyButton);

        await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('CredentialFormPage');
        });
    });

    test('shows alert when edit button is pressed', async () => {
        AsyncStorage.getItem.mockResolvedValueOnce('mock-token');
        axios.get.mockResolvedValueOnce({ data: mockProfessional });
    
        const { getByTestId, getByText } = render(<ProfilePage />);
    
        // Wait for the "Loading..." text to disappear, indicating the data has loaded
        await waitFor(() => {
            expect(getByText('John Doe')).toBeTruthy(); // Ensure profile data is loaded
        });
    
        // Locate the edit button after the data has loaded
        const editButton = getByTestId('edit-button');
        fireEvent.press(editButton);
    
        // Verify the alert is shown when the edit button is pressed
        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith(
                'Feature Unavailable',
                'The editing feature is not available yet, but please keep an eye out for future updates!',
                [{ text: 'OK', onPress: expect.any(Function) }]
            );
        });
    });    

    test('handles error state when profile data fails to load', async () => {
        AsyncStorage.getItem.mockResolvedValueOnce('mock-token');
        axios.get.mockRejectedValueOnce(new Error('Network error'));

        const { getByText } = render(<ProfilePage />);

        await waitFor(() => {
        expect(getByText('Error loading profile.')).toBeTruthy();
        });
    });

    test('navigates to ReviewsPage with professional email', async () => {
        const mockNavigate = jest.fn(); // Mock the navigation function
        const mockProfessional = {
            email: 'johndoe@example.com',
            firstName: 'John',
            lastName: 'Doe',
            totalRating: 4.5,
            reviewCount: 10,
            formComplete: true,
            approved: true,
        };
    
        jest.spyOn(require('@react-navigation/native'), 'useNavigation').mockReturnValue({
            navigate: mockNavigate,
        });
    
        AsyncStorage.getItem.mockResolvedValueOnce('mock-token'); // Mock AsyncStorage
        axios.get.mockResolvedValueOnce({ data: mockProfessional }); // Mock Axios response
    
        const { getByText } = render(<ProfilePage />);
    
        // Wait for the profile data to load
        await waitFor(() => {
            expect(getByText('John Doe')).toBeTruthy();
        });
    
        // Locate and press the "View Reviews" button
        const viewReviewsButton = getByText('View Reviews');
        fireEvent.press(viewReviewsButton);
    
        // Assert that navigation.navigate is called with the correct parameters
        expect(mockNavigate).toHaveBeenCalledWith('ReviewsPage', {
            professionalEmail: 'johndoe@example.com',
        });
    });

    test('navigates to ReviewsPage with professional email', async () => {
        const mockNavigate = jest.fn(); // Mock the navigation function
        const mockProfessional = {
            email: 'johndoe@example.com',
            firstName: 'John',
            lastName: 'Doe',
            totalRating: 4.5,
            reviewCount: 10,
            formComplete: true,
            approved: true,
        };
    
        jest.spyOn(require('@react-navigation/native'), 'useNavigation').mockReturnValue({
            navigate: mockNavigate,
        });
    
        AsyncStorage.getItem.mockResolvedValueOnce('mock-token'); // Mock AsyncStorage
        axios.get.mockResolvedValueOnce({ data: mockProfessional }); // Mock Axios response
    
        const { getByText } = render(<ProfilePage />);
    
        // Wait for the profile data to load
        await waitFor(() => {
            expect(getByText('John Doe')).toBeTruthy();
        });
    
        // Locate and press the "View Reviews" button
        const viewReviewsButton = getByText('View Reviews');
        fireEvent.press(viewReviewsButton);
    
        // Assert that navigation.navigate is called with the correct parameters
        expect(mockNavigate).toHaveBeenCalledWith('ReviewsPage', {
            professionalEmail: 'johndoe@example.com',
        });
    });    
});
