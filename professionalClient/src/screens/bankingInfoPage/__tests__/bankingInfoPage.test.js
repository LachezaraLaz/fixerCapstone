import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import BankingInfoPage from '../bankingInfoPage';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, InteractionManager } from 'react-native';
import { CardField, useStripe } from '@stripe/stripe-react-native';


// code to run only this file through the terminal:
// npm run test ./src/screens/bankingInfoPage/__tests__/bankingInfoPage.test.js
// or
// npm run test-coverage ./src/screens/bankingInfoPage/__tests__/bankingInfoPage.test.js

// Mock dependencies
// At the top of your test file, outside any describe blocks
const mockGoBack = jest.fn();
jest.mock('axios');
jest.mock('@react-native-async-storage/async-storage');
jest.mock('@stripe/stripe-react-native', () => ({
    CardField: jest.fn(() => null),
    useStripe: jest.fn(() => ({
        createPaymentMethod: jest.fn(),
    })),
}));

//async storage
jest.mock('@react-native-async-storage/async-storage', () => ({
    __esModule: true,
    default: {
        setItem: jest.fn(),
        getItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
    },
}));

jest.mock('@react-navigation/native', () => {
    return {
        useNavigation: () => ({
            goBack: mockGoBack,  // Use the variable defined above
            reset: jest.fn(),
            getState: jest.fn(() => ({ routes: [], index: 0 })),
        }),
        CommonActions: {
            reset: jest.fn(),
        },
    };
});

jest.mock('react-native/Libraries/Interaction/InteractionManager', () => ({
    runAfterInteractions: jest.fn((callback) => callback()),
}));

jest.mock('react-native/Libraries/Alert/Alert', () => ({
    alert: jest.fn(),
}));

// Mock Ionicons
jest.mock('react-native-vector-icons/Ionicons', () => 'Ionicons');

// Mock custom components
jest.mock('../../../../components/orangeButton', () => {
    return ({ title, onPress, testID, disabled }) => (
        <button
            testID={testID}
            onClick={onPress}
            disabled={disabled}
            data-title={title}
        >
            {title}
        </button>
    );
});

