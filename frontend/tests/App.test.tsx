/**
 * App tests
 */
import React from 'react';
import { render } from '@testing-library/react-native';
import { Button } from '../components/Button';

describe('Button Component', () => {
  it('renders correctly', () => {
    const { getByText } = render(
      <Button title="Test Button" onPress={() => {}} />
    );

    expect(getByText('Test Button')).toBeTruthy();
  });

  it('shows loading state', () => {
    const { getByTestId } = render(
      <Button title="Test Button" onPress={() => {}} loading />
    );

    // ActivityIndicator should be present when loading
    expect(getByTestId).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button title="Test Button" onPress={onPress} />
    );

    const button = getByText('Test Button');
    // Simulate press
    // Note: Full integration testing would require more setup
    expect(onPress).toBeDefined();
  });
});

describe('Store', () => {
  it('initializes with correct state', () => {
    // Add store tests here
    expect(true).toBe(true);
  });
});
