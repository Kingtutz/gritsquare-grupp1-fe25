/**
 * Header module - Main index exports
 *
 * This module re-exports functions from focused submodules for better maintainability.
 * The original monolithic implementation has been split into:
 * - navigation.js: Menu creation and link management
 * - online-users.js: Online user display and subscription
 * - home.js: Title plaque and grass hint
 * - header-index.js: Main header rendering and initialization
 */

export { renderHeader, initHeaderOnLoad } from './header/header-index.js'
export { buildNavigationLinks, createMenu } from './header/navigation.js'
export { attachOnlineUsersSection } from './header/online-users.js'
export { createHomeTitlePlaque, syncHomeGrassHint } from './header/home.js'
