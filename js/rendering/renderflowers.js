const isInSitesFolder = () =>
  window.location.pathname.toLowerCase().includes('/sites/')

const basePath = isInSitesFolder() ? '../img/flowers' : './img/flowers'

const FLOWER_SIZE = 64
const FLOWER_COLLISION_GAP = 6
const FLOWER_POSITIONS_STORAGE_KEY = 'flower-fixed-positions-v1'
const LIGHT_FLOWER_IMAGES = [
  `${basePath}/Lightflower1.png`,
  `${basePath}/Lightflower2.png`,
  `${basePath}/Lightflower3.png`,
  `${basePath}/Lightflower4.png`,
  `${basePath}/Lightflower5.png`,
  `${basePath}/Lightflower6.png`
]

const DARK_FLOWER_IMAGES = [
  `${basePath}/Darkflower1.png`,
  `${basePath}/Darkflower2.png`,
  `${basePath}/Darkflower3.png`,
  `${basePath}/Darkflower4.png`,
  `${basePath}/Darkflower5.png`,
  `${basePath}/Darkflower6.png`
]

function isDarkThemeActive () {
  const html = document.documentElement
  return (
    html.getAttribute('data-theme') === 'dark' ||
    html.classList.contains('dark-mode')
  )
}

function getFlowerImagesForCurrentTheme () {
  return isDarkThemeActive() ? DARK_FLOWER_IMAGES : LIGHT_FLOWER_IMAGES
}

function getDefaultFlowerImage () {
  return getFlowerImagesForCurrentTheme()[0]
}

function extractFlowerVariantNumber (src) {
  const match = src.match(/(Lightflower|Darkflower)(\d+)\.png/i)
  if (!match) {
    return null
  }

  return Number(match[2])
}

export function syncRenderedFlowerTheme () {
  const garden =
    document.getElementById('garden') ??
    document.querySelector('.garden-wrapper')

  if (!garden) {
    return
  }

  const flowers = Array.from(garden.querySelectorAll('.garden-flower'))
  if (flowers.length === 0) {
    return
  }

  const useDark = isDarkThemeActive()
  const fallbackImages = useDark ? DARK_FLOWER_IMAGES : LIGHT_FLOWER_IMAGES
  const targetPrefix = useDark ? 'Darkflower' : 'Lightflower'

  flowers.forEach((flower, index) => {
    const variant = extractFlowerVariantNumber(flower.src)
    if (variant && variant >= 1 && variant <= 6) {
      flower.src = `${basePath}/${targetPrefix}${variant}.png`
      return
    }

    flower.src = fallbackImages[index % fallbackImages.length]
  })
}

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

