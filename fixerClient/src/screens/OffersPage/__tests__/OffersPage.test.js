import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import OffersPage from '../OffersPage';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

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

    beforeEach(() => {
        jest.clearAllMocks();
        AsyncStorage.getItem.mockResolvedValue('mock-token');
        mockNavigate = jest.fn();
        useNavigation.mockReturnValue({ navigate: mockNavigate });
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

});
