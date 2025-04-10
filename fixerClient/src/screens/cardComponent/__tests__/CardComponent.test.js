import React from 'react';
import { render } from '@testing-library/react-native';
import CardComponent from '../CardComponent';

// code to run only this file through the terminal:
// npm run test ./src/screens/cardComponent/__tests__/cardComponent.test.js
// or
// npm run test-coverage ./src/screens/cardComponent/__tests__/cardComponent.test.js

describe('CardComponent', () => {
    const defaultProps = {
        title: 'Test Task',
        status: 'In Progress',
        professionalName: 'John Doe',
        imageUri: 'https://via.placeholder.com/50',
    };

    test('renders the title and status correctly', () => {
        const { getByText } = render(<CardComponent {...defaultProps} />);

        // Check the title
        expect(getByText('Test Task')).toBeTruthy();

        // Check the status
        expect(getByText('In Progress')).toBeTruthy();
    });

    test('applies correct styles for status', () => {
        const { getByText } = render(<CardComponent {...defaultProps} status="Overdue" />);

        // Check the status style for "Overdue"
        const statusElement = getByText('Overdue');
        expect(statusElement.props.style).toContainEqual({ color: 'red' });

        const { getByText: getByTextGreen } = render(<CardComponent {...defaultProps} status="In Progress" />);
        const statusGreenElement = getByTextGreen('In Progress');
        expect(statusGreenElement.props.style).toContainEqual({ color: 'green' });
    });

    test('does not render image when imageUri is not provided', () => {
        const { queryByTestId } = render(
            <CardComponent {...defaultProps} imageUri={null} />
        );

        expect(queryByTestId('professional-image')).toBeNull();
    });

    test('does not render professional details when showProfessional is false', () => {
        const { queryByText, queryByRole } = render(<CardComponent {...defaultProps} showProfessional={false} />);

        // Professional details should not be present
        expect(queryByText('By: John Doe')).toBeNull();
        expect(queryByRole('image')).toBeNull();
    });

    test('renders progress steps when showProgress is true', () => {
        const { getByText } = render(<CardComponent {...defaultProps} showProgress={true} />);

        // Check all progress steps
        ['Open', 'Quote', 'Accept', 'Doing', 'Finish'].forEach((step) => {
            expect(getByText(step)).toBeTruthy();
        });
    });

    test('does not render progress steps when showProgress is false', () => {
        const { queryByText } = render(<CardComponent {...defaultProps} showProgress={false} />);

        // Progress steps should not be present
        ['Open', 'Quote', 'Accept', 'Doing', 'Finish'].forEach((step) => {
            expect(queryByText(step)).toBeNull();
        });
    });
});
