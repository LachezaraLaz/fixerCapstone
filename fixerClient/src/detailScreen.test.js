import React from 'react';
import { render } from '@testing-library/react-native';
import DetailsScreen from './detailsScreen';

describe('DetailsScreen Component', () => {
    test('renders correctly with the expected text', () => {
        const { getByText } = render(<DetailsScreen />);

        // Check that the "Client Details Screen" text is displayed
        expect(getByText('Client Details Screen')).toBeTruthy();
    });
});
