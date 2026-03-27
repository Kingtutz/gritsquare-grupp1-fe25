import { messagesUrl, messagesBaseUrl } from '../core.js'

export const postMessage = async (message, name, title) => {
  const newMessage = {
    message: message,
    name: name,
    title: title,
    likes: 0,
    dislikes: 0,
    answer: { name: '', message: '', likes: 0, dislikes: 0 },
    replies: []
  }
  const options = {
    method: 'POST',
    body: JSON.stringify(newMessage),
    headers: {
      'Content-type': 'application/json; charset=UTF-8'
    }
  }

  const response = await fetch(messagesUrl, options)
  if (!response.ok) throw new Error(response.status)
  const newID = await response.json()
  console.log(newID.name)

  return { id: newID.name, newMessage }
}

export const postReply = async (postId, message, name) => {
  const cleanPostId = String(postId || '').trim()
  if (!cleanPostId) {
    throw new Error('Missing post id')
  }

  const replyPayload = {
    name,
    message,
    createdAt: Date.now(),
    likes: 0,
    dislikes: 0
  }

  const response = await fetch(
    `${messagesBaseUrl}/${encodeURIComponent(cleanPostId)}/replies.json`,
    {
      method: 'POST',
      body: JSON.stringify(replyPayload),
      headers: {
        'Content-type': 'application/json; charset=UTF-8'
      }
    }
  )

  if (!response.ok) {
    throw new Error(response.status)
  }

  const created = await response.json()
  return {
    ...replyPayload,
    id: created?.name || ''
  }
}

export const deleteMessagebyId = async id => {
  const cleanId = String(id || '').trim()
  if (!cleanId) {
    throw new Error('Missing message id')
  }

  try {
    const response = await fetch(
      `${messagesBaseUrl}/${encodeURIComponent(cleanId)}.json`,
      { method: 'DELETE' }
    )
    if (!response.ok) {
      throw new Error(response.status)
    }
    console.log('message deleted')
  } catch (err) {
    console.error('message not deleted')
    throw err
  }
}
