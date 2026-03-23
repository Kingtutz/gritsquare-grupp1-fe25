export function addStyling () {
  const isInSitesFolder = () =>
    window.location.pathname.toLowerCase().includes('/sites/')

  const basePath = isInSitesFolder() ? '../css/' : './css/'
  const fontHref =
    'https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400..700&display=swap'

  const cssFiles = [
    'styles.css',
    'footer.css',
    'header.css',
    'formstyling.css',
    'rabbit.css',
    'search.css'
  ]

  const existingFont = document.head.querySelector(
    `link[data-google-font="pixelify-sans"]`
  )

  if (!existingFont) {
    const fontLink = document.createElement('link')
    fontLink.rel = 'stylesheet'
    fontLink.href = fontHref
    fontLink.dataset.googleFont = 'pixelify-sans'
    document.head.append(fontLink)
  }

  return Promise.all(
    cssFiles.map(file => {
      const link = document.createElement('link')

      link.rel = 'stylesheet'
      link.href = basePath + file

      const stylesheetLoaded = new Promise(resolve => {
        link.addEventListener('load', resolve, { once: true })
        link.addEventListener('error', resolve, { once: true })
      })

      document.head.append(link)

      return stylesheetLoaded
    })
  )
}
