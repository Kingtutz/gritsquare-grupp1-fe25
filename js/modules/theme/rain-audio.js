import {
  DEFAULT_RAIN_AUDIO_VOLUME,
  getSavedRainVolume,
  setSavedRainVolume,
  RAIN_OVERLAY_KEY
} from './theme-persistence.js'
import { AUDIO_FADE_MS, AUDIO_FADE_STEP_MS } from './theme-transitions.js'

const isInSitesFolder = () =>
  window.location.pathname.toLowerCase().includes('/sites/')

let rainOverlayElement = null
let isRainEnabled = false
let rainAudioContext = null
let rainAudioSource = null
let rainAudioGain = null
let rainAudioInitialized = false
let rainAudioVolume = DEFAULT_RAIN_AUDIO_VOLUME
let isMuted = false

export function setRainMuted (muted) {
  isMuted = muted
}

export function getRainEnabled () {
  return isRainEnabled
}

export function getRainVolume () {
  return rainAudioVolume
}

export function ensureRainOverlay () {
  if (rainOverlayElement && document.body.contains(rainOverlayElement)) {
    return
  }

  rainOverlayElement = document.createElement('div')
  rainOverlayElement.id = 'rain-overlay'
  rainOverlayElement.className = 'rain-overlay'
  rainOverlayElement.setAttribute('aria-hidden', 'true')
  document.body.append(rainOverlayElement)
}

export function ensureRainAudioGraph () {
  if (rainAudioInitialized) {
    return
  }

  const AudioContextConstructor =
    window.AudioContext || window.webkitAudioContext
  if (!AudioContextConstructor) {
    return
  }

  rainAudioContext = new AudioContextConstructor()

  const durationSeconds = 2
  const sampleRate = rainAudioContext.sampleRate
  const frameCount = sampleRate * durationSeconds
  const noiseBuffer = rainAudioContext.createBuffer(1, frameCount, sampleRate)
  const noiseData = noiseBuffer.getChannelData(0)

  for (let i = 0; i < frameCount; i += 1) {
    noiseData[i] = Math.random() * 2 - 1
  }

  rainAudioSource = rainAudioContext.createBufferSource()
  rainAudioSource.buffer = noiseBuffer
  rainAudioSource.loop = true

  const highPass = rainAudioContext.createBiquadFilter()
  highPass.type = 'highpass'
  highPass.frequency.value = 600

  const lowPass = rainAudioContext.createBiquadFilter()
  lowPass.type = 'lowpass'
  lowPass.frequency.value = 6200

  rainAudioGain = rainAudioContext.createGain()
  rainAudioGain.gain.value = 0

  rainAudioSource.connect(highPass)
  highPass.connect(lowPass)
  lowPass.connect(rainAudioGain)
  rainAudioGain.connect(rainAudioContext.destination)
  rainAudioSource.start()
  rainAudioInitialized = true
}

export function setRainAudioVolume (volume) {
  if (!rainAudioContext || !rainAudioGain) {
    return
  }

  const now = rainAudioContext.currentTime
  rainAudioGain.gain.cancelScheduledValues(now)
  rainAudioGain.gain.setTargetAtTime(volume, now, 0.18)
}

export function syncRainAudio (audioUnlocked) {
  ensureRainAudioGraph()

  if (!rainAudioContext || !rainAudioGain) {
    return
  }

  const shouldPlayRain = isRainEnabled && !isMuted && audioUnlocked

  if (shouldPlayRain && rainAudioContext.state === 'suspended') {
    rainAudioContext.resume().catch(() => {})
  }

  setRainAudioVolume(shouldPlayRain ? rainAudioVolume : 0)
}

export function applyRainState (enabled, { persist = true } = {}) {
  isRainEnabled = enabled
  ensureRainOverlay()
  document.documentElement.classList.toggle('rain-enabled', enabled)

  if (persist) {
    localStorage.setItem(RAIN_OVERLAY_KEY, String(enabled))
  }

  window.dispatchEvent(
    new CustomEvent('garden:rain-state-changed', { detail: { enabled } })
  )
  syncRainAudio(true) // Assume unlocked when called
}

export function toggleRainOverlay () {
  applyRainState(!isRainEnabled)
}

export function setRainVolume (volume) {
  rainAudioVolume = volume
  setSavedRainVolume(volume)
  syncRainAudio(true)
}
