import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import EditIssue from '../editIssue';
import { Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
        axios.put.mockRejectedValueOnce(new Error('Network error'));

        const { getByText, queryByTestId } = render(<EditIssue navigation={mockNavigation} route={route} />);

        // Wait for the loading indicator to disappear
        await waitFor(() => expect(queryByTestId('ActivityIndicator')).toBeNull());

        // Attempt to save changes
        fireEvent.press(getByText('Save Changes'));

        // Verify the error alert
        await waitFor(() =>
            expect(Alert.alert).toHaveBeenCalledWith('An error occurred while updating the job')
        );
    });
});
