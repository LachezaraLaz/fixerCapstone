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

        const { getByPlaceholderText } = render(<EditIssue navigation={mockNavigation} route={route} />);

        await waitFor(() => expect(getByPlaceholderText('Title').props.value).toBe('Test Job'));
    });

    test('updates job successfully', async () => {
        AsyncStorage.getItem.mockResolvedValue('fake-jwt-token');
        axios.put.mockResolvedValueOnce({ status: 200 });

        const { getByPlaceholderText, getByText } = render(<EditIssue navigation={mockNavigation} route={route} />);
        fireEvent.changeText(getByPlaceholderText('Title'), 'Updated Job Title');
        fireEvent.press(getByText('Save Changes'));

        await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));
        expect(Alert.alert).toHaveBeenCalledWith('Job updated successfully');
        expect(mockNavigation.goBack).toHaveBeenCalled();
    });

    test('shows an error alert if update fails', async () => {
        AsyncStorage.getItem.mockResolvedValue('fake-jwt-token');
        axios.put.mockRejectedValueOnce(new Error('Network error'));

        const { getByText } = render(<EditIssue navigation={mockNavigation} route={route} />);
        fireEvent.press(getByText('Save Changes'));

        await waitFor(() => expect(Alert.alert).toHaveBeenCalledWith('An error occurred while updating the job'));
    });
});
