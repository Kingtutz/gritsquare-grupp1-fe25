import {
  loginUser,
  registerUser,
  setUserOnlineState
} from '../firebase/firebase.js'

const USERNAME_STORAGE_KEY = 'garden-username-v1'
const TERMS_ACCEPTED_KEY_BASE = 'garden-terms-accepted-v1'

export function getUsername () {
  return window.localStorage.getItem(USERNAME_STORAGE_KEY) || ''
}

export function logout () {
  const username = getUsername().trim()
  if (username) {
    setUserOnlineState(username, false).catch(() => {})
  }
  window.localStorage.removeItem(USERNAME_STORAGE_KEY)
  window.dispatchEvent(new CustomEvent('garden:auth-changed'))
}

function hasAcceptedTerms (username) {
  if (!username) return false
  return window.localStorage.getItem(`${TERMS_ACCEPTED_KEY_BASE}-${username}`) === 'true'
}

function setAcceptedTerms (username) {
  if (!username) return
  window.localStorage.setItem(`${TERMS_ACCEPTED_KEY_BASE}-${username}`, 'true')
}

async function showTermsPopup (username) {
  if (!username) return

  return new Promise(resolve => {
    const overlay = document.createElement('div')
    overlay.id = 'terms-prompt-overlay'
    overlay.style.position = 'fixed'
    overlay.style.inset = '0'
    overlay.style.background = 'rgba(0, 0, 0, 0.6)'
    overlay.style.display = 'flex'
    overlay.style.alignItems = 'center'
    overlay.style.justifyContent = 'center'
    overlay.style.zIndex = '9999'

    const box = document.createElement('div')
    box.className = 'username-prompt-box terms-prompt-box'
    box.style.maxWidth = '450px'

    const heading = document.createElement('h2')
    heading.className = 'username-prompt-heading'
    heading.textContent = 'Terms & Conditions'

    const text = document.createElement('p')
    text.className = 'terms-prompt-text'
    text.innerHTML =
      'Welcome to the garden! Please read and accept these terms before continuing. ' +
      'By accepting, you agree to follow community guidelines and use this app respectfully.'

    const rules = document.createElement('ul')
    rules.className = 'terms-prompt-rules'
    rules.innerHTML =
      '<li>Be respectful and kind.</li>' +
      '<li>No offensive or abusive content.</li>' +
      '<li>Do not share private or personal data.</li>' +
      '<li>Use this app according to local laws.</li>' +
      '<li>Garden team may revise these terms of service at any time without notice. </li>' +
      '<li>Failure to comply with these terms may result in removal of your account.</li>' +
      '<li>Have fun and enjoy the garden!</li>'

    const checkboxWrapper = document.createElement('label')
    checkboxWrapper.style.display = 'flex'
    checkboxWrapper.style.alignItems = 'center'
    checkboxWrapper.style.gap = '8px'
    checkboxWrapper.style.margin = '10px 0 4px'

    const acceptCheckbox = document.createElement('input')
    acceptCheckbox.type = 'checkbox'
    acceptCheckbox.id = 'terms-accept-checkbox'

    const checkboxText = document.createElement('span')
    checkboxText.textContent = 'I have read and agree to the terms and conditions'

    checkboxWrapper.append(acceptCheckbox, checkboxText)

    const declineBtn = document.createElement('button')
    declineBtn.className = 'username-prompt-btn'
    declineBtn.type = 'button'
    declineBtn.textContent = 'Decline'

    const acceptBtn = document.createElement('button')
    acceptBtn.className = 'username-prompt-btn'
    acceptBtn.type = 'button'
    acceptBtn.textContent = 'Accept'
    acceptBtn.disabled = true

    acceptCheckbox.addEventListener('change', () => {
      acceptBtn.disabled = !acceptCheckbox.checked
    })

    declineBtn.addEventListener('click', () => {
      overlay.remove()
      resolve(false)
    })

    acceptBtn.addEventListener('click', () => {
      setAcceptedTerms(username)
      overlay.remove()
      resolve(true)
    })

    const buttonWrapper = document.createElement('div')
    buttonWrapper.style.display = 'flex'
    buttonWrapper.style.justifyContent = 'space-between'
    buttonWrapper.style.gap = '12px'

    buttonWrapper.append(declineBtn, acceptBtn)
    box.append(heading, text, rules, checkboxWrapper, buttonWrapper)
    overlay.append(box)
    document.body.append(overlay)
  })
}

async function ensureTermsAccepted () {
  const username = getUsername()
  if (!username) {
    return true
  }

  // Always show Terms modal after each login.
  const accepted = await showTermsPopup(username)
  return accepted
}

function saveUsername (username) {
  window.localStorage.setItem(USERNAME_STORAGE_KEY, username.trim())
  window.dispatchEvent(new CustomEvent('garden:auth-changed'))
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

export async function initUsernamePrompt () {
  if (getUsername()) {
    const accepted = await ensureTermsAccepted()
    if (!accepted) {
      logout()
      await initUsernamePrompt()
    }
    return
  }

  let isLoginMode = true

  const overlay = document.createElement('div')
  overlay.id = 'username-prompt-overlay'

  const box = document.createElement('div')
  box.className = 'username-prompt-box'

  const heading = document.createElement('h2')
  heading.className = 'username-prompt-heading'

  const usernameInput = makeField(
    'login-username',
    'text',
    'Username',
    'username'
  )
  const passwordInput = makeField(
    'login-password',
    'password',
    'Password',
    'current-password'
  )

  const confirmWrapper = document.createElement('div')
  confirmWrapper.className = 'username-prompt-confirm-wrapper'
  const confirmInput = makeField(
    'login-confirm',
    'password',
    'Confirm password',
    'new-password'
  )
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
    toggleLink.textContent = loginMode
      ? 'Create an account'
      : 'Already have an account? Login'
    toggleText.childNodes[0].textContent = loginMode
      ? "Don't have an account? "
      : ''
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
      setUserOnlineState(username, true).catch(() => {})
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

  box.append(
    heading,
    usernameInput,
    passwordInput,
    confirmWrapper,
    errorMsg,
    submitBtn,
    toggleText
  )
  overlay.append(box)
  document.body.append(overlay)

  setTimeout(() => usernameInput.focus(), 50)
}
