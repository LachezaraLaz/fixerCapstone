import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ContractOffer from '../contractOffer'; // Update with the correct path
import axios from 'axios';
import customAlertSuccess from "../../../../components/customAlertSuccess";
import customAlertError from "../../../../components/customAlertError";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native'; 

// code to run only this file through the terminal:
// npm run test ./src/screens/contractOffer/__tests__/contractOffer.test.js
// or
// npm run test-coverage ./src/screens/contractOffer/__tests__/contractOffer.test.js

jest.mock('axios');
jest.mock('@react-native-async-storage/async-storage', () => ({
    __esModule: true,
    default: {
        setItem: jest.fn(),
        getItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
    },
}));

const mockCustomAlertError = jest.fn(() => null);

jest.mock('../../../../components/customAlertError', () => ({
    __esModule: true,
    default: (props) => {
        mockCustomAlertError(props); // capture the props
        return null;
    },
}));

const mockCustomAlertSuccess = jest.fn(() => null);

jest.mock('../../../../components/customAlertSuccess', () => ({
    __esModule: true,
    default: (props) => {
        mockCustomAlertSuccess(props);
        return null;
    },
}));

jest.mock('../../../../components/inputField', () => {
    const React = require('react');
    const { TextInput } = require('react-native');
    return ({ value, onChangeText, placeholder, testID, style, ...rest }) => (
        <TextInput
            testID={testID}
            value={value}
            placeholder={placeholder}
            onChangeText={onChangeText}
            style={style}
            {...rest}
        />
    );
});



describe('ContractOffer Component', () => {
    const mockNavigation = { goBack: jest.fn() };
    const mockRoute = {
        params: {
        issue: {
            title: 'Test Issue',
            description: 'This is a test description.',
            status: 'Open',
            professionalNeeded: 'Electrician',
            userEmail: 'testuser@example.com',
            _id: '12345',
            latitude: '40.7128',
            longitude: '-74.0060',
            imageUrl: 'https://example.com/image.jpg',
        },
        },
    };

    beforeEach(() => {
        AsyncStorage.getItem.mockResolvedValue('mock-token');
        jest.clearAllMocks();
    });

    test('renders correctly with issue details', () => {
        const { getByText } = render(<ContractOffer route={mockRoute} navigation={mockNavigation} />);
        expect(getByText('Job Description*')).toBeTruthy();
        expect(getByText('Tools-Materials*')).toBeTruthy();
        expect(getByText('Terms and Conditions*')).toBeTruthy();
        expect(getByText('Pricing $ (Hourly Rate)*')).toBeTruthy();
        expect(getByText('Submit Quote')).toBeTruthy();
    });

    test('fetches user profile on mount', async () => {
        axios.get.mockResolvedValueOnce({
            status: 200,
            data: {
                street: '123 Test St',
                postalCode: '12345',
                provinceOrState: 'Test State',
                country: 'Test Country',
            },
        });

        render(<ContractOffer route={mockRoute} navigation={mockNavigation} />);

        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledWith(
                'https://fixercapstone-production.up.railway.app/users/user/testuser@example.com',
                { headers: { Authorization: 'Bearer mock-token' } }
            );
        });
    });

    test('pressing back button calls navigation.goBack', () => {
        const { getByTestId } = render(<ContractOffer route={mockRoute} navigation={mockNavigation} />);
        const backButton = getByTestId('back-button');
        fireEvent.press(backButton);
        expect(mockNavigation.goBack).toHaveBeenCalled();
    });

    test('renders form labels and submit button', () => {
        const { getByText } = render(<ContractOffer route={mockRoute} navigation={mockNavigation} />);
        expect(getByText('Job Description*')).toBeTruthy();
        expect(getByText('Tools-Materials*')).toBeTruthy();
        expect(getByText('Terms and Conditions*')).toBeTruthy();
        expect(getByText('Pricing $ (Hourly Rate)*')).toBeTruthy();
        expect(getByText('Submit Quote')).toBeTruthy();
    });

    test('shows error alert if job description is missing', async () => {
        const { getByText } = render(<ContractOffer route={mockRoute} navigation={mockNavigation} />);
        fireEvent.press(getByText('Submit Quote'));

        await waitFor(() => {
            expect(mockCustomAlertError).toHaveBeenCalledWith(
                expect.objectContaining({
                    visible: true,
                    title: 'Missing Job Description',
                    message: 'Please enter a job description.',
                })
            );
        });
    });

    test('shows an alert if price is zero or negative', async () => {
        const { getByTestId, getByText } = render(
            <ContractOffer route={mockRoute} navigation={mockNavigation} />
        );

        // Fill out required fields to pass early validation
        fireEvent.changeText(getByTestId('jobDescription-input'), 'Test job');
        fireEvent.changeText(getByTestId('toolsMaterials-input'), 'Tools');
        fireEvent.changeText(getByTestId('termsConditions-input'), 'Terms');

        // Invalid price
        fireEvent.changeText(getByTestId('price-input'), '-50');

        fireEvent.press(getByText('Submit Quote'));

        await waitFor(() => {
            expect(mockCustomAlertError).toHaveBeenCalledWith(
                expect.objectContaining({
                    title: 'Invalid Price',
                    message: expect.stringContaining('valid positive number'),
                    visible: true,
                })
            );
        });
    });

    test('shows an alert if price exceeds limit', async () => {
        const { getByTestId, getByText } = render(
            <ContractOffer route={mockRoute} navigation={mockNavigation} />
        );

        fireEvent.changeText(getByTestId('jobDescription-input'), 'Test job');
        fireEvent.changeText(getByTestId('toolsMaterials-input'), 'Tools');
        fireEvent.changeText(getByTestId('termsConditions-input'), 'Terms');
        fireEvent.changeText(getByTestId('price-input'), '200000'); // Over the limit

        fireEvent.press(getByText('Submit Quote'));

        await waitFor(() => {
            expect(mockCustomAlertError).toHaveBeenCalledWith(
                expect.objectContaining({
                    title: 'Invalid Price',
                    message: expect.stringContaining('valid positive number'),
                    visible: true
                })
            );
        });
    });

    test('shows an alert if issue details are incomplete', async () => {
        const incompleteRoute = { params: { issue: {} } };

        const { getByTestId, getByText } = render(
            <ContractOffer route={incompleteRoute} navigation={mockNavigation} />
        );

        fireEvent.changeText(getByTestId('jobDescription-input'), 'Test job');
        fireEvent.changeText(getByTestId('toolsMaterials-input'), 'Tools');
        fireEvent.changeText(getByTestId('termsConditions-input'), 'Terms');
        fireEvent.changeText(getByTestId('price-input'), '150');

        fireEvent.press(getByText('Submit Quote'));

        await waitFor(() => {
            expect(mockCustomAlertError).toHaveBeenCalledWith(
                expect.objectContaining({
                    title: 'Error',
                    message: expect.stringContaining('Unable to retrieve complete issue details'),
                    visible: true,
                })
            );
        });
    });



