import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import ReviewsPage from '../reviewsPage'; 
import axios from 'axios';

// code to run only this file through the terminal:
// npm run test ./src/screens/reviewsPage/__tests__/reviewsPage.test.js
// or
// npm run test-coverage ./src/screens/reviewsPage/__tests__/reviewsPage.test.js

jest.mock('axios');

describe('ReviewsPage Component', () => {
    const mockRoute = {
        params: {
        professionalEmail: 'johndoe@example.com',
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders loading indicator initially', () => {
        const { getByText } = render(<ReviewsPage route={mockRoute} />);
        expect(getByText('Loading...')).toBeTruthy();
    });

    test('renders no reviews message if no reviews are available', async () => {
        axios.get.mockResolvedValueOnce({ data: [] }); // Mock API response with no reviews

        const { getByText } = render(<ReviewsPage route={mockRoute} />);

        await waitFor(() => {
        expect(getByText('No reviews available.')).toBeTruthy();
        });
    });

    test('renders reviews correctly when available', async () => {
        const mockReviews = [
        {
            _id: '1',
            professionalNeeded: 'Electrician',
            description: 'Fixed electrical wiring.',
            rating: 5,
            comment: 'Excellent work!',
        },
        {
            _id: '2',
            professionalNeeded: 'Plumber',
            description: 'Repaired a leaking pipe.',
            rating: 4,
            comment: 'Great job overall.',
        },
        ];

        axios.get.mockResolvedValueOnce({ data: mockReviews }); // Mock API response with reviews

        const { getByText } = render(<ReviewsPage route={mockRoute} />);

        await waitFor(() => {
        // Check that each review is rendered correctly
        expect(getByText('Title: Electrician')).toBeTruthy();
        expect(getByText('Description: Fixed electrical wiring.')).toBeTruthy();
        expect(getByText('⭐ 5')).toBeTruthy();
        expect(getByText('Excellent work!')).toBeTruthy();

        expect(getByText('Title: Plumber')).toBeTruthy();
        expect(getByText('Description: Repaired a leaking pipe.')).toBeTruthy();
        expect(getByText('⭐ 4')).toBeTruthy();
        expect(getByText('Great job overall.')).toBeTruthy();
        });
    });   

    test('handles API errors gracefully', async () => {
        axios.get.mockRejectedValueOnce(new Error('Network error')); // Mock API error

        const { getByText } = render(<ReviewsPage route={mockRoute} />);

        await waitFor(() => {
        expect(getByText('Loading...')).toBeTruthy();
        });
    });
});
