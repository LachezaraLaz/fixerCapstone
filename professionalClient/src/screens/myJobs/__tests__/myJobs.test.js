import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import MyJobsProfessional from '../myJobs';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';

// Mock the navigation
jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual('@react-navigation/native');
    return {
        ...actualNav,
        useNavigation: () => ({
            navigate: jest.fn(),
        }),
        useIsFocused: () => true,
    };
});

jest.mock('axios');
jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn(),
}));

jest.spyOn(Alert, 'alert');

describe('MyJobsProfessional Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Mock notification fetch to return valid data
        axios.get.mockImplementation((url) => {
            if (url.includes('notification')) {
                return Promise.resolve({ data: [] });
            }
            return Promise.reject(new Error('Unexpected URL'));
        });
    });

    const renderComponent = (props = {}) => {
        return render(
            <NavigationContainer>
                <MyJobsProfessional {...props} />
            </NavigationContainer>
        );
    };

    test('renders loading indicator while fetching jobs', () => {
        const { getByTestId } = renderComponent();
        expect(getByTestId('loading-indicator')).toBeTruthy();
    });

    test('fetches and displays jobs successfully', async () => {
        AsyncStorage.getItem.mockImplementation((key) =>
            key === 'token' ? Promise.resolve('mock-token') : Promise.resolve(null)
        );

        axios.get.mockImplementation((url) => {
            if (url.includes('myJobs/get')) {
                return Promise.resolve({
                    data: {
                        active: [
                            {
                                id: '1',
                                title: 'Active Job 1',
                                description: 'Job description 1',
                                price: 100,
                                professionalNeeded: 'Plumber',
                                timeline: 'Urgent',
                                createdAt: '2023-01-01'
                            },
                        ],
                        amountEarned: 500,
                    },
                });
            }
            return Promise.resolve({ data: [] });
        });

        const { getByText } = renderComponent();

        await waitFor(() => {
            expect(getByText('Active Job 1')).toBeTruthy();
            // Match the exact text pattern including the emoji
            expect(getByText(/📍.*Plumber/)).toBeTruthy();
            expect(getByText(/\$.*100/)).toBeTruthy();
            expect(getByText('Amount Earned: $500')).toBeTruthy();
        });
    });

    test('shows error alert if no token is found', async () => {
        AsyncStorage.getItem.mockResolvedValue(null);

        renderComponent();

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Error', 'User token not found.');
        });
    });

    test('shows error alert if job fetch fails', async () => {
        AsyncStorage.getItem.mockResolvedValue('mock-token');
        axios.get.mockImplementation((url) => {
            if (url.includes('myJobs/get')) {
                return Promise.reject(new Error('Network error'));
            }
            return Promise.resolve({ data: [] }); // For notification endpoint
        });

        renderComponent();

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Error', 'Could not fetch jobs.');
        });
    });

    test('renders jobs for the selected tab', async () => {
        AsyncStorage.getItem.mockResolvedValue('mock-token');
        axios.get.mockImplementation((url) => {
            if (url.includes('myJobs/get')) {
                return Promise.resolve({
                    data: {
                        active: [
                            {
                                id: '1',
                                title: 'Active Job 1',
                                description: 'Job description 1',
                                price: 100,
                                professionalNeeded: 'Plumber',
                                timeline: 'Urgent',
                                createdAt: '2023-01-01'
                            },
                        ],
                        pending: [
                            {
                                id: '2',
                                title: 'Pending Job 1',
                                description: 'Job description 2',
                                price: 200,
                                professionalNeeded: 'Electrician',
                                timeline: 'Standard',
                                createdAt: '2023-01-02'
                            },
                        ],
                        done: [
                            {
                                id: '3',
                                title: 'Done Job 1',
                                description: 'Job description 3',
                                price: 300,
                                professionalNeeded: 'Carpenter',
                                timeline: 'Completed',
                                createdAt: '2023-01-03'
                            },
                        ],
                        amountEarned: 500,
                    },
                });
            }
            return Promise.resolve({ data: [] }); // For notification endpoint
        });

        const { getByText } = renderComponent();

        await waitFor(() => {
            expect(getByText('Active Job 1')).toBeTruthy();
        });

        fireEvent.press(getByText('Quote Sent'));

        await waitFor(() => {
            expect(getByText('Pending Job 1')).toBeTruthy();
        });

        fireEvent.press(getByText('Completed'));

        await waitFor(() => {
            expect(getByText('Done Job 1')).toBeTruthy();
        });
    });

    test('shows "No jobs available" when no jobs exist', async () => {
        AsyncStorage.getItem.mockResolvedValue('mock-token');
        axios.get.mockImplementation((url) => {
            if (url.includes('myJobs/get')) {
                return Promise.resolve({
                    data: {
                        active: [],
                        pending: [],
                        done: [],
                        amountEarned: 0,
                    },
                });
            }
            return Promise.resolve({ data: [] }); // For notification endpoint
        });

        const { getByText } = renderComponent();

        await waitFor(() => {
            expect(getByText('No jobs available')).toBeTruthy();
        });
    });
});