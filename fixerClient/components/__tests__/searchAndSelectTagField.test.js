import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ProfessionalSelector from '../searchAndSelectTagField';

// code to run only this file through the terminal:
// npm run test ./components/__tests__/searchAndSelectTagField.test.js
// or
// npm run test-coverage ./components/__tests__/searchAndSelectTagField.test.js

describe('ProfessionalSelector', () => {
  let selectedProfessionals = [];
  let setSelectedProfessionals;

  beforeEach(() => {
    selectedProfessionals = [];
    setSelectedProfessionals = jest.fn((val) => {
      selectedProfessionals = val;
    });
  });

  const renderComponent = (selected = []) =>
    render(
      <ProfessionalSelector
        selectedProfessionals={selected}
        setSelectedProfessionals={setSelectedProfessionals}
      />
    );

  test('renders input field', () => {
    const { getByPlaceholderText } = renderComponent();
    expect(getByPlaceholderText('Type a professional (e.g. Plumber)')).toBeTruthy();
  });

  test('filters suggestions based on input', () => {
    const { getByPlaceholderText, getByText } = renderComponent();

    fireEvent.changeText(getByPlaceholderText(/type a professional/i), 'plu');

    expect(getByText('Plumber')).toBeTruthy();
  });

  test('selects a suggestion and calls setSelectedProfessionals', () => {
    const { getByPlaceholderText, getByText } = renderComponent();

    fireEvent.changeText(getByPlaceholderText(/type a professional/i), 'pain');
    fireEvent.press(getByText('Painter'));

    expect(setSelectedProfessionals).toHaveBeenCalledWith(['Painter']);
  });

  test('does not allow more than 2 selected professionals', () => {
    const selected = ['Plumber', 'Painter'];
    const { getByPlaceholderText } = renderComponent(selected);

    const input = getByPlaceholderText(/type a professional/i);

    expect(input.props.editable).toBe(false); // Input is disabled when 2 are selected
  });

  test('removes a selected badge when ✕ is pressed', () => {
    const selected = ['Plumber'];
    const { getByText } = render(
      <ProfessionalSelector
        selectedProfessionals={selected}
        setSelectedProfessionals={setSelectedProfessionals}
      />
    );

    fireEvent.press(getByText('✕'));

    expect(setSelectedProfessionals).toHaveBeenCalledWith([]);
  });

  test('does not show suggestions if input is empty', () => {
    const { queryByText } = renderComponent();
    expect(queryByText('Plumber')).toBeNull();
  });
});
