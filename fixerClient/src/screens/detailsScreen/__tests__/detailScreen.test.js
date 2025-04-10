import React from 'react';
import { render } from '@testing-library/react-native';
import DetailsScreen from '../detailsScreen';

// code to run only this file through the terminal:
// npm run test ./src/screens/detailsScreen/__tests__/detailScreen.test.js
// or
// npm run test-coverage ./src/screens/detailsScreen/__tests__/detailScreen.test.js

describe('DetailsScreen Component', () => {
    test('renders correctly with the expected text', () => {
        const { getByText } = render(<DetailsScreen />);

        // Check that the "Client Details Screen" text is displayed
        expect(getByText('Client Details Screen')).toBeTruthy();
    });
});
