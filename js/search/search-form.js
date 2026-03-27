import { getAll } from '../firebase/firebase.js'
import { renderSearchResults } from './search-rendering.js'

function getSearchMount () {
  return document.querySelector('[data-generated-header="true"]')
}

function createSearchForm () {
  const form = document.createElement('form')
  form.id = 'searchForm'

  const input = document.createElement('input')
  input.type = 'text'
  input.placeholder = 'Search by username'
  input.setAttribute('aria-label', 'Search by username')

  const searchBtn = document.createElement('button')
  searchBtn.type = 'submit'
  searchBtn.textContent = 'Search'

  const closeBtn = document.createElement('button')
  closeBtn.type = 'button'
  closeBtn.className = 'search-close-btn'
  closeBtn.setAttribute('aria-label', 'Close search')
  closeBtn.textContent = '✕'

  form.appendChild(closeBtn)
  form.appendChild(input)
  form.appendChild(searchBtn)

  return { form, input, searchBtn, closeBtn }
}

export async function showSearchForm (onClose) {
  const existingForm = document.getElementById('searchForm')
  if (existingForm) {
    if (existingForm.tagName !== 'FORM') {
      existingForm.remove()
    } else {
      const existingInput = existingForm.querySelector('input')
      if (existingInput) {
        existingInput.focus()
        existingInput.select()
      }
      return
    }
  }

  const searchMount = getSearchMount()

  if (!searchMount) {
    return
  }

  const { form, input, searchBtn, closeBtn } = createSearchForm()

  closeBtn.addEventListener('click', onClose)

  form.addEventListener('submit', async e => {
    e.preventDefault()

    searchBtn.disabled = true

    const search = input.value.trim().toLowerCase()
    const all = await getAll()
    const filteredUsers = {}

    for (const key in all) {
      const users = all[key]
      if (users.name && users.name.toLowerCase() === search) {
        filteredUsers[key] = users
      }
    }

    await renderSearchResults(filteredUsers)

    if (Object.keys(filteredUsers).length === 0) {
      alert('That user does not exist')
    }
    form.remove()
  })

  searchMount.appendChild(form)
  input.focus()
}
