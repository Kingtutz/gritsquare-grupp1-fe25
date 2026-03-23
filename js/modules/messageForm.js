import { postMessage } from '../firebase/firebase.js'
import { getUsername } from './username.js'

export const createFlowerForm = () => {
  const wrapper = document.createElement('div')
  wrapper.classList.add('form-wrapper')

  const cancelBtn = document.createElement('button')
  cancelBtn.textContent = 'X'
  cancelBtn.classList.add('cancelBtn')

  cancelBtn.addEventListener('click', () => wrapper.remove())

  const form = document.createElement('form')

  const title = document.createElement('input')
  title.placeholder = 'Title'

  const message = document.createElement('textarea')
  message.placeholder = 'Message'
  message.maxLength = 400

  const name = document.createElement('input')
  name.placeholder = 'Name'
  name.value = getUsername()

  const button = document.createElement('button')
  button.textContent = 'Send!'
  button.classList.add('sendBtn')

  form.addEventListener('submit', async e => {
    e.preventDefault()

    try {
      const titleValue = title.value
      const messageValue = message.value
      const nameValue = name.value

      await postMessage(messageValue, nameValue, titleValue)
      wrapper.remove()
      console.log('message sent!')
    } catch (error) {
      console.error('Error sending message: ', error)
    }
  })

  form.append(name, title, message, button)
  wrapper.append(cancelBtn, form)

  document.body.append(wrapper)
}
