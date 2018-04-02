$(document).ready(function() {
  const {abbrState} = usStates
  const {makeUppercase, addHttp, checkUrl, checkEmail, endMessage} = helpers
  let accessToken = localStorage.getItem('pa_token')
  console.log(accessToken);
  // if (localStorage.getItem('pa_token') && localStorage.getItem('pa_token'))
  // let gotSpotify = ''

  $.get(`/api/bands`, (data, status) => {
    listBands(data.slice(0,20))
  })

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

      let spotifyUri = spotify ? spotify.split('/')[4] : ''
      let spotifySrc = spotify ? `https://open.spotify.com/embed?uri=spotify:artist:${spotifyUri}&theme=white` : ''
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
          <td class="genreList d-none d-md-table-cell">${genre ? genre : ''}</td>


          <td class='d-none d-md-table-cell '><span class='mx-auto'>${displayBandcamp}</span></td>
          <td>${spotify ? `<img class='playSpotify' src='images/Spotify_Icon_RGB_Green.png' data-uri=${spotifyUri} style="width:32px; background-color:inherit;"/>` : ''}</td>
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
    $('.playSpotify').click( e => {
      e.preventDefault()
      let targ = $(e.currentTarget)
      let uri = e.currentTarget.dataset.uri
      $(`<iframe src=https://open.spotify.com/embed?uri=spotify:artist:${uri}&theme=white width="250" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>`).insertAfter(targ)
      targ.hide()
    })
  }



  $('#bandSearchForm').submit( e => {
    e.preventDefault()
    var target = $( event.target )
    console.log('target ', target);
    let formData = e.target.elements
    let state = $('.stateSelector').val()
    console.log('state ', state);
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
      $('#fb').val('http://www.facebook.com/')
  })


  $('.genre-selector').on('change', function() {
    if($('.genre-selector:checked').length > 4) {
       this.checked = false;
     }
  })

  $('#band').blur( e => {
    e.preventDefault()
    let band = e.currentTarget.value
    $.get(`/bc/${band}`, data => {
      console.log('data from bandcamp scrape ', data);
      $('#bandcamp').val(data[0].url)
      console.log('data[0].genre.trim() ', data[0].genre.trim());
      // $(`.genres input.${data[0].genre.trim()}`).prop('checked', true)
      data[0].tags.forEach( tag => {
        console.log('tag ', tag);
        tag = tag[0].toUpperCase()+tag.slice(1)
        $(`.genres input.${tag}`).prop('checked', true)
      })
    })

    if (!accessToken || accessToken == '') {
      console.log('needed a token first');
      $.get('/token/spotify', ({access_token, expires_in}) => {
        console.log('got a enw access token ', access_token);
        localStorage.setItem('pa_token', access_token)
        localStorage.setItem('pa_expires', 1000*(expires_in) + (new Date()).getTime())
        accessToken = access_token
        console.log('set variable accessToken', accessToken);
        getSpotifyWidgets(accessToken, band, $('#spotifyGuess'))
      })
    } else {
      console.log('had access token ', accessToken);
      console.log('getting spotify widgets- band', band);
      getSpotifyWidgets(accessToken, band, $('#spotifyGuess'))
    }
    console.log('should be trying fb search ');
      $.get(`/token/facebook/bands/${band.split(" ").join('')}`, data => {
        console.log('fb data from band name', data);
        console.log('data.link');
        $('#fb').val(data.link)
        $('#url').val(checkUrl(data.website))
        getLocationFromFb(data.current_location, data.hometown)
      })

  })

  $('#fb').blur( e => {
    e.preventDefault()

    let url = e.currentTarget.value
    if (!url.split('/')[3]) {
      console.log('fb had not been filled in yet, doing query to fb api ');
      let fbid
      if (url.split('.')[1] === 'facebook') {
        fbid = url.split('/')[3]
        if (fbid.split('-').length > 1) {
          fbid = fbid.split('-')
          fbid = fbid[fbid.length-1]
        }
      } else {
        fbid = url.split('.')[1]
      }
      $.get(`/token/facebook/bands/${fbid}`, ({name,website,link,genre,hometown,current_location,fan_count}) => {
        let url = checkUrl(website)
        getLocationFromFb(current_location, hometown)
        if (url.split('.')[1] ==='bandcamp') {
          $('#bandcamp').val(url)
        } else if (url.split('/')[2].split('.')[0] === 'www') {
          $('#url').val(url)
        }
      })
    }
  })

  const getLocationFromFb = (curr, home) => {

    if (curr) {
      $('#city').val(curr.split(',')[0])
      if (curr.split(',').length > 1) {
        if (curr.split(',')[1].trim().length === 2) {
          $('#state').val(abbrState(curr.split(',')[1].trim(), 'name'))
        } else {
          $('#state').val(curr.split(',')[1].trim())
        }
      }
    } else if (home) {
      $('#city').val(home.split(',')[0])
      if (home.split(',').length > 1) {
        if (home.split(',')[1].trim().length === 2) {
          $('#state').val(abbrState(home.split(',')[1].trim(), 'name'))
        } else {
          $('#state').val(home.split(',')[1].trim())
        }
      }
    }
  }


  $('#addBandForm').submit( e => {
    e.preventDefault()
    let formData = e.target.elements

    const newBand = {}
    if (!formData.state.value || formData.state.value === 'All') {
      return $('#errorMessage').html(`<div class="alert alert-danger fade show" role="alert">Please select a state</div>`)
    } else {
      newBand.state = formData.state.value
    }
    if (!formData.city.value) {
      return $('#errorMessage').html(`<div class="alert alert-danger fade show" role="alert">Please enter a city</div>`)
    } else {
      newBand.city = makeUppercase(formData.city.value)
    }
    if (!formData.band.value) {
        return $('#errorMessage').html(`<div class="alert alert-danger fade show" role="alert">Please enter a band name</div>`)
    } else {
      newBand.band = formData.band.value
    }
    let selectedGenres = []
    $.each($( ".genre-selector:checked" ), function (index, element) {
      selectedGenres.push(element.value)
    })
    newBand.genres = selectedGenres.slice(0,4)
    newBand.url = formData.url.value && checkUrl(formData.url.value)

    if (formData.fb.value.split('.')[1] !== 'facebook') {
        return $('#errorMessage').html(`<div class="alert alert-danger fade show" role="alert">Incorrect form for facebook url</div>`)
    }
    if (!formData.fb.value.split('/')[3]) {
      return $('#errorMessage').html(`<div class="alert alert-danger fade show" role="alert">Please enter a complete facebook url</div>`)
    }
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
      data: {newBand: JSON.stringify(newBand)},
      success: function (data) {
        // $('#addBandForm').clear()
        $('input').val('');
        $('.guesses').remove()
        $('.genre-selector').prop('checked', false)
        $('#state').val('All');
        $('#bandsList').empty()
        listBands(data)
              }

    })
  }) //end submit form


})
