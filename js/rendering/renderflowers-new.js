/**
 * Flower rendering module - Main index
 *
 * Re-exports flower rendering functions from focused submodules.
 * This file acts as a clean facade/barrel export for better maintainability.
 *
 * Submodules:
 * - flower-images.js: Flower image selection & theme syncing
 * - flower-positioning.js: Position calculations & collision detection
 * - flower-render.js: Core rendering & element creation
 */

// Primary exports
export { renderFlowers } from './flowers/flower-render.js'
export { syncRenderedFlowerTheme } from './flowers/flower-images.js'

// Image-related utilities
export {
  isDarkThemeActive,
  getFlowerImagesForCurrentTheme,
  getDefaultFlowerImage,
  getFlowerImageForSeed,
  extractFlowerVariantNumber
} from './flowers/flower-images.js'

// Position-related utilities
export {
  getFixedFlowerPosition,
  isOverlappingFlowers,
  getExistingFlowerPositions,
  findNonOverlappingPosition,
  getStoredFlowerPositions,
  getStoredReadState,
  getReadVersion,
  setReadVersion,
  getSavedFlowerPosition,
  saveFlowerPosition,
  resolveFlowerPosition
} from './flowers/flower-positioning.js'
