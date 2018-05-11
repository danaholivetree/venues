onDOMContentLoaded = (() {
  const {abbrState} = usStates
  const {makeUppercase, addHttp, checkUrl, checkEmail, endMessage} = helpers
  let accessToken = localStorage.getItem('pa_token')
  let off = 0

  const getById = (el) => document.getElementById(el);
  const next = getById('next')
  const prev = getById('prev')
  const top = getById('bandTable')[0] //was using .get(0) before but not sure why
  const prevNext = getById('prevNext')
  const hideEl = (el) => el.setAttribute('class', 'hidden')
  const showEl = (el) => el.removeAttribute('class', 'hidden')


  const getData = async (offset = 0, scroll = false, query = '') => {
    return $.get(`/api/bands/${query ? 'q?'+query : offset > 0 ? '?offset='+offset: ''}`, (data, status) => {
      if (offset > 0 && !data) {
        // $('#next').prop('disabled', true)
        // $('#prev').prop('disabled', true)
        next.disabled = true
        prev.disabled = true

        return
      } else {
        if (offset === 0) {
          // $('#prev').prop('disabled', true)
          prev.disabled = true
        }
        if (scroll) {
          // $('#bandTable').get(0).scrollIntoView()
          top.scrollIntoView()
        }
        return data
      }
    })
  }

  const loadPage = async () => {
    let data = await getData(off)
    processData(data)
    setPrevNextListener()
  }

  const processData = (data) => {
    if (data) {
      listBands(data)
      if (data.length === 0) {
        // $('#prevNext').hide()
        hide(prevNext)
      } else {
        // $('#prevNext').show()
        show(prevNext)
      }
      if (data.length < 25) {
        // $('#next').prop('disabled', true)
        next.disabled = true
      } else {
        // $('#next').prop('disabled', false)
        next.disabled = false
      }

    }
  }
  const clear = (el) => {
    el.innerHTML = ''
  }


  const listBands = (data, bookmarks = false) => {

    // $('#bandsList').empty()
    let tbody = getById('bandsList')
    clear(tbody)
    data.forEach( bnd => {
      const {id, band, state, city, url, spotify, bandcamp, fb, genre, starred, stars, bookmark} = bnd
      let displayUrl = url  ? `<a href=${url} target='_blank'>www</a>` : ``
      let spotifyUri = spotify ? spotify.split('/')[4] : ''
      // let spotifySrc = spotify ? `https://open.spotify.com/embed?uri=spotify:artist:${spotifyUri}&theme=white` : ''
      let displaySpotify = spotify ? `<img class='playSpotify' src='images/Spotify_Icon_RGB_Green.png' data-uri=${spotifyUri} style="width:32px; background-color:inherit; cursor: pointer;"/>` : ''
      let displayBandcamp = bandcamp ? `<img class='playBandcamp' data-band='${band}' data-href=${bandcamp} src='images/bandcamp-button-bc-circle-aqua-32.png'>` : ``
      let displayBand = fb ? `<a href=${fb} target='_blank'>${band}</a>` : `${band}`
      let starBorder= `<i style="color:black;" class="material-icons md-18">star_border</i>`
      let starIcon = `<i style="color:lightblue;" class="material-icons md-18">star</i>`
      let starr = `<button class='btn btn-default thumb star' data-id=${id}>${starred ? starIcon : starBorder}</button><br><span id=star-number${id}>${stars}</span>`
      let bookmarkIcon = `<i style="color:lightblue" class="material-icons md-18">bookmark</i>`
      let bookmarkBorder = `<i class="material-icons md-18">bookmark_border</i>`
      let bkmk = `<button class='btn btn-default thumb bookmark' data-id=${id}>${bookmark ? bookmarkIcon : bookmarkBorder}</button>`
      let displayGenre = genre ? genre : ''
      // $('#bandsList').append($(`
      //   <tr>
      //     <td class='d-none d-md-table-cell'>${abbrState(state, 'abbr')}</td>
      //     <td>${city}</td>
      //     <td>${displayBand}</td>
      //     <td class="genreList d-none d-md-table-cell">${displayGenre}</td>
      //     <td>${displayBandcamp}${displaySpotify}</td>
      //     <td class='d-none d-md-table-cell' align='center'>${starr}</td>
      //     <td class='d-none d-md-table-cell'>${bkmk}</td>
      //   </tr>`))
      let bodyItem = `
        <tr>
          <td class='d-none d-md-table-cell'>${abbrState(state, 'abbr')}</td>
          <td>${city}</td>
          <td>${displayBand}</td>
          <td class="genreList d-none d-md-table-cell">${displayGenre}</td>
          <td class="widgets-column">${displayBandcamp}${displaySpotify}</td>
          <td class='d-none d-md-table-cell' align='center'>${starr}</td>
          <td class='d-none d-md-table-cell'>${bkmk}</td>
        </tr>`
      tbody.innerHTML += bodyItem
    })
    setTbodyListeners(tbody)
    setBookmarkListener()
    setStarListener()
    setSpotifyListener()

  }

  loadPage()
  const setTbodyListeners = (tbody) => {
    tbody.addEventListener('click', e => {
      e.preventDefault()
      let targ = e.currentTarget
      // console.log(targ);
      if (targ.matches('.playBandcamp')) { //might not work in ie?
        console.log('clicked .playBandcamp');
        clickedBandcamp(targ)
      } else if (targ.matches('.playSpotify')) {
        console.log('clicked .playSpotify');
        clickedSpotify(targ)
      } else if (targ.matches('.close')) {
          targ.previousSibling.remove() // not sure this will work
          showEl(targ.parentNode)
          showEl(spot)
      }

    })
  }

  const clickedBandcamp = (targ) => {
    let spot = targ.nextSibling //spotify logo
    let url = targ.dataset.href
    let link = targ.dataset.href.split('/')[2].split('.')[0]
    let band = targ.dataset.band
    console.log('spot= ', spot);
    console.log('url= ', url);
    console.log('link= ', link);
    console.log('band= ', band);
    let getBandcampInfo = new XMLHttpRequest();
    const bandcampAjaxHandler = () => {
        if (getBandcampInfo.readyState === XMLHttpRequest.DONE) {
          console.log('getBandcampInfo.readyState === XMLHttpRequest.DONE');
          if (getBandcampInfo.status === 200) {
            console.log('status 200');
            let data = JSON.parse(getBandcampInfo.responseText); //is responseText a builtin for ajax?
            console.log('response from get bandcamp info ' , data.computedString);
            const {id, band_id, track, title, artist} = data
            let newBcWidget = `<div class='widget'>
              <iframe style="border: 0; width: 370px; height: 120px;" src=https://bandcamp.com/EmbeddedPlayer/album=${id}/size=large/bgcol=ffffff/linkcol=63b2cc/tracklist=false/artwork=small/track=${track}/transparent=true/ seamless><a href=${url}>${title} by ${artist}</a></iframe>
              <a style="top:45px;" href="/" class="close" aria-label="close">&times;</a>
              </div>`
            targ.parentNode.innerHTML += newBcWidget
            hideEl(targ)
            hideEl(spot)
          } else {
            console.log('bandcamp request failed- responsetext ', getBandcampInfo.responseText);
          }
        }
    }
    getBandcampInfo.onreadystatechange = bandcampAjaxHandler
    getBandcampInfo.open('GET', `/bc/album/${link}`)
    getBandcampInfo.send()
  }

  const clickedSpotify = (targ) => {
      let bc = targ.previousSibling
      let uri = targ.dataset.uri
      hideEl(bc)
      let spotifyWidget = `<div class='widget'>
            <iframe src=https://open.spotify.com/embed?uri=spotify:artist:${uri}&theme=white width="250" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>
            <a style="top:25px;" href="/" class="close" aria-label="close">&times;</a>
          </div>`
      targ.parentNode.innerHTML += spotifyWidget
      hideEl(targ)
      // $('.close').click( e => {
      //   e.preventDefault()
      //   $(e.currentTarget).closest('.widget').remove()
      //   targ.show()
      //   bc.show()
      // })
    })
  }

  const setBookmarkListener = () => {
    $('.bookmark').click( e => {
      e.preventDefault()
      $.post(`/api/bBookmarks`, {bandId: e.currentTarget.dataset.id}, data => {
        if (data.bookmarked) {
          $(e.currentTarget).children('i').css("color", "lightblue").text('bookmark')
        } else {
          $(e.currentTarget).children('i').css("color", "black").text('bookmark_border')
        }
      })
    })
  }

  const setStarListener = () => {
    $('.star').click( e => {
      e.preventDefault()
      let targ = e.currentTarget
      $.post(`/api/stars`, {bandId: targ.dataset.id}, ({starred, stars}) => {
        $(`#star-number${targ.dataset.id}`).text(`${stars}`)
        if (starred) {
          $(targ).children('i').css("color", "lightblue").text('star')
        } else {
          $(targ).children('i').css("color", "black").text('star_border')
        }

      })
    })
  }

  const setPrevNextListener = () => {
    $('#prevNext').show()
    $('#prev').prop('disabled', true)
    $('#next').click( e => {
      e.preventDefault()
      off += 25
      $('#prev').prop('disabled', false)
      getData(off, true).then( data => {
        if (data.length > 0) {
          processData(data)
        }
      })
    })
    $('#prev').click( e => {
      e.preventDefault()
      off -= 25
      getData(off, true).then( data => {
        processData(data)
      })

    })
  }

  const setPrevNextQueryListener = (params, origQuery) => {
    off = 0 // ?
    $('#prev').prop('disabled', true)

    $('#next').off('click')
    $('#next').click( e => {
      e.preventDefault()
      $('#prev').prop('disabled', false)
      off += 25
      let sendNextParams = params //added for older browsers
      sendNextParams.offset = off  //added for older browsers
      const newQueryString = $.param(sendNextParams) //added for older browsers
      // const newQueryString = $.param({...params, offset: off})
      getData(off, true, `${off > 0 ? newQueryString : origQuery}`).then( data => {
        if (data.length > 0) {
          processData(data)
        } else {
          $('#next').prop('disabled', true)
        }
      })
    })
    $('#prev').off('click')
    $('#prev').click( e => {
      e.preventDefault()
      off -= 25
      let sendPrevParams = params //added for older browsers
      sendPrevParams.offset = off  //added for older browsers
      const newQueryString = $.param(sendPrevParams) //added for older browsers
      // const newQueryString = $.param({...params, offset: off})
      getData(off, true, `${off > 0 ? newQueryString : origQuery}`).then( data => {
        processData(data)
        if (off === 0) {
          $('#next').prop('disabled', false)
        }
      })
    })
  }

  $('#bandSearchForm').submit( e => {
    e.preventDefault()
    off = 0
    let formData = e.target.elements
    let state = $('.stateSelector').val()
    let city = formData.city.value
    let band = formData.band.value
    let genres = []
    $('.genre-selector:checked').each( function() {
        genres.push(this.value)
    })
    let starred = $('#starred-select').prop('checked')
    let bookmarked = $('#bookmark-select').prop('checked')
    const params = {state, city, band, genres, starred, bookmarked}
    const queryString = $.param(params)
    getData(0, false, queryString).then( data => {
      processData(data)
      $('.stateDisplay').html(`<h2>Bands ${bookmarked || starred ? 'I\'ve ' : ''}${bookmarked ? 'Bookmarked ' : '' }${bookmarked && starred ? 'and ' : ''}
      ${starred ? 'Starred ' : '' }${city || state !== 'All' ? 'in ' :''}${city ? city : ''}${city && (state !== 'All') ? ',' : ''}
      ${state !== 'All' ? abbrState(state, 'abbr') : ''} ${band ? 'matching '+ makeUppercase(band) : ''}</h2>`).show()
      setPrevNextQueryListener(params, queryString)
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
    console.log(' checked length ', $('.genre-selector:checked').length);
    if($('.genre-selector:checked').length > 4) {
       this.checked = false;
     }
  })

  const getBandcamp = (band) => {
    $.get(`/bc/search/${band}`, data => {
      $('#bandcamp').val(data[0].url)
      data[0].tags.forEach( tag => {
        tag = tag[0].toUpperCase()+tag.slice(1)
        $(`#addGenres input.${tag}`).prop('checked', true)
      })
    })
  }
  const getSpotifyToken = () => {
    $.get('/token/spotify', ({access_token, expires_in}) => {
      localStorage.setItem('pa_token', access_token)
      localStorage.setItem('pa_expires', 1000*(expires_in) + (new Date()).getTime())
      accessToken = access_token
    })
  }

  const checkForSpotifyToken = () => {
    if (!accessToken || accessToken == '' || localStorage.getItem('pa_expires') < (new Date()).getTime()) {
      getSpotifyToken()
    }
  }
  $('#band').change( e => {
    e.preventDefault()
    let band = e.currentTarget.value
    if (band !== '') {
      getBandcamp(band)
      checkForSpotifyToken()
      getSpotifyWidgets(accessToken, band, $('#spotifyGuess'))
      $.get(`/token/facebook/bands/${band.split(" ").join('')}`, data => {
        if (data.category === 'Musician/Band' || data.category === 'Music') {
          $('#fb').val(data.link)
          $('#url').val(checkUrl(data.website))
          getLocationFromFb(data.current_location, data.hometown)
        }
      })
    }
  })

  const getFbId = (url) => {
    let fbid
    if (url.split('/')[3]) { // like name in facebook.com/name

      if (url.split('.')[1] === 'facebook') {  //from facebook

        fbid = url.split('/')[3]
        if (fbid.split('-').length > 1) {
          fbid = fbid.split('-')
          fbid = fbid[fbid.length-1]
        }
      }
    } else { //from url
        fbid = url.split('.')[1]
    }
    return fbid
  }

  $('#fb').change( e => {
    e.preventDefault()
    let fbid = getFbId(e.currentTarget.value)
    $.get(`/token/facebook/bands/${fbid}`, ({name,website,link,genre,hometown,current_location,fan_count,category}) => {
      console.log('category ', category);
      if (category === 'Musician/Band' || category === 'Music') {
        let url = checkUrl(website)
        getLocationFromFb(current_location, hometown)
        if ($('#band').val() === '') {
          $('#band').val(name)
          getBandcamp(name)
          checkForSpotifyToken()
          getSpotifyWidgets(accessToken, band, $('#spotifyGuess'))
        }
        if (url.split('.')[1] ==='bandcamp') {
          $('#bandcamp').val(url)
        } else if (url.split('/')[2].split('.')[0] === 'www') {
          $('#url').val(url)
        }
      }
    })
  })

  const getLocationFromFb = (curr, home) => {
    if ($('#city').val() === '' || ($('#state').val() === 'Any')) {
      if (curr && curr.split(',').length > 1) {
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
        if (items.length > 0) {
          let reordered = items.sort( (a,b) => a.followers.total < b.followers.total)
          $('#spotifyGuess').children().first().show()
          $('.guesses').remove()
          $('#wrongSpotify').remove()
          reordered.forEach( (item, i, arr) => {
            let artistId = item.id
            let artistSpotify = item.external_urls.spotify
            let artistUri = item.uri
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
    let newBand = newBandFromForm(formData, spot, selectedGenres)
    $.ajax({
      method: 'POST',
      url: '/api/bands',
      dataType: 'json',
      data: {newBand: JSON.stringify(newBand)},
      success: function (data) {
                  $('#errorMessage').empty()
                  $('input').val('');
                  $('.guesses').remove()
                  $('.genre-selector').prop('checked', false)
                  $('#state').val('All');
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
    if (checkForErrors(formData)) {
      return $('#errorMessage').html(`<div class="alert alert-danger fade show" role="alert">${checkForErrors(formData)}</div>`)
    }
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
