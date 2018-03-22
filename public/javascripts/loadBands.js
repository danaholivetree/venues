$(document).ready(function() {
  const {abbrState} = usStates
  const {makeUppercase, addHttp, checkUrl, checkEmail, endMessage} = helpers


  const getWidget = (token, band, target) => {
    $.ajax({
      method: 'GET',
      url: `https://api.spotify.com/v1/search?q="${band}"&type=artist&market=US&limit=1&offset=0`,
      accepts: "application/json",
      contentType: "application/json",
      headers : {
        'Authorization': `Bearer ${token}`
      },
      success : data => {
        console.log('data ', data);
        if (data.artists.items[0]) {
          let artistId = data.artists.items[0].id
          let artistHref = data.artists.items[0].href
          let artistUri = data.artists.items[0].uri
          let showSpotify = `<iframe src=https://open.spotify.com/embed?uri=${artistUri}&theme=white width="250" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>`
          $(showSpotify).insertAfter(target)
          $(target).hide()
        }
      },
      error: err => {
        console.log('error ', err);
      }
    })
  }


  const listBands = (data) => {
    data.forEach( band => {

      let displayUrl = band.url ? band.url.split('/')[2].split('.').slice(1).join('.') : ''
      let spotifyUrl = band.spotify ? band.spotify.split('/')[4] : ''
      let spotifySrc = band.spotify ? `https://open.spotify.com/embed?uri=spotify:track:${spotifyUrl}&theme=white` : ''
      let displaySpotify = band.spotify ? `<a href=${band.spotify} target='_blank'>spotify</a>` : ``
      let displayBandcamp = band.bandcamp ? `<a href=${band.bandcamp} target='_blank'>bandcamp</a>` : ``
      let displayBand = band.fb ? `<a href=${band.fb} target='_blank'>${band.band}</a>` : `${band.band}`
      let showSpotify = band.spotify ? `<iframe style="display:none;" src=${spotifySrc} width="250" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>` : ''
      $('#bandsList').append($(`
        <tr>
          <td>${abbrState(band.state, 'abbr')}</td>
          <td>${band.city}</td>
          <td>${displayBand}</td>
          <td class="genreList">${band.genre}</td>
          <td align='center'><i class="material-icons star" data-id=${band.id}>star</i><br><span>${band.stars}</span></td>
          <td class='url'><a href=${band.url} target='_blank'>${displayUrl}</a></td>
          <td>${displayBandcamp}</td>
          <td><button class='playSpotify btn' data-name='${band.band}'>play</button></td>
        </tr>`))
    })

    $('.star').click( e => {
      e.preventDefault()
      let targ = e.target
      $.post(`/api/stars`, {bandId: e.target.dataset.id}, data => {
        console.log('data came back from post stars ', data);
        $(targ + ` span`).text(`${data.stars}`)
        $(targ).css("color", "pink")
      })
    })
  }

  $.get(`/api/bands`, (data, status) => {
    listBands(data.slice(0,20))
    $('.playSpotify').click( e => {
      e.preventDefault()
      let targ = e.target

      const getAccessToken = () => {
        if (!localStorage.getItem('pa_token')) {
          console.log('there was no token');
          return ''
        }
        console.log('there was a token ');
        let expires = Number(localStorage.getItem('pa_expires'))
        if ((new Date()).getTime() > expires) {
          console.log('expired');
          return '';
        }
        console.log('was not expired ');
        var token = localStorage.getItem('pa_token');
        return token;
      }

      let accessToken = getAccessToken()
      console.log('accessToken from getAccessToken()' , accessToken);
      if (!accessToken || accessToken == '') {
        console.log('this should only happen if there was no token ');
        $.get('/token', (data) => {
          console.log('went to go get a token');
          localStorage.setItem('pa_token', data.access_token)
          localStorage.setItem('pa_expires', 1000*(data.expires_in) + (new Date()).getTime())
          accessToken = data.access_token
          $.ajax({
            method: 'GET',
            url: `https://api.spotify.com/v1/search?q=${e.target.dataset.name}&type=artist&market=US&limit=1&offset=0`,
            accepts: "application/json",
            contentType: "application/json",
            headers : {
              'Authorization': `Bearer ${accessToken}`
            },
            success : data => {
              console.log('data ', data);
              let artistId = data.artists.items[0].id
              let artistHref = data.artists.items[0].href
              let showSpotify = `<iframe src=https://open.spotify.com/embed?uri=spotify:artist:${artistId}&theme=white width="250" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>`
              $(showSpotify).insertAfter($(targ))
              $(targ).hide()

            },
            error: err => {
              console.log('error ', err);
            }
          })

        })
      } else {
        getWidget(accessToken, e.target.dataset.name, $(targ))
      }


    })
  })

  // $('.playSpotify').click( e => {
  //   e.preventDefault()
  //   console.log('clicked');
  //   $.ajax({
  //     method: 'GET',
  //     url: `https://api.spotify.com/v1/search?q=${dataset.name}&type=artist&market=US&limit=1&offset=0`,
  //     accepts: "application/json",
  //     contentType: "application/json",
  //     // crossDomain: true,
  //     headers : {
  //       'Authorization': "Bearer BQCoqdsPww7NKFiDVZeD45ibIKtFEjDUKon6SxcN9diDo4HBOlNg5_uzR6d-U5yBeUO2X8RiMThNHoCbNQohiYSxlyWAGM2vjg4EZyf5NBUgcHbWG3wIeBZKz0ZYKajnvORGehdus0OB8bMj"
  //     },
  //     success : (data) => {
  //       console.log('data ', data);
  //       console.log('data.href ' ,data.href);
  //     }
  //   })
  // })


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
      console.log('bands data ', data);
      if (state !== 'All') {
        $('.stateDisplay').text(`Bands in ${state}`).show()
      } else if (city) {
        $('.stateDisplay').text(`Bands in ${city}`).show()
      } else if (band) {
        $('.stateDisplay').text(`Bands matching '${band}'`).show()
      }
        $('#bandsList').empty()
        $('.genre-selector').prop('checked', false) //maybe dont want these three
        $('input[type="text"], textarea').val('');
        $('#state').val('All');
        listBands(data)

    })
  })

  $('#searchBands').click( e => {
    e.preventDefault()
    console.log('clicked search bands');
      $('#bandSearchForm').toggle(true)
      $('#addBandForm').toggle(false)
      $('#searchBands').css('background-color', 'lightblue')
      $('#addBand').css('background-color', 'white')
  })

  $('#addBand').click( e => {
    e.preventDefault()
    console.log('clicked add band');
      $('#bandSearchForm').toggle(false)
      $('#addBandForm').toggle(true)
      $('#addBand').css('background-color', 'lightblue')
      $('#searchBands').css('background-color', 'white')
  })


  $('.genre-selector').on('change', function() {
    if($('.genre-selector:checked').length > 4) {
       this.checked = false;
     }
  })

  $('#addBandForm').submit( e => {
    e.preventDefault()
    let formData = e.target.elements

    const newBand = {}
    newBand.state = formData.state.value
    if (!formData.city.value) {
      $('#errorMessage').html(`<div class="alert alert-danger fade show" role="alert">Please enter a city</div>`)
    } else {
      newBand.city = makeUppercase(formData.city.value)
    }
    if (!formData.band.value) {
        $('#errorMessage').html(`<div class="alert alert-danger fade show" role="alert">Please enter a band name</div>`)
    } else {
      newBand.band = formData.band.value
    }
    let selectedGenres = []
    $.each($( ".genre-selector:checked" ), function (index, element) {
      selectedGenres.push(element.value)
    })
    newBand.genres = selectedGenres
    newBand.url = formData.url.value && checkUrl(formData.url.value)
    newBand.fb = formData.fb.value && checkUrl(formData.fb.value)
    newBand.bandcamp = formData.bandcamp.value && checkUrl(formData.bandcamp.value)
    newBand.spotify = formData.spotify.value && checkUrl(formData.spotify.value)
    console.log('newBand ', newBand);

    $.ajax({
      method: 'POST',
      url: '/api/bands',
      dataType: 'json',
      success: function (data) {
        // $('#addBandForm').clear()
        $('input[type="text"], textarea').val('');
        $('.genre-selector').prop('checked', false)
        $('#state').val('All');
        $('#bandsList').empty()
        listBands(data)
              },
      data: {newBand: JSON.stringify(newBand)}
    })
  }) //end submit form

})
