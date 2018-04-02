
$(document).ready(function() {

  const { states, abbrState, genreKeywords } = usStates

  for (let i = 0; i < states.length; i++ ) {
    $('.stateSelector').append($(`<option value='${states[i]}'>${states[i]}</option>`))
  }

  genreKeywords.forEach( genre => {
      $('.genres').append($(`<div class="form-check form-check-inline" style='display:inline-flex;'>
        <input class="form-check-input genre-selector ${genre}" type="checkbox" value=${genre}>
        <label class="form-check-label" for=${genre}>${genre}</label></div>`))
  })











})
