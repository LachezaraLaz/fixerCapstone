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
        AsyncStorage.getItem.mockResolvedValue('fake-jwt-token');
        jwtDecode.mockReturnValue({ email: 'user@example.com' });
        axios.post.mockResolvedValueOnce({ status: 201 });

        const { getByPlaceholderText, getByTestId } = render(<CreateIssue />);
        fireEvent.changeText(getByPlaceholderText('Title'), 'Test Issue');
        fireEvent.changeText(getByPlaceholderText('Describe the issue...'), 'A test issue description.');
        fireEvent.press(getByTestId('post-job-button'));

        await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
        expect(Alert.alert).toHaveBeenCalledWith('Job posted successfully');
    });

    test('displays an error alert if post fails', async () => {
        AsyncStorage.getItem.mockResolvedValue('fake-jwt-token');
        jwtDecode.mockReturnValue({ email: 'user@example.com' });
        axios.post.mockRejectedValueOnce(new Error('Network error'));

        const { getByPlaceholderText, getByTestId } = render(<CreateIssue />);
        fireEvent.changeText(getByPlaceholderText('Title'), 'Test Issue');
        fireEvent.changeText(getByPlaceholderText('Describe the issue...'), 'A test issue description.');
        fireEvent.press(getByTestId('post-job-button'));

        await waitFor(() => expect(Alert.alert).toHaveBeenCalledWith('An error occurred. Please try again.'));
    });
});
