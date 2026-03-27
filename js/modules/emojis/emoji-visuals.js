import {
  spriteSheetPath,
  heartEmojiPath,
  brokenHeartEmojiPath,
  SPRITE_COLUMNS,
  SPRITE_ROWS,
  heartEmojiDefinition
} from './emoji-definitions.js'

function setSpriteBackground (element, definition) {
  const positionX =
    SPRITE_COLUMNS === 1 ? 0 : (definition.column / (SPRITE_COLUMNS - 1)) * 100
  const positionY =
    SPRITE_ROWS === 1 ? 0 : (definition.row / (SPRITE_ROWS - 1)) * 100

  element.style.backgroundImage = `url('${spriteSheetPath}')`
  element.style.backgroundSize = `${SPRITE_COLUMNS * 100}% ${
    SPRITE_ROWS * 100
  }%`
  element.style.backgroundPosition = `${positionX}% ${positionY}%`
}

export function createEmojiVisual (definition, options = {}) {
  const icon = document.createElement('span')
  icon.className = 'emoji-asset-icon'

  const size = Number(options.size || 20)
  icon.style.width = `${size}px`
  icon.style.height = `${size}px`

  if (definition.type === 'heart') {
    icon.style.backgroundImage = `url('${heartEmojiPath}')`
    icon.style.backgroundSize = 'contain'
    icon.style.backgroundPosition = 'center'
  } else {
    icon.classList.add('emoji-sprite-icon')
    setSpriteBackground(icon, definition)
  }

  if (options.inactive) {
    icon.classList.add('emoji-heart-inactive')
  }

  if (options.className) {
    icon.classList.add(options.className)
  }

  icon.setAttribute('aria-hidden', 'true')
  return icon
}

export function createReactionIcon (kind, options = {}) {
  const size = options.size || 18

  if (kind === 'heart') {
    return createEmojiVisual(heartEmojiDefinition, {
      size,
      inactive: !options.active,
      className: 'emoji-reaction-icon'
    })
  }

  if (kind === 'dislike') {
    const icon = document.createElement('span')
    icon.className = 'emoji-asset-icon emoji-reaction-icon'
    if (options.active) {
      icon.classList.add('emoji-dislike-active')
    }
    icon.style.width = `${size}px`
    icon.style.height = `${size}px`
    icon.style.backgroundImage = `url('${brokenHeartEmojiPath}')`
    icon.style.backgroundSize = 'contain'
    icon.style.backgroundPosition = 'center'
    icon.style.backgroundRepeat = 'no-repeat'
    icon.setAttribute('aria-hidden', 'true')
    return icon
  }

  // fallback: minus-streck
  const minus = document.createElement('span')
  minus.className = 'emoji-minus-icon'
  minus.style.width = `${size}px`
  minus.setAttribute('aria-hidden', 'true')
  return minus
}
