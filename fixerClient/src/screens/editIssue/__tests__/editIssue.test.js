import React, { act } from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import EditIssue from '../editIssue';
import { Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IPAddress } from '../../../../ipAddress';

// code to run only this file through the terminal:
// npm run test ./src/screens/editIssue/__tests__/editIssue.test.js
// or
// npm run test-coverage ./src/screens/editIssue/__tests__/editIssue.test.js

jest.mock('expo-image-picker', () => ({
    launchImageLibraryAsync: jest.fn(),
    launchCameraAsync: jest.fn(),
    requestMediaLibraryPermissionsAsync: jest.fn(),
}));
jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));
jest.mock('axios');
jest.spyOn(Alert, 'alert');
const navigationMock = { goBack: jest.fn() };
const routeMock = { params: { jobId: '123' } };

describe('EditIssue Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        AsyncStorage.getItem.mockResolvedValue('fake-token');
    });

    test('displays job details after fetching', async () => {
        axios.get.mockResolvedValue({
            status: 200,
            data: {
                title: 'Test Job',
                description: 'This is a test description',
                professionalNeeded: 'Plumber',
            },
        });

        const { getByText, getByPlaceholderText, queryByTestId } = render(
            <EditIssue route={routeMock} navigation={navigationMock} />
        );

        await waitFor(() => {
            // Ensure loading indicator disappears
            expect(queryByTestId('loading-indicator')).toBeNull();
        });

        // Check the Title field
        const titleInput = getByPlaceholderText('Title');
        expect(titleInput.props.value).toBe('Test Job');

        // Simulate selecting "Other" to check Issue Description
        const otherButton = getByText('Edit Job');
        fireEvent.press(otherButton);

        await waitFor(() => {
            const descriptionInput = getByPlaceholderText('Describe the issue...');
            expect(descriptionInput.props.value).toBe('This is a test description');
        });

        // Check Professional Needed selection
        const plumberButton = getByText('Plumber');
        expect(plumberButton).toBeTruthy();
    });


    test('displays error alert when fetch JobDetails fails with server error', async () => {
        // mock a failed GET request
        axios.get.mockRejectedValueOnce({ response: { data: { message: 'Server error' } } });

        render(<EditIssue route={routeMock} navigation={navigationMock} />);

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('An error occurred while loading job details');
        });
    });

    //test fails because we're not handling the exception when a client modifies a field, they can leave it blank
    test('prevents update when fields are empty and shows alert', async () => {
        // Mock successful initial fetch for job details
        axios.get.mockResolvedValueOnce({
            status: 200,
            data: { title: '', description: '', professionalNeeded: '' }, // Empty fields scenario
        });

        const { getByText, getByPlaceholderText } = render(
            <EditIssue route={routeMock} navigation={navigationMock} />
        );
        await act(async () => {}); // Wait for data load

        // Attempt to submit with empty fields
        fireEvent.press(getByText('Save Changes'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Please complete all fields for the professional to provide an accurate quote.'); // Alert for empty fields
            expect(axios.put).not.toHaveBeenCalled(); // Ensure no API call is made
        });
    });


    test('shows alert when fetch JobDetails fails without response', async () => {
        // Mock a request with no response (e.g., network issue)
        axios.get.mockRejectedValueOnce({ request: {} });

        render(<EditIssue route={routeMock} navigation={navigationMock} />);

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('An error occurred while loading job details');
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
        await act(async () => {});

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
        await act(async () => {});

        fireEvent.changeText(getByPlaceholderText('Title'), 'Updated Job Title');
        fireEvent.press(getByText('Save Changes'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('An error occurred while updating the job');
        });
    });

    test('shows alert and navigates back if token is missing', async () => {
        // mock missing token in AsyncStorage
        AsyncStorage.getItem.mockResolvedValueOnce(null);

        render(<EditIssue route={routeMock} navigation={navigationMock} />);
        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Invalid session or job ID');
            expect(navigationMock.goBack).toHaveBeenCalled();
        });
    });

    test('shows alert and navigates back if jobId is missing', async () => {
        // no jobId param
        const routeNoJobId = { params: {} };

        render(<EditIssue route={routeNoJobId} navigation={navigationMock} />);
        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Invalid session or job ID');
            expect(navigationMock.goBack).toHaveBeenCalled();
        });
    });

});