const isInSitesFolder = () =>
  window.location.pathname.toLowerCase().includes('/sites/')

const soundBasePath = isInSitesFolder() ? '../sounds' : './sounds'
const cabinDoorSoundPath = `${soundBasePath}/cabinopen.mp3`

let cabinDoorAudio = null
let cabinDoorReverseBuffer = null
let cabinDoorAudioContext = null

export function playCabinDoorSound () {
  if (!cabinDoorAudio) {
    cabinDoorAudio = new Audio(cabinDoorSoundPath)
    cabinDoorAudio.preload = 'auto'
    cabinDoorAudio.volume = 0.22
  }

  try {
    cabinDoorAudio.currentTime = 0
  } catch {
    // Ignore seek errors if audio metadata is not ready yet.
  }

  cabinDoorAudio.play().catch(() => {})
}

async function getCabinDoorReverseBuffer () {
  if (cabinDoorReverseBuffer) {
    return cabinDoorReverseBuffer
  }

  if (!cabinDoorAudioContext) {
    cabinDoorAudioContext = new window.AudioContext()
  }

  if (cabinDoorAudioContext.state === 'suspended') {
    await cabinDoorAudioContext.resume()
  }

  const response = await fetch(cabinDoorSoundPath)
  const arrayBuffer = await response.arrayBuffer()
  const decoded = await cabinDoorAudioContext.decodeAudioData(arrayBuffer)

  const reversedBuffer = cabinDoorAudioContext.createBuffer(
    decoded.numberOfChannels,
    decoded.length,
    decoded.sampleRate
  )

  for (let channel = 0; channel < decoded.numberOfChannels; channel += 1) {
    const source = decoded.getChannelData(channel)
    const target = reversedBuffer.getChannelData(channel)

    for (let i = 0; i < decoded.length; i += 1) {
      target[i] = source[decoded.length - 1 - i]
    }
  }

  cabinDoorReverseBuffer = reversedBuffer
  return cabinDoorReverseBuffer
}

export async function playCabinDoorSoundReverse () {
  try {
    const buffer = await getCabinDoorReverseBuffer()
    const source = cabinDoorAudioContext.createBufferSource()
    const gain = cabinDoorAudioContext.createGain()
    const now = cabinDoorAudioContext.currentTime
    const targetGain = 0.18

    // Smooth the first ~120ms to remove the sharp transient at start.
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(targetGain, now + 0.12)
    source.buffer = buffer
    source.connect(gain)
    gain.connect(cabinDoorAudioContext.destination)
    source.start(0)
  } catch {
    // Ignore sound errors so popup close flow is never blocked.
  }
}
