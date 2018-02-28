$(document).ready(function() {


  let states = ['All','Alabama','Alaska','Arizona','Arkansas','California','Colorado',
  'Connecticut','Delaware','DC','Florida','Georgia','Hawaii','Idaho','Illinois',
  'Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland',
  'Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana',
  'Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York',
  'North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania',
  'Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah',
  'Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming']
  for (let i = 0; i < states.length; i++ ) {
    $('.stateSelector').append($(`<option value=${states[i]}>${states[i]}</option>`))
  }

  let genres = [ 'Psych Rock','Americana','Indie Rock','Blues Rock','Bluegrass',
  'Zombie Death Polka','Prog','Lo-fi Pop','Indie, Shoe-Gaze','Indie Folk',
  'Glam Boys','Psychedelia','Experimental Folk','Slow folk','Rock\'n\'Roll',
  'Eclectic Folk','prog folk','Orchestral Pop','Americana Rock','Cello Prog Pop',
  'Orchestral folk','Folk/ ambient','Classic Pop','Rap / R&B','Folk',
  'Americana / Folk','indie folk pop','Americana / Rock','dark dream pop',
  'Indie electro','Power pop','Folk / country','Soft rock','Rock&Roll / Blues',
  'indie rock','Indie Electro Surf','vintage pop','vintage pop/lo fi',
  'Americana / Country / Folk','americana / alt. country','swing / blues / experimental']

  let genreKeywords = [ 'Psych','Rock','Americana','Indie','Blues','Bluegrass',
  'Zombie','Death','Polka','Prog','Lo-fi','Pop','Indie','Shoe-Gaze','Glam',
  'Experimental','Slow','Eclectic','Orchestral','Cello','Folk',
  'Ambient','Classic','Rap','R&B','Dark','Dream','Electro','Power','Soft',
  'Rock & Roll','Surf','Vintage','Country','Swing','Blues','Experimental','Punk',
  'Metal', 'Hardcore', 'Noise', 'Electronic', 'Jam', 'Classical',
  'Singer-songwriter', 'Jazz' ]

  genreKeywords.forEach( genre => {
      $('#genreSelector').append($(`<div class="form-check form-check-inline" style='display:inline-flex;'>
        <input class="form-check-input genre-selector" type="checkbox" value=${genre}>
        <label class="form-check-label" for=${genre}>${genre}</label></div>`))
  })

  $('.genre-selector').click( e => {
      console.log(e.target.value);
  })

  $('.notany').click( e => {
    console.log('clicked ');
    $('#capAny').removeAttr("checked")
  })

  $('#venueSearchForm').submit( e => {
    e.preventDefault()
    let formData = e.target.elements
    let state = formData.state.value
    let city = formData.city.value
    let venue = formData.venue.value
    let capacity = []
    if (formData.capAny.checked) {
      capacity.push('Any')
    }
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
    const params = {state, city, venue, capacity}
    const queryString = $.param(params)

    $.get(`/venues/q?${queryString}`, (data, status) => {
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
              <td>${venue.state}</td>
              <td>${venue.city}</td>
              <td>${venueText}</td>
              <td><a href=${venue.url} target='_blank'>${urlText}</a></td>
              <td>${capText}</td>
              <td>${venue.up} <i class="material-icons md-18">thumb_up</i></td>
              <td>${venue.down} <i class="material-icons md-18">thumb_down</i></td>
            </tr>
          `))
        })


    })
  })

  $('#bandSearchForm').submit( e => {
    e.preventDefault()
    console.log('submitted form ');
    var target = $( event.target )
    let formData = e.target.elements
    let state = formData.state.value
    console.log('state ', state);
    let city = formData.city.value
    console.log('city ', city);
    let band = formData.band.value
    console.log('band ', band);
    let genres = []
    $('.genre-selector:checked').each( function() {
        genres.push(this.value)
    })
    const params = {state, city, band, genres}
    const queryString = $.param(params)
    $.get(`/bands/q?${queryString}`, (data, status) => {
      if (state !== 'All') {
        $('.stateDisplay').text(`Bands in ${state}`).show()
      } else if (city) {
        $('.stateDisplay').text(`Bands in ${city}`).show()
      } else if (band) {
        $('.stateDisplay').text(`Bands matching '${band}'`).show()
      }
        $('#bandsList').empty()
        data.bands.forEach( band => {
          let displayUrl = band.url && band.url.split('/')[2][0] === 'w' ? band.url.split('/')[2].split('.').slice(1).join('.') : band.url && band.url.split('/')[2][0] !== 'w' ? band.url.split('/')[2] : ''
          $('#bandsList').append($(`
            <tr>
              <td>${band.state}</td>
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
