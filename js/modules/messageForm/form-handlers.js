import { postMessage } from '../../firebase/firebase.js'
import { showAdVideo } from '../advertisement.js'
import { censorBadWords } from '../censor.js'
import { getEmojiAwareLength } from '../emojis.js'

export function setupFormSubmission (form, formElements, removeForm) {
  const { title, message, name, button, sendStatus, emojiPickerPanel } =
    formElements

  form.addEventListener('submit', async e => {
    e.preventDefault()

    const titleValue = censorBadWords(title.value.trim())
    const messageValue = censorBadWords(message.value.trim())
    const nameValue = censorBadWords(name.value.trim())

    if (!nameValue || !messageValue) {
      sendStatus.textContent = 'Name and message are required.'
      return
    }

    try {
      button.disabled = true
      sendStatus.textContent = 'Sending...'

      await postMessage(messageValue, nameValue, titleValue)
      showAdVideo()
      removeForm()
      console.log('message sent!')
    } catch (error) {
      console.error('Error sending message: ', error)
      button.disabled = false
      sendStatus.textContent = 'Could not send. Try again.'
    }
  })
}

export function setupFormCloseHandlers (wrapper, form, cancelBtn) {
  let isRemoved = false

  const removeForm = () => {
    if (isRemoved) {
      return
    }

    isRemoved = true
    document.removeEventListener('keydown', onKeyDown)
    wrapper.remove()
  }

  const onKeyDown = event => {
    if (event.key === 'Escape') {
      removeForm()
    }
  }

  document.addEventListener('keydown', onKeyDown)
  cancelBtn.addEventListener('click', removeForm)

  return removeForm
}

export function setupCharCountDisplay (message, charCount) {
  const updateCharCount = () => {
    const length = getEmojiAwareLength(message.value)
    charCount.textContent = `${length} / 100`
  }

  updateCharCount()
  return updateCharCount
}
