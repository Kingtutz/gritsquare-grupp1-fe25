const FLOWER_SIZE = 64
const FLOWER_COLLISION_GAP = 6
const FLOWER_POSITIONS_STORAGE_KEY = 'flower-fixed-positions-v1'
const FLOWER_READ_STATE_STORAGE_KEY = 'flower-read-state-v1'

function clamp (value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function hashString (value) {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0
  }
  return hash
}

export function getFixedFlowerPosition (garden, seedValue) {
  const maxLeft = Math.max(garden.clientWidth - FLOWER_SIZE, 0)
  const maxTop = Math.max(garden.clientHeight - FLOWER_SIZE, 0)
  const seed = hashString(seedValue)

  const left = maxLeft > 0 ? seed % (maxLeft + 1) : 0
  const top = maxTop > 0 ? Math.floor(seed / 97) % (maxTop + 1) : 0

  return {
    left: `${left}px`,
    top: `${top}px`
  }
}

export function isOverlappingFlowers (left, top, existingFlowers) {
  const right = left + FLOWER_SIZE
  const bottom = top + FLOWER_SIZE

  return existingFlowers.some(({ left: existingLeft, top: existingTop }) => {
    const existingRight = existingLeft + FLOWER_SIZE
    const existingBottom = existingTop + FLOWER_SIZE

    return !(
      right + FLOWER_COLLISION_GAP <= existingLeft ||
      left >= existingRight + FLOWER_COLLISION_GAP ||
      bottom + FLOWER_COLLISION_GAP <= existingTop ||
      top >= existingBottom + FLOWER_COLLISION_GAP
    )
  })
}

export function getExistingFlowerPositions (garden) {
  return Array.from(garden.querySelectorAll('.garden-flower')).map(flower => ({
    left: parseFloat(flower.style.left || '0'),
    top: parseFloat(flower.style.top || '0')
  }))
}

export function findNonOverlappingPosition (
  garden,
  preferredPosition,
  positionSeed
) {
  const maxLeft = Math.max(garden.clientWidth - FLOWER_SIZE, 0)
  const maxTop = Math.max(garden.clientHeight - FLOWER_SIZE, 0)
  const existingFlowers = getExistingFlowerPositions(garden)
  const seed = hashString(positionSeed)

  const preferredLeft = clamp(
    parseFloat(preferredPosition.left || '0'),
    0,
    maxLeft
  )
  const preferredTop = clamp(
    parseFloat(preferredPosition.top || '0'),
    0,
    maxTop
  )

  if (!isOverlappingFlowers(preferredLeft, preferredTop, existingFlowers)) {
    return { left: preferredLeft, top: preferredTop }
  }

  const attempts = Math.max(existingFlowers.length * 20, 200)

  for (let i = 0; i < attempts; i++) {
    const left = maxLeft > 0 ? (seed + i * 131) % (maxLeft + 1) : 0
    const top = maxTop > 0 ? (Math.floor(seed / 97) + i * 73) % (maxTop + 1) : 0

    if (!isOverlappingFlowers(left, top, existingFlowers)) {
      return { left, top }
    }
  }

  return { left: preferredLeft, top: preferredTop }
}

export function getStoredFlowerPositions () {
  try {
    const raw = window.localStorage.getItem(FLOWER_POSITIONS_STORAGE_KEY)
    if (!raw) {
      return {}
    }

    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object') {
      return parsed
    }
  } catch {
    return {}
  }

  return {}
}

export function getStoredReadState () {
  try {
    const raw = window.localStorage.getItem(FLOWER_READ_STATE_STORAGE_KEY)
    if (!raw) {
      return {}
    }

    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object') {
      return parsed
    }
  } catch {
    return {}
  }

  return {}
}

export function getReadVersion (postId) {
  if (!postId) {
    return 0
  }

  const readState = getStoredReadState()
  const version = readState[postId]
  return typeof version === 'number' ? version : 0
}

export function setReadVersion (postId, version) {
  if (!postId) {
    return
  }

  const readState = getStoredReadState()
  readState[postId] = version
  window.localStorage.setItem(
    FLOWER_READ_STATE_STORAGE_KEY,
    JSON.stringify(readState)
  )
}

export function getSavedFlowerPosition (positionSeed) {
  const positions = getStoredFlowerPositions()
  const saved = positions[positionSeed]

  if (!saved || typeof saved !== 'object') {
    return null
  }

  if (typeof saved.left !== 'number' || typeof saved.top !== 'number') {
    return null
  }

  return saved
}

export function saveFlowerPosition (positionSeed, left, top) {
  const positions = getStoredFlowerPositions()
  positions[positionSeed] = { left, top }
  window.localStorage.setItem(
    FLOWER_POSITIONS_STORAGE_KEY,
    JSON.stringify(positions)
  )
}

export function resolveFlowerPosition (garden, positionSeed) {
  const maxLeft = Math.max(garden.clientWidth - FLOWER_SIZE, 0)
  const maxTop = Math.max(garden.clientHeight - FLOWER_SIZE, 0)
  const savedPosition = getSavedFlowerPosition(positionSeed)

  if (savedPosition) {
    return {
      left: `${clamp(savedPosition.left, 0, maxLeft)}px`,
      top: `${clamp(savedPosition.top, 0, maxTop)}px`
    }
  }

  const preferredPosition = getFixedFlowerPosition(garden, positionSeed)
  const nonOverlappingPosition = findNonOverlappingPosition(
    garden,
    preferredPosition,
    positionSeed
  )

  saveFlowerPosition(
    positionSeed,
    nonOverlappingPosition.left,
    nonOverlappingPosition.top
  )

  return {
    left: `${nonOverlappingPosition.left}px`,
    top: `${nonOverlappingPosition.top}px`
  }
}
