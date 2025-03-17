import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import CreateIssue from '../createIssue';
import { Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwtDecode from 'jwt-decode';
import * as ImagePicker from 'expo-image-picker';

jest.mock('expo-image-picker', () => ({
    MediaTypeOptions: {
        Images: 'Images',
    },
    requestMediaLibraryPermissionsAsync: jest.fn(() => Promise.resolve({ granted: true })),
    launchImageLibraryAsync: jest.fn(() =>
        Promise.resolve({
            canceled: false,
            assets: [{ uri: 'test-image-uri' }],
        })
    ),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn(),
}));
jest.mock('jwt-decode', () => jest.fn());
jest.mock('axios');
jest.spyOn(Alert, 'alert').mockImplementation(() => {});

describe('CreateIssue Component', () => {
    let mockNavigation;
    beforeEach(() => {
        jest.clearAllMocks();

        mockNavigation = { goBack: jest.fn() };
        AsyncStorage.getItem.mockResolvedValue('fake-jwt-token');
        jwtDecode.mockReturnValue({ email: 'user@example.com' });

        // Default ImagePicker mocks
        ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({ granted: true });
        ImagePicker.launchImageLibraryAsync.mockResolvedValue({
            canceled: false,
            assets: [{ uri: 'test-image-uri' }],
        });
    });

    const setup = () => {
        return render(<CreateIssue navigation={mockNavigation} />);
    };

    test('displays an alert if fields are empty', async () => {
        const { getByTestId } = render(<CreateIssue />);
        const postButton = getByTestId('post-job-button');

        fireEvent.press(postButton);

        expect(Alert.alert).toHaveBeenCalledWith(
            "Some fields are empty. Please complete everything for the professional to give you the most informed quote!"
        );
    });

    test('shows an alert if description is too short', async () => {
        const { getByPlaceholderText, getByTestId } = setup();

        fireEvent.changeText(getByPlaceholderText('Describe your service'), 'Too short');
        fireEvent.press(getByTestId('post-job-button'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith(
                'Invalid Description',
                'Some fields are empty. Please complete everything for the professional to give you the most informed quote!'
            );
        });
    });

    test('shows an alert if location is too short', async () => {
        const { getByPlaceholderText, getByTestId } = setup();

        fireEvent.changeText(getByPlaceholderText('Describe your service'), 'Valid Description');
        fireEvent.changeText(getByPlaceholderText('Enter Location'), '123');
        fireEvent.press(getByTestId('post-job-button'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith(
                'Invalid Location',
                'Please provide a valid location with at least 5 characters.'
            );
        });
    });

    test('shows an alert if timeline is not selected', async () => {
        const { getByPlaceholderText, getByTestId } = setup();

        fireEvent.changeText(getByPlaceholderText('Describe your service'), 'Valid Description');
        fireEvent.changeText(getByPlaceholderText('Enter Location'), 'Valid Location');
        fireEvent.press(getByTestId('post-job-button'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith(
                'Invalid Timeline',
                'Please select an urgency timeline.'
            );
        });
    });

    test('shows an alert for unsupported image formats', async () => {
        ImagePicker.launchImageLibraryAsync.mockResolvedValueOnce({
            canceled: false,
            assets: [{ uri: 'invalid-image.bmp' }], // Unsupported format
        });

        const { getByText } = setup();

        fireEvent.press(getByText('Take from your gallery'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith(
                'Invalid Image',
                'Only JPEG and PNG images are supported.'
            );
        });
    });

    test('posts an issue successfully', async () => {
        // Mock necessary dependencies
        AsyncStorage.getItem.mockResolvedValue('fake-jwt-token');
        jwtDecode.mockReturnValue({ email: 'user@example.com' });
        axios.post.mockResolvedValueOnce({ status: 201 });

        // Render the CreateIssue component
        const { getByPlaceholderText, getByText, getByTestId } = render(<CreateIssue />);

        // Fill the title input
        fireEvent.changeText(getByPlaceholderText('Title'), 'Test Issue');

        // Select "Plumber" for Professional Needed
        fireEvent.press(getByText('Plumber'));

        // Select "Other" to enable the "Describe the issue..." input
        fireEvent.press(getByText('Other'));

        // Wait for the "Describe the issue..." input to appear
        await waitFor(() => expect(getByPlaceholderText('Describe the issue...')).toBeTruthy());

        // Fill the description input
        fireEvent.changeText(getByPlaceholderText('Describe the issue...'), 'A test issue description.');

        // Press the "Post Job" button
        fireEvent.press(getByTestId('post-job-button'));

        // Wait for the axios.post call
        await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

        // Verify success alert
        expect(Alert.alert).toHaveBeenCalledWith('Job posted successfully');
    });

    test('renders and allows input for "Describe the issue..."', async () => {
        // Mock necessary dependencies
        AsyncStorage.getItem.mockResolvedValue('fake-jwt-token');
        jwtDecode.mockReturnValue({ email: 'user@example.com' });

        const { getByPlaceholderText, getByText } = render(<CreateIssue />);

        // Fill the title input
        fireEvent.changeText(getByPlaceholderText('Title'), 'Test Issue');

        // Select "Plumber" for Professional Needed
        fireEvent.press(getByText('Plumber'));

        // Select "Other" to enable the "Describe the issue..." input
        fireEvent.press(getByText('Other'));

        // Wait for the "Describe the issue..." input to appear
        await waitFor(() => expect(getByPlaceholderText('Describe the issue...')).toBeTruthy());

        // Fill the description input
        fireEvent.changeText(getByPlaceholderText('Describe the issue...'), 'Test description');

        // Assert the input value
        expect(getByPlaceholderText('Describe the issue...').props.value).toBe('Test description');
    });


    test('shows an error alert if post fails', async () => {
        AsyncStorage.getItem.mockResolvedValue('fake-jwt-token');
        jwtDecode.mockReturnValue({ email: 'user@example.com' });
        axios.post.mockRejectedValueOnce(new Error('Network error'));

        const { getByPlaceholderText, getByText, getByTestId } = render(<CreateIssue />);

        // Fill the title field
        fireEvent.changeText(getByPlaceholderText('Title'), 'Test Issue');

        // Select "Plumber" for Professional Needed
        fireEvent.press(getByText('Plumber'));

        // Select "Other" to enable the description input
        fireEvent.press(getByText('Other'));

        // Wait for the "Describe the issue..." input to appear
        await waitFor(() => expect(getByPlaceholderText('Describe the issue...')).toBeTruthy());

        // Fill the description field
        fireEvent.changeText(getByPlaceholderText('Describe the issue...'), 'Test description');

        // Trigger the "Post Job" button
        fireEvent.press(getByTestId('post-job-button'));

        // Wait for the error alert to appear
        await waitFor(() =>
            expect(Alert.alert).toHaveBeenCalledWith('An error occurred. Please try again.')
        );
    });

    test('shows alert if the user denies media library permissions', async () => {
        // Force permission to be denied
        ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValueOnce({ granted: false });

        const { getByText } = setup();

        fireEvent.press(getByText('Upload Image'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Permission to access images is required!');
        });

        // Make sure we never call launchImageLibraryAsync
        expect(ImagePicker.launchImageLibraryAsync).not.toHaveBeenCalled();
    });

    test('does not set image if user cancels image picker', async () => {
        ImagePicker.launchImageLibraryAsync.mockResolvedValueOnce({
            canceled: true, // user canceled
        });

        const { getByText } = setup();

        fireEvent.press(getByText('Upload Image'));

        await waitFor(() => {
            // Should not show any error or set the image.
            expect(Alert.alert).not.toHaveBeenCalled();
        });
    });

    test('renders and allows input for "Describe the issue..."', async () => {
        const { getByPlaceholderText, getByText } = setup();

        fireEvent.changeText(getByPlaceholderText('Title'), 'Test Issue');

        // Fill in fields
        fireEvent.press(getByText('Plumber'));
        fireEvent.press(getByText('Other'));
        await waitFor(() => expect(getByPlaceholderText('Describe the issue...')).toBeTruthy());

        fireEvent.changeText(getByPlaceholderText('Describe the issue...'), 'Test description');
        expect(getByPlaceholderText('Describe the issue...').props.value).toBe('Test description');
    });

    test('shows an error alert if post fails', async () => {
        axios.post.mockRejectedValueOnce(new Error('Network error'));

        const { getByPlaceholderText, getByText, getByTestId } = setup();

        fireEvent.changeText(getByPlaceholderText('Title'), 'Test Issue');
        fireEvent.press(getByText('Plumber'));
        fireEvent.press(getByText('Other'));
        await waitFor(() => expect(getByPlaceholderText('Describe the issue...')).toBeTruthy());

        fireEvent.changeText(getByPlaceholderText('Describe the issue...'), 'Test description');
        fireEvent.press(getByTestId('post-job-button'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('An error occurred. Please try again.');
        });
    });

    test('handles no token scenario (jwtDecode throws), hitting the catch block', async () => {
        // Force no token found
        AsyncStorage.getItem.mockResolvedValueOnce(null);

        const { getByPlaceholderText, getByText, getByTestId } = setup();

        fireEvent.changeText(getByPlaceholderText('Title'), 'Test Issue');
        fireEvent.press(getByText('Plumber'));
        fireEvent.press(getByText('Other'));

        await waitFor(() => expect(getByPlaceholderText('Describe the issue...')).toBeTruthy());
        fireEvent.changeText(getByPlaceholderText('Describe the issue...'), 'Some description');

        fireEvent.press(getByTestId('post-job-button'));

        await waitFor(() => {
            // We expect "An error occurred. Please try again." from catch block
            expect(Alert.alert).toHaveBeenCalledWith('An error occurred. Please try again.');
        });
    });

    describe('Coverage for sub-issue onPress handlers', () => {
        let mockNavigation;

        beforeEach(() => {
            jest.clearAllMocks();
            mockNavigation = { goBack: jest.fn() };
        });

        function setup() {
            // Provide any default props, token, etc. you might need
            return render(<CreateIssue navigation={mockNavigation} />);
        }

        test('selects "Electrician" and sub-issues: Flickering Lights, Dead Outlets, Faulty Switch, Other', async () => {
            const { getByText, queryByPlaceholderText } = setup();

            // Press to set professionalNeeded='electrician'
            fireEvent.press(getByText('Electrician'));

            // Press Flickering Lights
            fireEvent.press(getByText('Flickering Lights'));
            // Press Dead Outlets
            fireEvent.press(getByText('Dead Outlets'));
            // Press Faulty Switch
            fireEvent.press(getByText('Faulty Switch'));

            // Finally press "Other" (which sets other=true & clears description)
            fireEvent.press(getByText('Other'));

            await waitFor(() =>
                expect(queryByPlaceholderText('Describe the issue...')).toBeTruthy()
            );
        });

        test('selects "Plumber" and sub-issues: Dripping Faucets, Clogged Drains, Leaky Pipes', () => {
            const { getByText } = setup();

            // Press to set professionalNeeded='plumber'
            fireEvent.press(getByText('Plumber'));

            fireEvent.press(getByText('Dripping Faucets'));
            fireEvent.press(getByText('Clogged Drains'));
            fireEvent.press(getByText('Leaky Pipes'));
        });
    });
});
