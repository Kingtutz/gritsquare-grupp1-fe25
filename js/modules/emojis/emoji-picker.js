import {
  postEmojiDefinitions,
  emojiDefinitionMap,
  emojiTokenPattern
} from './emoji-definitions.js'
import { createEmojiVisual } from './emoji-visuals.js'

export function createEmojiPicker (onSelect) {
  const picker = document.createElement('div')
  picker.className = 'emoji-picker'

  postEmojiDefinitions.forEach(definition => {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'emoji-picker-button'
    button.title = definition.token
    button.append(createEmojiVisual(definition, { size: 24 }))
    button.addEventListener('click', () => {
      if (typeof onSelect === 'function') {
        onSelect(definition.token)
      }
    })
    picker.append(button)
  })

  return picker
}

export function getEmojiAwareLength (text) {
  const normalized = String(text || '').replace(emojiTokenPattern, 'x')
  return Array.from(normalized).length
}

export function insertEmojiTokenAtSelection (textarea, token, maxLength) {
  if (!textarea || !token) {
    return false
  }

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const nextValue =
    textarea.value.slice(0, start) + token + textarea.value.slice(end)

  if (
    typeof maxLength === 'number' &&
    getEmojiAwareLength(nextValue) > maxLength
  ) {
    return false
  }

  textarea.value = nextValue
  textarea.focus()
  textarea.selectionStart = textarea.selectionEnd = start + token.length
  textarea.dispatchEvent(new Event('input'))
  return true
}

export function createRichTextFragment (text, options = {}) {
  const fragment = document.createDocumentFragment()
  const rawText = String(text || '')

  if (!rawText) {
    return fragment
  }

  const iconSize = Number(options.size || 20)
  let cursor = 0

  rawText.replace(emojiTokenPattern, (match, _group, offset) => {
    if (offset > cursor) {
      fragment.append(document.createTextNode(rawText.slice(cursor, offset)))
    }

    const definition = emojiDefinitionMap.get(match)
    if (definition) {
      fragment.append(
        createEmojiVisual(definition, {
          size: iconSize,
          className: 'emoji-inline-icon'
        })
      )
    } else {
      fragment.append(document.createTextNode(match))
    }

    cursor = offset + match.length
    return match
  })

  if (cursor < rawText.length) {
    fragment.append(document.createTextNode(rawText.slice(cursor)))
  }

  return fragment
}

export function setElementTextWithEmojis (element, text, options = {}) {
  if (!element) {
    return
  }

  element.replaceChildren(createRichTextFragment(text, options))
}
