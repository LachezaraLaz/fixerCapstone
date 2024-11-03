import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CreateIssue from '../createIssue'; // Adjust the import path as necessary
import { Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwtDecode from 'jwt-decode'; // Import for mocking
import * as ImagePicker from 'expo-image-picker';

import { IPAddress } from '../../../../ipAddress'; 

// code to run only this file through the terminal:
// npm run test ./src/screens/createIssue/__tests__/createIssue.test.js
// or
// npm run test-coverage ./src/screens/createIssue/__tests__/createIssue.test.js

// Mocking dependencies
jest.mock('axios', () => ({
    post: jest.fn().mockResolvedValue({ status: 201 }),
}));
jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn().mockResolvedValue('fake-token'),
}));
jest.mock('jwt-decode', () => jest.fn(() => ({
    email: 'user@example.com',
    street: '123 Main St'
}))); 
jest.spyOn(Alert, 'alert');
jest.mock('expo-image-picker', () => ({
    requestMediaLibraryPermissionsAsync: jest.fn().mockResolvedValue({ granted: true }),
    launchImageLibraryAsync: jest.fn().mockResolvedValue({
        canceled: false,
        assets: [{ uri: 'test-image-uri' }],
    }),
    MediaTypeOptions: {
        Images: 'Images',
    },
}));


describe('CreateIssue Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders the component correctly', () => {
        const { getByPlaceholderText, getByText } = render(<CreateIssue />);
        expect(getByPlaceholderText('Title')).toBeTruthy();
        expect(getByPlaceholderText('Professional Needed')).toBeTruthy();
        expect(getByPlaceholderText('Describe the issue...')).toBeTruthy();
        expect(getByText('Upload Image')).toBeTruthy();
        expect(getByText('Post Job')).toBeTruthy();
    });

    test('changes text input values correctly', () => {
        const { getByPlaceholderText } = render(<CreateIssue />);
        const titleInput = getByPlaceholderText('Title');
        const descriptionInput = getByPlaceholderText('Describe the issue...');
        
        fireEvent.changeText(titleInput, 'Test Issue');
        fireEvent.changeText(descriptionInput, 'This is a test description');

        expect(titleInput.props.value).toBe('Test Issue');
        expect(descriptionInput.props.value).toBe('This is a test description');
    });

    test('alerts when trying to submit without mandatory fields', async () => {
        const mockNavigation = { navigate: jest.fn() };
        const { getByTestId } = render(<CreateIssue navigation={mockNavigation} />);
    
        const postJobButton = getByTestId('post-job-button');
        fireEvent.press(postJobButton);
    
        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith(
                "Some fields are empty. Please complete everything for the professional to give you the most informed quote!"
            );
        });
    
        // Ensure no API call is made
        expect(axios.post).not.toHaveBeenCalled();
        expect(mockNavigation.navigate).not.toHaveBeenCalled();
    });

    test('posts a job successfully and navigates to HomeScreen', async () => {
        const mockNavigation = { navigate: jest.fn() };
        const { getByTestId, getByPlaceholderText } = render(<CreateIssue navigation={mockNavigation} />);
    
        // Simulating input changes
        fireEvent.changeText(getByPlaceholderText('Title'), 'Test Job Title');
        fireEvent.changeText(getByPlaceholderText('Professional Needed'), 'Electrician');
        fireEvent.changeText(getByPlaceholderText('Describe the issue...'), 'There is an issue with the lights.');
    
        const postJobButton = getByTestId('post-job-button');
        fireEvent.press(postJobButton);
    
        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith(
                `http://${IPAddress}:3000/issue/create`,
                expect.any(FormData),
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer fake-token`
                    },
                }
            );
            expect(Alert.alert).toHaveBeenCalledWith('Job posted successfully');
            expect(mockNavigation.navigate).toHaveBeenCalledWith('HomeScreen');
        });
    });

    test('displays an error when the job posting fails', async () => {
        const mockNavigation = { navigate: jest.fn() };

        // Simulating API failure
        axios.post.mockRejectedValueOnce({
            response: { data: 'Error message from the server' }
        });

        const { getByTestId, getByPlaceholderText } = render(<CreateIssue navigation={mockNavigation} />);

        fireEvent.changeText(getByPlaceholderText('Title'), 'Test Job Title');
        fireEvent.changeText(getByPlaceholderText('Professional Needed'), 'Plumber');
        fireEvent.changeText(getByPlaceholderText('Describe the issue...'), 'The sink is leaking.');

        const postJobButton = getByTestId('post-job-button');
        fireEvent.press(postJobButton);

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith(
                `http://${IPAddress}:3000/issue/create`,
                expect.any(FormData),
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer fake-token`
                    },
                }
            );
            expect(Alert.alert).toHaveBeenCalledWith('An error occurred. Please try again.');
        });

        // Ensure no navigation happens
        expect(mockNavigation.navigate).not.toHaveBeenCalled();
    });

    // npm run test-coverage ./src/screens/createIssue/__tests__/createIssue.test.js

    test('uploads an image and posts a job successfully', async () => {
        const mockNavigation = { navigate: jest.fn() };
        const { getByTestId, getByPlaceholderText, getByText } = render(<CreateIssue navigation={mockNavigation} />);

        // Simulate filling in the input fields
        fireEvent.changeText(getByPlaceholderText('Title'), 'Test Job Title');
        fireEvent.changeText(getByPlaceholderText('Professional Needed'), 'Electrician');
        fireEvent.changeText(getByPlaceholderText('Describe the issue...'), 'There is an issue with the lights.');

        // Simulate the image upload process
        const uploadButton = getByText('Upload Image');
        fireEvent.press(uploadButton);

        await waitFor(() => {
            expect(ImagePicker.requestMediaLibraryPermissionsAsync).toHaveBeenCalled();
            expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalled();
        });

        // Confirm that the image URI is set (mocked image)
        const postJobButton = getByTestId('post-job-button');
        fireEvent.press(postJobButton);

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith(
                `http://${IPAddress}:3000/issue/create`,
                expect.any(FormData),
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer fake-token`,
                    },
                }
            );
            expect(mockNavigation.navigate).toHaveBeenCalledWith('HomeScreen');
        });
    });

});