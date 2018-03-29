$(document).ready(function() {
  const {abbrState} = usStates
  const {makeUppercase, addHttp, checkUrl, checkEmail, endMessage} = helpers
  let accessToken = ''
  let gotSpotify = ''

  const getWidget = (token, band, target) => {
    $.ajax({
      method: 'GET',
      url: `https://api.spotify.com/v1/search?q="${band}"&type=artist&market=US&limit=5&offset=0`,
      accepts: "application/json",
      contentType: "application/json",
      headers : {
        'Authorization': `Bearer ${token}`
      },
      success : data => {
        console.log('data ', data);
        if (data.artists.items[0]) {
          let artistId = data.artists.items[0].id
          gotSpotify = data.artists.items[0].external_urls.spotify
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
      // let displayUrl = band.url ? band.url.split('/')[2].split('.').slice(1).join('.') : ''
      let displayUrl = band.url  ? `<a href=${band.url} target='_blank'>www</a>` : ``
      let spotifyUrl = band.spotify ? band.spotify.split('/')[4] : ''
      let spotifySrc = band.spotify ? `https://open.spotify.com/embed?uri=spotify:track:${spotifyUrl}&theme=white` : ''
      let displaySpotify = band.spotify ? `<a href=${band.spotify} target='_blank'>spotify</a>` : ``
      let displayBandcamp = band.bandcamp ? `<span align='center' ><a href=${band.bandcamp} target='_blank'><img src='images/bandcamp-button-bc-circle-aqua-32.png'></a></span>` : ``
      // let displayBandcampWidget = band.bandcamp ? `<iframe style="border: 0; width: 370px; height: 120px;" src="https://bandcamp.com/EmbeddedPlayer/album=260781898/size=large/bgcol=ffffff/linkcol=63b2cc/tracklist=false/artwork=small/transparent=true/" seamless><a href=${band.bandcamp}>${band.band}</a></iframe>` : ''
      // let testBandcamp = band.bandcamp ? `<button class='btn bandcamp' data-id=${band.id} data-url=${band.bandcamp}>load widg</button>` : ''
      let displayBand = band.fb ? `<a href=${band.fb} target='_blank'>${band.band}</a>` : `${band.band}`
      let showSpotify = band.spotify ? `<iframe style="display:none;" src=${spotifySrc} width="250" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>` : ''
      $('#bandsList').append($(`
        <tr>
          <td>${abbrState(band.state, 'abbr')}</td>
          <td>${band.city}</td>
          <td>${displayBand}</td>
          <td class="genreList">${band.genre}</td>
          <td class=star_col${band.id} align='center'><i class="material-icons star" data-id=${band.id}>star</i><br><span>${band.stars}</span></td>
          <td class='url'><a href=${band.url} target='_blank'>${displayUrl}</a></td>
          <td>${displayBandcamp}</td>
          <td><button class='playSpotify btn' data-name='${band.band}'>play</button></td>
        </tr>`))
        if (band.starred) {
         $(`.star_col${band.starred} i`).css("color", "lightblue")
        }
    })

    $('.star').click( e => {
      e.preventDefault()
      let targ = e.target
      $.post(`/api/stars`, {bandId: e.target.dataset.id}, data => {
        console.log('data came back from post stars ', data);
        $(`.star_col${data.id} span`).text(`${data.stars}`)
        $(`.star_col${data.id} i`).css("color", "lightblue")
      })
    })

    // $('.bandcamp').click( e => {
    //   e.preventDefault()
    //   console.log('e.target.dataset.url ', e.target.dataset.url);
    //   let targ = e.target
    //   $.get(`https://harmalaska.bandcamp.com`, data => {
    //     console.log('data ', data);
    //   })
    // })
  }

  $.get(`/api/bands`, (data, status) => {
    listBands(data.slice(0,20))
    $('.playSpotify').click( e => {
      e.preventDefault()
      let targ = e.target

      const getAccessToken = () => {
        if (!localStorage.getItem('pa_token')) {
          return ''
        }
        let expires = Number(localStorage.getItem('pa_expires'))
        if ((new Date()).getTime() > expires) {
          console.log('expired');
          return '';
        }
        var token = localStorage.getItem('pa_token');
        return token;
      }

      let accessToken = getAccessToken()
      console.log('accessToken', accessToken);
      if (!accessToken || accessToken == '') {
        $.get('/token/spotify', (data) => {
          localStorage.setItem('pa_token', data.access_token)
          localStorage.setItem('pa_expires', 1000*(data.expires_in) + (new Date()).getTime())
          accessToken = data.access_token
          // $.ajax({
          //   method: 'GET',
          //   url: `https://api.spotify.com/v1/search?q=${e.target.dataset.name}&type=artist&market=US&limit=1&offset=0`,
          //   accepts: "application/json",
          //   contentType: "application/json",
          //   headers : {
          //     'Authorization': `Bearer ${accessToken}`
          //   },
          //   success : data => {
          //     console.log('data ', data);
          //     let artistId = data.artists.items[0].id
          //     let artistHref = data.artists.items[0].href
          //     let showSpotify = `<iframe src=https://open.spotify.com/embed?uri=spotify:artist:${artistId}&theme=white width="250" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>`
          //     $(showSpotify).insertAfter($(targ))
          //     $(targ).hide()
          //
          //   },
          //   error: err => {
          //     console.log('error ', err);
          //   }
          // })
          getWidget(accessToken, e.target.dataset.name, $(targ))

        })
      } else {
        getWidget(accessToken, e.target.dataset.name, $(targ))
      }


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

  $('#band').blur( e => {
    e.preventDefault()
    console.log(e.currentTarget.value);
    if (!accessToken || accessToken == '') {
      $.get('/token/spotify', (data) => {
        localStorage.setItem('pa_token', data.access_token)
        localStorage.setItem('pa_expires', 1000*(data.expires_in) + (new Date()).getTime())
        accessToken = data.access_token
        getWidget(accessToken, e.currentTarget.value, $('#spotifyGuess'))
      })
    }
    else {
      getWidget(accessToken, e.currentTarget.value, $('#spotifyGuess'))
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
    // newBand.spotify = formData.spotify.value && checkUrl(formData.spotify.value)
    newBand.spotify = gotSpotify
    console.log('newBand.spotify ', newBand.spotify);
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
