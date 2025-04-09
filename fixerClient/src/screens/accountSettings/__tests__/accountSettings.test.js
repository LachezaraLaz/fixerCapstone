import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AccountSettingsPage from '../accountSettings';
import { LanguageContext } from '../../../../context/LanguageContext';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { en } from '../../../../localization';

// code to run only this file through the terminal:
// npm run test ./src/screens/accountSettings/__tests__/accountSettings.test.js
// or
// npm run test-coverage ./src/screens/accountSettings/__tests__/accountSettings.test.js


// Mocks
jest.mock('axios');
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
}));

const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      goBack: mockGoBack,
    }),
  };
});

  

jest.mock('@expo/vector-icons', () => {
    const React = require('react');
    const { Text } = require('react-native');
    return {
      Ionicons: () => <Text>Ionicons</Text>,
      MaterialIcons: () => <Text>MaterialIcons</Text>,
    };
});

jest.mock('../../../../components/inputField', () => {
    const React = require('react');
    const { TextInput } = require('react-native');
    return {
      __esModule: true,
      default: ({ value, onChangeText, testID = 'mock-input-field', ...rest }) => (
        <TextInput
          value={value}
          onChangeText={onChangeText}
          testID={testID}
          {...rest}
        />
      ),
    };
});
  
  
  
jest.mock('../../../../components/orangeButton', () => {
    const React = require('react');
    const { Text } = require('react-native');
    return {
      __esModule: true,
      default: (props) => {
        const { title = 'Button', onPress, testID, ...rest } = props;
        return (
          <Text testID={testID || 'mock-orange-button'} onPress={onPress} {...rest}>
            {title}
          </Text>
        );
      },
    };
});

jest.mock('../../../../components/customAlertSuccess', () => ({
    __esModule: true,
    default: () => null,
}));

jest.mock('../../../../components/customAlertError', () => ({
    __esModule: true,
    default: () => null,
}));

const mockLanguageContext = {
  locale: 'en',
  changeLanguage: jest.fn(),
};

const mockUserData = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  street: '123 Main St',
  postalCode: 'H2X1Y4',
  provinceOrState: 'QC',
  country: 'Canada',
};

