/**
 * Flows Index
 * 
 * Central export point for all business flow functions.
 * Flows orchestrate page objects to represent real user journeys.
 * 
 * USAGE:
 * import {
 *   loginAsStandardUser,
 *   completePurchaseAsStandardUser,
 *   attemptInvalidLogin,
 * } from '@flows/index';
 */

export {
  loginAsStandardUser,
  loginWithCredentials,
  loginAndExpectFailure,
} from './loginFlow';

export {
  completePurchaseAsStandardUser,
  addProductToCart,
  attemptInvalidLogin,
} from './purchaseFlow';
