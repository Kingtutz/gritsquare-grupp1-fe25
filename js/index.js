import { getAll } from './firebase/firebase.js'
import { renderPost } from './rendering/renderpost.js'
import { initHeaderOnLoad } from './modules/header.js'
import { addStyling } from './modules/cssadder.js'

initHeaderOnLoad()
addStyling()
getAll().then(() => renderPost())
