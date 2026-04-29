/**
 * Utilities Index
 * 
 * Central export point for all utility functions and helpers.
 * Utilities should be reusable functions for common tasks like:
 * - Data generation
 * - API helpers
 * - Configuration management
 * - Assertion helpers
 * - Wait/retry logic
 * 
 * Usage:
 * import { validUsers, invalidCredentials } from '@utils/index';
 */

export { validUsers, invalidCredentials, lockedOutUser, successIndicators } from './testData';

// Export other utilities as they are created
// export { generateTestData } from './dataGenerator';
// export { apiHelper } from './apiHelper';
// export { delay } from './waitHelpers';
