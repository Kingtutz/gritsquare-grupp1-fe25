/**
 * Username module - Main index exports
 *
 * This module re-exports functions from focused submodules for better maintainability.
 * The original monolithic implementation has been split into:
 * - auth.js: Authentication functions and username storage
 * - terms.js: Terms & conditions acceptance logic
 * - prompt.js: Login/register prompt UI
 */

export {
  getUsername,
  logout,
  saveUsername,
  loginUser,
  registerUser
} from './auth.js'
export { initUsernamePrompt } from './prompt.js'
export { showTermsPopup, ensureTermsAccepted } from './terms.js'
