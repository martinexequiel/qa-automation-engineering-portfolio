/**
 * Test Data Fixtures for Login Tests
 * 
 * Centralized test data management following the Arrange-Act-Assert pattern.
 * Keeps test data separate from test logic for maintainability and reusability.
 */

/**
 * Valid user credentials for successful login scenarios
 * These users are provided by Sauce Demo for testing
 */
export const validUsers = [
  {
    username: 'standard_user',
    password: 'secret_sauce',
    description: 'Standard user with all features enabled',
  },
  {
    username: 'problem_user',
    password: 'secret_sauce',
    description: 'User that experiences UI rendering issues',
  },
  {
    username: 'performance_glitch_user',
    password: 'secret_sauce',
    description: 'User with simulated performance issues',
  },
  {
    username: 'visual_user',
    password: 'secret_sauce',
    description: 'User experiencing visual glitches',
  },
];

export const products = {
  backpack: 'Sauce Labs Backpack',
  bikeLight: 'Sauce Labs Bike Light',
  boltTShirt: 'Sauce Labs Bolt T-Shirt',
  fleeceJacket: 'Sauce Labs Fleece Jacket',
  onesie: 'Sauce Labs Onesie',
  testAllTheThingsTShirt: 'Test.allTheThings() T-Shirt (Red)',
};

/**
 * Locked out user - Cannot login even with correct password
 * Used to test account lockout scenarios
 */
export const lockedOutUser = {
  username: 'locked_out_user',
  password: 'secret_sauce',
  description: 'User account that is locked',
  expectedError: 'Epic sadface: Sorry, this user has been locked out.',
};

/**
 * Invalid credentials for negative testing
 * Tests various authentication failure scenarios
 */
export const invalidCredentials = [
  {
    username: 'invalid_user',
    password: 'secret_sauce',
    description: 'Non-existent username',
    expectedError: 'Epic sadface: Username and password do not match any user in this service',
  },
  {
    username: 'standard_user',
    password: 'wrong_password',
    description: 'Correct username, wrong password',
    expectedError: 'Epic sadface: Username and password do not match any user in this service',
  },
  {
    username: '',
    password: 'secret_sauce',
    description: 'Empty username',
    expectedError: 'Epic sadface: Username is required',
  },
  {
    username: 'standard_user',
    password: '',
    description: 'Empty password',
    expectedError: 'Epic sadface: Password is required',
  },
  {
    username: '',
    password: '',
    description: 'Both fields empty',
    expectedError: 'Epic sadface: Username is required',
  },
];

/**
 * Expected success indicators after successful login
 */
export const successIndicators = {
  urlPattern: /inventory\.html/,
  title: 'Swag Labs',
};
