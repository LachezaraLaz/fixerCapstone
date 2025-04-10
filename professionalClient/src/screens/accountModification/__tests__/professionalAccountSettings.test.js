import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import ProfessionalAccountSettingsPage from '../professionalAccountSettings';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';

// code to run only this file through the terminal:
// npm run test ./src/screens/accountModification/__tests__/professionalAccountSettings.test.js
// or
// npm run test-coverage ./src/screens/accountModification/__tests__/professionalAccountSettings.test.js

// Mock the necessary modules
jest.mock('axios');
jest.mock('@react-native-async-storage/async-storage');
jest.mock('@react-navigation/native', () => {
    return {
        ...jest.requireActual('@react-navigation/native'),
        useNavigation: () => ({
            goBack: jest.fn(),
        }),
    };
});

jest.mock('@react-native-async-storage/async-storage', () => ({
    __esModule: true,
    default: {
        setItem: jest.fn(),
        getItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
    },
}));

// Mock the custom components
jest.mock('../../../../components/customAlertSuccess', () => 'CustomAlertSuccess');
jest.mock('../../../../components/customAlertError', () => 'CustomAlertError');
jest.mock('../../../../components/orangeButton', () => {
    return ({ onPress, title, testID, disabled }) => (
        <button
            testID={testID}
            onClick={onPress}
            disabled={disabled}
            data-title={title}
        >
            {title}
        </button>
    );
});
jest.mock('../../../../components/inputField', () => {
    return ({ value, onChangeText, secureTextEntry, disabled, testID, showFloatingLabel }) => (
        <input
            testID={testID}
            value={value}
            onChange={(e) => onChangeText(e.target.value)}
            type={secureTextEntry ? 'password' : 'text'}
            disabled={disabled}
            data-floating={showFloatingLabel}
        />
    );
});

// Mock Ionicons and MaterialIcons
jest.mock('@expo/vector-icons', () => ({
    Ionicons: 'Ionicons',
    MaterialIcons: 'MaterialIcons',
}));

describe('ProfessionalAccountSettingsPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        // Setup AsyncStorage mock
        AsyncStorage.getItem.mockResolvedValue('fake-token');

        // Setup default axios response for profile data
        axios.get.mockResolvedValue({
            status: 200,
            data: {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
            },
        });
    });

    test('renders correctly with loading state', () => {
        const { getByText } = render(
            <NavigationContainer>
                <ProfessionalAccountSettingsPage />
            </NavigationContainer>
        );

        expect(getByText('Loading...')).toBeTruthy();
    });

    test('loads and displays user profile data correctly', async () => {
        const { UNSAFE_getAllByType, queryAllByText } = render(
            <NavigationContainer>
                <ProfessionalAccountSettingsPage />
            </NavigationContainer>
        );

        // Wait for the data to load
        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledWith(
                'https://fixercapstone-production.up.railway.app/professional/profile',
                { headers: { Authorization: 'Bearer fake-token' } }
            );
        });

        // First wait for loading to disappear
        await waitFor(() => {
            expect(queryAllByText('Loading...').length).toBe(0);
        });

        // Check that form data was loaded
        await waitFor(() => {
            // We'll use UNSAFE_getAllByType to find all input elements
            const inputs = UNSAFE_getAllByType('input');

            // Verify we have enough inputs
            expect(inputs.length).toBeGreaterThanOrEqual(3);

            // Find inputs with the expected values
            const johnInput = inputs.find(input => input.props.value === 'John');
            const doeInput = inputs.find(input => input.props.value === 'Doe');

            expect(johnInput).toBeTruthy();
            expect(doeInput).toBeTruthy();
        });
    });

    test('handles edit mode toggle correctly', async () => {
        const { UNSAFE_getByType, UNSAFE_getAllByType, queryAllByText } = render(
            <NavigationContainer>
                <ProfessionalAccountSettingsPage />
            </NavigationContainer>
        );

        // Wait for data to load
        await waitFor(() => {
            expect(axios.get).toHaveBeenCalled();
        });

        // Wait for loading to disappear
        await waitFor(() => {
            expect(queryAllByText('Loading...').length).toBe(0);
        });

        // Initially fields should be disabled
        const inputs = UNSAFE_getAllByType('input');
        expect(inputs[0].props.disabled).toBeTruthy();

        // Find the edit button by MaterialIcons type
        const editIcon = UNSAFE_getByType('MaterialIcons');
        fireEvent.press(editIcon);

        // After toggling, inputs should be enabled
        await waitFor(() => {
            const updatedInputs = UNSAFE_getAllByType('input');
            expect(updatedInputs[0].props.disabled).toBeFalsy();
        });
    });

    test('validates current password correctly', async () => {
        // Mock successful password validation
        axios.post.mockResolvedValueOnce({
            status: 200,
            data: { message: 'Password validated' },
        });

        const { getByTestId, UNSAFE_getByType, UNSAFE_getAllByType, queryAllByText } = render(
            <NavigationContainer>
                <ProfessionalAccountSettingsPage />
            </NavigationContainer>
        );

        // Wait for data to load
        await waitFor(() => {
            expect(axios.get).toHaveBeenCalled();
        });

        // Wait for loading to disappear
        await waitFor(() => {
            expect(queryAllByText('Loading...').length).toBe(0);
        });

        // Enable edit mode
        const editIcon = UNSAFE_getByType('MaterialIcons');
        fireEvent.press(editIcon);

        // Get all password inputs
        const inputs = UNSAFE_getAllByType('input');
        const passwordInputs = inputs.filter(input => input.props.type === 'password');

        // Enter current password
        fireEvent.changeText(passwordInputs[0], 'currentPassword123');

        // Click validate button using testID
        const validateButton = getByTestId('validate-password-button');
        fireEvent.press(validateButton);

        // Check that the API call was made with correct parameters
        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith(
                'https://fixercapstone-production.up.railway.app/professional/reset/validateCurrentPassword',
                {
                    email: 'john.doe@example.com',
                    currentPassword: 'currentPassword123',
                },
                { headers: { Authorization: 'Bearer fake-token' } }
            );
        });
    });

    test('shows password criteria feedback', async () => {
        const { getByTestId, UNSAFE_getByType, UNSAFE_getAllByType, queryAllByText, getByText } = render(
            <NavigationContainer>
                <ProfessionalAccountSettingsPage />
            </NavigationContainer>
        );

        // Wait for data to load
        await waitFor(() => {
            expect(axios.get).toHaveBeenCalled();
        });

        // Wait for loading to disappear
        await waitFor(() => {
            expect(queryAllByText('Loading...').length).toBe(0);
        });

        // Enable edit mode
        const editIcon = UNSAFE_getByType('MaterialIcons');
        fireEvent.press(editIcon);

        // Mock successful password validation
        axios.post.mockResolvedValueOnce({
            status: 200,
            data: { message: 'Password validated' },
        });

        // Enter and validate current password
        const inputs = UNSAFE_getAllByType('input');
        const passwordInputs = inputs.filter(input => input.props.type === 'password');
        fireEvent.changeText(passwordInputs[0], 'currentPassword123');
        fireEvent.press(getByTestId('validate-password-button'));

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalled();
        });

        // Enter new password and check criteria
        const updatedInputs = UNSAFE_getAllByType('input');
        const newPasswordInputs = updatedInputs.filter(input => input.props.type === 'password');
        fireEvent.changeText(newPasswordInputs[1], 'P@ssw0rd');

        // Check that criteria are shown and properly evaluated
        await waitFor(() => {
            expect(getByText('✓ At least 8 characters')).toBeTruthy();
            expect(getByText('✓ At least one number')).toBeTruthy();
            expect(getByText('✓ At least one uppercase letter')).toBeTruthy();
            expect(getByText('✓ At least one lowercase letter')).toBeTruthy();
            expect(getByText('✓ At least one special character')).toBeTruthy();
        });
    });

    test('validates matching passwords', async () => {
        const { getByTestId, getByText, UNSAFE_getByType, UNSAFE_getAllByType, queryAllByText } = render(
            <NavigationContainer>
                <ProfessionalAccountSettingsPage />
            </NavigationContainer>
        );

        // Wait for data to load
        await waitFor(() => {
            expect(axios.get).toHaveBeenCalled();
        });

        // Wait for loading to disappear
        await waitFor(() => {
            expect(queryAllByText('Loading...').length).toBe(0);
        });

        // Enable edit mode
        const editIcon = UNSAFE_getByType('MaterialIcons');
        fireEvent.press(editIcon);

        // Mock successful password validation
        axios.post.mockResolvedValueOnce({
            status: 200,
            data: { message: 'Password validated' },
        });

        // Enter and validate current password
        const inputs = UNSAFE_getAllByType('input');
        const passwordInputs = inputs.filter(input => input.props.type === 'password');
        fireEvent.changeText(passwordInputs[0], 'currentPassword123');
        fireEvent.press(getByTestId('validate-password-button'));

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalled();
        });

        // Enter matching passwords
        const updatedInputs = UNSAFE_getAllByType('input');
        const newPasswordInputs = updatedInputs.filter(input => input.props.type === 'password');
        fireEvent.changeText(newPasswordInputs[1], 'P@ssw0rd');
        fireEvent.changeText(newPasswordInputs[2], 'P@ssw0rd');

        // Check for matching passwords message
        await waitFor(() => {
            expect(getByText('Passwords match ✓')).toBeTruthy();
        });

        // Test mismatched passwords
        fireEvent.changeText(newPasswordInputs[2], 'DifferentP@ss');

        await waitFor(() => {
            expect(getByText('Passwords don\'t match ✗')).toBeTruthy();
        });
    });

    test('handles save changes correctly', async () => {
        // Mock successful update API call
        axios.put.mockResolvedValueOnce({
            status: 200,
            data: { message: 'Profile updated successfully' },
        });

        axios.post.mockResolvedValueOnce({
            status: 200,
            data: { message: 'Password validated' },
        }).mockResolvedValueOnce({
            status: 200,
            data: { message: 'Password updated successfully' },
        });

        const { getByTestId, getByText, UNSAFE_getByType, UNSAFE_getAllByType, queryAllByText } = render(
            <NavigationContainer>
                <ProfessionalAccountSettingsPage />
            </NavigationContainer>
        );

        // Wait for data to load
        await waitFor(() => {
            expect(axios.get).toHaveBeenCalled();
        });

        // Wait for loading to disappear
        await waitFor(() => {
            expect(queryAllByText('Loading...').length).toBe(0);
        });

        // Enable edit mode
        const editIcon = UNSAFE_getByType('MaterialIcons');
        fireEvent.press(editIcon);

        // Update first name
        const inputs = UNSAFE_getAllByType('input');
        const textInputs = inputs.filter(input => input.props.type === 'text');
        fireEvent.changeText(textInputs[0], 'Jane');

        // Enter and validate current password
        const passwordInputs = inputs.filter(input => input.props.type === 'password');
        fireEvent.changeText(passwordInputs[0], 'currentPassword123');
        fireEvent.press(getByTestId('validate-password-button'));

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledTimes(1);
        });

        // Enter new password and confirm
        const updatedInputs = UNSAFE_getAllByType('input');
        const newPasswordInputs = updatedInputs.filter(input => input.props.type === 'password');
        fireEvent.changeText(newPasswordInputs[1], 'NewP@ssw0rd');
        fireEvent.changeText(newPasswordInputs[2], 'NewP@ssw0rd');

        // Click save changes
        const saveButton = getByTestId('save-changes-button');
        fireEvent.press(saveButton);

        // Check that profile update API was called
        await waitFor(() => {
            expect(axios.put).toHaveBeenCalledWith(
                'https://fixercapstone-production.up.railway.app/professional/updateProfessionalProfile',
                {
                    firstName: 'Jane',
                    lastName: 'Doe',
                },
                { headers: { Authorization: 'Bearer fake-token' } }
            );

            // Check that password update API was called
            expect(axios.post).toHaveBeenCalledWith(
                'https://fixercapstone-production.up.railway.app/professional/reset/updatePasswordWithOld',
                {
                    email: 'john.doe@example.com',
                    currentPassword: 'currentPassword123',
                    newPassword: 'NewP@ssw0rd',
                },
                { headers: { Authorization: 'Bearer fake-token' } }
            );
        });
    });

    test('handles error scenarios correctly', async () => {
        // Mock failed password validation
        axios.post.mockRejectedValueOnce({
            response: { data: { error: 'Invalid current password' } }
        });

        const { getByTestId, UNSAFE_getByType, UNSAFE_getAllByType, queryAllByText } = render(
            <NavigationContainer>
                <ProfessionalAccountSettingsPage />
            </NavigationContainer>
        );

        // Wait for data to load
        await waitFor(() => {
            expect(axios.get).toHaveBeenCalled();
        });

        // Wait for loading to disappear
        await waitFor(() => {
            expect(queryAllByText('Loading...').length).toBe(0);
        });

        // Enable edit mode
        const editIcon = UNSAFE_getByType('MaterialIcons');
        fireEvent.press(editIcon);

        // Enter current password
        const inputs = UNSAFE_getAllByType('input');
        const passwordInputs = inputs.filter(input => input.props.type === 'password');
        fireEvent.changeText(passwordInputs[0], 'wrongPassword');

        // Click validate button
        const validateButton = getByTestId('validate-password-button');
        fireEvent.press(validateButton);

        // Check that the error alert props are set
        await waitFor(() => {
            expect(axios.post).toHaveBeenCalled();
            // This would check the props passed to the CustomAlertError component
            // In a real scenario, you would check the rendered alert text
        });
    });


    test('disables save button when no changes are made', async () => {
        const { getByTestId, UNSAFE_getByType, queryAllByText } = render(
            <NavigationContainer>
                <ProfessionalAccountSettingsPage />
            </NavigationContainer>
        );

        // Wait for data to load
        await waitFor(() => {
            expect(axios.get).toHaveBeenCalled();
        });

        // Wait for loading to disappear
        await waitFor(() => {
            expect(queryAllByText('Loading...').length).toBe(0);
        });

        // Enable edit mode
        const editIcon = UNSAFE_getByType('MaterialIcons');
        fireEvent.press(editIcon);

        // Check if Save Changes button exists and is disabled
        await waitFor(() => {
            const saveButton = getByTestId('save-changes-button');
            expect(saveButton.props.disabled).toBeTruthy();
        });
    });
    test('handles token missing scenario', async () => {
        // Mock missing token
        AsyncStorage.getItem.mockResolvedValueOnce(null);

        const { queryAllByText } = render(
            <NavigationContainer>
                <ProfessionalAccountSettingsPage />
            </NavigationContainer>
        );

        // Check that error state is set correctly
        await waitFor(() => {
            // In a real test, you would verify the error alert is shown
            // This is a bit tricky since we've mocked the components
            expect(AsyncStorage.getItem).toHaveBeenCalledWith('token');
            expect(queryAllByText('Loading...').length).toBe(0);
        });
    });

    test('handles network error scenario', async () => {
        // Mock network error
        axios.get.mockRejectedValueOnce(new Error('Network Error'));

        const { queryAllByText } = render(
            <NavigationContainer>
                <ProfessionalAccountSettingsPage />
            </NavigationContainer>
        );

        // Check that error state is set correctly
        await waitFor(() => {
            expect(axios.get).toHaveBeenCalled();
            // Would check for error alert in a real test
            expect(queryAllByText('Loading...').length).toBe(0);
        });
    });
});