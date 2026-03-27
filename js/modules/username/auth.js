import {
  loginUser as fbLoginUser,
  registerUser as fbRegisterUser,
  setUserOnlineState
} from '../../firebase/firebase.js'

const USERNAME_STORAGE_KEY = 'garden-username-v1'

export function getUsername () {
  return window.localStorage.getItem(USERNAME_STORAGE_KEY) || ''
}

export function saveUsername (username) {
  window.localStorage.setItem(USERNAME_STORAGE_KEY, username.trim())
  window.dispatchEvent(new CustomEvent('garden:auth-changed'))
}

export function logout () {
  const username = getUsername().trim()
  if (username) {
    setUserOnlineState(username, false).catch(() => {})
  }
  window.localStorage.removeItem(USERNAME_STORAGE_KEY)
  window.dispatchEvent(new CustomEvent('garden:auth-changed'))
}

export async function loginUser (username, password) {
  return fbLoginUser(username, password)
}

export async function registerUser (username, password) {
  return fbRegisterUser(username, password)
}

export async function setUserOnlineStateWrapper (username, online) {
  return setUserOnlineState(username, online)
}
