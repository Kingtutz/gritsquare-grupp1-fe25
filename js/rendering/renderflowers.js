import {
  postReply,
  deleteMessagebyId,
  isUserAdmin
} from '../firebase/firebase.js'
import { censorBadWords } from '../modules/censor.js'
import { getUsername } from '../modules/username.js'

const isInSitesFolder = () =>
  window.location.pathname.toLowerCase().includes('/sites/')

const basePath = isInSitesFolder() ? '../img/flowers' : './img/flowers'

const FLOWER_SIZE = 64
const FLOWER_COLLISION_GAP = 6
const FLOWER_POSITIONS_STORAGE_KEY = 'flower-fixed-positions-v1'
const FLOWER_READ_STATE_STORAGE_KEY = 'flower-read-state-v1'
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

function getFlowerImageForSeed (images, seedValue) {
  if (!Array.isArray(images) || images.length === 0) {
    return getDefaultFlowerImage()
  }

  const seed = hashString(String(seedValue || 'flower-default'))
  return images[seed % images.length]
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

  const flowers = Array.from(garden.querySelectorAll('.garden-flower-image'))
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

function getStoredReadState () {
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

function getReadVersion (postId) {
  if (!postId) {
    return 0
  }

  const readState = getStoredReadState()
  const version = readState[postId]
  return typeof version === 'number' ? version : 0
}

function setReadVersion (postId, version) {
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

function normalizeReply (reply) {
  if (!reply) {
    return null
  }

  if (typeof reply === 'string') {
    const trimmed = reply.trim()
    if (!trimmed) {
      return null
    }

    return {
      name: 'Anonymous',
      message: trimmed
    }
  }

  if (typeof reply === 'object') {
    const message =
      typeof reply.message === 'string' ? reply.message.trim() : ''
    if (!message) {
      return null
    }

    return {
      name:
        typeof reply.name === 'string' && reply.name.trim()
          ? reply.name.trim()
          : 'Anonymous',
      message
    }
  }

  return null
}

function getReplyList (data) {
  const replies = []

  if (Array.isArray(data?.replies)) {
    data.replies.forEach(entry => {
      const normalized = normalizeReply(entry)
      if (normalized) {
        replies.push(normalized)
      }
    })
  } else if (data?.replies && typeof data.replies === 'object') {
    Object.values(data.replies).forEach(entry => {
      const normalized = normalizeReply(entry)
      if (normalized) {
        replies.push(normalized)
      }
    })
  }

  if (replies.length === 0) {
    const legacyAnswer = normalizeReply(data?.answer)
    if (legacyAnswer) {
      replies.push(legacyAnswer)
    }
  }

  return replies
}

function getThreadVersion (data) {
  if (!data || typeof data !== 'object') {
    return 0
  }

  const hasMainMessage =
    typeof data.message === 'string' && data.message.trim().length > 0
  if (!hasMainMessage) {
    return 0
  }

  return 1 + getReplyList(data).length
}

function hasUnreadContent (postId, data) {
  if (!postId) {
    return false
  }

  return getThreadVersion(data) > getReadVersion(postId)
}

function buildReplyElement (replyData) {
  const replyBlock = document.createElement('section')
  replyBlock.className = 'flower-popup-reply'

  const replyLabel = document.createElement('h4')
  replyLabel.className = 'flower-popup-reply-label'
  replyLabel.textContent = 'Reply'

  const replyText = document.createElement('p')
  replyText.className = 'flower-popup-reply-message'
  replyText.textContent = replyData.message

  const replyMeta = document.createElement('p')
  replyMeta.className = 'flower-popup-reply-meta'
  replyMeta.textContent = `From: ${replyData.name}`

  replyBlock.append(replyLabel, replyText, replyMeta)
  return replyBlock
}

function buildReplyForm ({ postId, data, onReplySaved }) {
  const form = document.createElement('form')
  form.className = 'flower-popup-reply-form'

  const replyMessage = document.createElement('textarea')
  replyMessage.name = 'reply-message'
  replyMessage.maxLength = 180
  replyMessage.required = true
  replyMessage.placeholder = 'Write a reply...'

  const actions = document.createElement('div')
  actions.className = 'flower-popup-reply-actions'

  const submit = document.createElement('button')
  submit.type = 'submit'
  submit.textContent = 'Reply'

  const status = document.createElement('p')
  status.className = 'flower-popup-reply-status'
  status.hidden = true

  actions.append(submit, status)
  form.append(replyMessage, actions)

  form.addEventListener('submit', async event => {
    event.preventDefault()

    const nameValue = censorBadWords(getUsername().trim())
    const messageValue = censorBadWords(replyMessage.value.trim())

    if (!nameValue) {
      status.hidden = false
      status.textContent = 'You need to be logged in to reply.'
      return
    }

    if (!messageValue) {
      status.hidden = false
      status.textContent = 'Please enter a reply.'
      return
    }

    submit.disabled = true
    status.hidden = false
    status.textContent = 'Sending...'

    try {
      const savedReply = await postReply(postId, messageValue, nameValue)
      if (!Array.isArray(data.replies)) {
        data.replies = getReplyList(data)
      }
      data.replies.push(savedReply)
      replyMessage.value = ''
      status.textContent = 'Reply posted.'
      onReplySaved()
    } catch {
      status.textContent = 'Could not post reply. Try again.'
    } finally {
      submit.disabled = false
    }
  })

  return form
}

function normalizeUserName (value) {
  return String(value || '')
    .trim()
    .toLowerCase()
}

function canDeleteAsOwner (data, currentUsername) {
  if (!data) {
    return false
  }

  return normalizeUserName(data.name) === normalizeUserName(currentUsername)
}

function appendDeleteButton ({ box, overlay, postId, data }) {
  const username = getUsername().trim()
  if (!postId || !username) {
    return
  }

  let deleteButton = null
  let status = null
  let adminLabel = null

  const mountDeleteControls = ({ fromAdmin = false } = {}) => {
    if (deleteButton) {
      return
    }

    if (fromAdmin) {
      adminLabel = document.createElement('p')
      adminLabel.className = 'flower-popup-admin-label'
      adminLabel.textContent = 'Admin access'
    }

    deleteButton = document.createElement('button')
    deleteButton.type = 'button'
    deleteButton.className = 'flower-popup-delete-btn'
    deleteButton.textContent = 'Delete message'

    status = document.createElement('p')
    status.className = 'flower-popup-delete-status'
    status.hidden = true

    deleteButton.addEventListener('click', async () => {
      const shouldDelete = window.confirm(
        'Delete this message and all replies?'
      )
      if (!shouldDelete) {
        return
      }

      deleteButton.disabled = true
      status.hidden = false
      status.textContent = 'Deleting...'

      try {
        await deleteMessagebyId(postId)
        overlay.remove()
      } catch {
        status.textContent = 'Could not delete message.'
        deleteButton.disabled = false
      }
    })

    if (adminLabel) {
      box.append(adminLabel)
    }
    box.append(deleteButton, status)
  }

  if (canDeleteAsOwner(data, username)) {
    mountDeleteControls()
    return
  }

  isUserAdmin(username)
    .then(admin => {
      if (admin) {
        mountDeleteControls({ fromAdmin: true })
      }
    })
    .catch(() => {})
}

export function renderFlower (
  imageSrc = getDefaultFlowerImage(),
  data = null,
  positionSeed = 'flower-default',
  postId = ''
) {
  const garden =
    document.getElementById('garden') ??
    document.querySelector('.garden-wrapper')

  if (!garden) {
    return null
  }

  const flower = document.createElement('div')
  const flowerImage = document.createElement('img')
  const unreadBadge = document.createElement('span')
  const fixedPosition = resolveFlowerPosition(garden, positionSeed)

  flowerImage.src = imageSrc
  flowerImage.alt = 'Flower'
  flowerImage.className = 'garden-flower-image'
  flowerImage.style.width = `${FLOWER_SIZE}px`
  flowerImage.style.height = `${FLOWER_SIZE}px`
  flowerImage.style.objectFit = 'contain'
  flowerImage.style.objectPosition = 'center'
  flowerImage.draggable = false

  flower.className = 'garden-flower'
  garden.style.position = 'relative'
  flower.style.position = 'absolute'
  flower.style.width = `${FLOWER_SIZE}px`
  flower.style.height = `${FLOWER_SIZE}px`
  flower.style.left = fixedPosition.left
  flower.style.top = fixedPosition.top

  unreadBadge.className = 'flower-unread-badge'
  unreadBadge.textContent = '!'
  unreadBadge.hidden = !hasUnreadContent(postId, data)

  flower.append(flowerImage, unreadBadge)

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

    setReadVersion(postId, getThreadVersion(data))
    unreadBadge.hidden = true

    openFlowerPopup(flowerImage.src, data, postId)
  })

  return flower
}

function openFlowerPopup (imageSrc, data, postId) {
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

      const repliesContainer = document.createElement('div')
      repliesContainer.className = 'flower-popup-replies'
      message.insertAdjacentElement('afterend', repliesContainer)

      const renderReplies = () => {
        repliesContainer.replaceChildren()
        const replies = getReplyList(data)
        replies.forEach(reply => {
          repliesContainer.append(buildReplyElement(reply))
        })
      }

      renderReplies()

      if (postId) {
        const replyForm = buildReplyForm({
          postId,
          data,
          onReplySaved: renderReplies
        })
        box.append(replyForm)
      }
    }
  }

  appendDeleteButton({ box, overlay, postId, data })

  overlay.append(box)
  document.body.append(overlay)
}

export function renderFlowers (data = null) {
  const garden =
    document.getElementById('garden') ??
    document.querySelector('.garden-wrapper')
  if (garden) {
    garden.querySelectorAll('.garden-flower').forEach(flower => flower.remove())
  }

  const renderedFlowers = []
  const flowerImages = getFlowerImagesForCurrentTheme()
  const entries = data
    ? Object.entries(data)
    : new Array(12)
        .fill(null)
        .map((entry, index) => [`placeholder-${index}`, entry])

  entries.forEach(([entryKey, entry]) => {
    const randomImage = getFlowerImageForSeed(flowerImages, entryKey)
    const flower = renderFlower(
      randomImage,
      entry,
      String(entryKey),
      String(entryKey)
    )
    console.log(entry)
    if (flower) {
      renderedFlowers.push(flower)
    }
  })

  return renderedFlowers
}
