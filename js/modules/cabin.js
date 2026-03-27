/**
 * Cabin module - Main index exports
 *
 * This module re-exports functions from focused submodules for better maintainability.
 * The original monolithic implementation has been split into:
 * - audio.js: Door sound handling and audio effects
 * - popup.js: Main cabin popup and hub content loading
 * - post-display.js: Post and reply display utilities
 * - post-form.js: Post creation form
 * - ui-utils.js: UI component helpers
 * - cabin-index.js: Cabin initialization and coordination
 */

export { initCabin } from './cabin/cabin-index.js'
export { openCabinPopup, loadHubContent } from './cabin/popup.js'
export { showPostForm } from './cabin/post-form.js'
export { playCabinDoorSound, playCabinDoorSoundReverse } from './cabin/audio.js'
export {
  displayPostsList,
  displayLikedList,
  getReplyList,
  getReplyCount,
  buildCabinReplyElement,
  buildCabinReplyForm
} from './cabin/post-display.js'
