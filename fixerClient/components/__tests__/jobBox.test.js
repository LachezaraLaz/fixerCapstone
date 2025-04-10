import React from 'react';
import { render, fireEvent} from '@testing-library/react-native';
import JobBox from '../JobBox';

// code to run only this file through the terminal:
// npm run test ./components/__tests__/jobBox.test.js
// or
// npm run test-coverage ./components/__tests__/jobBox.test.js

describe('JobBox Component', () => {
    const mockJob = {
        title: 'Plumbing Work',
        professionalNeeded: 'Plumber',
        rating: 4.5,
        imageUrl: 'https://example.com/job-image.jpg',
        price: 150,
    };

    it('renders correctly with job details', () => {
        const { getByText, getByTestId } = render(<JobBox job={mockJob} />);

        expect(getByText(mockJob.title)).toBeTruthy();
        expect(getByText(`📍 ${mockJob.professionalNeeded}`)).toBeTruthy();
        expect(getByText(`⭐ ${mockJob.rating} `)).toBeTruthy();
        expect(getByText(`$${mockJob.price}`)).toBeTruthy();
    });

    it('renders a placeholder image if no imageUrl is provided', () => {
        const jobWithoutImage = { ...mockJob, imageUrl: null };
        const { getByTestId } = render(<JobBox job={jobWithoutImage} />);
        const image = getByTestId('job-image');

        expect(image.props.source.uri).toBe('https://via.placeholder.com/100');
    });

    it('renders "N/A" when rating is not provided', () => {
        const jobWithoutRating = { ...mockJob, rating: null };
        const { getByText } = render(<JobBox job={jobWithoutRating} />);

        expect(getByText('⭐ N/A ')).toBeTruthy();
    });

    it('renders price correctly in bottom-right container', () => {
        const { getByText } = render(<JobBox job={mockJob} />);

        expect(getByText(`$${mockJob.price}`)).toBeTruthy();
    });

    it('renders correctly without professionalNeeded field', () => {
        const jobWithoutProfessional = { ...mockJob, professionalNeeded: null };
        const { getByText } = render(<JobBox job={jobWithoutProfessional} />);

        expect(getByText('📍')).toBeTruthy();
    });

    it('renders correctly with minimal job details', () => {
        const minimalJob = {
            title: 'Basic Job',
            price: 100,
        };
        const { getByText } = render(<JobBox job={minimalJob} />);

        expect(getByText(minimalJob.title)).toBeTruthy();
        expect(getByText(`$${minimalJob.price}`)).toBeTruthy();
    });

    it('navigates to IssueDetails on press with correct jobId', () => {
        const mockNavigate = jest.fn();
        const mockNavigation = { navigate: mockNavigate };
        const jobWithId = { ...mockJob, id: 'job123' };
      
        const { getByText } = render(<JobBox job={jobWithId} navigation={mockNavigation} />);
      
        fireEvent.press(getByText(jobWithId.title)); // or wrap Touchable with a testID if preferred
      
        expect(mockNavigate).toHaveBeenCalledWith('IssueDetails', { jobId: 'job123' });
    });
});
