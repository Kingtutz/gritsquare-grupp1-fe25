import { getAll } from './firebase/firebase.js'
import { renderFlowers } from './rendering/renderflowers.js'

function getGarden () {
  return (
    document.getElementById('garden') ??
    document.querySelector('.garden-wrapper')
  )
}

function getSearchMount () {
  return document.querySelector('[data-generated-header="true"]')
}

function clearRenderedFlowers (garden) {
  garden.querySelectorAll('.garden-flower').forEach(flower => flower.remove())
}

function clearSearchMessage (garden) {
  const existingMessage = garden.querySelector('.notFound')
  if (existingMessage) {
    existingMessage.remove()
  }
}

async function renderSearchResults (data) {
  const garden = getGarden()

  if (!garden) {
    return
  }

  clearRenderedFlowers(garden)
  clearSearchMessage(garden)

  const flowers = renderFlowers(data)
  flowers.forEach(flower => {
    garden.appendChild(flower)
  })
}

export const resetSearchFilter = async () => {
  const existingForm = document.getElementById('searchForm')
  if (existingForm) {
    existingForm.remove()
  }

  const all = await getAll()
  await renderSearchResults(all)
}

export const searchUser = async () => {
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

  const garden = getGarden()
  const searchMount = getSearchMount()

  if (!garden || !searchMount) {
    return
  }

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
  closeBtn.addEventListener('click', () => resetSearchFilter())

  form.appendChild(closeBtn)
  form.appendChild(input)
  form.appendChild(searchBtn)
  searchMount.appendChild(form)
  input.focus()

  form.addEventListener('submit', async e => {
    e.preventDefault()

    searchBtn.disabled = true

    const search = input.value.trim().toLowerCase()

    const all = await getAll()

    const filteredUsers = {}

    for (const key in all) {
      const users = all[key]
      if (users.name.toLowerCase() === search) {
        filteredUsers[key] = users
      }
    }

    await renderSearchResults(filteredUsers)

    if (Object.keys(filteredUsers).length === 0) {
      const notAUser = document.createElement('p')
      notAUser.classList.add('notFound')
      notAUser.innerText = 'That user does not exist'
      garden.appendChild(notAUser)
    }

    form.remove()
  })
}
