import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import MyJobsProfessional from '../myJobs'; // Update with the correct path
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

// code to run only this file through the terminal:
// npm run test ./src/screens/myJobs/__tests__/myJobs.test.js
// or
// npm run test-coverage ./src/screens/myJobs/__tests__/myJobs.test.js

jest.mock('axios');
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
}));

jest.spyOn(Alert, 'alert');

describe('MyJobsProfessional Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders loading indicator while fetching jobs', () => {
        const { getByTestId } = render(<MyJobsProfessional />);

        expect(getByTestId('loading-indicator')).toBeTruthy();
    });

    test('fetches and displays jobs successfully', async () => {
        AsyncStorage.getItem.mockResolvedValueOnce('mock-token');
        axios.get.mockResolvedValueOnce({
        data: {
            active: [
            { title: 'Active Job 1', description: 'Job description 1', price: 100 },
            ],
            pending: [
            { title: 'Pending Job 1', description: 'Job description 2', price: 200 },
            ],
            done: [
            { title: 'Done Job 1', description: 'Job description 3', price: 300 },
            ],
        },
        });

        const { getByText } = render(<MyJobsProfessional />);

        await waitFor(() => {
        expect(getByText('Active Job 1')).toBeTruthy();
        expect(getByText('Job description 1')).toBeTruthy();
        expect(getByText('Price: $100')).toBeTruthy();
        });
    });

    test('shows error alert if no token is found', async () => {
        AsyncStorage.getItem.mockResolvedValueOnce(null);

        const { getByTestId } = render(<MyJobsProfessional />);

        await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Error', 'User token not found.');
        });
    });

    test('shows error alert if job fetch fails', async () => {
        AsyncStorage.getItem.mockResolvedValueOnce('mock-token');
        axios.get.mockRejectedValueOnce(new Error('Network error'));

        const { getByTestId } = render(<MyJobsProfessional />);

        await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Error', 'Could not fetch jobs.');
        });
    });

    test('renders jobs for the selected tab', async () => {
        AsyncStorage.getItem.mockResolvedValueOnce('mock-token');
        axios.get.mockResolvedValueOnce({
        data: {
            active: [
            { title: 'Active Job 1', description: 'Job description 1', price: 100 },
            ],
            pending: [
            { title: 'Pending Job 1', description: 'Job description 2', price: 200 },
            ],
            done: [
            { title: 'Done Job 1', description: 'Job description 3', price: 300 },
            ],
        },
        });

        const { getByText } = render(<MyJobsProfessional />);

        await waitFor(() => {
        expect(getByText('Active Job 1')).toBeTruthy();
        });

        const pendingTab = getByText('Pending');
        fireEvent.press(pendingTab);

        await waitFor(() => {
        expect(getByText('Pending Job 1')).toBeTruthy();
        expect(getByText('Job description 2')).toBeTruthy();
        expect(getByText('Price: $200')).toBeTruthy();
        });

        const doneTab = getByText('Done');
        fireEvent.press(doneTab);

        await waitFor(() => {
        expect(getByText('Done Job 1')).toBeTruthy();
        expect(getByText('Job description 3')).toBeTruthy();
        expect(getByText('Price: $300')).toBeTruthy();
        });
    });
});

