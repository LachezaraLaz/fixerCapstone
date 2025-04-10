import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import WelcomePage from '../welcomePage'; 
import { LanguageContext } from '../../../../context/LanguageContext';

// code to run only this file through the terminal:
// npm run test ./src/screens/welcome/__tests__/welcome.test.js
// or
// npm run test-coverage ./src/screens/welcome/__tests__/welcome.test.js

jest.mock('@react-native-async-storage/async-storage', () => ({
    __esModule: true,
    default: {
      setItem: jest.fn(),
      getItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    },
}));


const renderWithContext = (ui, { locale = 'en', setLocale = jest.fn() } = {}) => {
    return render(
      <LanguageContext.Provider value={{ locale, setLocale }}>
        {ui}
      </LanguageContext.Provider>
    );
  };
  

describe('WelcomePage Navigation', () => {
    test('navigates to SignInPage when the "Sign In" button is pressed', () => {
        const mockNavigation = { navigate: jest.fn() };
    
        const { getByText } = renderWithContext(<WelcomePage navigation={mockNavigation} />);
    
        const signInButton = getByText('Sign In'); // This works because 'en' is the locale
        fireEvent.press(signInButton);
    
        expect(mockNavigation.navigate).toHaveBeenCalledWith('SignInPage');
    });

    test('navigates to SignUpPage when the "Sign Up" button is pressed', () => {
        const mockNavigation = { navigate: jest.fn() };
    
        const { getByText } = renderWithContext(<WelcomePage navigation={mockNavigation} />);
    
        const signUpButton = getByText('Sign Up');
        fireEvent.press(signUpButton);
    
        expect(mockNavigation.navigate).toHaveBeenCalledWith('SignUpPage');
    });
    
    test('opens language modal when language button is pressed', () => {
        const { getByText } = renderWithContext(<WelcomePage navigation={{ navigate: jest.fn() }} />);
        
        const langButton = getByText('🌍 Change Language');
        fireEvent.press(langButton);
     });
});
