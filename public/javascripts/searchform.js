$(document).ready(function() {
  let userId = 1

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

  function abbrState(input, to){

    var states = [
        ['Arizona', 'AZ'],
        ['Alabama', 'AL'],
        ['Alaska', 'AK'],
        ['Arizona', 'AZ'],
        ['Arkansas', 'AR'],
        ['California', 'CA'],
        ['Colorado', 'CO'],
        ['Connecticut', 'CT'],
        ['Delaware', 'DE'],
        ['Florida', 'FL'],
        ['Georgia', 'GA'],
        ['Hawaii', 'HI'],
        ['Idaho', 'ID'],
        ['Illinois', 'IL'],
        ['Indiana', 'IN'],
        ['Iowa', 'IA'],
        ['Kansas', 'KS'],
        ['Kentucky', 'KY'],
        ['Louisiana', 'LA'],
        ['Maine', 'ME'],
        ['Maryland', 'MD'],
        ['Massachusetts', 'MA'],
        ['Michigan', 'MI'],
        ['Minnesota', 'MN'],
        ['Mississippi', 'MS'],
        ['Missouri', 'MO'],
        ['Montana', 'MT'],
        ['Nebraska', 'NE'],
        ['Nevada', 'NV'],
        ['New Hampshire', 'NH'],
        ['New Jersey', 'NJ'],
        ['New Mexico', 'NM'],
        ['New York', 'NY'],
        ['North Carolina', 'NC'],
        ['North Dakota', 'ND'],
        ['Ohio', 'OH'],
        ['Oklahoma', 'OK'],
        ['Oregon', 'OR'],
        ['Pennsylvania', 'PA'],
        ['Rhode Island', 'RI'],
        ['South Carolina', 'SC'],
        ['South Dakota', 'SD'],
        ['Tennessee', 'TN'],
        ['Texas', 'TX'],
        ['Utah', 'UT'],
        ['Vermont', 'VT'],
        ['Virginia', 'VA'],
        ['Washington', 'WA'],
        ['West Virginia', 'WV'],
        ['Wisconsin', 'WI'],
        ['Wyoming', 'WY'],
    ];

    if (to == 'abbr'){
        input = input.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
        for(i = 0; i < states.length; i++){
            if(states[i][0] == input){
                return(states[i][1]);
            }
        }
    } else if (to == 'name'){
        input = input.toUpperCase();
        for(i = 0; i < states.length; i++){
            if(states[i][1] == input){
                return(states[i][0]);
            }
        }
    }
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
      $('#genreSelector').append($(`<div class="form-check form-check-inline" style='display:inline-flex;'>
        <input class="form-check-input genre-selector" type="checkbox" value=${genre}>
        <label class="form-check-label" for=${genre}>${genre}</label></div>`))
  })

  $.get(`/votes/${userId}`, (data, status) => {
    data.forEach( vote => {
      console.log('vote.vote ', vote.vote);
      console.log('vote.venue_id ', vote.venue_id);
      if (vote.vote === 'up') {
        $(`#upVote${vote.venue_id} button`).css("color", "green")
      }
      if (vote.vote === 'down') {
        $(`#downVote${vote.venue_id} button`).css("color", "red")
      }
    })
  })

  $('.notany').click( e => {
    console.log($('.notany:checked').length);
    if ($('.notany:checked').length === 0) {
      console.log('trying to add checked attribute to capAny');
        $('#capAny').prop("checked", true)
        console.log('any checked ? ', $('#capAny').prop("checked"));
    } else {
        console.log('removing checked attr');
        $('#capAny').prop("checked", false)
          console.log('any checked ? ', $('#capAny').prop("checked"));
    }
  })

  $('.thumb-up').click( e => {
      $.post(`/venues/vote`, {venueId: e.target.dataset.id, userId, vote: 'up'}, (data, status) => {
        console.log('status ', status)
        $(`#upVote${data.id} span`).text(`${data.up}`)
        $(`#upVote${data.id} button`).css("color", "green")
        $(`#downVote${data.id} span`).text(`${data.down}`)
        $(`#downVote${data.id} button`).css("color", "black")
      })
  })

  $('.thumb-down').click( e => {
    $.post(`/venues/vote`, {venueId: e.target.dataset.id, userId, vote: 'down'}, (data, status) => {
      console.log('status ', status)
      $(`#upVote${data.id} span`).text(`${data.up}`)
      $(`#upVote${data.id} button`).css("color", "black")
      $(`#downVote${data.id} span`).text(`${data.down}`)
      $(`#downVote${data.id} button`).css("color", "red")
    })
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

    $.get(`/venues/q?${queryString}`, (data, status) => {
      console.log('data.venues.length ', data.venues.length);
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
              <td id=upVote${venue.id}>${venue.up} <button class='btn btn-default'> <i class="material-icons md-18">thumb_up</i></button></td>
              <td id=downVote${data.id}>${venue.down}<button class='btn btn-default'><i class="material-icons md-18">thumb_down</i></button></td>
            </tr>
          `))
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
