// __tests__/IssueDetails.test.js
import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import IssueDetails from '../issueDetails'; // Adjust path as needed
import axios from 'axios';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ----- Mock React Navigation -----
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
jest.mock('@react-navigation/native', () => {
    // We'll keep the real module for everything except the hooks we override
    const actualNav = jest.requireActual('@react-navigation/native');
    return {
        ...actualNav,
        useRoute: jest.fn(),
        useNavigation: jest.fn(),
        // DO NOT auto-invoke the callback here. We'll handle that in tests if needed.
        useFocusEffect: jest.fn(),
    };
});

// ----- Mock Ionicons from @expo/vector-icons -----
// Alternatively, if you use 'react-native-vector-icons/Ionicons', mock that instead.
jest.mock('@expo/vector-icons', () => ({
    Ionicons: ({ name, ...props }) => {
        // Return a simple Text or mock component
        return `IoniconMock: ${name}`;
    },
}));

jest.mock('axios');
jest.mock('react-native/Libraries/Alert/Alert', () => ({
    alert: jest.fn(),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn(),
}));

// Silence console.error to avoid polluting test logs when we test error paths
jest.spyOn(global.console, 'error').mockImplementation(() => {});

describe('IssueDetails', () => {
    const mockNavigate = jest.fn();
    const mockGoBack = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();

        // Default mock for route params
        useRoute.mockReturnValue({
            params: { jobId: 123 },
        });

        // Default navigation mock
        useNavigation.mockReturnValue({
            navigate: mockNavigate,
            goBack: mockGoBack,
        });

        // DO NOT auto-invoke the callback. Just store it.
        // We'll manually invoke if we want to simulate "focus".
        useFocusEffect.mockImplementation(() => {});
    });

    it('displays "Issue details not found" if job is null after loading', async () => {
        // Mock an empty (null) data from server
        axios.get.mockResolvedValueOnce({ data: null });

        const { getByText } = render(<IssueDetails />);

        // Wait for final state
        await waitFor(() => {
            expect(getByText('Issue details not found')).toBeTruthy();
        });
    });

    it('displays the job details if job is returned', async () => {
        // Provide some valid job data
        axios.get.mockResolvedValueOnce({
            data: {
                id: 123,
                title: 'Test Issue',
                status: 'In Progress',
                createdAt: '2023-01-01T12:00:00Z',
            },
        });

        const { getByText } = render(<IssueDetails />);

        await waitFor(() => {
            expect(getByText('Test Issue')).toBeTruthy();
            expect(getByText('Issue Details')).toBeTruthy();
        });
    });

    it('shows the "Mark Complete" button if status is "in progress"', async () => {
        axios.get.mockResolvedValueOnce({
            data: {
                id: 123,
                title: 'Test Issue',
                status: 'In Progress',
            },
        });

        const { getByText } = render(<IssueDetails />);

        await waitFor(() => {
            const button = getByText('Mark Complete');
            expect(button).toBeTruthy();
        });
    });

    it('does not show "Mark Complete" button if status != "in progress"', async () => {
        axios.get.mockResolvedValueOnce({
            data: {
                id: 123,
                title: 'Test Issue',
                status: 'Completed', // e.g. not in progress
            },
        });

        const { queryByText } = render(<IssueDetails />);
        await waitFor(() => {
            expect(queryByText('Mark Complete')).toBeNull();
        });
    });

    it('shows an alert if fetching fails', async () => {
        // Force axios to reject
        axios.get.mockRejectedValue(new Error('Network Error'));
        const spy = jest.spyOn(Alert, 'alert');

        render(<IssueDetails />);
        await waitFor(() => {
            expect(spy).toHaveBeenCalledWith('Error', 'Failed to fetch issue details');
        });
    });

    it('fetches job details on mount (and does not auto-run useFocusEffect)', async () => {
        axios.get.mockResolvedValueOnce({ data: { id: 123, status: 'In Progress' } });

        render(<IssueDetails />);

        // Because we do NOT auto-run the callback in useFocusEffect, only the
        // initial fetch on mount is called:
        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledTimes(1);
        });

        // If you want to explicitly test the focus callback:
        // 1. Capture how we called useFocusEffect:
        const focusCallback = useFocusEffect.mock.calls[0][0]; // the function
        // 2. Manually call it to simulate "focus"
        act(() => {
            focusCallback();
        });
        // Now it should fetch again
        expect(axios.get).toHaveBeenCalledTimes(2);
    });
});
