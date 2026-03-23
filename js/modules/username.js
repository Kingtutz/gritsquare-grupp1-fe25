import { loginUser, registerUser } from '../firebase/firebase.js'

const USERNAME_STORAGE_KEY = 'garden-username-v1'

export function getUsername () {
  return window.localStorage.getItem(USERNAME_STORAGE_KEY) || ''
}

export function logout () {
  window.localStorage.removeItem(USERNAME_STORAGE_KEY)
}

function saveUsername (username) {
  window.localStorage.setItem(USERNAME_STORAGE_KEY, username.trim())
}

function makeField (id, type, placeholder, autocomplete) {
  const input = document.createElement('input')
  input.id = id
  input.className = 'username-prompt-input'
  input.type = type
  input.placeholder = placeholder
  input.maxLength = 64
  input.autocomplete = autocomplete
  return input
}

export function initUsernamePrompt () {
  if (getUsername()) {
    return
  }

  let isLoginMode = true

  const overlay = document.createElement('div')
  overlay.id = 'username-prompt-overlay'

  const box = document.createElement('div')
  box.className = 'username-prompt-box'

  const heading = document.createElement('h2')
  heading.className = 'username-prompt-heading'

  const usernameInput = makeField('login-username', 'text', 'Username', 'username')
  const passwordInput = makeField('login-password', 'password', 'Password', 'current-password')

  const confirmWrapper = document.createElement('div')
  confirmWrapper.className = 'username-prompt-confirm-wrapper'
  const confirmInput = makeField('login-confirm', 'password', 'Confirm password', 'new-password')
  confirmWrapper.append(confirmInput)

  const errorMsg = document.createElement('span')
  errorMsg.className = 'username-prompt-error'
  errorMsg.hidden = true

  const submitBtn = document.createElement('button')
  submitBtn.className = 'username-prompt-btn'
  submitBtn.type = 'button'

  const toggleText = document.createElement('p')
  toggleText.className = 'username-prompt-toggle'

  const toggleLink = document.createElement('button')
  toggleLink.className = 'username-prompt-toggle-link'
  toggleLink.type = 'button'

  toggleText.append(toggleLink)

  function setMode (loginMode) {
    isLoginMode = loginMode
    heading.textContent = loginMode ? 'Login' : 'Register'
    submitBtn.textContent = loginMode ? 'Login' : 'Register'
    confirmWrapper.hidden = loginMode
    toggleLink.textContent = loginMode ? 'Create an account' : 'Already have an account? Login'
    toggleText.childNodes[0].textContent = loginMode ? "Don't have an account? " : ''
    errorMsg.hidden = true
    errorMsg.textContent = ''
  }

  toggleLink.addEventListener('click', () => setMode(!isLoginMode))

  function showError (msg) {
    errorMsg.textContent = msg
    errorMsg.hidden = false
  }

  async function submit () {
    const username = usernameInput.value.trim()
    const password = passwordInput.value

    if (!username) {
      showError('Please enter a username')
      usernameInput.focus()
      return
    }
    if (!password) {
      showError('Please enter a password')
      passwordInput.focus()
      return
    }

    if (!isLoginMode) {
      if (password !== confirmInput.value) {
        showError('Passwords do not match')
        confirmInput.focus()
        return
      }
      if (password.length < 6) {
        showError('Password must be at least 6 characters')
        passwordInput.focus()
        return
      }
    }

    submitBtn.disabled = true
    submitBtn.textContent = isLoginMode ? 'Logging in...' : 'Registering...'
    errorMsg.hidden = true

    try {
      if (isLoginMode) {
        await loginUser(username, password)
      } else {
        await registerUser(username, password)
      }
      saveUsername(username)
      overlay.remove()
    } catch (err) {
      const message =
        err.message === 'Username already taken'
          ? 'Username already taken'
          : err.message === 'User not found'
            ? 'No account with that username'
            : err.message === 'Incorrect password'
              ? 'Incorrect password'
              : 'Something went wrong, try again'
      showError(message)
      submitBtn.disabled = false
      setMode(isLoginMode)
    }
  }

  submitBtn.addEventListener('click', submit)
  ;[usernameInput, passwordInput, confirmInput].forEach(input => {
    input.addEventListener('keydown', event => {
      if (event.key === 'Enter') submit()
    })
    input.addEventListener('input', () => {
      errorMsg.hidden = true
    })
  })

  setMode(true)

  box.append(heading, usernameInput, passwordInput, confirmWrapper, errorMsg, submitBtn, toggleText)
  overlay.append(box)
  document.body.append(overlay)

  setTimeout(() => usernameInput.focus(), 50)
}
