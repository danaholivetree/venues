(function (window, document, undefined) {

  const {genreKeywords} = usStates
  const {makeUppercase, addHttp, checkUrl, checkEmail, endMessage} = helpers
  const {handleErrorsAndReturnJson, disable, enable, hideEl, showEl, clear, getById, makeQuery} = sharedFunctions
  let accessToken = localStorage.getItem('pa_token') || ''
  let off = 0

  var tbody = getById('bandsList')
  const next = getById('next')
  const prev = getById('prev')
  const topOfResults = getById('bandTable') //was using .get(0) before but not sure why
  const prevNext = getById('prevNext')
  const addBandBtn = getById('addBand')
  const addBandForm = getById('addBandForm')
  const searchBandBtn = getById('searchBands')
  const searchBandForm = getById('bandSearchForm')
  const addGenres = getById('addGenres')
  let bandInput = getById('band')
  let fb = getById('fb')
  let globalParams
  let globalOrigQuery
  let wrongSpotify = getById('wrongSpotify')

  const getData = async (offset = 0, scroll = false, query = '') => {
    let bandQuery = query ? 'q?'+query : offset > 0 ? '?offset='+offset: ''
    return await fetch(`/api/bands/${bandQuery}`, {credentials: 'same-origin'})
      .then(handleErrorsAndReturnJson)
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

  const closeModal = (e) => {
    console.log('event ', e);
    e.preventDefault()
    hideEl(document.querySelector('.modal'))
  }

  const loadPage = async () => {
    const displayGenres = () => {
      let gs = getById('genreSelector')

      genreKeywords.forEach( genre => {
        let newGenre = `<div class="form-check form-check-inline" style='display:inline-flex;'>
            <input class="form-check-input genre-selector ${genre}" type="checkbox" value="${genre}">
            <label class="form-check-label" for=${genre}>${genre}</label></div>`
        gs.innerHTML += newGenre
        addGenres.innerHTML += newGenre
      })
    }
    displayGenres()
    let data = await getData(off)
    processData(data)
    // showEl(prevNext)
    disable(prev)
    setPrevNextListener()
    setTbodyListeners()
    document.querySelectorAll('.closemodal').forEach( closemo => {
      closemo.addEventListener('click', closeModal)
    })
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

  const buildBandForList = bnd => {
    const {id, band, state, city, url, spotify, bandcamp, fb, genre, starred, stars, bookmark} = bnd
    let displayUrl = url  ? `<a href=${url} target='_blank'>www</a>` : ``
    let spotifyUri = spotify ? spotify.split('/')[4] : ''
    let displaySpotify = spotify ? `<img class='playSpotify' src='images/Spotify_Icon_RGB_Green.png' data-uri=${spotifyUri} style="width:32px; background-color:inherit; cursor: pointer;"/>` : ''
    let displayBandcamp = bandcamp ? `<img class='playBandcamp' data-band='${band}' data-href=${bandcamp} src='images/bandcamp-button-bc-circle-aqua-32.png'>` : ``
    let displayBand = fb ? `<a href=${fb} target="_blank">${band}</a>` : `${band}`
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
    return bodyItem
  }

  const listBands = (data, bookmarks = false) => {
    clear(tbody)
    data.forEach( item => {
      let band = buildBandForList(item)
      tbody.innerHTML += band
    })
  }

  loadPage()

  const setTbodyListeners = () => {
    tbody.addEventListener('click', e => {
      let targ = e.target
      if (targ.matches('.playBandcamp')) { //might not work in ie?
        clickedBandcamp(targ)
      } else if (targ.matches('.playSpotify')) {
        clickedSpotify(targ)
      } else if (targ.matches('.close')) {
        clickedClose(targ)
      } else if (targ.matches('.bookmark')) {
        clickedBookmark(targ)
      } else if (targ.matches('.star')) {
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
    console.log('targ ', targ);
      let bc = targ.previousSibling
      console.log('targ.previousSibling ', bc);
      let uri = targ.dataset.uri
      console.log('targ.dataset.uri ', targ.dataset.uri);
      hideEl(bc)
      hideEl(targ)
      let spotifyWidget = `<div class='widget'>
            <iframe src=https://open.spotify.com/embed?uri=spotify:artist:${uri}&theme=white width="250" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>
            <a style="top:25px;" href="/" class="close" aria-label="close">&times;</a>
          </div>`
      targ.parentNode.innerHTML += spotifyWidget

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
    }).then(handleErrorsAndReturnJson)
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
    }).then(handleErrorsAndReturnJson)
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

  const makeResultsTitle = (params) => {
    let {state, city, band, genres, starred, bookmarked} = params
    return `<h2>Bands ${bookmarked || starred ? 'I\'ve ' : ''}${bookmarked ? 'Bookmarked ' : '' }${bookmarked && starred ? 'and ' : ''}
    ${starred ? 'Starred ' : '' }${city || state !== 'All' ? 'in ' :''}${city ? city : ''}${city && (state !== 'All') ? ',' : ''}
    ${state !== 'All' ? abbrState(state, 'abbr') : ''} ${band ? 'matching '+ makeUppercase(band) : ''}</h2>`
  }

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
    console.log('getting new spotify token');
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
      console.log('token expired? ', localStorage.getItem('pa_expires') < (new Date()).getTime());
      console.log('no token ', !accessToken || accessToken == '' || accessToken == undefined );
      return false
    } else {
      console.log('there was a token ');
      return true
    }
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

  const changedBand = async (e) => {
    e.preventDefault()
    let band = e.currentTarget.value
    if (band !== '') {
      getBandcamp(band)
      if (!checkForSpotifyToken()) {
        accessToken = await getSpotifyToken()
      }
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
      .then( response => {
        console.log('response ', response);
        if (response.name) {
          // console.log('response.name ', response.name);
          processFbData(response)
        } else {
           console.log('no data in response, not doing anything');
        }
      }).catch( err => {
        console.log('error getting data from fb ', err);
      })
  }
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

  const displayWidget = (item, i, check) => {
    let spotifyGuess = getById('spotifyGuess')
    let artistId = item.id
    let artistSpotify = item.external_urls.spotify
    let artistUri = item.uri
    let widget =  `<div class='form-group col-lg-3 col-12 guesses'>
              <div class="form-radio-inline mx-auto">
                <div class='form-radio col-12'>
                  <label class="form-radio-label" for="radio${i}">
                    <iframe src=https://open.spotify.com/embed?uri=${artistUri} width="250" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>
                  </label>
                </div>

                <div class='mx-auto col-1'>
                  <input class="form-radio-input guess" type="radio" id="radio${i}" ${check && 'checked'} value=${artistSpotify} />
                </div>
              </div>
            </div>`
    spotifyGuess.innerHTML += widget
  }

  const getSpotifyWidgets = async (token, band, target) => {
    return await fetch(`https://api.spotify.com/v1/search?q=artist:"${band}"&type=artist&market=US&limit=4&offset=0`, {
      headers : {
        'Authorization': `Bearer ${token}`
      }
    }).then(handleErrorsAndReturnJson)
      .then( ({artists}) => {
      // console.log(artists);
        const {items} = artists
        let spotifyGuess = getById('spotifyGuess')
        showEl(spotifyGuess.firstChild)
        clear(document.querySelector('.guesses'))

        if (items.length > 0) {
          let reordered = items.sort( (a,b) => a.followers.total < b.followers.total)
          reordered.forEach( (item, i, arr) => {
            let check = arr.length === 1 ? true : false // automatically check box if there's only one
            displayWidget(item, i, check)
          })
          showEl(wrongSpotify)
          let spotifyOther = getById('spotifyOther')
          spotifyOther.addEventListener('change', e => document.querySelector('input.guess:checked').checked = false)
        }
      }).catch( err => {
          console.log('error getting Spotify Widgets ', err);
      })
  }

  const checkForErrors = (data) => {
    if (!data.state || data.state === 'All') {
      return "Please select a state"
    }
    if (!data.city) {
      return "Please enter a city"
    }
    if (!data.band) {
      return "Please enter a band name"
    }
    if (data.fb && data.fb.split('.')[1] !== 'facebook') {
      return "Incorrect form for facebook url"
    }
    if (data.fb && !data.fb.split('/')[3]) {
      return "Please enter a complete facebook url"
    }
    if (!data.spotify && !data.bandcamp) {
      return "Please enter a spotify or bandcamp link"
    }
    console.log('no input errors');
  }

  const newBandFromForm = (formData) => {
    console.log('newBandFromForm');
    let newBand = {
      state: formData.state.value,
      city: makeUppercase(formData.city.value),
      band: makeUppercase(formData.band.value)
    }
    let selectedGenres = []
    let checkedGenres = addGenres.querySelectorAll('input:checked')
    checkedGenres.forEach( el => {
      selectedGenres.push(el.value)
    })
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
    let spotChecked = document.querySelector('input.guess:checked')
    let spotWritten = getById('spotifyOther')
    newBand.spotify = spotChecked ? spotChecked.value : spotWritten.value
    console.log('newBand created from form', newBand);
    return newBand
  }

  const clearGuesses = () => {
    document.querySelectorAll('.guesses').forEach( guess => {
      clear(guess)
    })
    console.log('cleared guesses');
  }

  const uncheckGenres = () => {
    document.querySelectorAll('.genre-selector').forEach( selector => {
      selector.checked = false
    })
    console.log('unchecked genres');
  }

  const clearInputs = () => {
    document.querySelectorAll('input:not([type="checkbox"])').forEach( inp => {
      inp.value = ''
    })
    console.log('cleared inputs');
  }

  const resetForm = () => {
    console.log('resetting form');
    let errorMessage = getById('errorMessage')
    clear(errorMessage)
    console.log('cleared error message');
    clearInputs()
    clearGuesses()
    uncheckGenres()
    getById('state').value = 'All'
  }

  const submitNewBand = async (newBand) => {
    console.log('submitNewBand ', newBand);
    return await fetch('/api/bands', {
                        body: JSON.stringify({newBand}),
                        headers: {'Content-Type': 'application/json'},
                        credentials: 'same-origin', method: 'POST'})
      .then(handleErrorsAndReturnJson)
      .then( data => {
        console.log('data' , data);
        if (!data.error) {
          resetForm()
          listBands(data)
        }
      }).catch(err => {
        console.log('err ', err)
        let error = `<div class="alert alert-danger fade show" role="alert">${err}</div><button type='button' id='clearForm'>Clear Form</button>`
        errorMessage.innerHTML = error
        getById('clearForm').addEventListener('click', resetForm)
      })
  }

  const fillModal = (inputData) => {
    let checkBandModal = getById('checkBandModal')
    let modalBody = checkBandModal.querySelector('.modal-body')
    clear(modalBody)
    console.log('inputData.genres ' , inputData.genres);
    modalBody.innerHTML = `<p>Is this correct?</p>
      <p>Band: ${inputData.band}</p>
      <p>Location: ${inputData.city}, ${abbrState(inputData.state, 'abbr')}</p>
      <p>FB: <a href="${inputData.fb}" target="_blank">${inputData.fb}</a></p>
      <p>URL: <a href="${inputData.url}" target="_blank">${inputData.url}</a></p>
      <p>Bandcamp: <a href="${inputData.bandcamp}" target="_blank">${inputData.bandcamp}</a></p>
      <p>Spotify: <a href=${inputData.spotify} target="_blank">${inputData.spotify}</a></p>
      <p>Genres: ${inputData.genres.join(' ')}`
    checkBandModal.style = 'display:block;'
    showEl(checkBandModal)
    let acceptedBand = e => {
      hideEl(checkBandModal)
      submitNewBand(inputData)
      getById('acceptBand').removeEventListener('click', acceptedBand)
    }
    getById('acceptBand').addEventListener('click', acceptedBand)
  }

  const submitAddBandForm = e => {
    console.log('submitaddbandform');
    e.preventDefault()
    //sort form data and checked inputs
    let inputData = newBandFromForm(e.target.elements)
    //check sorted inputData for missing or incorrect fields
    let inputError = checkForErrors(inputData)
    if (inputError) {
      let errorMessage = getById('errorMessage')
      let error = `<div class="alert alert-danger fade show" role="alert">${inputError}</div>`
      return errorMessage.innerHTML = error
    }
    //check for approval of submitted band
    fillModal(inputData)
  }
  addBandForm.addEventListener('submit', submitAddBandForm)

})(window, document);
