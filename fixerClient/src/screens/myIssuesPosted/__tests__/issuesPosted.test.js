import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import MyIssuesPosted from '../myIssuesPosted'; // Adjust the import path as necessary
import { Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwtDecode from 'jwt-decode'; // Import for mocking
// import * as ImagePicker from 'expo-image-picker';

import { IPAddress } from '../../../../ipAddress'; 

// code to run only this file through the terminal:
// npm run test ./src/screens/myIssuesPosted/__tests__/issuesPosted.test.js
// or
// npm run test-coverage ./src/screens/myIssuesPosted/__tests__/issuesPosted.test.js

// Mocking dependencies
jest.mock('axios', () => ({
    get: jest.fn(),
    delete: jest.fn(),
}));
jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn(),
}));
jest.mock('jwt-decode', () => jest.fn(() => ({
    email: 'user@example.com',
})));
jest.spyOn(Alert, 'alert');

describe('MyIssuesPosted Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('displays a loading spinner while fetching data', async () => {
        AsyncStorage.getItem.mockResolvedValue('fake-jwt-token');
        axios.get.mockResolvedValueOnce({ status: 200, data: { jobs: [] } });

        const { getByTestId } = render(<MyIssuesPosted />);
        expect(getByTestId('ActivityIndicator')).toBeTruthy();

        await waitFor(() => expect(axios.get).toHaveBeenCalled());
    });

    test('displays jobs after fetching data', async () => {
        const mockJobs = [
            {
                _id: '1',
                title: 'Fix Light Bulb',
                status: 'open',
                professionalNeeded: 'Electrician',
                description: 'The living room light needs to be fixed.',
                imageUrl: 'http://example.com/image.jpg',
            },
        ];

        AsyncStorage.getItem.mockResolvedValue('fake-jwt-token');
        axios.get.mockResolvedValueOnce({ status: 200, data: { jobs: mockJobs } });

        const { getByText } = render(<MyIssuesPosted />);

        await waitFor(() => {
            expect(getByText('Fix Light Bulb')).toBeTruthy();
            expect(getByText('open')).toBeTruthy();
            expect(getByText('The living room light needs to be fixed.')).toBeTruthy();
            // expect(getByAltText('image')).toBeTruthy();
        });
    });

    test('displays an alert when there are no jobs posted', async () => {
        AsyncStorage.getItem.mockResolvedValue('fake-jwt-token');
        axios.get.mockResolvedValueOnce({ status: 200, data: { jobs: [] } });

        const { getByText } = render(<MyIssuesPosted />);

        await waitFor(() => {
            expect(getByText('No jobs posted yet.')).toBeTruthy();
        });
    });

    test('displays an alert when a job is deleted successfully', async () => {
        const mockJobs = [
            {
                _id: '1',
                title: 'Fix Light Bulb',
                status: 'open',
                professionalNeeded: 'Electrician',
                description: 'The living room light needs to be fixed.',
            },
        ];

        AsyncStorage.getItem.mockResolvedValue('fake-jwt-token');
        axios.get.mockResolvedValueOnce({ status: 200, data: { jobs: mockJobs } });
        axios.delete.mockResolvedValueOnce({ status: 200 });

        const { getByText } = render(<MyIssuesPosted />);
        await waitFor(() => expect(getByText('Fix Light Bulb')).toBeTruthy());

        const deleteButton = getByText('Delete Job');
        fireEvent.press(deleteButton);

        await waitFor(() => {
            expect(axios.delete).toHaveBeenCalledWith(`http://${IPAddress}:3000/issue/1`, {
                headers: {
                    'Authorization': 'Bearer fake-jwt-token',
                },
            });
            expect(Alert.alert).toHaveBeenCalledWith('Job deleted successfully');
        });
    });

    test('displays an error alert when fetching jobs fails', async () => {
        AsyncStorage.getItem.mockResolvedValue('fake-jwt-token');
        axios.get.mockRejectedValueOnce(new Error('Network error'));

        const { getByText } = render(<MyIssuesPosted />);

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('An error occurred while fetching jobs');
            expect(getByText('No jobs posted yet.')).toBeTruthy(); // Ensures the fallback message shows up if data fetch fails
        });
    });

    test('displays an error alert when deleting a job fails', async () => {
        const mockJobs = [
            {
                _id: '1',
                title: 'Fix Light Bulb',
                status: 'open',
                professionalNeeded: 'Electrician',
                description: 'The living room light needs to be fixed.',
            },
        ];

        AsyncStorage.getItem.mockResolvedValue('fake-jwt-token');
        axios.get.mockResolvedValueOnce({ status: 200, data: { jobs: mockJobs } });
        axios.delete.mockRejectedValueOnce(new Error('Network error'));

        const { getByText } = render(<MyIssuesPosted />);
        await waitFor(() => expect(getByText('Fix Light Bulb')).toBeTruthy());

        const deleteButton = getByText('Delete Job');
        fireEvent.press(deleteButton);

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('An error occurred while deleting the job');
        });
    });

    test('displays an alert when jobs fail to load with a non-200 response', async () => {
        AsyncStorage.getItem.mockResolvedValue('fake-jwt-token');
        axios.get.mockResolvedValueOnce({ status: 500, data: {} }); // Mock a non-200 response
    
        const { getByText } = render(<MyIssuesPosted />);
    
        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Failed to load jobs');
        });
    
        // Ensure that the fallback message is shown if jobs failed to load
        expect(getByText('No jobs posted yet.')).toBeTruthy();
    });

});
