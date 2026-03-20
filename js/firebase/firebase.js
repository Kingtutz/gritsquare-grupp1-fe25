import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js'
import {
  getDatabase,
  ref,
  remove
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
const db = getDatabase(app)
export const usersRef = ref(db, '/messages')
const url =
  'https://messageboard-77286-default-rtdb.europe-west1.firebasedatabase.app/messages.json'

export const getAll = async () => {
  const response = await fetch(url)
  if (!response.ok) throw new Error(response.status)
  const messages = await response.json()
  console.log(messages)
  return messages
}

export const postMessage = async () => {
  const newMessage = {
    message: 'hello',
    name: 'Charlie',
    likes: 0,
    dislikes: 0
  }
  const options = {
    method: 'POST',
    body: JSON.stringify(newMessage),
    headers: {
      'Content-type': 'application/json; charset=UTF-8'
    }
  }

  const response = await fetch(url, options)
  if (!response.ok) throw new Error(response.status)
  const newID = await response.json()
  console.log(newID.name)

  return { id: newID.name, newMessage }
}
getAll()

export const deleteMessagebyId = async (id) => {

const singleMessageRef = ref(db,`${id}/messages`)
try {
  await remove(singleMessageRef)
console.log('message deleted')
} catch(err) {
  console.error('message not deleted')
throw err
}
     
}
