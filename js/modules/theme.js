// Barrel export from refactored theme submodules
export { initTheme } from './theme/theme-index.js'
export {
  THEME_KEY,
  SOUND_MUTED_KEY,
  RAIN_OVERLAY_KEY,
  RAIN_VOLUME_KEY,
  LIGHT_THEME,
  DARK_THEME,
  DEFAULT_RAIN_AUDIO_VOLUME,
  getSavedTheme,
  getSavedMutedState,
  getSavedRainState,
  getSavedRainVolume
} from './theme/theme-persistence.js'
export {
  SLOW_TRANSITION_MS,
  AUDIO_FADE_MS,
  AUDIO_FADE_STEP_MS,
  runThemeTransition,
  applyThemeClasses,
  applyTheme
} from './theme/theme-transitions.js'
export {
  createAudioTrack,
  ensureAudioTracks,
  pauseAllTracks,
  playTrack,
  playThemeTrack
} from './theme/audio-management.js'
export {
  ensureRainOverlay,
  ensureRainAudioGraph,
  applyRainState,
  toggleRainOverlay
} from './theme/rain-audio.js'
export {
  createThemeControls,
  mountThemeControls,
  updateToggleButton,
  updateSoundButton,
  updateRainButton
} from './theme/theme-ui.js'
