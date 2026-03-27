// Core Firebase setup and data URLs
export {
  db,
  messagesUrl,
  messagesBaseUrl,
  usersUrl,
  usersRef,
  getAll,
  subscribeToMessages
} from './core.js'

// Authentication functions
export { registerUser, loginUser, isUserAdmin } from './auth/auth.js'

// Message operations
export {
  postMessage,
  postReply,
  deleteMessagebyId
} from './messages/messages.js'

// User operations
export {
  setUserOnlineState,
  subscribeToOnlineUsers,
  getUserPosts,
  getUserLikedPosts,
  getUserDislikedPosts
} from './users/users.js'

// Like/Dislike operations
export {
  likePost,
  unlikePost,
  updatePostLikes,
  LikeMessage,
  dislikePost,
  undislikePost,
  updatePostDislikes,
  disLikeMessage
} from './likes/likes.js'
