import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import UploadID from '../uploadID';
import * as ImagePicker from 'expo-image-picker';
import { NavigationContainer } from '@react-navigation/native';

// code to run only this file through the terminal:
// npm run test ./src/screens/uploadID/__tests__/uploadID.test.js
// or
// npm run test-coverage ./src/screens/uploadID/__tests__/uploadID.test.js


// Mock modules
jest.spyOn(Alert, 'alert');
jest.mock('axios');
jest.mock('expo-image-picker', () => ({
    requestCameraPermissionsAsync: jest.fn(),
    launchCameraAsync: jest.fn().mockResolvedValue({
        canceled: false,
        assets: [{ uri: 'mock-uri' }],
    }),
    MediaTypeOptions: {
        Images: 'Images',
    },
}));
jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn(),
}));

const renderWithNavigation = () => {
    return render(
        <NavigationContainer>
            <UploadID />
        </NavigationContainer>
    );
};

describe('UploadID Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('requests camera permission on mount', async () => {
        ImagePicker.requestCameraPermissionsAsync.mockResolvedValueOnce({ status: 'granted' });

        renderWithNavigation();

        await waitFor(() => {
            expect(ImagePicker.requestCameraPermissionsAsync).toHaveBeenCalled();
        });
    });

    test('shows permission denied alert when camera access is denied', async () => {
        ImagePicker.requestCameraPermissionsAsync.mockResolvedValueOnce({ status: 'denied' });

        renderWithNavigation();

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Permission Denied', 'Camera access is required to take a picture.');
        });
    });

    test('shows an alert if camera is launched without permission', async () => {
        ImagePicker.requestCameraPermissionsAsync.mockResolvedValueOnce({ status: 'denied' });

        const { getByText } = renderWithNavigation();

        const button = getByText('Take a Picture of Your ID');
        fireEvent.press(button);

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Permission Denied', 'Camera access is required to take a picture.');
        });
    });

    test('uploads image and navigates to ThankYouPage on success', async () => {
        ImagePicker.requestCameraPermissionsAsync.mockResolvedValueOnce({ status: 'granted' });
        ImagePicker.launchCameraAsync.mockResolvedValueOnce({
            canceled: false,
            assets: [{ uri: 'test-image-uri' }],
        });

        AsyncStorage.getItem.mockResolvedValueOnce('mock-token');
        axios.post.mockResolvedValueOnce({ status: 200 });

        const { getByText } = renderWithNavigation();

        const button = getByText('Take a Picture of Your ID');
        fireEvent.press(button);

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith(
                'https://fixercapstone-production.up.railway.app/professional/uploadID',
                expect.any(FormData),
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: 'Bearer mock-token',
                    },
                }
            );
        });
    });

    test('shows network error alert when no response is received', async () => {
        ImagePicker.requestCameraPermissionsAsync.mockResolvedValueOnce({ status: 'granted' });
        ImagePicker.launchCameraAsync.mockResolvedValueOnce({
            canceled: false,
            assets: [{ uri: 'test-image-uri' }],
        });

        AsyncStorage.getItem.mockResolvedValueOnce('mock-token');
        axios.post.mockRejectedValueOnce({ request: {} });

        const { getByText } = renderWithNavigation();

        const button = getByText('Take a Picture of Your ID');
        fireEvent.press(button);

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Network Error', 'No response received from the server. Please check your network and try again.');
        });
    });

    test('shows server error alert when server responds with an error', async () => {
        ImagePicker.requestCameraPermissionsAsync.mockResolvedValueOnce({ status: 'granted' });
        ImagePicker.launchCameraAsync.mockResolvedValueOnce({
            canceled: false,
            assets: [{ uri: 'test-image-uri' }],
        });

        AsyncStorage.getItem.mockResolvedValueOnce('mock-token');
        axios.post.mockRejectedValueOnce({ response: { data: 'Upload failed' } });

        const { getByText } = renderWithNavigation();

        const button = getByText('Take a Picture of Your ID');
        fireEvent.press(button);

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Upload Failed', 'The server responded with an error.');
        });
    });
});
