const isInSitesFolder = () =>
  window.location.pathname.toLowerCase().includes('/sites/')

const basePath = isInSitesFolder() ? '../img/flowers' : './img/flowers'

const DEFAULT_FLOWER_IMAGE = `${basePath}/redFlower.png`
const FLOWER_SIZE = 64
const FLOWER_IMAGES = [
  `${basePath}/blueFlower.png`,
  `${basePath}/greenFlower.png`,
  `${basePath}/pinkFlower.png`,
  `${basePath}/purpleFlower.png`,
  `${basePath}/redFlower.png`,
  `${basePath}/yellowFlower.png`
]

function clamp (value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function enableFlowerDragging (flower, garden) {
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

export function renderFlower (imageSrc = DEFAULT_FLOWER_IMAGE, data = null) {
  const garden =
    document.getElementById('garden') ??
    document.querySelector('.garden-wrapper')

  if (!garden) {
    return null
  }

  const flower = document.createElement('img')
  const maxLeft = Math.max(garden.clientWidth - FLOWER_SIZE, 0)
  const maxTop = Math.max(garden.clientHeight - FLOWER_SIZE, 0)
  const randomLeft = `${Math.floor(Math.random() * (maxLeft + 1))}px`
  const randomTop = `${Math.floor(Math.random() * (maxTop + 1))}px`

  flower.src = imageSrc
  flower.alt = 'Flower'
  flower.className = 'garden-flower'
  garden.style.position = 'relative'
  flower.style.position = 'absolute'
  flower.style.width = `${FLOWER_SIZE}px`
  flower.style.height = `${FLOWER_SIZE}px`
  flower.style.left = randomLeft
  flower.style.top = randomTop
  flower.draggable = false

  const hoverTitle =
    typeof data?.title === 'string' && data.title.trim().length > 0
      ? data.title.trim()
      : 'Untitled post'
  flower.title = hoverTitle

  const consumeDragState = enableFlowerDragging(flower, garden)

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
  const entries = data ? Object.values(data) : new Array(12).fill(null)

  entries.forEach(entry => {
    const randomImage =
      FLOWER_IMAGES[Math.floor(Math.random() * FLOWER_IMAGES.length)]
    const flower = renderFlower(randomImage, entry)
    console.log(entry)
    if (flower) {
      renderedFlowers.push(flower)
    }
  })

  return renderedFlowers
}
