$(document).ready(function() {
  const {abbrState} = usStates
  const {makeUppercase, addHttp, checkUrl, checkEmail, endMessage} = helpers
  let accessToken = ''
  // let gotSpotify = ''

  const getSpotifyWidgets = (token, band, target) => {
    $.ajax({
      method: 'GET',
      url: `https://api.spotify.com/v1/search?q="${band}"&type=artist&market=US&limit=4&offset=0`,
      accepts: "application/json",
      contentType: "application/json",
      headers : {
        'Authorization': `Bearer ${token}`
      },
      success : ({artists}) => {
        console.log('artists', artists);
        const {items} = artists
        // let removeUnlikelies = items.filter( item => {
        //   return item.followers.total > 50
        // })
        if (items.length > 0) {
          let reordered = items.sort( (a,b) => a.followers.total < b.followers.total)
          // let bestGuess = Math.max( ...items.map( item => item.followers.total))
          $('#spotifyGuess').children().first().show()
          reordered.forEach( (item, i) => {
            let artistId = item.id
            let artistSpotify = item.external_urls.spotify
            let artistUri = item.uri
            // let showSpotify = `<div class='col'><iframe src=https://open.spotify.com/embed?uri=${artistUri}&theme=white width="250" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe></div>`
            // $(showSpotify).insertAfter(target)
            let showItAll =  `<div class='form-group col-3 guesses'>
                      <div class="form-radio-inline">
                        <div class='form-radio col-12'>
                          <label class="form-radio-label" for="radio${i}">
                            <iframe src=https://open.spotify.com/embed?uri=${artistUri}&theme=white width="250" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>
                          </label>
                        </div>

                        <div class='mx-auto col-1'>
                          <input class="form-radio-input guess" type="radio" id="radio${i}" value=${artistSpotify}>
                        </div>
                      </div>
                    </div>`

            $(target).append(showItAll)
            // $(target).hide()
          })

        }





      },
      error: err => {
        console.log('error ', err);
      }
    })
  }
  // <td class='url d-none d-md-table-cell'><a href=${band.url} target='_blank'>${displayUrl}</a></td>
{/* <span class='playSpotify' data-uri=${spotifySrc} data-name='${band.band}'></span> */}
// <td class='star_col${id} d-none d-md-table-cell' align='center'><i class="material-icons star" data-id=${id}>star</i><br><span>${stars}</span></td>
  const listBands = (data) => {
    data.forEach( ({id, band, state, city, url, spotify, bandcamp, fb, genre, starred, stars}) => {
      let displayUrl = url  ? `<a href=${url} target='_blank'>www</a>` : ``
      let spotifyUrl = spotify ? spotify.split('/')[4] : ''
      let spotifySrc = spotify ? `https://open.spotify.com/embed?uri=spotify:track:${spotifyUrl}&theme=white` : ''
      let displayBandcamp = bandcamp ? `<span align='center' ><a href=${bandcamp} target='_blank'><img src='images/bandcamp-button-bc-circle-aqua-32.png'></a></span>` : ``
      // let displayBandcampWidget = band.bandcamp ? `<iframe style="border: 0; width: 370px; height: 120px;" src="https://bandcamp.com/EmbeddedPlayer/album=260781898/size=large/bgcol=ffffff/linkcol=63b2cc/tracklist=false/artwork=small/transparent=true/" seamless><a href=${band.bandcamp}>${band.band}</a></iframe>` : ''
      // let testBandcamp = band.bandcamp ? `<button class='btn bandcamp' data-name=${band.band} data-id=${band.id} data-url=${band.bandcamp}>load widg</button>` : ''
      let displayBand = fb ? `<a href=${fb} target='_blank'>${band}</a>` : `${band}`
      let showSpotify = spotify ? `<iframe style="display:none;" src=${spotifySrc} width="250" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>` : ''
      $('#bandsList').append($(`
        <tr>
          <td class='d-none d-md-table-cell'>${abbrState(state, 'abbr')}</td>
          <td>${city}</td>
          <td>${displayBand}</td>
          <td class="genreList d-none d-md-table-cell">${genre}</td>


          <td class='d-none d-md-table-cell '><span class='mx-auto'>${displayBandcamp}</span></td>
          <td>${spotify ? `<img class='playSpotify' src='images/Spotify_Icon_RGB_Green.png' data-uri=${spotifyUrl} style="width:32px; background-color:inherit;"/>` : ''}</td>
        </tr>`))
        if (starred) {
         $(`.star_col${starred} i`).css("color", "lightblue")
        }
    })

    $('.star').click( e => {
      e.preventDefault()
      let targ = e.target
      $.post(`/api/stars`, {bandId: e.target.dataset.id}, ({id, stars}) => {
        console.log('data came back from post stars ', id, stars);
        $(`.star_col${id} span`).text(`${stars}`)
        $(`.star_col${id} i`).css("color", "lightblue")
      })
    })

    // $('.bandcamp').click( e => {
    //   e.preventDefault()
    //   console.log('e.target.dataset.url ', e.target.dataset.url);
    //   let targ = e.target
    //   $.get(`https://www.bandcamp.com/search?${}`, data => {
    //     console.log('data ', data);
    //   })
    // })
  }

  $.get(`/api/bands`, (data, status) => {
    listBands(data.slice(0,20))

    $('.playSpotify').click( e => {
      e.preventDefault()
      let targ = $(e.currentTarget)
      let uri = e.currentTarget.dataset.uri
      console.log('uri ', uri);
      $(`<iframe src=https://open.spotify.com/embed?uri=spotify:track:${uri}&theme=white width="250" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>`).insertAfter(targ)
      targ.hide()
    })
    // $('.playSpotify').click( e => {
    //   e.preventDefault()
    //   let uri = e.currentTarget.dataset.uri
    //   let targ = e.target
    //   console.log('targ ', targ);
    //   console.log('targ.dataset', e.currentTarget.dataset);
    //   if (uri) {
    //     console.log('there was a uri');
    //     $(targ).hide()
    //     $(targ).next().show()
    //   } else {
    //     console.log('there was no uri');
    //     const getAccessToken = () => {
    //       if (!localStorage.getItem('pa_token')) {
    //         return ''
    //       }
    //       let expires = Number(localStorage.getItem('pa_expires'))
    //       if ((new Date()).getTime() > expires) {
    //         console.log('expired');
    //         return '';
    //       }
    //       var token = localStorage.getItem('pa_token');
    //       return token;
    //     }
    //     let accessToken = getAccessToken()
    //     console.log('accessToken', accessToken);
    //     if (!accessToken || accessToken == '') {
    //       $.get('/token/spotify', (data) => {
    //         localStorage.setItem('pa_token', data.access_token)
    //         localStorage.setItem('pa_expires', 1000*(data.expires_in) + (new Date()).getTime())
    //         accessToken = data.access_token
    //         getWidget(accessToken, e.currentTarget.dataset.name, $(targ))
    //       })
    //     } else {
    //       getWidget(accessToken, e.currentTarget.dataset.name, $(targ))
    //     }
    //   }
    // })
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
        getSpotifyWidgets(accessToken, e.currentTarget.value, $('#spotifyGuess'))
      })
    }
    else {
      getSpotifyWidgets(accessToken, e.currentTarget.value, $('#spotifyGuess'))
    }
  })

  $('#fb').blur( e => {
    e.preventDefault()
    let url = e.currentTarget.value
    let fbid
    if (url.split('.')[1] === 'facebook') {
      fbid = url.split('/')[3]
      if (fbid.split('-').length > 1) {
        fbid = fbid.split('-')
        fbid = fbid[fbid.length-1]
      }
      console.log('fbid ', fbid);
    } else {
      fbid = url.split('.')[1]
      console.log('trying fbid ', fbid);
    }
    $.get(`/token/facebook/venues/${fbid}`, data => {
      console.log('data' , data);
      // getEvents(data.events.data)
      // checkForBookingEmail(data.about)
      // if (data.emails) {
      //   data.emails.filter( email => checkForBookingEmail(email))
      // }
    })


  })

  $('#addBandForm').submit( e => {
    e.preventDefault()
    let formData = e.target.elements
    console.log('spotify guess checked first', $('.guess:checked'))
    console.log('$(".guess:checked").value() ', $('.guess:checked').val() );

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
    newBand.spotify = $('.guess:checked').val()
    // newBand.spotify = formData.
    // console.log('newBand.spotify ', newBand.spotify);
    console.log('newBand ', newBand);

    $.ajax({
      method: 'POST',
      url: '/api/bands',
      dataType: 'json',
      success: function (data) {
        // $('#addBandForm').clear()
        $('input[type="text"], textarea').val('');
        $('.guesses').remove()
        $('.genre-selector').prop('checked', false)
        $('#state').val('All');
        $('#bandsList').empty()
        listBands(data)
              },
      data: {newBand: JSON.stringify(newBand)}
    })
  }) //end submit form


})