describe('BankingInfoPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        // Setup default AsyncStorage mock
        AsyncStorage.getItem.mockImplementation((key) => {
            if (key === 'userId') return Promise.resolve('test-user-id');
            if (key === 'token') return Promise.resolve('test-token');
            return Promise.resolve(null);
        });

        // Setup default useStripe mock
        useStripe().createPaymentMethod.mockResolvedValue({
            paymentMethod: { id: 'pm_test123' },
            error: null,
        });

        // Setup default axios mock
        axios.post.mockResolvedValue({
            data: { status: 'success' }
        });

        // Mock setTimeout
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test('renders correctly', () => {
        const { getByText, getByTestId } = render(<BankingInfoPage />);

        expect(getByText('Banking Information')).toBeTruthy();
        expect(getByText('Please enter your credit card details to enable payments.')).toBeTruthy();
        expect(getByTestId('submit-button')).toBeTruthy();
    });

    test('back button navigates back', () => {
        const { getByTestId } = render(<BankingInfoPage />);

        // Clear previous calls to the mock function
        mockGoBack.mockClear();

        // Click the back button
        const backButton = getByTestId('back-button');
        fireEvent.press(backButton);

        // Check if the goBack function was called
        expect(mockGoBack).toHaveBeenCalled();
    });


    test('handles successful payment submission', async () => {
        // Setup mocks for successful scenario
        const createPaymentMethodMock = jest.fn().mockResolvedValue({
            paymentMethod: { id: 'pm_test123' },
            error: null
        });

        useStripe.mockReturnValue({
            createPaymentMethod: createPaymentMethodMock
        });

        axios.post.mockResolvedValue({
            data: { status: 'success' }
        });

        jest.spyOn(Alert, 'alert');

        const { getByTestId } = render(<BankingInfoPage />);

        // Click submit button
        const submitButton = getByTestId('submit-button');
        fireEvent.press(submitButton);

        // Wait for createPaymentMethod to be called
        await waitFor(() => {
            expect(createPaymentMethodMock).toHaveBeenCalledWith({
                paymentMethodType: 'Card'
            });
        });

        // Fast-forward timers to execute setTimeout
        act(() => {
            jest.advanceTimersByTime(1000);
        });

        // Wait for API call
        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith(
                'https://fixercapstone-production.up.railway.app/professional/add-banking-info',
                { professionalId: 'test-user-id', paymentMethodId: 'pm_test123' },
                { headers: { Authorization: 'Bearer test-token' } }
            );
        });

        // Verify success alert was shown
        expect(Alert.alert).toHaveBeenCalledWith(
            'Success',
            'Credit card added successfully.',
            expect.any(Array)
        );
    });

    test('handles payment method creation error', async () => {
        // Setup mocks for error scenario
        const createPaymentMethodMock = jest.fn().mockResolvedValue({
            paymentMethod: null,
            error: { message: 'Invalid card details' }
        });

        useStripe.mockReturnValue({
            createPaymentMethod: createPaymentMethodMock
        });

        jest.spyOn(Alert, 'alert');

        const { getByTestId } = render(<BankingInfoPage />);

        // Click submit button
        const submitButton = getByTestId('submit-button');
        fireEvent.press(submitButton);

        // Wait for alert to be shown
        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Error', 'Invalid card details');
        });

        // Verify axios was not called
        expect(axios.post).not.toHaveBeenCalled();
    });

    test('handles API error response', async () => {
        // Setup mocks for successful payment method creation
        const createPaymentMethodMock = jest.fn().mockResolvedValue({
            paymentMethod: { id: 'pm_test123' },
            error: null
        });

        useStripe.mockReturnValue({
            createPaymentMethod: createPaymentMethodMock
        });

        // Mock AsyncStorage responses
        AsyncStorage.getItem.mockImplementation((key) => {
            if (key === 'userId') return Promise.resolve('test-user-id');
            if (key === 'token') return Promise.resolve('test-token');
            return Promise.resolve(null);
        });

        // Mock API error response
        axios.post.mockResolvedValue({
            data: { status: 'error', data: 'Failed to process payment' }
        });

        // Reset Alert mock
        Alert.alert.mockClear();

        // Render the component
        const { getByTestId } = render(<BankingInfoPage />);

        // Click submit button
        const submitButton = getByTestId('submit-button');
        fireEvent.press(submitButton);

        // Wait for payment method to be created
        await waitFor(() => {
            expect(createPaymentMethodMock).toHaveBeenCalled();
        });

        // Fast-forward through all timers
        jest.runAllTimers();

        // Wait for axios call
        await waitFor(() => {
            expect(axios.post).toHaveBeenCalled();
        });

        // Verify Alert was called
        expect(Alert.alert).toHaveBeenCalled();
    });


    test('handles network error', async () => {
        // Setup mocks with a successful payment method
        const createPaymentMethodMock = jest.fn().mockResolvedValue({
            paymentMethod: { id: 'pm_test123' },
            error: null
        });

        useStripe.mockReturnValue({
            createPaymentMethod: createPaymentMethodMock
        });

        // Setup AsyncStorage mock
        AsyncStorage.getItem.mockImplementation((key) => {
            if (key === 'userId') return Promise.resolve('test-user-id');
            if (key === 'token') return Promise.resolve('test-token');
            return Promise.resolve(null);
        });

        // Mock network error
        axios.post.mockRejectedValue(new Error('Network Error'));

        // Clear any previous Alert calls
        Alert.alert.mockClear();

        const { getByTestId } = render(<BankingInfoPage />);

        // Click submit button
        const submitButton = getByTestId('submit-button');
        fireEvent.press(submitButton);

        // Wait for createPaymentMethod to complete
        await waitFor(() => {
            expect(createPaymentMethodMock).toHaveBeenCalled();
        });

        // Run all the timers - this will advance through all setTimeout calls
        await act(async () => {
            jest.runAllTimers();
            // Allow any promises to resolve
            await Promise.resolve();
        });

        // Now check that axios.post was called
        expect(axios.post).toHaveBeenCalled();

        // And check that the Alert was shown with the expected error message
        expect(Alert.alert).toHaveBeenCalledWith(
            'Error',
            'An error occurred while adding credit card.'
        );
    });

    test('handles successful navigation after payment', async () => {
        const createPaymentMethodMock = jest.fn().mockResolvedValue({
            paymentMethod: { id: 'pm_test123' },
            error: null
        });

        useStripe.mockReturnValue({
            createPaymentMethod: createPaymentMethodMock
        });

        AsyncStorage.getItem.mockImplementation((key) => {
            if (key === 'userId') return Promise.resolve('test-user-id');
            if (key === 'token') return Promise.resolve('test-token');
            return Promise.resolve(null);
        });

        axios.post.mockResolvedValue({
            data: { status: 'success' }
        });

        // Create a navigation mock specific for this test
        const mockNavigationReset = jest.fn();
        const mockNavigation = {
            goBack: mockGoBack,
            reset: mockNavigationReset,
            getState: jest.fn(() => ({ routes: [], index: 0 })),
        };

        // Dynamically override useNavigation just for this test
        const navigationModule = require('@react-navigation/native');
        jest.spyOn(navigationModule, 'useNavigation').mockImplementation(() => mockNavigation);

        Alert.alert.mockImplementation((title, message, buttons) => {
            if (buttons && buttons.length > 0 && buttons[0].onPress) {
                buttons[0].onPress();
            }
        });

        const { getByTestId } = render(<BankingInfoPage />);

        fireEvent.press(getByTestId('submit-button'));

        await waitFor(() => {
            expect(createPaymentMethodMock).toHaveBeenCalled();
        });

        await act(async () => {
            jest.runAllTimers();
            await Promise.resolve();
        });

        expect(axios.post).toHaveBeenCalled();
        expect(Alert.alert).toHaveBeenCalledWith(
            'Success',
            'Credit card added successfully.',
            expect.any(Array)
        );

        await act(async () => {
            jest.runAllTimers();
            await Promise.resolve();
        });

        expect(mockNavigationReset).toHaveBeenCalledWith({
            index: 0,
            routes: [{ name: 'MainTabs' }]
        });
    });


    test('disables submit button while loading', async () => {
        // Setup mock for a delayed response
        useStripe().createPaymentMethod.mockImplementation(() => {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve({
                        paymentMethod: { id: 'pm_test123' },
                        error: null
                    });
                }, 500);
            });
        });

        const { getByTestId, getByText } = render(<BankingInfoPage />);

        // Click submit button
        const submitButton = getByTestId('submit-button');
        fireEvent.press(submitButton);

        // Check that button text changes to "Submitting..." and button is disabled
        await waitFor(() => {
            const updatedButton = getByTestId('submit-button');
            expect(updatedButton.props.disabled).toBeTruthy();
            expect(updatedButton.props['data-title']).toBe('Submitting...');
        });

        // Fast-forward timers to complete the process
        act(() => {
            jest.advanceTimersByTime(500);
        });

        act(() => {
            jest.advanceTimersByTime(1000);
        });
    });

    test('cleans up properly on unmount', () => {
        const { unmount } = render(<BankingInfoPage />);

        // Unmount the component
        unmount();

        // The isUnmounted ref should be set to true, but we can't test that directly
        // We can only verify there are no errors thrown during unmount
    });
});