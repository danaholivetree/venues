
$(document).ready(function() {

  const { states, abbrState } = usStates

  for (let i = 0; i < states.length; i++ ) {
    $('.stateSelector').append($(`<option value=${states[i]}>${states[i]}</option>`))
  }

  let genreKeywords = [ 'Psych','Rock','Americana','Indie','Blues','Bluegrass',
  'Zombie','Death','Polka','Prog','Lo-fi','Pop','Indie','Shoe-Gaze','Glam',
  'Experimental','Slow','Eclectic','Orchestral','Cello', 'Freak', 'Folk',
  'Ambient','Classic','Rap','R&B','Dark','Dream','Electro','Power',
  'Rock & Roll','Surf','Vintage','Country','Swing','Blues','Experimental','Punk',
  'Metal', 'Hardcore', 'Noise', 'Electronic', 'Jam', 'Classical',
  'Singer-songwriter', 'Jazz', 'Math', 'Synth', 'Goth', 'Opera', 'Rockabilly',
  'Swing', 'Ragtime', 'Post-rock', 'Steampunk', 'Avant', 'World', 'Emo' ]

  genreKeywords.forEach( genre => {
      $('.genres').append($(`<div class="form-check form-check-inline" style='display:inline-flex;'>
        <input class="form-check-input genre-selector" type="checkbox" value=${genre}>
        <label class="form-check-label" for=${genre}>${genre}</label></div>`))
  })


  $('.notany').click( e => {
    if ($('.notany:checked').length === 0) {
        $('#capAny').prop("checked", true)
    } else {
        $('#capAny').prop("checked", false)
    }
  })

  $('#venueSearchForm').submit( e => {
    e.preventDefault()
    let formData = e.target.elements
    let state = formData.state.value
    let city = formData.city.value
    let venue = formData.venue.value
    let capacity = []
    if (formData.capAny.checked) {
      capacity.push('any')
    } else {
      if (formData.unlabeled.checked) {
        capacity.push('unlabeled')
      }
      if (formData.capxs.checked) {
        capacity.push('capxs')
      }
      if (formData.caps.checked) {
        capacity.push('caps')
      }
      if (formData.capm.checked) {
        capacity.push('capm')
      }
      if (formData.capl.checked) {
        capacity.push('capl')
      }
      if (formData.capxl.checked) {
        capacity.push('capxl')
      }
    }
    if (capacity.length < 1) {
      capacity.push('any')
    }
    const params = {state, city, venue, capacity}
    const queryString = $.param(params)

    $.get(`/api/venues/q?${queryString}`, (data, status) => {
      console.log('data length ', data.venues.length);
      if (state !== 'All') {
        $('.stateDisplay').text(`Venues in ${state}`).show()
      } else if (city) {
        $('.stateDisplay').text(`Venues in ${city}`).show()
      } else if (venue) {
        $('.stateDisplay').text(`Venues matching '${venue}'`).show()
      }
        $('#venuesList').empty()
        data.venues.forEach( venue => {
          let urlText = (venue.url.split('/')[2] === 'www.facebook.com') ? 'facebook' : 'website'
          let capText = venue.capacity ? venue.capacity : ''
          let venueText = `${venue.venue}`
          if (venue.diy) {
            venueText = venueText + '*'
          }

          $('#venuesList').append($(`
            <tr>
              <td>${abbrState(venue.state, 'abbr')}</td>
              <td>${venue.city}</td>
              <td>${venueText}</td>
              <td><a href=${venue.url} target='_blank'>${urlText}</a></td>
              <td>${capText}</td>
              <td id=upVote${venue.id}><span>${venue.up}</span><button class='btn btn-default thumb-up' data-id=${venue.id}> <i class="material-icons md-18" data-id=${venue.id}>thumb_up</i></button></td>
              <td id=downVote${venue.id}><span>${venue.down}</span><button class='btn btn-default thumb-down' data-id=${venue.id}><i class="material-icons md-18" data-id=${venue.id}>thumb_down</i></button></td>
            </tr>
          `))
        })
        $('.thumb-up').click( e => {
            $.post(`/api/votes`, {venueId: e.target.dataset.id, vote: 'up'}, data => {
              $(`#upVote${data.id} span`).text(`${data.up}`)
              $(`#upVote${data.id} button`).css("color", "green")
              $(`#downVote${data.id} span`).text(`${data.down}`)
              $(`#downVote${data.id} button`).css("color", "black")
            })
        })

        $('.thumb-down').click( e => {
          $.post(`/api/votes`, {venueId: e.target.dataset.id, vote: 'down'}, data => {
            $(`#upVote${data.id} span`).text(`${data.up}`)
            $(`#upVote${data.id} button`).css("color", "black")
            $(`#downVote${data.id} span`).text(`${data.down}`)
            $(`#downVote${data.id} button`).css("color", "red")
          })
        })

    })
  })

  $('#bandSearchForm').submit( e => {
    e.preventDefault()
    var target = $( event.target )
    let formData = e.target.elements
    let state = formData.state.value
    let city = formData.city.value
    let band = formData.band.value
    let genres = []
    $('.genre-selector:checked').each( function() {
        genres.push(this.value)
    })
    const params = {state, city, band, genres}
    const queryString = $.param(params)
    $.get(`/api/bands/q?${queryString}`, (data, status) => {
      if (state !== 'All') {
        $('.stateDisplay').text(`Bands in ${state}`).show()
      } else if (city) {
        $('.stateDisplay').text(`Bands in ${city}`).show()
      } else if (band) {
        $('.stateDisplay').text(`Bands matching '${band}'`).show()
      }
        $('#bandsList').empty()
        data.forEach( band => {
          let displayUrl = band.url && band.url.split('/')[2][0] === 'w' ? band.url.split('/')[2].split('.').slice(1).join('.') : band.url && band.url.split('/')[2][0] !== 'w' ? band.url.split('/')[2] : ''
          $('#bandsList').append($(`
            <tr>
              <td>${abbrState(band.state, 'abbr')}</td>
              <td>${band.city}</td>
              <td>${band.band}</td>
              <td>${band.genre}</td>
              <td><a href=${band.url} target='_blank'>${displayUrl}</a></td>
              <td><a href=${band.fb} target='_blank'>fb</a></td>
              <td><a href=${band.bandcamp} target='_blank'>bandcamp</a></td>
              <td><a href=${band.spotify} target='_blank'>spotify</a></td>
            </tr>
          `))
        })
    })
  })




})
