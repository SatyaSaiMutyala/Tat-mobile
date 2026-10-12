/**
 * @format
 */
import 'react-native';
import React from 'react';
import renderer from 'react-test-renderer';

import App from '../App';

test('renders correctly', () => {
  renderer.create(<App />);
});
