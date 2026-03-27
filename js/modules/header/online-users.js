import { getUsername } from '../username.js'
import { subscribeToOnlineUsers } from '../../firebase/firebase.js'

let unsubscribeOnlineUsers = null

export function attachOnlineUsersSection (menuContent, onUsersUpdate = null) {
  if (unsubscribeOnlineUsers) {
    unsubscribeOnlineUsers()
    unsubscribeOnlineUsers = null
  }

  const section = document.createElement('section')
  section.className = 'menu-online-users'

  const heading = document.createElement('p')
  heading.className = 'menu-online-users-heading'

  const list = document.createElement('ul')
  list.className = 'menu-online-users-list'

  section.append(heading, list)
  menuContent.append(section)

  unsubscribeOnlineUsers = subscribeToOnlineUsers(onlineUsers => {
    if (typeof onUsersUpdate === 'function') {
      onUsersUpdate(onlineUsers)
    }

    heading.textContent = `Online now (${onlineUsers.length})`
    list.replaceChildren()

    if (onlineUsers.length === 0) {
      const empty = document.createElement('li')
      empty.className = 'menu-online-users-empty'
      empty.textContent = 'No users online'
      list.append(empty)
      return
    }

    onlineUsers.forEach(name => {
      const item = document.createElement('li')
      item.textContent = name

      if (name.toLowerCase() === getUsername().trim().toLowerCase()) {
        item.classList.add('menu-online-users-self')
      }

      list.append(item)
    })
  })
}

export function cleanupOnlineUsers () {
  if (unsubscribeOnlineUsers) {
    unsubscribeOnlineUsers()
    unsubscribeOnlineUsers = null
  }
}
