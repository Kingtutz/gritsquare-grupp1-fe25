import {
  createFormElements,
  setupCharCountListener,
  setupEmojiInsertion
} from './messageForm/form-structure.js'
import {
  setupFormSubmission,
  setupFormCloseHandlers,
  setupCharCountDisplay
} from './messageForm/form-handlers.js'

export const createFlowerForm = () => {
  const formElements = createFormElements()
  const { wrapper, form, cancelBtn, message, charCount } = formElements

  // Setup character count display
  const updateCharCount = setupCharCountDisplay(message, charCount)

  // Setup close handlers (returns removeForm function)
  const removeForm = setupFormCloseHandlers(wrapper, form, cancelBtn)

  // Setup character count validation
  setupCharCountListener(message, charCount, updateCharCount)

  // Setup emoji insertion
  setupEmojiInsertion(
    formElements.emojiPicker,
    message,
    charCount,
    updateCharCount
  )

  // Setup form submission
  setupFormSubmission(form, formElements, removeForm)

  // Append to DOM and focus title
  document.body.append(wrapper)
  const titleInput = wrapper.querySelector('input[placeholder="Title"]')
  if (titleInput) {
    titleInput.focus()
  }

  return wrapper
}
