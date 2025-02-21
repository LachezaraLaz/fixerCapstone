import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import EditIssue from '../editIssue';
import { Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

jest.mock('expo-image-picker', () => ({
    requestMediaLibraryPermissionsAsync: jest.fn(() => Promise.resolve({ granted: true })),
    launchImageLibraryAsync: jest.fn(() =>
        Promise.resolve({ canceled: false, assets: [{ uri: 'test-image-uri' }] })
    ),
}));
jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn(),
}));
jest.mock('axios');
jest.spyOn(Alert, 'alert');

const mockNavigation = { goBack: jest.fn(), navigate: jest.fn() };
const route = { params: { jobId: '12345' } };

describe('EditIssue Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('fetches job details on load', async () => {
        AsyncStorage.getItem.mockResolvedValue('fake-jwt-token');
        axios.get.mockResolvedValueOnce({
            status: 200,
            data: { title: 'Test Job', description: 'A test description.', professionalNeeded: 'Plumber', image: null },
        });

        const { getByPlaceholderText, queryByTestId } = render(<EditIssue navigation={mockNavigation} route={route} />);

        // Wait for the loading indicator to disappear
        await waitFor(() => expect(queryByTestId('ActivityIndicator')).toBeNull());

        // Check if the fetched title is displayed in the input field
        expect(getByPlaceholderText('Title').props.value).toBe('Test Job');
    });

    test('updates job successfully', async () => {
        AsyncStorage.getItem.mockResolvedValue('fake-jwt-token');
        axios.put.mockResolvedValueOnce({ status: 200 });

        const { getByPlaceholderText, getByText, queryByTestId } = render(
            <EditIssue navigation={mockNavigation} route={route} />
        );

        // Wait for the loading indicator to disappear
        await waitFor(() => expect(queryByTestId('ActivityIndicator')).toBeNull());

        // Simulate selecting "Plumber" for Professional Needed
        fireEvent.press(getByText('Plumber'));

        // Simulate selecting "Other" to set `other = true`
        fireEvent.press(getByText('Other'));

        // Wait for the issue description input to appear
        await waitFor(() => expect(getByPlaceholderText('Describe the issue...')).toBeTruthy());

        // Update the inputs
        fireEvent.changeText(getByPlaceholderText('Title'), 'Updated Job Title');
        fireEvent.changeText(getByPlaceholderText('Describe the issue...'), 'Updated description');

        // Verify the inputs have updated
        expect(getByPlaceholderText('Title').props.value).toBe('Updated Job Title');
        expect(getByPlaceholderText('Describe the issue...').props.value).toBe('Updated description');

        // Trigger the save changes button
        fireEvent.press(getByText('Save Changes'));

        // Wait for axios.put to be called
        await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

        // Verify success alert and navigation
        expect(Alert.alert).toHaveBeenCalledWith('Job updated successfully');
        expect(mockNavigation.goBack).toHaveBeenCalled();
    });


    test('shows an error alert if update fails', async () => {
        AsyncStorage.getItem.mockResolvedValue('fake-jwt-token');
        axios.get.mockResolvedValueOnce({
            status: 200,
            data: { title: 'Test Job', description: 'A test description.', professionalNeeded: 'Plumber', image: null },
        });
        axios.put.mockRejectedValueOnce(new Error('Network error'));

        const { getByPlaceholderText, getByText, queryByTestId } = render(
            <EditIssue navigation={mockNavigation} route={route} />
        );

        // Wait for the loading indicator to disappear
        await waitFor(() => expect(queryByTestId('ActivityIndicator')).toBeNull());

        // Update the inputs
        fireEvent.changeText(getByPlaceholderText('Title'), 'Updated Job Title');
        fireEvent.press(getByText('Plumber'));
        fireEvent.press(getByText('Other'));
        fireEvent.changeText(getByPlaceholderText('Describe the issue...'), 'Updated description');

        // Trigger the save changes button
        fireEvent.press(getByText('Save Changes'));

        // Wait for the axios.put call and the error alert
        await waitFor(() => expect(Alert.alert).toHaveBeenCalledWith('An error occurred while updating the job'));
    });
    
    test('alerts and goes back if token or jobId is missing during fetch', async () => {
        // jobId is provided in route.params, so let's either remove it or simulate missing token
        const noTokenRoute = { params: { jobId: '12345' } };
        AsyncStorage.getItem.mockResolvedValue(null); // No token returned

        render(<EditIssue navigation={mockNavigation} route={noTokenRoute} />);

        await waitFor(() => {
            // Should show alert and goBack
            expect(Alert.alert).toHaveBeenCalledWith('Invalid session or job ID');
            expect(mockNavigation.goBack).toHaveBeenCalled();
        });
    });
    
    test('alerts if job details fail to load with non-200 status', async () => {
        AsyncStorage.getItem.mockResolvedValue('fake-jwt-token');
        axios.get.mockResolvedValueOnce({
            status: 404, // Non-200
        });

        render(<EditIssue navigation={mockNavigation} route={route} />);

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Failed to load job details');
        });
    });

    test('alerts if an error occurs while fetching job details', async () => {
        AsyncStorage.getItem.mockResolvedValue('fake-jwt-token');
        axios.get.mockRejectedValueOnce(new Error('Network error'));

        render(<EditIssue navigation={mockNavigation} route={route} />);

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('An error occurred while loading job details');
        });
    });
    
    test('alerts if media library permission is not granted in pickImage', async () => {
        // Override the default mock for this scenario
        ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValueOnce({
            granted: false,
        });

        const { getByText, queryByTestId } = render(
            <EditIssue navigation={mockNavigation} route={route} />
        );

        // Wait for initial fetch to finish
        await waitFor(() => expect(queryByTestId('ActivityIndicator')).toBeNull());

        // Press the "Upload Image" button
        fireEvent.press(getByText('Upload Image'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Permission to access images is required!');
        });
    });
    
    test('alerts if fields are missing on update', async () => {
        // We do have a token, so it will pass the token check
        AsyncStorage.getItem.mockResolvedValue('fake-jwt-token');
        axios.get.mockResolvedValueOnce({ status: 200, data: { title: '', description: '', professionalNeeded: '', image: null } });

        const { getByText, queryByTestId } = render(
            <EditIssue navigation={mockNavigation} route={route} />
        );

        // Wait for initial fetch
        await waitFor(() => expect(queryByTestId('ActivityIndicator')).toBeNull());

        // Now press "Save Changes" without filling required fields
        fireEvent.press(getByText('Save Changes'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith(
                'Please complete all fields for the professional to provide an accurate quote.'
            );
        });
    });
    
    test('alerts if token is missing on update', async () => {
        // This time for fetch we have a token => but after fetch we reset
        AsyncStorage.getItem.mockResolvedValueOnce('fake-jwt-token'); // For fetch
        axios.get.mockResolvedValueOnce({ status: 200, data: { title: 'T', description: 'D', professionalNeeded: 'plumber', image: null } });

        // But for update, we want no token => second call to getItem => null
        AsyncStorage.getItem.mockResolvedValueOnce(null);

        const { getByText, queryByTestId } = render(
            <EditIssue navigation={mockNavigation} route={route} />
        );
        await waitFor(() => expect(queryByTestId('ActivityIndicator')).toBeNull());

        // We already have minimal fields from the fetch mock
        fireEvent.press(getByText('Save Changes'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('You are not logged in');
        });
    });

    test('renders electrician issue options when professionalNeeded is electrician', async () => {
        AsyncStorage.getItem.mockResolvedValue('fake-jwt-token');

        // Force the fetch to respond with electrician
        axios.get.mockResolvedValueOnce({
            status: 200,
            data: {
                title: 'Electric Issue',
                description: 'Dead Outlets',
                professionalNeeded: 'electrician',
                image: null,
            },
        });

        const { getByText, queryByText } = render(
            <EditIssue navigation={mockNavigation} route={route} />
        );

        // Wait for the spinner to go away
        await waitFor(() => {
            // We expect electrician's typical issues to show
            expect(queryByText('Flickering Lights')).toBeTruthy();
            expect(queryByText('Dead Outlets')).toBeTruthy();
            expect(queryByText('Faulty Switch')).toBeTruthy();
            // 'Other' is also shown
            expect(queryByText('Other')).toBeTruthy();
        });
    });
    
    test('alerts if server returns non-200 on update', async () => {
        AsyncStorage.getItem.mockResolvedValue('fake-jwt-token');
        axios.get.mockResolvedValueOnce({
            status: 200,
            data: {
                title: 'Test Job',
                description: 'Clogged Drains',
                professionalNeeded: 'plumber',
                image: null,
            },
        });

        axios.put.mockResolvedValueOnce({ status: 400 }); // Non-200

        const { getByText, queryByTestId } = render(
            <EditIssue navigation={mockNavigation} route={route} />
        );

        await waitFor(() => expect(queryByTestId('ActivityIndicator')).toBeNull());

        fireEvent.press(getByText('Save Changes'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Failed to update job');
        });
    });

    test('alerts with error.response.data.message if server responded with error', async () => {
        AsyncStorage.getItem.mockResolvedValue('fake-jwt-token');
        axios.get.mockResolvedValueOnce({
            status: 200,
            data: { title: 'T', description: 'D', professionalNeeded: 'p', image: null },
        });

        axios.put.mockRejectedValueOnce({
            response: {
                data: { message: 'Server custom error' },
            },
        });

        const { getByText, queryByTestId } = render(
            <EditIssue navigation={mockNavigation} route={route} />
        );
        await waitFor(() => expect(queryByTestId('ActivityIndicator')).toBeNull());

        fireEvent.press(getByText('Save Changes'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Error: Server custom error');
        });
    });
    
    test('alerts about no response if error.request is present', async () => {
        AsyncStorage.getItem.mockResolvedValue('fake-jwt-token');
        axios.get.mockResolvedValueOnce({
            status: 200,
            data: { title: 'T', description: 'D', professionalNeeded: 'p', image: null },
        });

        axios.put.mockRejectedValueOnce({ request: {} }); // No response, only request

        const { getByText, queryByTestId } = render(
            <EditIssue navigation={mockNavigation} route={route} />
        );
        await waitFor(() => expect(queryByTestId('ActivityIndicator')).toBeNull());

        fireEvent.press(getByText('Save Changes'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('No response from server. Please try again later.');
        });
    });

    test('alerts a generic error if neither response nor request exist', async () => {
        AsyncStorage.getItem.mockResolvedValue('fake-jwt-token');
        axios.get.mockResolvedValueOnce({
            status: 200,
            data: { title: 'T', description: 'D', professionalNeeded: 'p', image: null },
        });

        axios.put.mockRejectedValueOnce(new Error('Unknown error'));

        const { getByText, queryByTestId } = render(
            <EditIssue navigation={mockNavigation} route={route} />
        );
        await waitFor(() => expect(queryByTestId('ActivityIndicator')).toBeNull());

        fireEvent.press(getByText('Save Changes'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('An error occurred while updating the job');
        });
    });
});
