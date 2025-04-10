// __tests__/issueDetailScreen.test.js

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import IssueDetailScreen from '../issueDetailScreen';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as geoUtils from '../../../../utils/geoCoding_utils';
import { Animated } from 'react-native';

// ─── Mocks ──────────────────────────────────────────────

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual('@react-navigation/native');
    return {
        ...actualNav,
        useNavigation: jest.fn(),
    };
});

jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn(),
}));

jest.mock('axios');
jest.mock('../../../../utils/geoCoding_utils', () => ({
    getAddressFromCoords: jest.fn(),
}));

// Silence logs
jest.spyOn(global.console, 'error').mockImplementation(() => {});

// ─── Sample Props ───────────────────────────────────────

const mockNavigate = jest.fn();
const mockOnClose = jest.fn();

const fakeIssue = {
    _id: '123',
    title: 'Broken faucet',
    description: 'Needs urgent repair',
    professionalNeeded: 'Plumber',
    createdAt: '2024-04-10T10:00:00Z',
    timeline: 'high-priority',
    latitude: 37.7749,
    longitude: -122.4194,
    imageUrl: 'https://via.placeholder.com/150',
    firstName: 'John',
    lastName: 'Doe',
    userEmail: 'client@example.com',
};

const fakeIssuesList = [fakeIssue];

jest.useFakeTimers();

// ─── Tests ───────────────────────────────────────────────

describe('<IssueDetailScreen />', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        jest.spyOn(Animated, 'timing').mockReturnValue({
            start: (cb) => cb && cb(),
        });

        useNavigation.mockReturnValue({ navigate: mockNavigate });

        AsyncStorage.getItem.mockImplementation(async (key) =>
            key === 'userId' ? 'user-123' : key === 'token' ? 'fake-token' : null
        );

        geoUtils.getAddressFromCoords.mockResolvedValue('123 Test St, Test City');

        axios.get.mockResolvedValue({ data: { bankingInfoAdded: true } });
    });

    it('renders title and description', async () => {
        const { getByText } = render(
            <IssueDetailScreen issue={fakeIssue} issues={fakeIssuesList} onClose={mockOnClose} />
        );

        await waitFor(() => {
            expect(getByText('Broken faucet')).toBeTruthy();
            expect(getByText('Needs urgent repair')).toBeTruthy();
        });
    });

    it('renders address once geocoding finishes', async () => {
        const { getByText } = render(
            <IssueDetailScreen issue={fakeIssue} issues={fakeIssuesList} onClose={mockOnClose} />
        );

        await waitFor(() => {
            expect(getByText('123 Test St, Test City')).toBeTruthy();
        });
    });

    it('opens and closes image modal', async () => {
        const { getByTestId, queryByTestId } = render(
            <IssueDetailScreen issue={fakeIssue} issues={fakeIssuesList} onClose={mockOnClose} />
        );

        const image = getByTestId('image-touchable');
        fireEvent.press(image);

        await waitFor(() => {
            expect(getByTestId('image-modal')).toBeTruthy();
        });

        await act(async () => {
            fireEvent.press(getByTestId('image-modal-close'));
        });
    });

    it('calls navigation when quote button is pressed (with banking info)', async () => {
        // Mock the animation timing to complete immediately
        const mockAnimationStart = jest.fn((cb) => cb && cb());
        Animated.timing.mockReturnValue({ start: mockAnimationStart });

        const { getByText } = render(
            <IssueDetailScreen issue={fakeIssue} issues={fakeIssuesList} onClose={mockOnClose} />
        );

        // Wait for any initial async operations
        await waitFor(() => {
            expect(getByText('Send Quote')).toBeTruthy();
        });

        // Press the button
        fireEvent.press(getByText('Send Quote'));

        // Wait for the navigation to be called
        await waitFor(() => {
            expect(mockAnimationStart).toHaveBeenCalled();
            expect(mockNavigate).toHaveBeenCalledWith('ContractOffer', { issue: fakeIssue });
        });
    });

    it('shows alert when no banking info is added', async () => {
        axios.get.mockResolvedValueOnce({ data: { bankingInfoAdded: false } });

        const { getByText, queryByText } = render(
            <IssueDetailScreen issue={fakeIssue} issues={fakeIssuesList} onClose={mockOnClose} />
        );

        await waitFor(() => {
            expect(queryByText('Send Quote')).toBeTruthy();
        });

        fireEvent.press(getByText('Send Quote'));

        await waitFor(() => {
            expect(getByText('Payment Method Required')).toBeTruthy();
            expect(
                getByText('Cannot use this feature until a payment method has been added.')
            ).toBeTruthy();
        });
    });

    it('calls onClose when close button is pressed', () => {
        const { getByTestId } = render(
            <IssueDetailScreen issue={fakeIssue} issues={fakeIssuesList} onClose={mockOnClose} />
        );

        fireEvent.press(getByTestId('close-button'));
        expect(mockOnClose).toHaveBeenCalled();
    });
});
