export function renderPost () {
  const postdiv = document.createElement('div')
  const title = document.createElement('h1')
  const message = document.createElement('p')
  const name = document.createElement('h4')
  const garden = document.getElementById('garden')
  title.innerText = 'first'
  message.innerText = 'I was here first!'
  name.innerText = 'Charlie'
  garden.append(postdiv)
  postdiv.append(title, message, name)
}
