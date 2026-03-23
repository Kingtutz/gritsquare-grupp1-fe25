import { getAll } from './firebase/messages.js'
import { renderFlowers } from './rendering/renderflowers.js'

const garden = document.querySelector('.garden-wrapper')
const searchForm = document.querySelector('#searchForm')

export const searchUser = async () => {
  const all = await getAll()

  const form = document.createElement('form')

  const input = document.createElement('input')
  input.type = 'text'
  input.placeholder = 'Search'

  const searchBtn = document.createElement('button')
  searchBtn.type = 'submit'
  searchBtn.textContent = 'Search'

  form.appendChild(input)
  form.appendChild(searchBtn)
  searchForm.appendChild(form)

  form.addEventListener('submit', e => {
    e.preventDefault()

    const search = input.value.toLowerCase()

    const filteredUsers = {}

    console.log(search)

    for (const key in all) {
      const users = all[key]
      //console.log(names)
      if (users.name.toLowerCase().includes(search)) {
        console.log(input.value)
        filteredUsers[key] = users
      }
    }
    const flowers = renderFlowers(filteredUsers)
    garden.innerHTML = ''
    flowers.forEach(flower => {
      garden.appendChild(flower)
    })
    input.value = ''
  })
}
