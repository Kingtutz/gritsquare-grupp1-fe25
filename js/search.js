import { loadAllResults } from './search/search-rendering.js'
import { showSearchForm } from './search/search-form.js'

export const resetSearchFilter = async () => {
  const existingForm = document.getElementById('searchForm')
  if (existingForm) {
    existingForm.remove()
  }

  await loadAllResults()
}

export const searchUser = async () => {
  await showSearchForm(resetSearchFilter)
}
