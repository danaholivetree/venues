$(document).ready(function() {
  const {abbrState} = usStates
  const {makeUppercase, addHttp, checkUrl, checkEmail, endMessage} = helpers
  let accessToken = localStorage.getItem('pa_token')

  $.get(`/api/bands`, (data, status) => {
    listBands(data.slice(0,20))
    setBookmarkListener()
    setStarListener()
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
        const {items} = artists
        // let removeUnlikelies = items.filter( item => {
        //   return item.followers.total > 50
        // })
        if (items.length > 0) {
          let reordered = items.sort( (a,b) => a.followers.total < b.followers.total)
          $('#spotifyGuess').children().first().show()
          $('.guesses').remove()
          $('#wrongSpotify').remove()
          reordered.forEach( (item, i, arr) => {
            let artistId = item.id
            let artistSpotify = item.external_urls.spotify
            let artistUri = item.uri
            // let showSpotify = `<div class='col'><iframe src=https://open.spotify.com/embed?uri=${artistUri}&theme=white width="250" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe></div>`
            // $(showSpotify).insertAfter(target)
            let showItAll =  `<div class='form-group col-lg-3 col-12 guesses'>
                      <div class="form-radio-inline mx-auto">
                        <div class='form-radio col-12'>
                          <label class="form-radio-label" for="radio${i}">
                            <iframe src=https://open.spotify.com/embed?uri=${artistUri}&theme=white width="250" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>
                          </label>
                        </div>

                        <div class='mx-auto col-1'>
                          <input class="form-radio-input guess" type="radio" id="radio${i}" value=${artistSpotify} />
                        </div>
                      </div>
                    </div>`

            $(target).append(showItAll)
            if (arr.length === 1) {
              $('input.guess').prop("checked", true)
            }

          })

          $(`<div id='wrongSpotify' class="form-row"><div class="input-group mb-3 col-12 col-md-8">
            <div class="d-none d-md-inline-block input-group-prepend">
              <span class="input-group-text">Wrong artist? Spotify URL:</span>
            </div>
            <label for='spotifyOther' class="control-label col-3 d-md-none col-form-label" >or Spotify URL:</label>
            <input type="url" id='spotifyOther' class="form-control" aria-label="Default" aria-describedby="inputGroup-sizing-default">
          </div></div>`).insertAfter($(target))

          $('#spotifyOther').on('change', e => $('input.guess').prop("checked", false))
        }
      },
      error: err => {
        console.log('error ', err);
      }
    })
  }

  const listBands = (data) => {
    data.forEach( ({id, band, state, city, url, spotify, bandcamp, fb, genre, starred, stars, bookmark}) => {
      let displayUrl = url  ? `<a href=${url} target='_blank'>www</a>` : ``
      let spotifyUri = spotify ? spotify.split('/')[4] : ''
      let spotifySrc = spotify ? `https://open.spotify.com/embed?uri=spotify:artist:${spotifyUri}&theme=white` : ''
      let displayBandcamp = bandcamp ? `<img class='playBandcamp' data-band='${band}' data-href=${bandcamp} src='images/bandcamp-button-bc-circle-aqua-32.png'>` : ``
      let displayBand = fb ? `<a href=${fb} target='_blank'>${band}</a>` : `${band}`
      let showSpotify = spotify ? `<iframe style="display:none;" src=${spotifySrc} width="250" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>` : ''
      $('#bandsList').append($(`
        <tr>
          <td class='d-none d-md-table-cell'>${abbrState(state, 'abbr')}</td>
          <td>${city}</td>
          <td>${displayBand}</td>
          <td class="genreList d-none d-md-table-cell">${genre ? genre : ''}</td>
          <td>${displayBandcamp}${spotify ? `<img class='playSpotify' src='images/Spotify_Icon_RGB_Green.png' data-uri=${spotifyUri} style="width:32px; background-color:inherit; cursor: pointer;"/>` : ''}</td>
          <td class='d-none d-md-table-cell' align='center'><button class='btn btn-default thumb star'  data-id=${id}><i class="material-icons md-18" data-id=${id}>star</i></button><br><span id=star-number${id}>${stars}</span></td>
          <td class='d-none d-md-table-cell'><button class='btn btn-default thumb bookmark' data-id=${id}><i class="material-icons md-18" data-id=${id}>bookmark</i></button></td>
        </tr>`))
        // console.log('id ', id);
        // console.log('starred' ,starred);
        if (starred) {
         $(`.star`).css("color", "lightblue")
        }
        // console.log('bookmark ', bookmark);
        if (bookmark) {
          console.log('bookmark ', bookmark);
          $('.bookmark').css("color", "lightblue")
        }
        // if (bookmarks) {
        //   $('.bookmark').css("color", "lightblue")
        // }
    })



    $('.playSpotify').click( e => {
      e.preventDefault()
      let targ = $(e.currentTarget)
      let bc = targ.prev()
      let uri = e.currentTarget.dataset.uri
      bc.hide()
      $(`
          <div class='widget'>
            <iframe src=https://open.spotify.com/embed?uri=spotify:artist:${uri}&theme=white width="250" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>
            <a style="top:25px;" href="/" class="close" aria-label="close">&times;</a>
          </div>
          <div>

          </div>
      `).insertAfter(targ)
      targ.hide()
      $('.close').click( e => {
        e.preventDefault()
        $(e.currentTarget).closest('.widget').remove()
        targ.show()
        bc.show()
      })
    })

    $('.playBandcamp').click( e => {
      e.preventDefault()
      let targ = $(e.currentTarget)
      let spot = targ.next()
      let url = e.currentTarget.dataset.href
      let link = e.currentTarget.dataset.href.split('/')[2].split('.')[0]
      let band = e.currentTarget.dataset.band

      $.get(`/bc/album/${link}`, data => {
        const {id, band_id, track, title, artist} = data
        $(`
            <div class='widget'>
               <iframe style="border: 0; width: 370px; height: 120px;" src=https://bandcamp.com/EmbeddedPlayer/album=${id}/size=large/bgcol=ffffff/linkcol=0687f5/tracklist=false/artwork=small/track=${track}/transparent=true/ seamless><a href=${url}>${title} by ${artist}</a></iframe>
               <a style="top:45px;" href="/" class="close" aria-label="close">&times;</a>
            </div>

        `).insertAfter(targ)
        targ.hide()
        spot.hide()
        $('.close').click( e => {
          e.preventDefault()
          $(e.currentTarget).closest('.widget').remove()
          targ.show()
          spot.show()
        })
      })

    })

  }


  const setBookmarkListener = () => {
    $('.bookmark').click( e => {
      console.log('e.target ', e.target);
      e.preventDefault()
      console.log('e.target.dataset.id ', e.target.dataset.id);
      $.post(`/api/bBookmarks`, {bandId: e.target.dataset.id}, data => {
        if (data.bookmarked) {
          $(e.target).css("color", "lightblue")
        } else {
          $(e.target).css("color", "black")
        }
      })
    })
  }

  const setStarListener = () => {
    console.log('setting star listener');
    $('.star').click( e => {
      console.log('e.target ', e.target);
      e.preventDefault()
      let targ = e.target
      $.post(`/api/stars`, {bandId: targ.dataset.id}, ({starred, stars}) => {
        console.log('starred ', starred);
        console.log('stars ', stars);
        console.log('looking for span ', $(targ).next('span'));
        $(`#star-number${targ.dataset.id}`).text(`${stars}`)
        if (starred) {
          $(targ).css("color", "lightblue")
        } else {
          $(targ).css("color", "black")
        }

      })
    })
  }


  $('#bandSearchForm').submit( e => {
    e.preventDefault()
    let formData = e.target.elements
    let state = $('.stateSelector').val()
    let city = formData.city.value
    let band = formData.band.value
    let genres = []
    $('.genre-selector:checked').each( function() {
        genres.push(this.value)
    })
    // console.log($('#starred-select'));
    let starred = $('#starred-select').prop('checked')
    let bookmarked = $('#bookmark-select').prop('checked')
    const params = {state, city, band, genres, starred, bookmarked}
    const queryString = $.param(params)
    $.get(`/api/bands/q?${queryString}`, (data, status) => {
      if (band) {
        $('.stateDisplay').text(`Bands matching '${makeUppercase(band)}'`).show()
      } else if (city) {
        $('.stateDisplay').text(`Bands in ${makeUppercase(city)}`).show()
      } else if (state !== 'All') {
        $('.stateDisplay').text(`Bands in ${state}`).show()
      }
        $('#bandsList').empty()
        // $('.genre-selector').prop('checked', false) //maybe dont want these three
        // $('input[type="text"], textarea').val('');
        // $('#state').val('All');
        listBands(data)
        setBookmarkListener()
        setStarListener()

    })
  })

  $('#searchBands').click( e => {
    e.preventDefault()
      $('#bandSearchForm').toggle(true)
      $('.guesses').remove()
      $('.genre-selector').prop('checked', false)
      $('#addBandForm').toggle(false)
      $('#addBandForm input').val('')
      $('#state').val('All')
      $('#searchBands').css('background-color', 'lightblue')
      $('#addBand').css('background-color', 'white')
  })

  $('#addBand').click( e => {
    e.preventDefault()
      $('#bandSearchForm input').val('')
      $('.stateSelector').val('All')
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

  $('#band').change( e => {
    e.preventDefault()
    let band = e.currentTarget.value
    if (band !== '') {
      $.get(`/bc/search/${band}`, data => {
        $('#bandcamp').val(data[0].url)
        // $(`.genres input.${data[0].genre.trim()}`).prop('checked', true)
        data[0].tags.forEach( tag => {
          tag = tag[0].toUpperCase()+tag.slice(1)
          $(`.genres input.${tag}`).prop('checked', true)
        })
      })

      if (!accessToken || accessToken == '' || localStorage.getItem('pa_expires') < (new Date()).getTime()) {
        $.get('/token/spotify', ({access_token, expires_in}) => {
          localStorage.setItem('pa_token', access_token)
          localStorage.setItem('pa_expires', 1000*(expires_in) + (new Date()).getTime())
          accessToken = access_token
          getSpotifyWidgets(accessToken, band, $('#spotifyGuess'))
        })
      } else {
        getSpotifyWidgets(accessToken, band, $('#spotifyGuess'))
      }
        $.get(`/token/facebook/bands/${band.split(" ").join('')}`, data => {
          console.log('fb data from band name', data);
          console.log('data.link');
          $('#fb').val(data.link)
          $('#url').val(checkUrl(data.website))
          getLocationFromFb(data.current_location, data.hometown)
        })


    }

  })

  $('#fb').change( e => {
    e.preventDefault()

    let url = e.currentTarget.value
    if (!url.split('/')[3]) {
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
    if ($('#city').val() === '' || ($('#state').val() === '')) {
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
  }

  const checkForErrors = (formData) => {
    if (!formData.state.value || formData.state.value === 'All') {
      return "Please select a state"
    }
    if (!formData.city.value) {
      return "Please enter a city"
    }
    if (!formData.band.value) {
      return "Please enter a band name"
    }
    if (formData.fb && formData.fb.value.split('.')[1] !== 'facebook') {
      return "Incorrect form for facebook url"
    }
    if (formData.fb && !formData.fb.value.split('/')[3]) {
      return "Please enter a complete facebook url"
    }
  }

  const newBandFromForm = (formData, spot, selectedGenres) => {
    let newBand = {
      state: formData.state.value,
      city: makeUppercase(formData.city.value),
      band: makeUppercase(formData.band.value)
    }
    newBand.genres = selectedGenres.slice(0,4)

    if (formData.url.value !== '') {
      newBand.url = checkUrl(formData.url.value)
    }
    if (formData.fb.value !== '') {
      newBand.fb = checkUrl(formData.fb.value)
    }
    if (formData.bandcamp.value !== '') {
      newBand.bandcamp = checkUrl(formData.bandcamp.value)
    }
    newBand.spotify = spot
    return newBand
  }

  const newBandandSubmit = (formData, spot, selectedGenres) => {
    // e.preventDefault()

    if (checkForErrors(formData)) {
      return $('#errorMessage').html(`<div class="alert alert-danger fade show" role="alert">${checkForErrors(formData)}</div>`)
    }
    let newBand = newBandFromForm(formData, spot, selectedGenres)
    $.ajax({
      method: 'POST',
      url: '/api/bands',
      dataType: 'json',
      data: {newBand: JSON.stringify(newBand)},
      success: function (data) {
                  console.log('data came back from add band ', data);
                  $('#errorMessage').empty()
                  $('input').val('');
                  $('.guesses').remove()
                  $('.genre-selector').prop('checked', false)
                  $('#state').val('All');
                  $('#bandsList').empty()
                  listBands(data)
              },
      error: err => {
        $('#errorMessage').html(`<div class="alert alert-danger fade show" role="alert">${err.responseText}</div>`)
      }
    })
  }

  $('#addBandForm').submit( e => {
    e.preventDefault()
    let formData = e.target.elements
    let spot = $('.guess:checked').val() ? $('.guess:checked').val() : $('#spotifyOther').val()
    let selectedGenres = []
    $.each($( "#addGenres input:checked" ), function (i, el) {
      selectedGenres.push(el.value)
    })
    $('#checkBandModal .modal-body').empty().append(`<p>Is this correct?</p>
      <p>Band: ${formData.band.value}</p>
      <p>Location: ${formData.city.value}, ${abbrState(formData.state.value, 'abbr')}</p>
      <p>FB: <a href="${formData.fb.value}" target="_blank">${formData.fb.value}</a></p>
      <p>URL: <a href="${formData.url.value}" target="_blank">${formData.url.value}</a></p>
      <p>Bandcamp: <a href="${formData.bandcamp.value}" target="_blank">${formData.bandcamp.value}</a></p>
      <p>Spotify: <a href=${spot} target="_blank">${spot}</a></p>
      <p>Genres: ${selectedGenres.slice(0,4).join(' ')}

      `)
    $('#checkBandModal').modal('show');
    $('#acceptBand').click( e => {
      $('#checkBandModal').modal('hide');
      newBandandSubmit(formData, spot, selectedGenres)
    })
  })



})
