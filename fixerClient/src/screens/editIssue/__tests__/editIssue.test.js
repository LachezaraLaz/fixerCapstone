import React, {act} from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import EditIssue from '../editIssue'; // Adjust the import path as necessary
import { Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { IPAddress } from '../../../../ipAddress';

// code to run only this file through the terminal:
// npm run test ./src/screens/editIssue/__tests__/editIssue.test.js
// or
// npm run test-coverage ./src/screens/editIssue/__tests__/editIssue.test.js
jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));
jest.mock('axios');
jest.spyOn(Alert, 'alert');

// Define reusable mocks
const navigationMock = { goBack: jest.fn() };
const routeMock = { params: { jobId: '123' } };

describe('EditIssue Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        AsyncStorage.getItem.mockResolvedValue('fake-token'); // Default mock for token
    });

    test('displays job details after fetching', async () => {
        axios.get.mockResolvedValue({
            status: 200,
            data: { title: 'Test Job', description: 'This is a test description', professionalNeeded: 'Plumber' },
        });

        const { getByPlaceholderText, queryByTestId } = render(
            <EditIssue route={routeMock} navigation={navigationMock} />
        );

        await waitFor(() => {
            expect(queryByTestId('loading-indicator')).toBeNull();
            expect(getByPlaceholderText('Title').props.value).toBe('Test Job');
            expect(getByPlaceholderText('Description').props.value).toBe('This is a test description');
            expect(getByPlaceholderText('Professional Needed').props.value).toBe('Plumber');
        });
    });

    test('displays error alert when fetchJobDetails fails with server error', async () => {
        axios.get.mockRejectedValueOnce({ response: { data: { message: 'Server error' } } });

        render(<EditIssue route={routeMock} navigation={navigationMock} />);

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Error: Server error');
        });
    });

    test('successfully updates job and shows success alert', async () => {
        axios.get.mockResolvedValueOnce({
            status: 200,
            data: { title: 'Test Job', description: 'Initial description', professionalNeeded: 'Electrician' },
        });
        axios.put.mockResolvedValueOnce({ status: 200 });

        const { getByText, getByPlaceholderText } = render(
            <EditIssue route={routeMock} navigation={navigationMock} />
        );

        await act(async () => {}); // Wait for initial data to load

        fireEvent.changeText(getByPlaceholderText('Title'), 'Updated Job Title');
        fireEvent.changeText(getByPlaceholderText('Description'), 'Updated Job Description');
        fireEvent.changeText(getByPlaceholderText('Professional Needed'), 'Updated Professional');
        fireEvent.press(getByText('Save Changes'));

        await waitFor(() => {
            expect(axios.put).toHaveBeenCalledWith(
                `http://${IPAddress}:3000/issue/123`,
                {
                    title: 'Updated Job Title',
                    description: 'Updated Job Description',
                    professionalNeeded: 'Updated Professional',
                },
                expect.any(Object)
            );
            expect(Alert.alert).toHaveBeenCalledWith('Job updated successfully');
        });
    });

    test('displays error alert if updateJob fails with no response', async () => {
        axios.get.mockResolvedValueOnce({
            status: 200,
            data: { title: 'Test Job', description: 'Initial description', professionalNeeded: 'Electrician' },
        });
        axios.put.mockRejectedValueOnce({ request: {} });

        const { getByText, getByPlaceholderText } = render(
            <EditIssue route={routeMock} navigation={navigationMock} />
        );

        await act(async () => {}); // Wait for initial data to load

        fireEvent.changeText(getByPlaceholderText('Title'), 'Updated Job Title');
        fireEvent.press(getByText('Save Changes'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('No response from server. Please try again later.');
        });
    });

    test('displays generic error alert if updateJob throws unknown error', async () => {
        axios.get.mockResolvedValueOnce({
            status: 200,
            data: { title: 'Test Job', description: 'Initial description', professionalNeeded: 'Electrician' },
        });
        axios.put.mockRejectedValueOnce(new Error('Unknown error'));

        const { getByText, getByPlaceholderText } = render(
            <EditIssue route={routeMock} navigation={navigationMock} />
        );

        await act(async () => {}); // Wait for initial data to load

        fireEvent.changeText(getByPlaceholderText('Title'), 'Updated Job Title');
        fireEvent.press(getByText('Save Changes'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('An error occurred while updating the job');
        });
    });

    test('shows alert and navigates back if token is missing', async () => {
        AsyncStorage.getItem.mockResolvedValueOnce(null);

        render(<EditIssue route={routeMock} navigation={navigationMock} />);

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('You are not logged in');
            expect(navigationMock.goBack).toHaveBeenCalled();
        });
    });

    test('shows alert and navigates back if jobId is missing', async () => {
        const routeNoJobId = { params: {} };

        render(<EditIssue route={routeNoJobId} navigation={navigationMock} />);

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Invalid job ID');
            expect(navigationMock.goBack).toHaveBeenCalled();
        });
    });
});