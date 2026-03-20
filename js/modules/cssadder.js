export function addStyling () {
  const isInSitesFolder = () =>
    window.location.pathname.toLowerCase().includes('/sites/')

  const basePath = isInSitesFolder() ? '../css/' : './css/'

  const cssFiles = ['styles.css', 'footer.css', 'header.css', 'formstyling.css']

  cssFiles.forEach(file => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = basePath + file
    document.head.append(link)
  })
}
