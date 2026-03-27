const TERMS_ACCEPTED_KEY_BASE = 'garden-terms-accepted-v1'

function hasAcceptedTerms (username) {
  if (!username) return false
  return (
    window.localStorage.getItem(`${TERMS_ACCEPTED_KEY_BASE}-${username}`) ===
    'true'
  )
}

function setAcceptedTerms (username) {
  if (!username) return
  window.localStorage.setItem(`${TERMS_ACCEPTED_KEY_BASE}-${username}`, 'true')
}

export async function showTermsPopup (username) {
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
    checkboxText.textContent =
      'I have read and agree to the terms and conditions'

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

export async function ensureTermsAccepted (username, logout, reinitPrompt) {
  if (!username) {
    return true
  }

  if (hasAcceptedTerms(username)) {
    return true
  }

  // Show Terms only once per username unless localStorage is cleared.
  const accepted = await showTermsPopup(username)
  if (!accepted) {
    logout()
    await reinitPrompt()
  }

  return accepted
}
