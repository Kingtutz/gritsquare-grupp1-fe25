import {
  createEmojiPicker,
  getEmojiAwareLength,
  insertEmojiTokenAtSelection
} from './emojis.js'
import { getUsername } from './username.js'

const maxMessageLength = 100
const internalMessageLimit = 800

export function createFormElements () {
  const wrapper = document.createElement('div')
  wrapper.classList.add('form-wrapper')

  const cancelBtn = document.createElement('button')
  cancelBtn.textContent = 'X'
  cancelBtn.classList.add('cancelBtn')
  cancelBtn.type = 'button'
  cancelBtn.setAttribute('aria-label', 'Close form')

  const form = document.createElement('form')

  const title = document.createElement('input')
  title.placeholder = 'Title'

  const message = document.createElement('textarea')
  message.placeholder = 'Message'
  message.maxLength = internalMessageLimit

  const charCount = document.createElement('div')
  charCount.textContent = `0 / ${maxMessageLength}`

  const name = document.createElement('input')
  name.placeholder = 'Name'
  name.value = getUsername()

  const button = document.createElement('button')
  button.textContent = 'Send!'
  button.classList.add('sendBtn')
  button.type = 'submit'

  const sendStatus = document.createElement('p')
  sendStatus.classList.add('form-send-status')

  const emojiPickerPanel = document.createElement('div')
  emojiPickerPanel.classList.add('emoji-picker-panel')

  const emojiPickerLabel = document.createElement('p')
  emojiPickerLabel.classList.add('emoji-picker-label')
  emojiPickerLabel.textContent = 'Choose emoji'

  const emojiPicker = createEmojiPicker(() => {
    // Callback will be set externally
  })

  emojiPickerPanel.append(emojiPickerLabel, emojiPicker)

  const bottomRow = document.createElement('div')
  bottomRow.classList.add('form-bottom-row')
  bottomRow.append(button, charCount, emojiPickerPanel)

  form.append(title, message, name, sendStatus, bottomRow)
  wrapper.append(cancelBtn, emojiPickerPanel, form)

  return {
    wrapper,
    form,
    cancelBtn,
    title,
    message,
    charCount,
    name,
    button,
    sendStatus,
    emojiPicker,
    emojiPickerPanel
  }
}

export function setupCharCountListener (message, charCount, updateCharCount) {
  let lastValidMessage = ''

  const handleInput = () => {
    if (getEmojiAwareLength(message.value) > maxMessageLength) {
      message.value = lastValidMessage
    } else {
      lastValidMessage = message.value
    }
    updateCharCount()
  }

  message.addEventListener('input', handleInput)

  return () => {
    message.removeEventListener('input', handleInput)
  }
}

export function setupEmojiInsertion (
  emojiPicker,
  message,
  charCount,
  updateCharCount
) {
  let lastValidMessage = message.value

  const handleEmojiSelect = token => {
    const inserted = insertEmojiTokenAtSelection(
      message,
      token,
      maxMessageLength
    )

    if (!inserted) {
      return
    }

    lastValidMessage = message.value
    updateCharCount()
  }

  emojiPicker.querySelectorAll('.emoji-picker-button').forEach(btn => {
    btn.addEventListener('click', e => {
      const token = btn.title
      handleEmojiSelect(token)
    })
  })
}

export const MAX_MESSAGE_LENGTH = maxMessageLength
export const INTERNAL_MESSAGE_LIMIT = internalMessageLimit
