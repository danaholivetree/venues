  const {genreKeywords} = usStates
  const {makeUppercase, addHttp, checkUrl, checkEmail, endMessage} = helpers
  let accessToken = localStorage.getItem('pa_token') || ''
  let off = 0
  const getById = (el) => document.getElementById(el);
  const next = getById('next')
  const prev = getById('prev')
  const topOfResults = getById('bandTable') //was using .get(0) before but not sure why
  const prevNext = getById('prevNext')
  const hideEl = (el) => el.classList.add('hidden')
  const showEl = (el) => el.classList.remove('hidden')
  const addBandBtn = getById('addBand')
  const addBandForm = getById('addBandForm')
  const searchBandBtn = getById('searchBands')
  const searchBandForm = getById('bandSearchForm')
  const addGenres = getById('addGenres')
  let globalParams
  let globalOrigQuery

  const handleErrors = response => {
    // console.log(response.ok ? 'response ok' : response.statusText);
    if (!response.ok) {
      throw new Error(response.statusText);
    } else {
      return response.json();
    }
  }

  const genresAndListener = () => {
    let gs = getById('genreSelector')

    genreKeywords.forEach( genre => {
      let newGenre = `<div class="form-check form-check-inline" style='display:inline-flex;'>
          <input class="form-check-input genre-selector ${genre}" type="checkbox" value="${genre}">
          <label class="form-check-label" for=${genre}>${genre}</label></div>`
      gs.innerHTML += newGenre
      addGenres.innerHTML += newGenre
    })
  }
  genresAndListener()

  const getData = async (offset = 0, scroll = false, query = '') => {
    let bandQuery = query ? 'q?'+query : offset > 0 ? '?offset='+offset: ''
    return await fetch(`/api/bands/${bandQuery}`, {credentials: 'same-origin'})
      .then(handleErrors)
      .then( data => {
        if (offset > 0 && data.length === 0) {
          disable(next)
          return //no data, don't reload anything
        } else {
          if (offset === 0) {
            disable(prev)
          }
          if (scroll) {
            topOfResults.scrollIntoView()
          }
          // console.log('getData', data);
          return data
        }
      }).catch( err => {
        console.log('error fetching data ', err);
      })
  }

  const loadPage = async () => {
    let data = await getData(off)
    processData(data)
    // showEl(prevNext)
    disable(prev)
    setPrevNextListener()
  }

  const managePrevNextButtons = (dataLength) => {
    if (dataLength === 0) {
      // console.log('hiding prevnext',dataLength );
      hideEl(prevNext)
    } else {
      // console.log('showing prevnext', dataLength);
      showEl(prevNext)
    }
    if (dataLength < 25) {
      disable(next)
    } else {
      enable(next)
    }
  }

  const processData = (data) => {
    if (data) {
      listBands(data)
      managePrevNextButtons(data.length)
    } else {
      // console.log('processing data, no data ', data);
    }
  }

  const clear = (el) => {
    if (el) {
        el.innerHTML = ''
    }
  }

  const disable = (el) => {
    el.disabled = true
  }

  const enable = (el) => {
    el.disabled = false
  }

  const listBands = (data, bookmarks = false) => {

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
      let starBorder= `<i class="material-icons md-18 star">star_border</i>`
      let starIcon = `<i class="material-icons md-18 lightblue-text star">star</i>`
      let starr = `<button class='btn btn-default thumb star' data-id=${id}>${starred ? starIcon : starBorder}</button><br><span>${stars}</span>`
      let bookmarkIcon = `<i class="material-icons md-18 bookmark lightblue-text">bookmark</i>`
      let bookmarkBorder = `<i class="material-icons md-18 bookmark">bookmark_border</i>`
      let bkmk = `<button class='btn btn-default thumb bookmark' data-id=${id}>${bookmark ? bookmarkIcon : bookmarkBorder}</button>`
      let displayGenre = genre ? genre : ''
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
  }

  loadPage()

  const setTbodyListeners = (tbody) => {
    tbody.addEventListener('click', e => {
      e.preventDefault()
      let targ = e.target
      if (targ.matches('.playBandcamp')) { //might not work in ie?
        // console.log('clicked .playBandcamp');
        clickedBandcamp(targ)
      } else if (targ.matches('.playSpotify')) {
        // console.log('clicked .playSpotify');
        clickedSpotify(targ)
      } else if (targ.matches('.close')) {
        // console.log('clicked .close')
        clickedClose(targ)
      } else if (targ.matches('.bookmark')) {
        // console.log('clicked .bookmark', targ);
        clickedBookmark(targ)
      } else if (targ.matches('.star')) {
        // console.log('clicked .star');
        clickedStar(targ)
      }

    })
  }

  const clickedClose = (targ) => {
    let widget = targ.parentNode
    // console.log('widget ', widget);
    let spot = widget.previousSibling
    // console.log('spotify button ', spot);
    let bandcamp = spot.previousSibling
    // console.log('bandcamp button ', bandcamp);
    showEl(spot)
    showEl(bandcamp)
    widget.remove() // not sure this will work
  }

  const clickedBandcamp = (targ) => {
    let spot = targ.nextSibling //spotify logo
    let url = targ.dataset.href
    let link = targ.dataset.href.split('/')[2].split('.')[0]
    let band = targ.dataset.band
    // console.log('spot= ', spot);
    // console.log('url= ', url);
    // console.log('link= ', link);
    // console.log('band= ', band);
    let getBandcampInfo = new XMLHttpRequest();
    const bandcampAjaxHandler = () => {
        if (getBandcampInfo.readyState === XMLHttpRequest.DONE) {
          // console.log('getBandcampInfo.readyState === XMLHttpRequest.DONE');
          if (getBandcampInfo.status === 200) {
            // console.log('status 200');
            let data = JSON.parse(getBandcampInfo.responseText); //is responseText a builtin for ajax?
            // console.log('response from get bandcamp info ' , data.computedString);
            const {id, band_id, track, title, artist} = data
            let newBcWidget = `<div class='widget'>
              <iframe style="border: 0; width: 370px; height: 120px;" src=https://bandcamp.com/EmbeddedPlayer/album=${id}/size=large/bgcol=ffffff/linkcol=63b2cc/tracklist=false/artwork=small/track=${track}/transparent=true/ seamless><a href=${url}>${title} by ${artist}</a></iframe>
              <a style="top:45px;" href="/" class="close" aria-label="close">&times;</a>
              </div>`
            targ.parentNode.innerHTML += newBcWidget
            hideEl(targ)
            hideEl(spot)
          } else {
            // console.log('bandcamp request failed- responsetext ', getBandcampInfo.responseText);
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
  }

  const clickedBookmark = async (targ) => {
    let bandId
    if (targ.dataset.id) {
      bandId = targ.dataset.id
    } else if (targ.parentNode.dataset.id) {
      bandId = targ.parentNode.dataset.id
      targ = targ.parentNode
    }
    return await fetch(`/api/bBookmarks`, {body: JSON.stringify({bandId}),
              headers: {'Content-Type': 'application/json'},
              credentials: 'same-origin', method: 'POST'
    }).then(handleErrors)
      .then(data => {
        let icon = targ.firstChild
        if (data.bookmarked) {
          icon.classList.add('lightblue-text')
          clear(icon)
          iconText = document.createTextNode('bookmark')
          icon.append(iconText)
        } else {
          icon.classList.remove('lightblue-text')
          clear(icon)
          iconText = document.createTextNode('bookmark_border')
          icon.append(iconText)
        }
      }).catch(err => console.log(err))
    }

  const clickedStar = (targ) => {
    let bandId
    if (targ.dataset.id) {
      bandId = targ.dataset.id
    } else if (targ.parentNode.dataset.id) {
      bandId = targ.parentNode.dataset.id
      targ = targ.parentNode
    }
    fetch(`/api/stars`, {body: JSON.stringify({bandId}),
              headers: {'Content-Type': 'application/json'},
              credentials: 'same-origin', method: 'POST'
    }).then(handleErrors)
      .then(data => {
        let {starred, stars} = data
        let starIcon = targ.firstChild
        let brEl = targ.nextSibling
        let starSpan = brEl.nextSibling
        starSpan.textContent = stars
        if (starred) {
          starIcon.classList.add('lightblue-text')
          starIcon.textContent = 'star'
        } else {
          starIcon.classList.remove('lightblue-text')
          starIcon.textContent = 'star_border'
        }
      })
  }

  const makeQuery = (obj) => {
    var k = Object.keys(obj);
    var s = "";
    for(var i=0;i<k.length;i++) {
        s += k[i] + "=" + encodeURIComponent(obj[k[i]]);
        if (i != k.length -1) s += "&";
    }
    return s;
  }

  const nextHandler = e => {
    e.preventDefault()
    enable(prev)
    off += 25
    // console.log('global params ', globalParams);
    // console.log('global origquery ', globalOrigQuery);
    if (globalParams) {
      let sendNextParams = globalParams //added for older browsers
      sendNextParams.offset = off  //added for older browsers
      const newQueryString = makeQuery(sendNextParams) //added for older browsers
      // const newQueryString = $.param({...params, offset: off})
      getData(off, true, `${off > 0 ? newQueryString : globalOrigQuery}`).then( data => {
        if (data.length > 0) {
          processData(data)
        }
      })
    } else {
      getData(off, true).then( data => {
        if (data.length > 0) {
          processData(data)
        }
      })
    }
  }

  const prevHandler = (e, params, origQuery) => {
    e.preventDefault()
    off -= 25
    if (globalParams) {
      let sendPrevParams = globalParams //added for older browsers
      sendPrevParams.offset = off  //added for older browsers
      const newQueryString = makeQuery(sendPrevParams) //added for older browsers
        // const newQueryString = $.param({...params, offset: off})
      getData(off, true, `${off > 0 ? newQueryString : globalOrigQuery}`).then( data => {
        processData(data)
      })
    } else {
      getData(off, true).then( data => {
        processData(data)
      })
    }
  }

  const setPrevNextListener = () => {
    off = 0
    disable(prev)
    next.addEventListener('click', nextHandler)
    prev.addEventListener('click', prevHandler)
  }

  const submitSearch = e => {
    // console.log('submitting search');
    e.preventDefault()
    off = 0
    let formData = e.target.elements
    let state = formData.state.value
    let city = formData.city.value
    let band = formData.band.value
    let genres = []
    let genreSelector = document.querySelectorAll('.genre-selector')
    genreSelector.forEach( g => {
      if (g.checked) {
        genres.push(g.value)
      }
    })
    let starredSelect = getById('starred-select')
    let starred = starredSelect.checked
    let bookmarkSelect = getById('bookmark-select')
    let bookmarked = bookmarkSelect.checked
    const params = {state, city, band, genres, starred, bookmarked}

    let queryString = makeQuery(params)
    // console.log( $.param(params) === queryString)
    // console.log('$.param(params) ', $.param(params) );
    // console.log('queryString ', queryString);
    getData(0, false, queryString).then( data => {
      processData(data)
      let resultsTitleDisplay = document.querySelector('.stateDisplay')
      resultsTitleDisplay.innerHTML = makeResultsTitle(params)
      showEl(resultsTitleDisplay)
      globalParams = params
      globalOrigQuery = queryString
    })
  }

  searchBandForm.addEventListener('submit', submitSearch)

  const makeResultsTitle = (params) => {
    let {state, city, band, genres, starred, bookmarked} = params
    return `<h2>Bands ${bookmarked || starred ? 'I\'ve ' : ''}${bookmarked ? 'Bookmarked ' : '' }${bookmarked && starred ? 'and ' : ''}
    ${starred ? 'Starred ' : '' }${city || state !== 'All' ? 'in ' :''}${city ? city : ''}${city && (state !== 'All') ? ',' : ''}
    ${state !== 'All' ? abbrState(state, 'abbr') : ''} ${band ? 'matching '+ makeUppercase(band) : ''}</h2>`
  }

  const showSearchForm = e => {
    e.preventDefault()
    showEl(searchBandForm)
    clear(document.querySelector('.guesses'))
    hideEl(addBandForm)
    let addBandFormInputs = addBandForm.querySelectorAll('input')
    addBandFormInputs.forEach( inp => {
      inp.value = ''
      if (inp.type === 'checkbox') {
        inp.checked = false
      }
    })
    let state = getById('state')
    state.value = 'All'
    searchBandBtn.classList.add('lightblue')
    addBandBtn.classList.remove('lightblue')
  }

  searchBandBtn.addEventListener('click', showSearchForm)

  const showAddForm = e => {
    e.preventDefault()
      let searchBandFormInputs = searchBandForm.querySelectorAll('input')
      searchBandFormInputs.forEach( inp => {
        inp.value = ''
        if (inp.type === 'checkbox') {
          inp.checked = false
        }
      })
      let stateSelector = document.querySelector('.stateSelector')
      stateSelector.value = 'All'
      hideEl(searchBandForm)
      showEl(addBandForm)
      addBandBtn.classList.add('lightblue')
      searchBandBtn.classList.remove('lightblue')
      let fb = document.getElementById('fb')
      fb.value = 'http://www.facebook.com/'
  }

  addBandBtn.addEventListener('click', showAddForm)

  const preventFifthGenre = e => {
    let g = e.target
    if (g.type === 'checkbox' && g.checked) {
      let genresChecked = addGenres.querySelectorAll('input:checked')
      if (genresChecked.length > 4) {
        g.checked = false;
      }
    }
  }

  addGenres.addEventListener('click', preventFifthGenre)

  const getBandcamp = async (band) => {
    return await fetch(`/bc/search/${band}`)
      .then( res => res.json())
      .catch( err => console.log(err))
      .then( data => {
        if (data) {
          getById('bandcamp').value = data[0].url
          data[0].tags.forEach( tag => {
            tag = tag[0].toUpperCase()+tag.slice(1)
            if (addGenres.querySelector(`input.${tag}`)) {
              // console.log(addGenres.querySelector(`input.${tag}`))
              addGenres.querySelector(`input.${tag}`).checked = true
            }
          })

        }
      })
  }

  const getSpotifyToken = async () => {
    // console.log('getting spotify token');
    return await fetch('/token/spotify')
      .then(res => res.json())
      .catch(err => console.log(err))
      .then( (data) => {
        // console.log('data ', data);
        const {access_token, expires_in} = data
        localStorage.setItem('pa_token', access_token)
        localStorage.setItem('pa_expires', 1000*(expires_in) + (new Date()).getTime())
        accessToken = access_token
        return accessToken
      })
  }

  const checkForSpotifyToken = () => {
    if (!accessToken || accessToken == '' || accessToken == undefined || localStorage.getItem('pa_expires') < (new Date()).getTime()) {
      // console.log('token expired? ', localStorage.getItem('pa_expires') < (new Date()).getTime());
      // console.log('no token ', !accessToken || accessToken == '' || accessToken == undefined );
      return false
    } else {
      // console.log('there was a token ');
      return true
    }
  }

  const changedBand = async (e) => {
    e.preventDefault()
    let band = e.currentTarget.value
    if (band !== '') {
      getBandcamp(band)
      if (!checkForSpotifyToken()) {
        // console.log('awaiting getSpotifyToken');
        accessToken = await getSpotifyToken()
        // console.log('this means theres a token', accessToken);
      }
      // console.log('and this shouldnt happen first');
      getSpotifyWidgets(accessToken, band, getById(spotifyGuess))
      console.log('querying facebook for ', band.split(" ").join(''));
      return await fetch(`/token/facebook/bands/${band.split(" ").join('')}`)
        .then(res => res.json())
        .catch(err => {
          console.log(err)
        }).then( data => {
          if (data) {
            console.log('got data from fb' , data);
            if (data.category === 'Musician/Band' || data.category === 'Music') {
              // let fb = getById('fb')
              fb.value = data.link // fb will be global anyway
              let url = getById('url')
              url.value = checkUrl(data.website)
              getLocationFromFb(data.current_location, data.hometown)
            }
          }
        })
    }
  }

  let bandInput = getById('band')
  bandInput.addEventListener('change', changedBand)

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

  const processFbData = async (data) => {
    console.log('got data from fb query ', data);
    console.log('using fb data to populate form fields');
    const {name,website,link,genre,hometown,current_location,fan_count,category} = data
    // console.log('category ', category);
    if (category === 'Musician/Band' || category === 'Music') {
      let bc = getById('bandcamp')
      let website = checkUrl(website)
      let band = getById('band')
      let url = getById('url')
      let spotifyGuess = getById('spotifyGuess')
      if (website.split('.')[1] === 'bandcamp') {
        bc.value = website
      } else if (website.split('/')[2].split('.')[0] === 'www') {
        url.value = website
      }
      getLocationFromFb(current_location, hometown)
      if (band.value === '') {
        band.value = name
      }
      if (bc.value === '') {
        getBandcamp(name)
      }
      if (spotifyGuess.firstChild === spotifyGuess.lastChild) {
        if (!checkForSpotifyToken()) {
          accessToken = await getSpotifyToken()
        }
        getSpotifyWidgets(accessToken, band, getById('spotifyGuess'))
      }
    }
  }

  const fbChanged = async (e) => {
    e.preventDefault()
    // console.log('running fbChanged');
    let fbid = getFbId(e.currentTarget.value)
    // console.log('fbid ', fbid);
    await fetch(`/token/facebook/bands/${fbid}`)
      .then( res => res.json())
      .catch( err => {
        // console.log('error getting data from fb ', err);
      }).then( response => {
        // console.log('response ', response);
        if (response.name) {
          // console.log('response.name ', response.name);
          processFbData(response)
        } else {
           console.log(response);
        }
      })
  }

  let fb = getById('fb')
  fb.addEventListener('change', fbChanged)

  const getLocationFromFb = (curr, home) => {
    let city = getById('city')
    let cityVal = city.value
    let state = getById('state')
    let stateVal = state.value
    if (cityVal === '' || stateVal === 'Any') {
      if (curr && curr.split(',').length > 1) {
        city.value = curr.split(',')[0]
        if (curr.split(',').length > 1) {
          if (curr.split(',')[1].trim().length === 2) {
            state.value = abbrState(curr.split(',')[1].trim(), 'name')
          } else {
            state.value = curr.split(',')[1].trim()
          }
        }
      } else if (home) {
        city.value = home.split(',')[0]
        if (home.split(',').length > 1) {
          if (home.split(',')[1].trim().length === 2) {
            state.value = abbrState(home.split(',')[1].trim(), 'name')
          } else {
            state.value = home.split(',')[1].trim()
          }
        }
      }
    }
  }

  const getSpotifyWidgets = async (token, band, target) => {
    return await fetch(`https://api.spotify.com/v1/search?q=artist:"${band}"&type=artist&market=US&limit=4&offset=0`, {
      headers : {
        'Authorization': `Bearer ${token}`
      }
    }).then( res => {
      return res.json()
    }).catch( err => {
        // console.log('error ', err);
    }).then(({artists}) => {
      // console.log(artists);
        const {items} = artists
        // console.log(items);
        if (items.length > 0) {
          let reordered = items.sort( (a,b) => a.followers.total < b.followers.total)
          let spotifyGuess = getById('spotifyGuess')
          showEl(spotifyGuess.firstChild)
          clear(document.querySelector('.guesses'))
          let wrongSpotify = getById('wrongSpotify')
          clear(wrongSpotify)
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

            spotifyGuess.innerHTML += showItAll
            // if (arr.length === 1) {
            //   $('input.guess').prop("checked", true)
            // }
          })
          wrongSpotify.innerHTML = `<div class="input-group mb-3 col-12 col-md-8">
            <div class="d-none d-md-inline-block input-group-prepend">
              <span class="input-group-text">Wrong artist? Spotify URL:</span>
            </div>
            <label for='spotifyOther' class="control-label col-3 d-md-none col-form-label" >or Spotify URL:</label>
            <input type="url" id='spotifyOther' class="form-control" aria-label="Default" aria-describedby="inputGroup-sizing-default">
          </div>`

          let spotifyOther = getById('spotifyOther')
          spotifyOther.addEventListener('change', e => document.querySelector('input.guess:checked').checked = false)
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

  const submitAddBandForm = e => {
    e.preventDefault()
    let formData = e.target.elements
    if (checkForErrors(formData)) {
      let errorMessage = getById('errorMessage')
      let error = `<div class="alert alert-danger fade show" role="alert">${checkForErrors(formData)}</div>`
      return errorMessage.innerHTML = error
    }
    let spotChecked = document.querySelector('input.guess:checked')
    let spot = spotChecked ? spotChecked.value : getById('spotifyOther').value
    let selectedGenres = []
    let checkedGenres = addGenres.querySelectorAll('input:checked')
    checkedGenres.forEach( el => {
      selectedGenres.push(el.value)
    })
    let checkBandModal = getById('checkBandModal')
    let modalBody = checkBandModal.querySelector('.modal-body')
    clear(modalBody)
    modalBody.innerHTML = `<p>Is this correct?</p>
      <p>Band: ${formData.band.value}</p>
      <p>Location: ${formData.city.value}, ${abbrState(formData.state.value, 'abbr')}</p>
      <p>FB: <a href="${formData.fb.value}" target="_blank">${formData.fb.value}</a></p>
      <p>URL: <a href="${formData.url.value}" target="_blank">${formData.url.value}</a></p>
      <p>Bandcamp: <a href="${formData.bandcamp.value}" target="_blank">${formData.bandcamp.value}</a></p>
      <p>Spotify: <a href=${spot} target="_blank">${spot}</a></p>
      <p>Genres: ${selectedGenres.slice(0,4).join(' ')}`
    checkBandModal.modal('show');
    getById('acceptBand').addEventListener('click', e => {
      checkBandModal.modal('hide');
      newBandandSubmit(formData, spot, selectedGenres)
    })
  }


  addBandForm.addEventListener('submit', submitAddBandForm)
