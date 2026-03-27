import { postMessage } from '../../firebase/firebase.js'
import { censorBadWords } from '../censor.js'
import { createPixelLabel, setPixelButtonContent } from './ui-utils.js'
import { loadHubContent } from './popup.js'

const isInSitesFolder = () =>
  window.location.pathname.toLowerCase().includes('/sites/')

const basePath = isInSitesFolder() ? '../img/cabin' : './img/cabin'

export function showPostForm (contentArea, username, hubContainer, postsList) {
  // Hide hub and show form
  hubContainer.style.display = 'none'

  const formContainer = document.createElement('div')
  formContainer.className = 'cabin-post-form-container'
  formContainer.style.display = 'flex'
  formContainer.style.flexDirection = 'column'
  formContainer.style.gap = '12px'
  formContainer.style.overflowY = 'auto'

  // Back button
  const backBtn = document.createElement('button')
  backBtn.type = 'button'
  backBtn.className = 'cabin-nav-btn'
  setPixelButtonContent(backBtn, 'pixel-icon-arrow-left', 'Back')
  backBtn.addEventListener('click', () => {
    formContainer.remove()
    hubContainer.style.display = 'flex'
  })

  const form = document.createElement('form')
  form.style.display = 'flex'
  form.style.flexDirection = 'column'
  form.style.gap = '12px'

  const nameInput = document.createElement('input')
  nameInput.placeholder = 'Your name'
  nameInput.type = 'text'
  nameInput.value = username // Pre-fill with logged-in username
  nameInput.required = true

  const titleInput = document.createElement('input')
  titleInput.placeholder = 'Post title'
  titleInput.type = 'text'
  titleInput.required = true

  const messageInput = document.createElement('textarea')
  messageInput.placeholder = 'Your message'
  messageInput.maxLength = 400
  messageInput.required = true
  messageInput.style.minHeight = '100px'
  messageInput.style.resize = 'vertical'

  const button = document.createElement('button')
  button.textContent = 'Post'
  button.type = 'submit'
  button.style.padding = '10px 20px'
  button.style.backgroundColor = '#8B6F47'
  button.style.color = 'white'
  button.style.border = 'none'
  button.style.borderRadius = '4px'
  button.style.cursor = 'pointer'

  form.addEventListener('submit', async e => {
    e.preventDefault()

    try {
      const nameValue = censorBadWords(nameInput.value.trim())
      const titleValue = censorBadWords(titleInput.value.trim())
      const messageValue = censorBadWords(messageInput.value.trim())

      await postMessage(messageValue, nameValue, titleValue)
      form.innerHTML = ''
      const successMessage = document.createElement('p')
      successMessage.className = 'cabin-form-success'
      successMessage.append(createPixelLabel('pixel-icon-check', 'Post sent!'))
      form.append(successMessage)

      setTimeout(() => {
        // Reload the posts list
        formContainer.remove()
        hubContainer.style.display = 'flex'
        // Refresh the posts
        const refreshPostsList = hubContainer.querySelector('.cabin-posts-list')
        if (refreshPostsList) {
          loadHubContent(
            username,
            refreshPostsList,
            hubContainer.querySelector('.cabin-liked-list'),
            hubContainer
          )
        }
      }, 1500)
    } catch (error) {
      console.error('Error posting message: ', error)
      form.innerHTML =
        '<p style="text-align: center; color: red;">Error sending post. Try again!</p>'
    }
  })

  form.append(nameInput, titleInput, messageInput, button)
  formContainer.append(backBtn, form)

  // Insert after header
  const header = contentArea.querySelector('.cabin-popup-header')
  header.after(formContainer)
}
