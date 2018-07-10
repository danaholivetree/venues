(function (window, document, undefined) {

  // const {abbrState} = usStates
  const {makeUppercase, addHttp, checkUrl, checkEmail, endMessage, copyToClipboard} = helpers
  const {handleErrorsAndReturnJson, disable, enable, hideEl, showEl, clear, getById, makeQuery} = sharedFunctions
  let off = 0

  const next = getById('next')
  const prev = getById('prev')
  const topOfResults = getById('venueTable')
  const prevNext = getById('prevNext')

  let info = 'here is some text'
  const searchVenuesBtn = getById('searchVenues')
  console.log(searchVenuesBtn);
  const addVenueBtn = getById('addVenue')
  const venueSearchForm = getById('venueSearchForm')
  const addVenueForm = getById('addVenueForm')
  let state = {}

  // const handleErrorsAndReturnJson = response => {
  //   // console.log(response.ok ? 'response ok? ' : response.statusText);
  //   if (!response.ok) {
  //     throw new Error(response.statusText);
  //   } else {
  //     return response.json();
  //   }
  // }

  const getData = async (offset = 0, scroll = false, query = '') => {
    return fetch(`/api/venues/${query ? 'q?'+query : offset > 0 ? '?offset='+offset: ''}`)
      .then(handleErrorsAndReturnJson)
      .then(data => {
        if (offset > 0 && data.length === 0) {
          disable(next)
          return
        } else {
          if (offset === 0) {
            disable(prev)
          }
          if (scroll) {
            topOfResults.scrollIntoView() //need to test this
          }
          return data
        }
    }).catch(err => console.log(err))
  }

  const loadPage = async () => {
    let data = await getData(off)
    if (data) {
      // console.log('data');
      processData(data)
      setPrevNextListener()
    }
  }

  const managePrevNextButtons = (dataLength) => {
    if (dataLength === 0) {
      // console.log('hiding prevnext', dataLength);
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
    // console.log('processing venues' , data);
    if (data) {
      listVenues(data)
      managePrevNextButtons(data.length)
    } else {
      // console.log('processing data, no data ', data);
    }
  }

  const listVenues = (venues) => {
    let venuesList = getById('venuesList')
    clear(venuesList)

    venues.forEach( ven => {
      const {id, venue, diy, email, city, state, capacity, up, down, bookmark, vote} = ven
      let displayVenue = `<a href='/venues/${id}' target='_blank'>${venue}${diy ? '*' : ''}</a>`
      let displayEmail = email ?
      `<button type="button" class="btn btn-default thumb btn-copy js-tooltip js-copy"
        data-toggle="tooltip" data-placement="top" data-copy=${email} title="Copy to clipboard">
        <svg class="icon" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="18" height="18" viewBox="0 0 24 24">
          <path d="M17,9H7V7H17M17,13H7V11H17M14,17H7V15H14M12,3A1,1 0 0,1 13,4A1,1 0 0,1 12,5A1,1 0 0,1 11,4A1,1 0 0,1 12,3M19,3H14.82C14.4,1.84 13.3,1 12,1C10.7,1 9.6,1.84 9.18,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3Z" />
        </svg>
      </button>` : ''
      let displayCap = capacity ? capacity : ''
      let thumbUp = `<span>${up}</span><button class='btn btn-default vote thumb thumb-up ${vote === 'up' ? 'lightblue-text' : ''} ' data-voted='up' data-venueid=${id}><i class="material-icons md-18 vote">thumb_up</i></button>`
      let thumbDown = `<span>${down}</span><button class='btn btn-default vote thumb thumb-down ${vote === 'down' ? 'red-text' : ''}' data-voted='down' data-venueid=${id}><i class="material-icons md-18 vote">thumb_down</i></button>`
      let bookmarkIcon = `<i class="material-icons md-18 bookmark lightblue-text" >bookmark</i>`
      let bookmarkBorder = `<i class="material-icons md-18 bookmark" >bookmark_border</i>`
      let bkmk = `<button class='btn btn-default thumb bookmark' data-id=${id}>${bookmark ? bookmarkIcon : bookmarkBorder}</button>`
      let venueRow = `<tr scope='row' data-id=${id} class='venue-row'>
          <td>${abbrState(state, 'abbr')}</td>
          <td>${city}</td>
          <td>${displayVenue}</td>
          <td class="d-none d-md-table-cell">${displayEmail}</td>
          <td class='d-none d-md-table-cell'>${displayCap}</td>
          <td class='d-none d-md-table-cell'>${thumbUp}</td>
          <td class='d-none d-md-table-cell'>${thumbDown}</td>
          <td>${bkmk}</td>
        </tr>`
      venuesList.innerHTML += venueRow
    })
    // setClipboardListener()
    // setThumbListener()
    // setBookmarkListener()
    setTbodyListeners(venuesList)

  }

  loadPage()

  const setTbodyListeners = (tbody) => {
    tbody.addEventListener('click', e => {
      // e.preventDefault()
      let targ = e.target
      // console.log('targ: ', targ, 'targ.id', targ.dataset.id);
      if (targ.matches('.bookmark')) {
        // console.log('clicked .bookmark');
        // console.log(targ.dataset.id);
        clickedBookmark(targ)
      } else if (targ.matches('.vote')) {
        // console.log('clicked .vote');
        clickedVote(targ)
      }
    }, true)
  }
  const setClipboardListener = () => {
    let clipTips = document.querySelectorAll('.js-tooltip')
    // console.log('cliptip', clipTips);
    // clipTip.tooltip()
    let clipCopy = document.querySelectorAll('.js-copy')
    clipCopy.addEventListener('click', e => {
      e.preventDefault()
      let el = e.target
      let text = el.getAttribute('data-copy')
      copyToClipboard(text, el)
    })
  }

  const clickedVote = async (targ) => {
    let voted
    let venueid
    if (targ.dataset.voted) {
      voted = targ.dataset.voted
      venueid = targ.dataset.venueid
    } else if (targ.parentNode.dataset.voted) {
        targ = targ.parentNode
        voted = targ.dataset.voted
        venueid = targ.dataset.venueid
    }
      let upSpan, downSpan, otherBtn
      if (voted === 'up') {
        upSpan = targ.previousSibling
        downSpan = upSpan.parentNode.nextSibling.nextSibling.firstChild
        otherBtn = downSpan.nextSibling
      } else {
        downSpan = targ.previousSibling
        upSpan = downSpan.parentNode.previousSibling.previousSibling.firstChild
        otherBtn = upSpan.nextSibling

      }
      return await fetch(`/api/votes`, {body: JSON.stringify({venueId: venueid, vote: voted}), method:'POST', credentials: 'same-origin',
        headers: {'Content-Type': 'application/json'}})
        .then(handleErrorsAndReturnJson)
        .then(data => {
        let {id, up, down, vote} = data
        upSpan.innerText = up
        downSpan.innerText = down
        otherBtn.classList.add('black-text')
        if (vote && vote === 'none') {
          targ.classList.add('black-text')
          targ.classList.remove('red-text')
          targ.classList.remove('lightblue-text')
        } else {
          if (voted === 'up') {
            targ.classList.add('lightblue-text')
            targ.classList.remove('black-text')

          } else if (voted === 'down') {
            targ.classList.add('red-text')
            targ.classList.remove('black-text')
          }

        }
      })
  }

  const clickedBookmark = async (targ) => {
    let id
    if (targ.dataset.id) {
      id = targ.dataset.id
    } else if (targ.parentNode.dataset.id) {
      id = targ.parentNode.dataset.id
      targ = targ.parentNode
    }
    let venueId = targ.dataset.id

    return await fetch(`/api/vBookmarks`, {body: JSON.stringify({venueId}),
      method: 'POST',
      credentials: 'same-origin',
      headers: {'Content-Type': 'application/json'}
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

  let capSel = getById('capacity')
  capSel.addEventListener('click', e => {
    let notAny = capSel.querySelectorAll('.notany:checked')
    let any = getById('any')
    if (notAny.length === 0) {
        any.checked = true
    } else {
        any.checked = false
    }
  })

  const submitSearchForm = e => {
    e.preventDefault()
    off = 0
    let formData = e.target.elements
    let state = formData.state.value
    let city = formData.city.value
    let venue = formData.venue.value
    let capacity = []
    let inputs = capSel.querySelectorAll('input:checked')
    inputs.forEach( el => {
      capacity.push(el.id)
    })
    if (capacity.length < 1) {
      capacity.push('any')
    }
    let up = getById('up-select').checked
    let down = getById('down-select').checked
    let bookmarked = getById('bookmark-select').checked
    const params = {state, city, venue, capacity, up, down, bookmarked}
    // const queryString = $.param(params)
    let queryString = makeQuery(params)
    getData(0, false, queryString).then( data => {
      processData(data)
      let resultsTitleDisplay = document.querySelector('.stateDisplay')
      // console.log('resutstitledispay ', resultsTitleDisplay);
      resultsTitleDisplay.innerHTML = makeResultsTitle(params)
      showEl(resultsTitleDisplay)
      state.globalParams = params
      state.globalOrigQuery = queryString
    })
  }
  const makeResultsTitle = (params) => {
    // console.log(params);
    let {state, city, venue, up, down, bookmarked} = params
    return `<h2>Venues ${bookmarked || up || down ? 'I\'ve ' : ''}
    ${up ? 'Upvoted' : ''}${up && (down || bookmarked) ? ' and ' : ''}${down ? 'Downvoted ' : ''}
    ${down && bookmarked ? 'and ' : ''}${bookmarked ? 'Bookmarked ' : '' }
    ${city || state !=='All' ? 'in ' :''}${city ? city : ''}${city && (state !== 'All') ? ',' : ''}
    ${state !== 'All' ? abbrState(state, 'abbr') : ''} ${venue ? 'matching '+ makeUppercase(venue) : ''}</h2>`
  }

  venueSearchForm.addEventListener('submit', submitSearchForm)

  const nextHandler = e => {
    e.preventDefault()
    enable(prev)
    off += 25
    if (state.globalParams) {
      let sendNextParams = state.globalParams //added for older browsers
      sendNextParams.offset = off  //added for older browsers
      const newQueryString = makeQuery(sendNextParams) //added for older browsers
      // const newQueryString = $.param({...params, offset: off})
      getData(off, true, `${off > 0 ? newQueryString : state.globalOrigQuery}`).then( data => {
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
    if (state.globalParams) {
      let sendPrevParams = state.globalParams //added for older browsers
      sendPrevParams.offset = off  //added for older browsers
      const newQueryString = makeQuery(sendPrevParams) //added for older browsers
        // const newQueryString = $.param({...params, offset: off})
      getData(off, true, `${off > 0 ? newQueryString : state.globalOrigQuery}`).then( data => {
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

  searchVenuesBtn.addEventListener('click', e => {
    e.preventDefault()
    showEl(venueSearchForm)
    let formInputs = addVenueForm.querySelectorAll('input')
    formInputs.forEach( el => {
      el.value = ''
      if (el.type === 'checkbox') {
        el.checked = false
      }
    })
    getById('state').value = 'All'
    hideEl(addVenueForm)
    searchVenuesBtn.classList.add('lightblue')
    addVenueBtn.classList.remove('lightblue')
  })

  addVenue.addEventListener('click', e => {
    e.preventDefault()
      showEl(addVenueForm)
      getById('venue').focus()
      let formInputs = venueSearchForm.querySelectorAll('input')
      formInputs.forEach( el => {
        el.value = ''
        if (el.type === 'checkbox') {
          el.checked = false
        }
      })
      hideEl(venueSearchForm)
      addVenueBtn.classList.add('lightblue')
      searchVenuesBtn.classList.remove('lightblue')
  })

// try to get email, city and state from venue name alone
  let venue = getById('venue')
  const venueChanged = async (e) => {
    // e.preventDefault()
    let ven = venue.value
    if (ven) {
      ven = makeUppercase(ven)
      let checkFb = ven.split(" ").join('')
      console.log(`querying public page content api for /${checkFb}`);
      return await fetch(`/token/facebook/venues/${checkFb}`)
        .then(handleErrorsAndReturnJson)
        .then(data =>{
          if (data && !data.error) {
            let {name,about,link,website,single_line_address,emails,location,events} = data
            if (location) {
              state.fbData = data
              let checkVenueModal = getById('checkVenueModal')
              let modalBody = checkVenueModal.querySelector('.modal-body')
              modalBody.innerHTML = `Do you mean ${name} in ${location.city}, ${location.state}?`
              showModal(checkVenueModal);
            }
          }
      }).catch(err => console.log(err))
    }
  }

  getById('confirmVenue').addEventListener('click', e => {
    hideModal(checkVenueModal)
    console.log('fb data came back: ', state.fbData);
    console.log('using data from fb query to autofill fields');
    lookForFbInfo(state.fbData.about, state.fbData.link, state.fbData.emails, state.fbData.location)
    lookForSiInfo(state.fbData.name, state.fbData.location)
  })

      //tried to do this with the SDK. still needs valid app access token, it seems.
      // FB.api(`/${venue.split(" ").join('')}`, 'GET', {fields: 'name,about,link,website,single_line_address,emails,location,events.time_filter(upcoming){name,start_time,id}'}, res => {
        // if (res && !res.error) {
        //   let {name,about,link,website,single_line_address,emails,location,events} = res
      //     if (location) {
      //       console.log('location ', location);
      //       $('#checkVenueModal .modal-body').text(`Do you mean ${name} in ${location.city}, ${location.state}?`)
      //       $('#checkVenueModal').modal('show');
      //       $('#acceptVenue').click( e => {
      //         lookForFbInfo(about, link, emails, location)
      //         $('#checkVenueModal').modal('hide');
      //         lookForSiInfo(venue, location)
      //       })
      //     }
      //   } else {
      //     console.log(res.error.message);
      //   }
      // }) // close api call

  venue.addEventListener('change', venueChanged)

  let url = getById('url')
  const urlChanged = async (e) => {
    // e.preventDefault()
    let email = getById('email')
    if (url.value && !email.value) {
      let fbid
      if (url.value.split('.')[1] === 'facebook') {
        // console.log('url.value' , url.value);
        fbid = url.value.split('/')[3]
        if (fbid.split('-').length > 1) {
          fbid = fbid.split('-')
          fbid = fbid[fbid.length-1]
        }
      } else {
        fbid = url.value.split('.')[1]
      }
      console.log(`querying public page content api for /${fbid}`);
      await fetch(`/token/facebook/venues/${fbid}`)
        .then( res => res.json())
        .then( data => {
          if (data && !data.error) {
            let {name,about,link,website,single_line_address,emails,location,events} = data
            console.log('fb data came back:');
            console.log('using data from fb query to autofill fields');
            lookForFbInfo(about, link, emails, location)
            lookForSiInfo(name, location)
          }
        }).catch(err => console.log(err))
    }
  }

  // check for data from url if it hasn't been found already

  url.addEventListener('change', urlChanged)

  const checkForBookingEmail = (field) => {
    // console.log(field);
    // if (field) {
      let clean = field.replace(/(\r\n|\n|\r)/gm, " ");
      let em = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/g
      let booking = clean.split(' ').find( el => el.match(em))
      return booking
    // }
  }

  const lookForFbInfo = (about, link, emails, location) => {
    let url = getById('url')
    if (!url.value.split('/')[3]) {
      url.value = checkUrl(link)
    }
    // console.log('about', about, 'link', link, 'emails', emails, 'location', location);
    let booking
    if (about) {
      booking = checkForBookingEmail(about)
    }
    if (!booking) {
      if (emails) {
        booking = emails.filter( email => checkForBookingEmail(email))
      }
    }
    let email = getById('email')
    if (booking && !email.value) {
      email.value = booking
    }
    let city = getById('city')
    if (!city.value) {
      city.value = location.city
    }
    let state = getById('state')
    if (state.value === "All") {
      state.value = abbrState(location.state, 'name')
    }
  }

  const lookForSiInfo = async (venue, location) => {
    let siQuery = venue.split(' ').join('-') + '-' +location.city.split(' ').join('-')+ '-' + abbrState(location.state, 'name').split(' ').join('-')
    return await fetch(`/token/si/${siQuery}`)
      .then(res => res.json())
      .catch(err => console.log('error looking for SI info ', err))
      .then(data => {
        if (data.capacity && data.capacity !== 'N/A') {
          getById('cap').value = Number(data.capacity)
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
    if (!formData.venue.value) {
      return "Please enter a venue name"
    }
    if (!formData.url.value) {
      return "Please enter a URL"
    }
  }

  const newVenueFromForm = (formData) => {
    let newVenue = {
      state: formData.state.value,
      city: makeUppercase(formData.city.value),
      venue: makeUppercase(formData.venue.value),
      url: checkUrl(formData.url.value)
    }
    if (formData.email.value) {
      newVenue.email = checkEmail(formData.email.value)
    }
    if (formData.cap.value) {

      newVenue.capacity = formData.cap.value
    }
    newVenue.diy = formData.diy.checked ? true : false
    return newVenue
  }

  const newVenueAndSubmit = async (newVenue) => {
    console.log('newvenue in newvenueandsubmit ', newVenue);
    return await fetch(`/api/venues`, {method: 'POST', body: JSON.stringify({newVenue}), credentials: 'same-origin',
      headers: {'Content-Type': 'application/json'}})
      .then(handleErrorsAndReturnJson)
      .then(data => {
        if (!data.id) {
          let errorMessage = getById('errorMessage')
          let error = `<div class="alert alert-danger fade show" role="alert">${data}</div>`
            return errorMessage.innerHTML = error
        } else {
          window.location=`/venues/${data.id}`
        }
      })
  }

  const displayInfoModal = data => {
    console.log(data);
    let {venue, city, state, url, email, capacity} = data
    let checkInfoModal = getById('checkInfoModal')
    let infoModal = checkInfoModal.querySelector('.modal-body')
    console.log('infoModal', infoModal);
    clear(infoModal)
    infoModal.innerHTML = `<p>Is this correct?</p>
      <p>Venue: ${venue}</p>
      <p>Location: ${city}, ${abbrState(state, 'abbr')}</p>
      <p>URL: ${url}</p>
      <p>Booking Email: ${email ? email : ''}</p>
      <p>Capacity: ${capacity ? capacity : 'Unlisted'}</p>` + infoModal.innerHTML
    showModal(checkInfoModal)

  }
  getById('acceptInfo').addEventListener('click', e => {
    hideModal(checkInfoModal)
    // const newVenue = newVenueFromForm(data)
    console.log('global newVenue', state.newVenue);
    newVenueAndSubmit(newVenue)
  })


  document.querySelector('.modal-close').addEventListener('click', e => {
    hideModal(checkInfoModal)
  })

  const hideModal = (modal) => {
    modal.style.display = 'none'
  }

  const showModal = (modal) => {
    modal.style.display = 'block'
  }

  const submitAddVenueForm = e => {
    e.preventDefault()
    let formData = e.target.elements
    if (checkForErrors(formData)) {
      let errorMessage = getById('errorMessage')
      let error = `<div class="alert alert-danger fade show" role="alert">${checkForErrors(formData)}</div>`
      clear(errorMessage)
      return errorMessage.innerHTML = error
    }
    state.newVenue = newVenueFromForm(formData)
    displayInfoModal(newVenue)
  }

  addVenueForm.addEventListener('submit', submitAddVenueForm)
})(window, document);