function getFixedFlowerPosition (garden, seedValue) {
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

function isOverlappingFlowers (left, top, existingFlowers) {
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

function getExistingFlowerPositions (garden) {
  return Array.from(garden.querySelectorAll('.garden-flower')).map(flower => ({
    left: parseFloat(flower.style.left || '0'),
    top: parseFloat(flower.style.top || '0')
  }))
}

function findNonOverlappingPosition (garden, preferredPosition, positionSeed) {
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

function getStoredFlowerPositions () {
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

function getSavedFlowerPosition (positionSeed) {
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

function saveFlowerPosition (positionSeed, left, top) {
  const positions = getStoredFlowerPositions()
  positions[positionSeed] = { left, top }
  window.localStorage.setItem(
    FLOWER_POSITIONS_STORAGE_KEY,
    JSON.stringify(positions)
  )
}

function resolveFlowerPosition (garden, positionSeed) {
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

function enableFlowerDragging (flower, garden, onDragEnd = null) {
  let pointerId = null
  let startPointerX = 0
  let startPointerY = 0
  let startLeft = 0
  let startTop = 0
  let didDrag = false
  const dragThreshold = 3

  flower.addEventListener('pointerdown', event => {
    pointerId = event.pointerId
    startPointerX = event.clientX
    startPointerY = event.clientY
    startLeft = parseFloat(flower.style.left || '0')
    startTop = parseFloat(flower.style.top || '0')
    didDrag = false
    flower.setPointerCapture(pointerId)
  })

  flower.addEventListener('pointermove', event => {
    if (pointerId !== event.pointerId) {
      return
    }

    const deltaX = event.clientX - startPointerX
    const deltaY = event.clientY - startPointerY

    if (!didDrag && Math.abs(deltaX) + Math.abs(deltaY) >= dragThreshold) {
      didDrag = true
    }

    if (!didDrag) {
      return
    }

    const maxLeft = Math.max(garden.clientWidth - FLOWER_SIZE, 0)
    const maxTop = Math.max(garden.clientHeight - FLOWER_SIZE, 0)

    flower.style.left = `${clamp(startLeft + deltaX, 0, maxLeft)}px`
    flower.style.top = `${clamp(startTop + deltaY, 0, maxTop)}px`
  })

  function finishDrag (event) {
    if (pointerId !== event.pointerId) {
      return
    }

    if (flower.hasPointerCapture(pointerId)) {
      flower.releasePointerCapture(pointerId)
    }

    if (didDrag && onDragEnd) {
      onDragEnd(
        parseFloat(flower.style.left || '0'),
        parseFloat(flower.style.top || '0')
      )
    }

    pointerId = null
  }

  flower.addEventListener('pointerup', finishDrag)
  flower.addEventListener('pointercancel', finishDrag)

  return () => {
    const wasDragged = didDrag
    didDrag = false
    return wasDragged
  }
}

export function renderFlower (
  imageSrc = getDefaultFlowerImage(),
  data = null,
  positionSeed = 'flower-default'
) {
  const garden =
    document.getElementById('garden') ??
    document.querySelector('.garden-wrapper')

  if (!garden) {
    return null
  }

  const flower = document.createElement('img')
  const fixedPosition = resolveFlowerPosition(garden, positionSeed)

  flower.src = imageSrc
  flower.alt = 'Flower'
  flower.className = 'garden-flower'
  garden.style.position = 'relative'
  flower.style.position = 'absolute'
  flower.style.width = `${FLOWER_SIZE}px`
  flower.style.height = `${FLOWER_SIZE}px`
  flower.style.objectFit = 'contain'
  flower.style.objectPosition = 'center'
  flower.style.left = fixedPosition.left
  flower.style.top = fixedPosition.top
  flower.draggable = false

  const hoverTitle =
    typeof data?.title === 'string' && data.title.trim().length > 0
      ? data.title.trim()
      : 'Untitled post'
  flower.title = hoverTitle

  const consumeDragState = enableFlowerDragging(flower, garden, (left, top) => {
    saveFlowerPosition(positionSeed, left, top)
  })

  garden.append(flower)
  flower.addEventListener('click', () => {
    if (consumeDragState()) {
      return
    }

    openFlowerPopup(imageSrc, data)
  })

  return flower
}

function openFlowerPopup (imageSrc, data) {
  const existing = document.getElementById('flower-popup')
  if (existing) {
    existing.remove()
  }

  const overlay = document.createElement('div')
  overlay.id = 'flower-popup'

  const box = document.createElement('div')
  box.className = 'flower-popup-box'

  const img = document.createElement('img')
  img.src = imageSrc
  img.alt = 'Flower'

  const closeBtn = document.createElement('button')
  closeBtn.textContent = '\u2715'
  closeBtn.className = 'flower-popup-close'
  closeBtn.addEventListener('click', () => overlay.remove())

  overlay.addEventListener('click', event => {
    if (event.target === overlay) {
      overlay.remove()
    }
  })

  box.append(closeBtn, img)

  if (data) {
    if (data.name) {
      const name = document.createElement('h5')
      name.className = 'flower-popup-name'
      name.textContent = data.name
      box.append(name)
    }
    if (data.title) {
      const message = document.createElement('h3')
      message.className = 'flower-popup-message'
      message.textContent = data.title
      box.append(message)
    }
    if (data.message) {
      const message = document.createElement('p')
      message.className = 'flower-popup-message'
      message.textContent = data.message
      box.append(message)
    }
    if (data.answer) {
      const answer = document.createElement('p')
      answer.className = 'flower-popup-message'
      const answerText =
        typeof data.answer === 'string'
          ? data.answer
          : data.answer.message ?? JSON.stringify(data.answer)
      const answerName =
        typeof data.answer === 'string'
          ? data.answer
          : data.answer.name ?? JSON.stringify(data.answer)
      answer.textContent = `Answer: ${answerText} From: ${answerName}`
      box.append(answer)
    }
  }

  overlay.append(box)
  document.body.append(overlay)
}

export function renderFlowers (data = null) {
  const renderedFlowers = []
  const flowerImages = getFlowerImagesForCurrentTheme()
  const entries = data
    ? Object.entries(data)
    : new Array(12)
        .fill(null)
        .map((entry, index) => [`placeholder-${index}`, entry])

  entries.forEach(([entryKey, entry]) => {
    const randomImage =
      flowerImages[Math.floor(Math.random() * flowerImages.length)]
    const flower = renderFlower(randomImage, entry, String(entryKey))
    console.log(entry)
    if (flower) {
      renderedFlowers.push(flower)
    }
  })

  return renderedFlowers
}
