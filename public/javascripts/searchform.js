

  const { states, abbrState, genreKeywords } = usStates

  for (let i = 0; i < states.length; i++ ) {
    document.querySelectorAll('.stateSelector').forEach(el => el.innerHTML += `<option value='${states[i]}'>${states[i]}</option>`)
  }
  const genresAndListener = () => {
    let gs = document.getElementById('genreSelector')
    let ag = document.getElementById('addGenres')
    genreKeywords.forEach( genre => {

      let newGenre = `<div class="form-check form-check-inline" style='display:inline-flex;'>
          <input class="form-check-input genre-selector ${genre}" type="checkbox" value="${genre}">
          <label class="form-check-label" for=${genre}>${genre}</label></div>`
      gs.innerHTML += newGenre
      ag.innerHTML += newGenre
    })
  }
  genresAndListener()
