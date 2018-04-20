$(document).ready(function() {
  const {abbrState} = usStates
  const {makeUppercase, addHttp, checkUrl, checkEmail, endMessage, copyToClipboard} = helpers
  let off = 0

  const listVenues = (data, bookmarks = false) => {
    console.log('data.length at listvenues ', data.length);

    $('#venuesList').empty()

    data.forEach( ven => {
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
      let thumbUp = `<span>${up}</span><button class='btn btn-default vote thumb thumb-up' data-voted='up' data-venueid=${id}><i class="material-icons md-18">thumb_up</i></button>`
      let thumbDown = `<span>${down}</span><button class='btn btn-default vote thumb thumb-down' data-voted='down' data-venueid=${id}><i class="material-icons md-18">thumb_down</i></button>`
      let bookmarkIcon = `<i style="color:lightblue" class="material-icons md-18" data-id=${id}>bookmark</i>`
      let bookmarkBorder = `<i class="material-icons md-18" data-id=${id}>bookmark_border</i>`
      let bkmk = `<button class='btn btn-default thumb bookmark' data-id=${id}>${bookmark ? bookmarkIcon : bookmarkBorder}</button>`

      $('#venuesList').append($(`

        <tr scope='row' data-id=${id} class='venue-row'>
          <td>${abbrState(state, 'abbr')}</td>
          <td>${city}</td>
          <td>${displayVenue}</td>
          <td class='d-none d-md-table-cell'>${displayEmail}</td>
          <td class='d-none d-md-table-cell'>${displayCap}</td>
          <td class='d-none d-md-table-cell'>${thumbUp}</td>
          <td class='d-none d-md-table-cell'>${thumbDown}</td>
          <td class='d-none d-md-table-cell'>${bkmk}</td>
        </tr>
      `))
      if (vote === 'up') {
        $(`.thumb-up`).css("color", "green")
      }
      if (vote === 'down') {
        $(`.thumb-down`).css("color", "red")
      }
    })
    setClipboardListener()
    setThumbListener()
    setBookmarkListener()
    if (data.length < 25) {
      $('#next').prop('disabled', true)
    }
  }

  const setClipboardListener = () => {
    $('.js-tooltip').tooltip()
    $('.js-copy').click( function(e) {
      e.preventDefault()
      let el = $(this)
      let text = el.attr('data-copy')
      copyToClipboard(text, el)
    })
  }

  const setThumbListener = () => {
    $('.vote').click( e => {
      let clicked = $(e.currentTarget)
      let {voted, venueid} = e.currentTarget.dataset
      let upSpan, downSpan, otherBtn
      if (voted === 'up') {
        upSpan = clicked.prev('span')
        downSpan = clicked.closest('td').next('td').find('span')
        otherBtn = downSpan.next()
      } else {
        downSpan = clicked.prev('span')
        upSpan = clicked.closest('td').prev('td').find('span')
        otherBtn = upSpan.next()
      }
      $.post(`/api/votes`, {venueId: venueid, vote: voted}, data => {
        let {id, up, down, vote} = data
        upSpan.text(up)
        downSpan.text(down)
        otherBtn.css("color", "black")
        if (vote && vote === 'none') {
          clicked.css("color", "black")
        } else {
          clicked.css("color", `${voted === 'up' ? "green" : "red"}`)
        }
      })
    })
  }

  const setBookmarkListener = () => {
    $('.bookmark').click( e => {
      e.preventDefault()
      $.post(`/api/vBookmarks`, {venueId: e.target.dataset.id}, data => {
        if (data.bookmarked) {
          $(e.target).css("color", "lightblue").text('bookmark')
        } else {
          $(e.target).css("color", "black").text('bookmark_border')
        }
      })
    })
  }

  $('.notany').click( e => {
    if ($('.notany:checked').length === 0) {
        $('#any').prop("checked", true)
    } else {
        $('#any').prop("checked", false)
    }
  })

  $('#venueSearchForm').submit( e => {
    e.preventDefault()
    off = 0
    let formData = e.target.elements
    let state = formData.state.value
    let city = formData.city.value
    let venue = formData.venue.value
    let capacity = []
    $('#capacity :checked').each( function(i, el) {
      capacity.push(el.id)
    })
    if (capacity.length < 1) {
      capacity.push('any')
    }
    let selectors = []
    $('#selector :checked').each( function(i, el) {
      selectors.push(el.value)
    })
    const params = {state, city, venue, capacity, selectors}
    const queryString = $.param(params)
    getData(0, false, queryString).then( data => {
      processData(data)
      $('.stateDisplay').text(`Venues ${data.bookmarks ? 'I\'ve ' : ''}${data.bookmarks ? 'Bookmarked ' : '' }
      ${city || state ? 'in ' :''}${city ? city : ''}${city && (state !== 'All') ? ',' : ''}
      ${state !== 'All' ? abbrState(state, 'abbr') : ''} ${venue ? 'matching '+ makeUppercase(venue) : ''}`).show()
      setPrevNextQueryListener(params, queryString)
    })
  })

  const getData = async (offset = 0, scroll = false, query = '') => {
    return $.get(`/api/venues/${query ? 'q?'+query : offset > 0 ? '?offset='+offset: ''}`, (data, status) => {
      if (offset > 0 && !data.venues) {
        $('#next').prop('disabled', true)
        $('#prev').prop('disabled', true)
        return
      } else {
        if (offset === 0) {
          $('#prev').prop('disabled', true)
        }
        if (scroll) {
          $('#venueTable').get(0).scrollIntoView()
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

  loadPage()

  const processData = (data) => {
    let {venues, bookmarks} = data
    if (venues && venues.length > 0) {
      listVenues(venues)
    }
  }

  const setPrevNextListener = () => {
    $('#prevNext').show()
    $('#prev').prop('disabled', true)
    $('#next').click( e => {
      e.preventDefault()
      off += 25
      $('#prev').prop('disabled', false)
      getData(off, true).then( data => {
        processData(data)
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
    $('#next').prop('disabled', false)
    console.log('disabling prev');
    $('#next').off('click')
    console.log('removing previous listener');
    $('#next').click( e => {
      e.preventDefault()
      $('#prev').prop('disabled', false)
      console.log('enabling prev');
      off += 25
      console.log('incrementing off');
      const newQueryString = $.param({...params, offset: off})
      console.log(newQueryString);
      getData(off, true, `q?${off > 0 ? newQueryString : origQuery}`).then( data => {
        processData(data)
      })
    })
    $('#prev').off('click')
    $('#prev').click( e => {
      e.preventDefault()
      off -= 25
      const newQueryString = $.param({...params, offset: off})
      getData(off, true, `q?${off > 0 ? newQueryString : origQuery}`).then( data => {
        processData(data)
      })
    })
  }

  $('#searchVenues').click( e => {
    e.preventDefault()
      $('#venueSearchForm').toggle(true)
      $('#addVenueForm input').val('')
      $('#state').val('All')
      $('#addVenueForm').toggle(false)
      $('#searchVenues').css('background-color', 'lightblue')
      $('#addVenue').css('background-color', 'white')
      $('#venueState').val('All');
  })

  $('#addVenue').click( e => {
    e.preventDefault()
      $('#venueSearchForm').toggle(false)
      $('#addVenueForm').toggle(true)
      $('#venue').focus()
      $('#addVenue').css('background-color', 'lightblue')
      $('#searchVenues').css('background-color', 'white')
  })

// try to get email, city and state from venue name alone
  $('#venue').blur( e => {
    e.preventDefault()
    if ($('#venue').val()) {
      let venue = e.currentTarget.value
      $('#venue').val(makeUppercase(e.currentTarget.value))
      $.get(`/token/facebook/venues/${venue.split(" ").join('')}`, res => {
        if (res && !res.error) {
          let {name,about,link,website,single_line_address,emails,location,events} = res
          if (location) {
            $('#checkVenueModal .modal-body').text(`Do you mean ${name} in ${location.city}, ${location.state}?`)
            $('#checkVenueModal').modal('show');
            $('#acceptVenue').click( e => {
              lookForFbInfo(about, link, emails, location)
              $('#checkVenueModal').modal('hide');
              lookForSiInfo(venue, location)
            })
          }
        } else {
          console.log(res.error.message);
        }
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
    }
  })


// check for data from url if it hasn't been found already
  $('#url').blur( e => {
    e.preventDefault()
    let url = e.currentTarget.value
    if ($('#url').val() && !$('#email').val()) {
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
      $.get(`/token/facebook/venues/${fbid}`, res => {
        if (res && !res.error) {
          let {name,about,link,website,single_line_address,emails,location,events} = res
          lookForFbInfo(about, link, emails, location)
          lookForSiInfo(name, location)
        } else {
          console.log(res.error.message)
        }
      })
    }
  })

  const checkForBookingEmail = (field) => {
    let clean = field.replace(/(\r\n|\n|\r)/gm, " ");
    let em = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/g
    let booking = clean.split(' ').find( el => el.match(em))
    return booking
  }

  const lookForFbInfo = (about, link, emails, location) => {
    if (!$('#url').val().split('/')[3]) {
      $('#url').val(checkUrl(link))
    }
    let booking = checkForBookingEmail(about)
    if (!booking) {
      if (emails) {
        booking = emails.filter( email => checkForBookingEmail(email))
      }
    }
    if (booking && !$('#email').val()) {
      $('#email').val(booking)
    }
    if (!$('#city').val()) {
      $('#city').val(location.city)
    }
    if ($('#state').val() === "All") {
      $('#state').val(abbrState(location.state, 'name'))
    }
  }

  const lookForSiInfo = (venue, location) => {
    let siQuery = venue.split(' ').join('-') + '-' +location.city+ '-' + abbrState(location.state, 'name')
    $.get(`/token/si/${siQuery}`, data => {
      if (data.capacity) {
        $('#capacity').val(Number(data.capacity))
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
    if (formData.capacity.value) {
      newVenue.capacity = formData.capacity.value
    }
    newVenue.diy = formData.diy.checked ? true : false
    return newVenue
  }

  $('#addVenueForm').submit( e => {
    e.preventDefault()
    let formData = e.target.elements
    if (checkForErrors(formData)) {
      return $('#errorMessage').html(`<div class="alert alert-danger fade show" role="alert">${checkForErrors(formData)}</div>`)
    }
    $('#checkInfoModal .modal-body').empty().append(`<p>Is this correct?</p>
      <p>Venue: ${formData.venue.value}</p>
      <p>Location: ${formData.city.value}, ${abbrState(formData.state.value, 'abbr')}</p>
      <p>URL: ${formData.url.value}</p>
      <p>Booking Email: ${formData.email.value ? formData.email.value : ''}</p>
      <p>Capacity: ${formData.capacity.value ? formData.capacity.value : 'Unlisted'}</p>`)
    $('#checkInfoModal').modal('show');
    $('#acceptInfo').click( e => {
      $('#checkInfoModal').modal('hide');
      const newVenue = newVenueFromForm(formData)
      $.post(`/api/venues`, newVenue, (data, status) => {
        if (!data.id) {
            return $('#errorMessage').html(`<div class="alert alert-danger fade show" role="alert">${data}</div>`)
        } else {
          window.location=`/venues/${data.id}`
        }
      })
    })
  })



})
