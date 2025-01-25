import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CreateIssue from '../createIssue';
import { Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwtDecode from 'jwt-decode';

jest.mock('expo-image-picker', () => ({
    requestMediaLibraryPermissionsAsync: jest.fn(() => Promise.resolve({ granted: true })),
    launchImageLibraryAsync: jest.fn(() =>
        Promise.resolve({ canceled: false, assets: [{ uri: 'test-image-uri' }] })
    ),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn(),
}));
jest.mock('jwt-decode', () => jest.fn());
jest.mock('axios');
jest.spyOn(Alert, 'alert');

describe('CreateIssue Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('displays an alert if fields are empty', async () => {
        const { getByTestId } = render(<CreateIssue />);
        const postButton = getByTestId('post-job-button');

        fireEvent.press(postButton);

        expect(Alert.alert).toHaveBeenCalledWith(
            "Some fields are empty. Please complete everything for the professional to give you the most informed quote!"
        );
    });

    test('posts an issue successfully', async () => {
        // Mock necessary dependencies
        AsyncStorage.getItem.mockResolvedValue('fake-jwt-token');
        jwtDecode.mockReturnValue({ email: 'user@example.com' });
        axios.post.mockResolvedValueOnce({ status: 201 });

        // Render the CreateIssue component
        const { getByPlaceholderText, getByText, getByTestId } = render(<CreateIssue />);

        // Fill the title input
        fireEvent.changeText(getByPlaceholderText('Title'), 'Test Issue');

        // Select "Plumber" for Professional Needed
        fireEvent.press(getByText('Plumber'));

        // Select "Other" to enable the "Describe the issue..." input
        fireEvent.press(getByText('Other'));

        // Wait for the "Describe the issue..." input to appear
        await waitFor(() => expect(getByPlaceholderText('Describe the issue...')).toBeTruthy());

        // Fill the description input
        fireEvent.changeText(getByPlaceholderText('Describe the issue...'), 'A test issue description.');

        // Press the "Post Job" button
        fireEvent.press(getByTestId('post-job-button'));

        // Wait for the axios.post call
        await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

        // Verify success alert
        expect(Alert.alert).toHaveBeenCalledWith('Job posted successfully');
    });

    test('renders and allows input for "Describe the issue..."', async () => {
        // Mock necessary dependencies
        AsyncStorage.getItem.mockResolvedValue('fake-jwt-token');
        jwtDecode.mockReturnValue({ email: 'user@example.com' });

        const { getByPlaceholderText, getByText } = render(<CreateIssue />);

        // Fill the title input
        fireEvent.changeText(getByPlaceholderText('Title'), 'Test Issue');

        // Select "Plumber" for Professional Needed
        fireEvent.press(getByText('Plumber'));

        // Select "Other" to enable the "Describe the issue..." input
        fireEvent.press(getByText('Other'));

        // Wait for the "Describe the issue..." input to appear
        await waitFor(() => expect(getByPlaceholderText('Describe the issue...')).toBeTruthy());

        // Fill the description input
        fireEvent.changeText(getByPlaceholderText('Describe the issue...'), 'Test description');

        // Assert the input value
        expect(getByPlaceholderText('Describe the issue...').props.value).toBe('Test description');
    });


    test('shows an error alert if post fails', async () => {
        AsyncStorage.getItem.mockResolvedValue('fake-jwt-token');
        jwtDecode.mockReturnValue({ email: 'user@example.com' });
        axios.post.mockRejectedValueOnce(new Error('Network error'));

        const { getByPlaceholderText, getByText, getByTestId } = render(<CreateIssue />);

        // Fill the title field
        fireEvent.changeText(getByPlaceholderText('Title'), 'Test Issue');

        // Select "Plumber" for Professional Needed
        fireEvent.press(getByText('Plumber'));

        // Select "Other" to enable the description input
        fireEvent.press(getByText('Other'));

        // Wait for the "Describe the issue..." input to appear
        await waitFor(() => expect(getByPlaceholderText('Describe the issue...')).toBeTruthy());

        // Fill the description field
        fireEvent.changeText(getByPlaceholderText('Describe the issue...'), 'Test description');

        // Trigger the "Post Job" button
        fireEvent.press(getByTestId('post-job-button'));

        // Wait for the error alert to appear
        await waitFor(() =>
            expect(Alert.alert).toHaveBeenCalledWith('An error occurred. Please try again.')
        );
    });
});
