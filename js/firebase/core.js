import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js'
import {
  getDatabase,
  ref,
  onValue
} from 'https://www.gstatic.com/firebasejs/12.10.0/firebase-database.js'

// https://firebase.google.com/docs/web/setup#available-libraries
const firebaseConfig = {
  apiKey: 'AIzaSyBYrqmRZmIQjtWQZMSynD0F2wZPWA462tc',
  authDomain: 'messageboard-77286.firebaseapp.com',
  databaseURL:
    'https://messageboard-77286-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'messageboard-77286',
  storageBucket: 'messageboard-77286.firebasestorage.app',
  messagingSenderId: '262402990271',
  appId: '1:262402990271:web:724586d400e56438b0a60a'
}

const app = initializeApp(firebaseConfig)
export const db = getDatabase(app)

export const messagesUrl =
  'https://messageboard-77286-default-rtdb.europe-west1.firebasedatabase.app/messages.json'
export const messagesBaseUrl =
  'https://messageboard-77286-default-rtdb.europe-west1.firebasedatabase.app/messages'
export const usersUrl =
  'https://messageboard-77286-default-rtdb.europe-west1.firebasedatabase.app/users'
export const usersRef = ref(db, '/messages')

export const getAll = async () => {
  const response = await fetch(messagesUrl)
  if (!response.ok) throw new Error(response.status)
  const messages = await response.json()
  console.log(messages)
  return messages
}

export const subscribeToMessages = onData => {
  if (typeof onData !== 'function') {
    return () => {}
  }

  const messagesRef = ref(db, '/messages')
  return onValue(messagesRef, snapshot => {
    onData(snapshot.val() || {})
  })
}
