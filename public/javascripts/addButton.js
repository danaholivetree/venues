$(document).ready( () => {
  const addVenueForm = $('#addVenueForm')
  const addBandForm = $('#addBandForm')

  $('#addVenue').click( e => {
    e.preventDefault()
    addVenueForm.toggle()
  })

  $('#addBand').click( e => {
    e.preventDefault()
    console.log('clicked add band button');
    addBandForm.toggle()
  })

  const makeUppercase = str => str.split(' ').map( word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')

  // const checkUrl = url => {
  //   if (url.split('/')[0] !== 'http:') {
  //     if (url.split('.')[0] !== 'www') {
  //       return `http://www.${url}`
  //     }
  //     else return `http://${url}`
  //   }
  //   else return url
  // }
  const addHttp = url => `http://${url}`
  const checkUrl = url => {

    const addWww = url => {
      console.log(` url.split('/').slice(0,2).join('') `, url.split('/').slice(0,2).join(''));
      console.log(`url.split('/').slice(2).join('') `, url.split('/').slice(2).join('') );
      return `${url.split('/').slice(0,2).join('/')}/www.${url.split('/').slice(2).join('')}`}
    if (url.split('/')[0] !== 'http:' && url.split('/')[0] !== 'https:') {
      console.log(url.split('/')[0] , 'wasnt http:');
      url = addHttp(url)
      console.log('url now ', url);
    }
    if (url.split('/')[2].slice(0,3) !== 'www' && url.split('/')[2].split('.')[1] !== 'bandcamp' && url.split('/')[2].split('.')[1] !== 'spotify') {
      url = addWww(url)
      console.log('url now ', url);
    }
    return url
  }

  const checkEmail = email => {
    if (email.split('@').length !== 2 || email.split('@')[1].split('.').length !== 2) {
      console.log('email is not an email!')
    }
    return email
  }


  addVenueForm.submit( e => {
    e.preventDefault()
    let formData = e.target.elements
    const newVenue = {}
    newVenue.state = formData.state.value
    if (!formData.city.value) {
      // return error alert
    } else {
      newVenue.city = makeUppercase(formData.city.value)
    }
    if (!formData.venue.value) {
        // return error alert
    } else {
      newVenue.venue = makeUppercase(formData.venue.value)
    }
    if (!formData.url.value) {
      //return error alert
    } else {
      newVenue.url = checkUrl(formData.url.value)
    }
    if (!formData.email.value) {
      //return warning?
    } else {
      newVenue.email = checkEmail(formData.email.value)
    }
    if (formData.capacity.value) {
      newVenue.capacity = formData.capacity.value
    }
    newVenue.diy = formData.diy.value === 'diy' ? true : false

    $.post(`/venues`, newVenue, (venues, status) => {
      $('#venuesList').empty()
      venues.forEach( venue => {
        let urlText = (venue.url.split('/')[2] === 'www.facebook.com') ? 'facebook' : 'website'
        $('#venuesList').append($(`
          <tr>
            <td>${venue.state}</td>
            <td>${venue.city}</td>
            <td>${venue.venue}</td>
            <td><a href=${venue.url} target='_blank'>${urlText}</a></td>
            <td>${venue.capacity}</td>
            <td>${venue.up} <i class="material-icons md-18">thumb_up</i></td>
            <td>${venue.down} <i class="material-icons md-18">thumb_down</i></td>
          </tr>`))
      })
    }) //end post
  }) //end submit form

  addBandForm.submit( e => {
    e.preventDefault()
    let formData = e.target.elements
    const newBand = {}
    newBand.state = formData.state.value
    if (!formData.city.value) {
      // return error alert
    } else {
      newBand.city = makeUppercase(formData.city.value)
    }
    if (!formData.band.value) {
        // return error alert
    } else {
      newBand.band = formData.band.value
    }
    if (!formData.genre.value) {
        // return error alert
    } else {
      newBand.genre = formData.genre.value
    }
    newBand.url = formData.url && checkUrl(formData.url.value)
    console.log('url ', newBand.url);
    newBand.fb = formData.fb && checkUrl(formData.fb.value)
    console.log('fb ', newBand.fb);
    newBand.bandcamp = formData.bandcamp && checkUrl(formData.bandcamp.value)
    console.log('bandcamp ', newBand.bandcamp);
    newBand.spotify = formData.spotify && checkUrl(formData.spotify.value)
    console.log('spotify ', newBand.spotify);

    $.post(`/bands`, newBand, (bands, status) => {
      $('#bandsList').empty()
      bands.forEach( band => {
        let displayUrl = band.url ? band.url.split('/')[2].split('.').slice(1).join('.') : ''
        let spotifyUrl = band.spotify ? band.spotify.split('/')[4] : ''
        let spotifySrc = band.spotify ? `https://open.spotify.com/embed?uri=spotify:track:${spotifyUrl}&theme=white` : ''
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
          </tr>`))
      })
    }) //end post
  }) //end submit form

})