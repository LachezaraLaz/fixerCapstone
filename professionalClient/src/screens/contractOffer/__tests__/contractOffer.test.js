import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ContractOffer from '../contractOffer'; // Update with the correct path
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native'; 

// code to run only this file through the terminal:
// npm run test ./src/screens/contractOffer/__tests__/contractOffer.test.js
// or
// npm run test-coverage ./src/screens/contractOffer/__tests__/contractOffer.test.js

jest.mock('axios');
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
}));

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

        expect(getByText('Test Issue')).toBeTruthy();
        expect(getByText('Detailed Information')).toBeTruthy();
        expect(getByText('This is a test description.')).toBeTruthy();
        expect(getByText('Open')).toBeTruthy();
        expect(getByText('Electrician')).toBeTruthy();
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

        const { getByText } = render(<ContractOffer route={mockRoute} navigation={mockNavigation} />);

        await waitFor(() => {
        expect(getByText('Street: 123 Test St')).toBeTruthy();
        expect(getByText('Postal Code: 12345')).toBeTruthy();
        expect(getByText('Province/State: Test State')).toBeTruthy();
        expect(getByText('Country: Test Country')).toBeTruthy();
        });
    });

    test('shows an alert if price is zero or negative', async () => {
        const { getByPlaceholderText, getByText } = render(
            <ContractOffer route={mockRoute} navigation={mockNavigation} />
        );

        const priceInput = getByPlaceholderText('Enter price for this issue');
        fireEvent.changeText(priceInput, '-50');

        const submitButton = getByText('Submit');
        fireEvent.press(submitButton);

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith(
                'Invalid Price',
                'Please enter a valid positive number for the price.'
            );
        });
    });

    test('shows an alert if price exceeds limit', async () => {
        const { getByPlaceholderText, getByText } = render(
            <ContractOffer route={mockRoute} navigation={mockNavigation} />
        );

        const priceInput = getByPlaceholderText('Enter price for this issue');
        fireEvent.changeText(priceInput, '200000');

        const submitButton = getByText('Submit');
        fireEvent.press(submitButton);

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith(
                'Invalid Price',
                'Price should not exceed $100,000.'
            );
        });
    });

    test('shows an alert if issue details are incomplete', async () => {
        const incompleteRoute = { params: { issue: {} } };

        const { getByPlaceholderText, getByText } = render(
            <ContractOffer route={incompleteRoute} navigation={mockNavigation} />
        );

        const priceInput = getByPlaceholderText('Enter price for this issue');
        fireEvent.changeText(priceInput, '150');

        const submitButton = getByText('Submit');
        fireEvent.press(submitButton);

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith(
                'Error',
                'Unable to retrieve complete issue details. Please try again.'
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

    test('handles quote submission successfully and shows alert', async () => {
        axios.post.mockResolvedValueOnce({ status: 201 });
    
        const { getByPlaceholderText, getByText } = render(
        <ContractOffer route={mockRoute} navigation={mockNavigation} />
        );
    
        const priceInput = getByPlaceholderText('Enter price for this issue');
        fireEvent.changeText(priceInput, '150');
    
        const submitButton = getByText('Submit');
        fireEvent.press(submitButton);
    
        // Mock the Alert.alert behavior
        const alertMock = jest.spyOn(Alert, 'alert');
    
        await waitFor(() => {
        expect(alertMock).toHaveBeenCalledWith(
            'Success',
            'Quote submitted successfully!',
            expect.any(Array) // Ensures it has the 'OK' button configuration
        );
        });
    
        alertMock.mockRestore(); // Clean up after the test
    });

    test('shows error if quote submission fails', async () => {
        // Mock the API call to reject with a 400 status
        axios.post.mockRejectedValueOnce({
            response: { status: 400 },
        });

        // Mock Alert.alert
        const alertMock = jest.spyOn(Alert, 'alert');

        const { getByPlaceholderText, getByText } = render(
            <ContractOffer route={mockRoute} navigation={mockNavigation} />
        );

        // Simulate entering a price
        const priceInput = getByPlaceholderText('Enter price for this issue');
        fireEvent.changeText(priceInput, '150');

        // Simulate pressing the submit button
        const submitButton = getByText('Submit');
        fireEvent.press(submitButton);

        // Assert that Alert.alert was called with the correct arguments
        await waitFor(() => {
            expect(alertMock).toHaveBeenCalledWith(
            'Error',
            'You have already submitted a quote for this issue.',
            expect.any(Array) // Checks for the buttons passed to the alert
            );
        });

        // Restore the original Alert.alert
        alertMock.mockRestore();
    });


    test('opens and closes image modal', () => {
        const { getByText, getByTestId } = render(
            <ContractOffer route={mockRoute} navigation={mockNavigation} />
        );

        const imageLink = getByText('Image 1');
        fireEvent.press(imageLink);

        // Assert that the modal is visible
        expect(getByTestId('modal')).toBeTruthy();

        const closeButton = getByText('Close');
        fireEvent.press(closeButton);

        // Assert that the modal is no longer visible
        expect(() => getByTestId('modal')).toThrow();
    });

    test('calls navigation.goBack when Go Back button is pressed', () => {
        const { getByText } = render(
          <ContractOffer route={mockRoute} navigation={mockNavigation} />
        );
      
        const goBackButton = getByText('Go Back');
        fireEvent.press(goBackButton);
      
        expect(mockNavigation.goBack).toHaveBeenCalled();
    });

    test('shows an alert if price is not provided when submitting a quote', async () => {
    const { getByText } = render(
        <ContractOffer route={mockRoute} navigation={mockNavigation} />
    );

    // Mock the Alert.alert behavior
    const alertMock = jest.spyOn(Alert, 'alert');

    const submitButton = getByText('Submit');
    fireEvent.press(submitButton);

    // Assert that Alert.alert was called with the correct arguments
    await waitFor(() => {
        expect(alertMock).toHaveBeenCalledWith(
        'Error',
        'Please enter a price before submitting the quote.'
        );
    });

    // Restore the mock
    alertMock.mockRestore();
    });

});