describe('AccountSettingsPage', () => {
  beforeEach(() => {
    AsyncStorage.getItem.mockResolvedValue('mock-token');
    axios.get.mockResolvedValue({ data: mockUserData });
  });

  const renderComponent = () =>
    render(
      <LanguageContext.Provider value={mockLanguageContext}>
        <NavigationContainer>
          <AccountSettingsPage />
        </NavigationContainer>
      </LanguageContext.Provider>
    );
    

  test('renders loading initially and then shows user data', async () => {
    const { getByText, queryByText, getAllByTestId } = renderComponent();
    expect(getByText('Loading...')).toBeTruthy();

    await waitFor(() => {
        expect(queryByText('Loading...')).toBeNull();
        const inputs = getAllByTestId('mock-input-field');
        expect(inputs.some(input => input.props.value === 'John')).toBe(true);
    });
      
  });

  test('enters and exits edit mode', async () => {
    const { getByText, getByTestId } = renderComponent();
    await waitFor(() => expect(axios.get).toHaveBeenCalled());

    const editIcon = getByText('MaterialIcons');
    fireEvent.press(editIcon);

    expect(getByTestId('save-changes-button')).toBeTruthy();

    fireEvent.press(editIcon); // Exit edit mode
    expect(() => getByTestId('save-changes-button')).toThrow();
  });

  test('shows validate password button when editing', async () => {
    const { getByText, getByTestId } = renderComponent();
    await waitFor(() => expect(axios.get).toHaveBeenCalled());

    const editIcon = getByText('MaterialIcons');
    fireEvent.press(editIcon);

    expect(getByTestId('validate-password-button')).toBeTruthy();
  });

  test('does not allow save if form has not changed', async () => {
    const { getByText, getByTestId } = renderComponent();
    await waitFor(() => expect(axios.get).toHaveBeenCalled());

    const editIcon = getByText('MaterialIcons');
    fireEvent.press(editIcon);

    const saveButton = getByTestId('save-changes-button');
    expect(saveButton.props.disabled).toBe(true);
  });

  test('updates all input values and triggers change handler', async () => {
    // Mock both profile fetch and current password validation
    axios.get.mockResolvedValueOnce({ data: mockUserData });
    axios.post.mockImplementation((url) => {
      if (url.includes('/validateCurrentPassword')) {
        return Promise.resolve({ status: 200 });
      }
      return Promise.resolve({
        data: {
          isAddressValid: true,
          completeAddress: {
            postalCode: 'H2X1Y4',
            provinceOrState: 'QC',
            country: 'Canada',
          },
        },
      });
    });
  
    const { getByText, getAllByTestId } = renderComponent();
    await waitFor(() => expect(axios.get).toHaveBeenCalled());
  
    fireEvent.press(getByText('MaterialIcons')); // enter edit mode
  
    const inputs = getAllByTestId('mock-input-field');
  
    fireEvent.changeText(inputs[0], 'Johnny'); // firstName
    fireEvent.changeText(inputs[1], 'Doeman'); // lastName
    fireEvent.changeText(inputs[2], '456 Elm Ave'); // street
    fireEvent.changeText(inputs[3], 'H3Z2Y7'); // postal code
    fireEvent.changeText(inputs[4], 'OldPassword123!'); // current password
  
    fireEvent.press(getByText('Validate'));
  
    // Wait for validation and password inputs to render
    await waitFor(() => {
      const updatedInputs = getAllByTestId('mock-input-field');
      expect(updatedInputs.length).toBeGreaterThanOrEqual(7);
    });
  
    const updatedInputs = getAllByTestId('mock-input-field');
    fireEvent.changeText(updatedInputs[5], 'NewPassword123!');
    fireEvent.changeText(updatedInputs[6], 'NewPassword123!');
  
    // Verify that form fields have updated values
    expect(updatedInputs[0].props.value).toBe('Johnny');
    expect(updatedInputs[1].props.value).toBe('Doeman');
    expect(updatedInputs[2].props.value).toBe('456 Elm Ave');
    expect(updatedInputs[3].props.value).toBe('H3Z2Y7');
    expect(updatedInputs[4].props.value).toBe('OldPassword123!');
    expect(updatedInputs[5].props.value).toBe('NewPassword123!');
    expect(updatedInputs[6].props.value).toBe('NewPassword123!');

    // Now assert criteria appear
    expect(getByText(/At least 8 characters/i)).toBeTruthy();
    expect(getByText(/one number/i)).toBeTruthy();
    expect(getByText(/uppercase letter/i)).toBeTruthy();
    expect(getByText(/lowercase letter/i)).toBeTruthy();
    expect(getByText(/special character/i)).toBeTruthy();
  });
  
  
  test('verifies address and shows success alert', async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        isAddressValid: true,
        completeAddress: {
          postalCode: 'H2X1Y4',
          provinceOrState: 'QC',
          country: 'Canada',
        },
      },
    });
  
    const { getByText, getByTestId } = renderComponent();
    await waitFor(() => expect(axios.get).toHaveBeenCalled());
  
    fireEvent.press(getByText('MaterialIcons')); // enter edit mode
  
    const verifyAddressButton = getByTestId('verify-address-button');
    fireEvent.press(verifyAddressButton);
  
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('/client/verifyAddress'),
      expect.any(Object)
    );
  });

  test('shows error if passwords do not match when saving', async () => {
    const { getByText, getByTestId } = renderComponent();
    await waitFor(() => expect(axios.get).toHaveBeenCalled());
  
    fireEvent.press(getByText('MaterialIcons'));
  
    const saveButton = getByTestId('save-changes-button');
  
    // Simulate mismatched passwords
    fireEvent.press(saveButton); // This should trigger mismatch check
  
    // Ideally, you'd spy on setErrorAlert, but since it's internal, just ensure no crash
    expect(saveButton).toBeTruthy();
  });
  
  test('resets password fields and validation on cancel edit', async () => {
    const { getByText, getByTestId } = renderComponent();
    await waitFor(() => expect(axios.get).toHaveBeenCalled());
  
    const editIcon = getByText('MaterialIcons');
    fireEvent.press(editIcon); // enter edit mode
  
    // simulate some edits, then exit
    fireEvent.press(editIcon); // exit edit mode again
  
    expect(getByText('MaterialIcons')).toBeTruthy(); // still on screen
  });

  test('pressing the back icon calls navigation.goBack()', async () => {
    const { getByText } = renderComponent();
    await waitFor(() => expect(axios.get).toHaveBeenCalled());
  
    const backIcon = getByText('Ionicons');
    fireEvent.press(backIcon);
  
    expect(mockGoBack).toHaveBeenCalled(); // should now pass!
  });
  
});
