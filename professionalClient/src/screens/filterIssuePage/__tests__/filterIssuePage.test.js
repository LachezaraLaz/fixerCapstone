/*
 * __tests__/filterIssuePage.test.js
 *
 * Unit tests for <FilterIssuePage />. Follows the same conventions as
 * credentialFormPage.test.js so it plays nicely with the current Jest setup.
 *
 * Run a single test file via:
 *   npm run test ./src/screens/filterIssuePage/__tests__/filterIssuePage.test.js
 * or with coverage:
 *   npm run test-coverage ./src/screens/filterIssuePage/__tests__/filterIssuePage.test.js
 */

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import FilterIssuePage from '../filterIssuePage';

// ---------- mocks ----------

// Async mocks for react‑navigation props (navigate / goBack)
const mockNavigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),
};

const mockRoute = {
    params: {
        typesOfWork: ['Plumbing', 'Electrician', 'Handyman'],
        selectedFilters: [],
        distanceRange: [0, 50],
        rating: 0,
        timeline: '',
    },
};

// Mock @react-navigation/native to inject our mockNavigation when useNavigation is used.
jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual('@react-navigation/native');
    return {
        ...actualNav,
        useNavigation: () => mockNavigation,
    };
});

jest.mock('@react-native-community/slider', () => {
    const React = require('react');
    const { View } = require('react-native');

    /**
     * Very small mock: renders a <View> that carries the `testID`
     * so RTL can query it, and calls `onValueChange` when we fire
     * the synthetic change event in tests.
     */
    const SliderMock = ({
                            value = 0,
                            onValueChange = () => {},
                            testID = 'mock-slider',
                        }) => (
        <View
            testID={testID}
            accessibilityLabel={`slider-${value}`}
            onChange={e => onValueChange(Number(e?.nativeEvent?.text) || value)}
        />
    );

    return { __esModule: true, default: SliderMock };
});


// Mock DropDownPicker with a simple select element
jest.mock('react-native-dropdown-picker', () => {
    const React = require('react');
    return ({ value, setValue, items, testID = 'mock-dropdown' }) => (
        <select
            data-testid={testID}
            value={value}
            onChange={(e) => setValue(() => e.target.value)}
        >
            {items.map((opt) => (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
    );
});

// mock Ionicons so the icon name appears in the render tree
jest.mock('react-native-vector-icons/Ionicons', () => {
    const React = require('react');
    const { Text } = require('react-native');

    const IconMock = ({ name, testID, ...rest }) => (
        <Text
            accessibilityLabel={name}
            testID={testID || name}
            {...rest}
        >
            {name}
        </Text>
    );

    return { __esModule: true, default: IconMock };
});

// ---------- helper ----------
const renderComponent = () =>
    render(<FilterIssuePage navigation={mockNavigation} route={mockRoute} />);

// ---------- tests ----------

describe('<FilterIssuePage />', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the expected static texts', () => {
        const { getByText } = renderComponent();

        expect(getByText('Filters')).toBeTruthy();
        expect(getByText('Distance Range (km)')).toBeTruthy();
        expect(getByText('Urgency Timeline')).toBeTruthy();
        expect(getByText('Rating')).toBeTruthy();
    });

    it('allows selecting a work‑type filter and applies it', async () => {
        const { getByText } = renderComponent();

        // Select Plumbing filter
        const plumbingButton = getByText('Plumbing');
        fireEvent.press(plumbingButton);

        // Press Apply button
        fireEvent.press(getByText(/Apply The Filter/));

        await waitFor(() => {
            expect(mockNavigation.navigate).toHaveBeenCalledWith('MainTabs', {
                screen: 'Home',
                params: expect.objectContaining({ selectedFilters: ['Plumbing'] }),
            });
        });
    });

    it('updates rating when a star is tapped', () => {
        const { getAllByText, getByText } = renderComponent();

        // all five icons have accessibilityLabel = "star-outline"
        const firstStar = getAllByText('star-outline');
        fireEvent.press(firstStar[0]);

        fireEvent.press(getByText(/Apply The Filter/));

        expect(mockNavigation.navigate).toHaveBeenCalledWith('MainTabs', {
            screen: 'Home',
            params: expect.objectContaining({ rating: 1 }),
        });
    });

    it('handles slider change', () => {
        const { getByTestId } = renderComponent();
        const slider = getByTestId('mock-slider');

        act(() => {
            fireEvent(slider, 'valueChange', 25);
        });
    });
});