//   test('shows error alert if user profile fetch fails', async () => {
//     axios.get.mockRejectedValueOnce({
//       response: {
//         data: { message: 'User not found.' },
//       },
//     });

//     const alertMock = jest.spyOn(global, 'alert').mockImplementation(() => {});

//     render(<ContractOffer route={mockRoute} navigation={mockNavigation} />);

//     await waitFor(() => {
//       expect(alertMock).toHaveBeenCalledWith('Error', 'User not found.');
//     });

//     alertMock.mockRestore();
//   });

    // test('handles quote submission successfully and shows alert', async () => {
    //     axios.post.mockResolvedValueOnce({ status: 201 });
    //
    //     const { getByTestId, getByText } = render(
    //         <ContractOffer route={mockRoute} navigation={mockNavigation} />
    //     );
    //
    //     fireEvent.changeText(getByTestId('jobDescription-input'), 'Test job');
    //     fireEvent.changeText(getByTestId('toolsMaterials-input'), 'Tools');
    //     fireEvent.changeText(getByTestId('termsConditions-input'), 'Terms');
    //     fireEvent.changeText(getByTestId('price-input'), '150');
    //
    //     fireEvent.press(getByText('Submit Quote'));
    //
    //     await waitFor(() => {
    //         const calls = mockCustomAlertSuccess.mock.calls;
    //         const match = calls.find(
    //             ([props]) =>
    //                 props.visible === true &&
    //                 props.title === 'Success' &&
    //                 props.message === 'Quote submitted successfully!'
    //         );
    //         expect(match).toBeDefined();
    //     });
    // });


    // test('shows error if quote submission fails', async () => {
    //     axios.post.mockRejectedValueOnce({
    //         response: { status: 400 },
    //     });
    //
    //     const { getByTestId, getByText } = render(
    //         <ContractOffer route={mockRoute} navigation={mockNavigation} />
    //     );
    //
    //     fireEvent.changeText(getByTestId('jobDescription-input'), 'Test job');
    //     fireEvent.changeText(getByTestId('toolsMaterials-input'), 'Tools');
    //     fireEvent.changeText(getByTestId('termsConditions-input'), 'Terms');
    //     fireEvent.changeText(getByTestId('price-input'), '150');
    //
    //     fireEvent.press(getByText('Submit Quote'));
    //
    //     // Use waitFor to check if a matching call ever happens
    //     await waitFor(() => {
    //         const calls = mockCustomAlertError.mock.calls;
    //         const found = calls.some(
    //             ([props]) =>
    //                 props.visible === true &&
    //                 props.title === 'Error' &&
    //                 props.message === 'You have already submitted a quote for this issue.'
    //         );
    //         expect(found).toBe(true);
    //     });
    // });

//
//     test('shows an alert if price is not provided when submitting a quote', async () => {
//     const { getByText } = render(
//         <ContractOffer route={mockRoute} navigation={mockNavigation} />
//     );
//
//     // Mock the Alert.alert behavior
//     const alertMock = jest.spyOn(Alert, 'alert');
//
//     const submitButton = getByText('Submit');
//     fireEvent.press(submitButton);
//
//     // Assert that Alert.alert was called with the correct arguments
//     await waitFor(() => {
//         expect(alertMock).toHaveBeenCalledWith(
//         'Error',
//         'Please enter a price before submitting the quote.'
//         );
//     });
//
//     // Restore the mock
//     alertMock.mockRestore();
//     });

});
