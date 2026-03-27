import { usersUrl } from './core.js'

export const registerUser = async (username, password) => {
  const checkResponse = await fetch(
    `${usersUrl}/${encodeURIComponent(username)}.json`
  )
  if (!checkResponse.ok) throw new Error(checkResponse.status)
  const existing = await checkResponse.json()
  if (existing !== null) {
    throw new Error('Username already taken')
  }

  const putResponse = await fetch(
    `${usersUrl}/${encodeURIComponent(username)}.json`,
    {
      method: 'PUT',
      body: JSON.stringify({ password }),
      headers: { 'Content-type': 'application/json; charset=UTF-8' }
    }
  )
  if (!putResponse.ok) throw new Error(putResponse.status)
  return putResponse.json()
}

export const loginUser = async (username, password) => {
  const response = await fetch(
    `${usersUrl}/${encodeURIComponent(username)}.json`
  )
  if (!response.ok) throw new Error(response.status)
  const user = await response.json()
  if (user === null) {
    throw new Error('User not found')
  }
  if (user.password !== password) {
    throw new Error('Incorrect password')
  }
  return true
}

export const isUserAdmin = async username => {
  const cleanUsername = String(username || '').trim()
  if (!cleanUsername) {
    return false
  }

  const response = await fetch(
    `${usersUrl}/${encodeURIComponent(cleanUsername)}.json`
  )
  if (!response.ok) {
    throw new Error(response.status)
  }

  const user = await response.json()
  return Boolean(user?.admin)
}
