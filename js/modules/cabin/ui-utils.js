import { createReactionIcon } from '../emojis.js'

export function createPixelLabel (iconClass, text) {
  const wrapper = document.createElement('span')
  wrapper.className = 'pixel-inline'

  const icon = document.createElement('span')
  icon.className = `pixel-icon ${iconClass}`
  icon.setAttribute('aria-hidden', 'true')

  const label = document.createElement('span')
  label.textContent = text

  wrapper.append(icon, label)
  return wrapper
}

export function setPixelButtonContent (button, iconClass, text) {
  button.replaceChildren(createPixelLabel(iconClass, text))
}

export function updateCabinLikeButton (button, isLiked) {
  const icon = createReactionIcon('heart', { active: isLiked, size: 18 })
  const label = document.createElement('span')
  label.textContent = isLiked ? 'Liked' : 'Like'
  button.replaceChildren(icon, label)
}
