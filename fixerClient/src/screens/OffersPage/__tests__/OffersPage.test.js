import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import OffersPage from '../OffersPage';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Alert } from 'react-native';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn(),
}));

// Mock axios
jest.mock('axios');

// Mock useNavigation
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: jest.fn(),
}));

describe('OffersPage', () => {
    let mockNavigate;
    let alertSpy;

    beforeEach(() => {
        jest.clearAllMocks();
        AsyncStorage.getItem.mockResolvedValue('mock-token');
        mockNavigate = jest.fn();
        useNavigation.mockReturnValue({ navigate: mockNavigate });
        alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    });

    it('displays loading spinner initially', async () => {
        const route = { params: { jobId: 'mockJobId' } };

        const { getByTestId } = render(<OffersPage route={route} />);

        // Wait for the spinner to appear
        await waitFor(() => expect(getByTestId('loading-indicator')).toBeTruthy());
    });

    it('fetches and displays offers on load', async () => {
        const route = { params: { jobId: 'mockJobId' } };

        axios.get.mockResolvedValueOnce({
            status: 200,
            data: {
                offers: [
                    {
                        _id: '1',
                        professionalFullName: 'John Doe',
                        professionalEmail: 'john@example.com',
                        price: 100,
                        status: 'pending',
                        createdAt: '2025-01-25T12:00:00Z',
                    },
                ],
            },
        });

        const { getByText } = render(<OffersPage route={route} />);

        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledWith(
                'https://fixercapstone-production.up.railway.app/quotes/job/mockJobId',
                { headers: { Authorization: 'Bearer mock-token' } }
            );
            expect(getByText('Professional:')).toBeTruthy();
            expect(getByText('John Doe')).toBeTruthy();
            expect(getByText('Price: $100')).toBeTruthy();
            expect(getByText('Status: Pending')).toBeTruthy();
        });
    });

    it('displays a message when no offers are found', async () => {
        const route = { params: { jobId: 'mockJobId' } };

        axios.get.mockResolvedValueOnce({
            status: 200,
            data: { offers: [] },
        });

        const { getByText } = render(<OffersPage route={route} />);

        await waitFor(() => {
            expect(getByText('No offers available for this job.')).toBeTruthy();
        });
    });

    it('handles accept offer action', async () => {
        const route = { params: { jobId: 'mockJobId' } };

        axios.get.mockResolvedValueOnce({
            status: 200,
            data: {
                offers: [
                    {
                        _id: '1',
                        professionalFullName: 'John Doe',
                        professionalEmail: 'john@example.com',
                        price: 100,
                        status: 'pending',
                        createdAt: '2025-01-25T12:00:00Z',
                    },
                ],
            },
        });

        axios.put.mockResolvedValueOnce({
            status: 200,
        });

        const { getByText } = render(<OffersPage route={route} />);

        await waitFor(() => expect(getByText('Accept')).toBeTruthy());

        act(() => {
            fireEvent.press(getByText('Accept'));
        });

        await waitFor(() => {
            expect(axios.put).toHaveBeenCalledWith(
                'https://fixercapstone-production.up.railway.app/quotes/1',
                { status: 'accepted' },
                { headers: { Authorization: 'Bearer mock-token' } }
            );
            expect(mockNavigate).toHaveBeenCalledWith('ChatListPage');
        });
    });

    it('handles reject offer action', async () => {
        const route = { params: { jobId: 'mockJobId' } };

        axios.get.mockResolvedValueOnce({
            status: 200,
            data: {
                offers: [
                    {
                        _id: '1',
                        professionalFullName: 'John Doe',
                        professionalEmail: 'john@example.com',
                        price: 100,
                        status: 'pending',
                        createdAt: '2025-01-25T12:00:00Z',
                    },
                ],
            },
        });

        axios.put.mockResolvedValueOnce({
            status: 200,
        });

        const { getByText } = render(<OffersPage route={route} />);

        await waitFor(() => expect(getByText('Reject')).toBeTruthy());

        act(() => {
            fireEvent.press(getByText('Reject'));
        });

        await waitFor(() => {
            expect(axios.put).toHaveBeenCalledWith(
                'https://fixercapstone-production.up.railway.app/quotes/1',
                { status: 'rejected' },
                { headers: { Authorization: 'Bearer mock-token' } }
            );
            expect(axios.get).toHaveBeenCalledTimes(2);
        });
    });

    it('displays alert when no token is found in fetchOffers', async () => {
        const route = { params: { jobId: 'mockJobId' } };

        // Force AsyncStorage to return null to simulate no token
        AsyncStorage.getItem.mockResolvedValueOnce(null);

        render(<OffersPage route={route} />);

        await waitFor(() => {
            expect(alertSpy).toHaveBeenCalledWith('You are not logged in');
        });
    });

    it('displays alert when an error occurs in fetchOffers', async () => {
        const route = { params: { jobId: 'mockJobId' } };

        // Force axios.get to reject
        axios.get.mockRejectedValueOnce(new Error('Network Error'));

        render(<OffersPage route={route} />);

        await waitFor(() => {
            expect(alertSpy).toHaveBeenCalledWith('Failed to fetch offers. Please try again later.');
        });
    });

    it('handles accept offer action - fails if response status is not 200', async () => {
        const route = { params: { jobId: 'mockJobId' } };

        axios.get.mockResolvedValueOnce({
            status: 200,
            data: {
                offers: [
                    {
                        _id: '1',
                        professionalFullName: 'John Doe',
                        professionalEmail: 'john@example.com',
                        price: 100,
                        status: 'pending',
                        createdAt: '2025-01-25T12:00:00Z',
                    },
                ],
            },
        });

        // Simulate non-200 response from the put request
        axios.put.mockResolvedValueOnce({
            status: 400,
        });

        const { getByText } = render(<OffersPage route={route} />);

        await waitFor(() => expect(getByText('Accept')).toBeTruthy());

        act(() => {
            fireEvent.press(getByText('Accept'));
        });

        await waitFor(() => {
            expect(axios.put).toHaveBeenCalledWith(
                'https://fixercapstone-production.up.railway.app/quotes/1',
                { status: 'accepted' },
                { headers: { Authorization: 'Bearer mock-token' } }
            );
            expect(alertSpy).toHaveBeenCalledWith('Failed to accept the offer.');
            // No navigation if fail
            expect(mockNavigate).not.toHaveBeenCalled();
        });
    });

    it('handles accept offer action - catch block on error', async () => {
        const route = { params: { jobId: 'mockJobId' } };

        axios.get.mockResolvedValueOnce({
            status: 200,
            data: {
                offers: [
                    {
                        _id: '1',
                        professionalFullName: 'John Doe',
                        professionalEmail: 'john@example.com',
                        price: 100,
                        status: 'pending',
                        createdAt: '2025-01-25T12:00:00Z',
                    },
                ],
            },
        });

        // Force axios.put to throw an error
        axios.put.mockRejectedValueOnce(new Error('Network Error'));

        const { getByText } = render(<OffersPage route={route} />);

        await waitFor(() => expect(getByText('Accept')).toBeTruthy());

        act(() => {
            fireEvent.press(getByText('Accept'));
        });

        await waitFor(() => {
            expect(alertSpy).toHaveBeenCalledWith('An error occurred while accepting the offer.');
            expect(mockNavigate).not.toHaveBeenCalled();
        });
    });

    it('handles reject offer action - fails if response status is not 200', async () => {
        const route = { params: { jobId: 'mockJobId' } };

        axios.get.mockResolvedValueOnce({
            status: 200,
            data: {
                offers: [
                    {
                        _id: '1',
                        professionalFullName: 'John Doe',
                        professionalEmail: 'john@example.com',
                        price: 100,
                        status: 'pending',
                        createdAt: '2025-01-25T12:00:00Z',
                    },
                ],
            },
        });

        // Simulate non-200 response
        axios.put.mockResolvedValueOnce({
            status: 400,
        });

        const { getByText } = render(<OffersPage route={route} />);

        await waitFor(() => expect(getByText('Reject')).toBeTruthy());

        act(() => {
            fireEvent.press(getByText('Reject'));
        });

        await waitFor(() => {
            expect(alertSpy).toHaveBeenCalledWith('Failed to reject the offer.');
            // Should not call fetchOffers again if it fails
            // So axios.get would have been called only once in the beginning
            expect(axios.get).toHaveBeenCalledTimes(1);
        });
    });

    it('handles reject offer action - catch block on error', async () => {
        const route = { params: { jobId: 'mockJobId' } };

        axios.get.mockResolvedValueOnce({
            status: 200,
            data: {
                offers: [
                    {
                        _id: '1',
                        professionalFullName: 'John Doe',
                        professionalEmail: 'john@example.com',
                        price: 100,
                        status: 'pending',
                        createdAt: '2025-01-25T12:00:00Z',
                    },
                ],
            },
        });

        // Force axios.put to throw an error
        axios.put.mockRejectedValueOnce(new Error('Network Error'));

        const { getByText } = render(<OffersPage route={route} />);

        await waitFor(() => expect(getByText('Reject')).toBeTruthy());

        act(() => {
            fireEvent.press(getByText('Reject'));
        });

        await waitFor(() => {
            expect(alertSpy).toHaveBeenCalledWith('An error occurred while rejecting the offer.');
        });
    });

    it('handles reject offer action - success path also calls fetchOffers', async () => {
        const route = { params: { jobId: 'mockJobId' } };

        // First get returns one pending offer
        axios.get.mockResolvedValueOnce({
            status: 200,
            data: {
                offers: [
                    {
                        _id: '1',
                        professionalFullName: 'John Doe',
                        professionalEmail: 'john@example.com',
                        price: 100,
                        status: 'pending',
                        createdAt: '2025-01-25T12:00:00Z',
                    },
                ],
            },
        });

        // Put returns success
        axios.put.mockResolvedValueOnce({
            status: 200,
        });

        // Second get (after reject) returns an empty list
        axios.get.mockResolvedValueOnce({
            status: 200,
            data: { offers: [] },
        });

        const { getByText, queryByText } = render(<OffersPage route={route} />);

        // Wait for first offer to appear
        await waitFor(() => expect(getByText('Reject')).toBeTruthy());

        act(() => {
            fireEvent.press(getByText('Reject'));
        });

        await waitFor(() => {
            expect(axios.put).toHaveBeenCalledWith(
                'https://fixercapstone-production.up.railway.app/quotes/1',
                { status: 'rejected' },
                { headers: { Authorization: 'Bearer mock-token' } }
            );
            expect(alertSpy).toHaveBeenCalledWith('Offer Rejected', 'You have rejected the offer.');
            // fetchOffers called again
            expect(axios.get).toHaveBeenCalledTimes(2);
            // No offers should be found after reload
            expect(queryByText('Professional:')).toBeNull();
        });
    });
});
