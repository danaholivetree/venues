$(document).ready(function() {
  const {abbrState} = usStates
  const {makeUppercase, addHttp, checkUrl, checkEmail, endMessage, copyToClipboard} = helpers

  $.get(`/api/venues`, (data, status) => {
    // console.log('got data ', data);
    listVenues(data.slice(0,20))
    setThumbListener()
    setBookmarkListener()
  })

  const listVenues = (data, bookmarks = false) => {
    data.forEach( venue => {

      // let displayVenue = `<a href=${venue.url} target='_blank'>${venue.venue}${venue.diy ? '*' : ''}</a>`
      let displayVenue = `<a href='/venues/${venue.id}' target='_blank'>${venue.venue}${venue.diy ? '*' : ''}</a>`
      let displayEmail = venue.email ?
      `<button type="button" class="btn btn-default thumb btn-copy js-tooltip js-copy"
        data-toggle="tooltip" data-placement="top" data-copy=${venue.email} title="Copy to clipboard">
        <svg class="icon" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="18" height="18" viewBox="0 0 24 24">
          <path d="M17,9H7V7H17M17,13H7V11H17M14,17H7V15H14M12,3A1,1 0 0,1 13,4A1,1 0 0,1 12,5A1,1 0 0,1 11,4A1,1 0 0,1 12,3M19,3H14.82C14.4,1.84 13.3,1 12,1C10.7,1 9.6,1.84 9.18,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3Z" />
        </svg>
      </button>` : ''
      $('#venuesList').append($(`

        <tr scope='row' data-id=${venue.id} class='venue-row'>
          <td>${abbrState(venue.state, 'abbr')}</td>
          <td>${venue.city}</td>
          <td>${displayVenue}</td>
          <td class='d-none d-md-table-cell'>${displayEmail}</td>
          <td class='d-none d-md-table-cell'>${venue.capacity ? venue.capacity : ''}</td>
          <td class='d-none d-md-table-cell' id=upVote${venue.id}><span>${venue.up}</span><button class='btn btn-default thumb thumb-up' data-id=${venue.id}> <i class="material-icons md-18"  data-id=${venue.id}>thumb_up</i></button></td>
          <td class='d-none d-md-table-cell' id=downVote${venue.id}><span>${venue.down}</span><button class='btn btn-default thumb thumb-down' data-id=${venue.id}><i class="material-icons md-18" data-id=${venue.id}>thumb_down</i></button></td>
          <td class='d-none d-md-table-cell'><button class='btn btn-default thumb bookmark' data-id=${venue.id}><i class="material-icons md-18" data-id=${venue.id}>bookmark</i></button></td>
        </tr>

      `))

      console.log('venue.bookmark ', venue.bookmark);
      if (venue.vote === 'up') {
        $(`#upVote${venue.id} button`).css("color", "green")
      }
      if (venue.vote === 'down') {
        $(`#downVote${venue.id} button`).css("color", "red")
      }
      if (venue.bookmark || bookmarks) {
        $('.bookmark').css("color", "lightblue")
      }
    })
    $('.js-tooltip').tooltip()
    $('.js-copy').click( e => {
      e.preventDefault()
      var text = $(e.currentTarget).attr('data-copy')
      var el = $(e.currentTarget)
      copyToClipboard(text, el)
    })
  }
  const setThumbListener = () => {
    $('.thumb-up').click( e => {
        $.post(`/api/votes`, {venueId: e.target.dataset.id, vote: 'up'}, data => {
          $(`#upVote${data.id} span`).text(`${data.up}`)
          $(`#downVote${data.id} span`).text(`${data.down}`)
          $(`#downVote${data.id} button`).css("color", "black")
          if (data.vote && data.vote === 'none') {
            $(`#upVote${data.id} button`).css("color", "black")
          } else {
            $(`#upVote${data.id} button`).css("color", "green")
          }
        })
    })

    $('.thumb-down').click( e => {
        $.post(`/api/votes`, {venueId: e.target.dataset.id, vote: 'down'}, data => {
          $(`#upVote${data.id} span`).text(`${data.up}`)
          $(`#downVote${data.id} span`).text(`${data.down}`)
          $(`#upVote${data.id} button`).css("color", "black")
          if (data.vote && data.vote === 'none') {
            $(`#downVote${data.id} button`).css("color", "black")
          } else {
            $(`#downVote${data.id} button`).css("color", "red")
          }
        })
    })
  }

  const setBookmarkListener = () => {
    $('.bookmark').click( e => {
      console.log('e.target ', e.target);
      e.preventDefault()
      console.log('e.target.dataset.id ', e.target.dataset.id);
      $.post(`/api/vBookmarks`, {venueId: e.target.dataset.id}, data => {
        if (data.bookmarked) {
          $(e.target).css("color", "lightblue")
        } else {
          $(e.target).css("color", "black")
        }
      })
    })
  }
//this stopped working?
  $('.notany').click( e => {
    if ($('.notany:checked').length === 0) {
        $('#capAny').prop("checked", true)
    } else {
        $('#capAny').prop("checked", false)
    }
  })



  $('#venueSearchForm').submit( e => {
    e.preventDefault()
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
      console.log('el.value ' , el.value);
      selectors.push(el.value)
    })
    console.log('selectors ', selectors);
    const params = {state, city, venue, capacity, selectors}
    const queryString = $.param(params)
    $.get(`/api/venues/q?${queryString}`, ({venues, bookmarks}, status) => {
      if (venue) {
        $('.stateDisplay').text(`Venues matching '${makeUppercase(venue)}'`).show()
      } else if (city) {
        $('.stateDisplay').text(`Venues in ${makeUppercase(city)}`).show()
      } else if (state !== 'All') {
        $('.stateDisplay').text(`Venues in ${state}`).show()
      }
        $('#venuesList').empty()
        // $('input[type="checkbox"]').prop('checked', false);
        // $('#capAny').prop('checked', true) //maybe dont want these three
        // $('input[type="text"], textarea').val('');
        // $('#venueState').val('All');
        listVenues(venues, bookmarks)
        setThumbListener()
        setBookmarkListener()
    })
  })

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



  $('#addVenueForm').submit( e => {
    e.preventDefault()
    let formData = e.target.elements
    $('#checkInfoModal .modal-body').empty().append(`<p>Is this correct?</p>
      <p>Venue: ${formData.venue.value}</p>
      <p>Location: ${formData.city.value}, ${abbrState(formData.state.value, 'abbr')}</p>
      <p>URL: ${formData.url.value}</p>
      <p>Booking Email: ${formData.email.value ? formData.email.value : ''}</p>
      <p>Capacity: ${formData.capacity.value ? formData.capacity.value : 'Unlisted'}</p>`)
    $('#checkInfoModal').modal('show');
    $('#acceptInfo').click( e => {
      $('#checkInfoModal').modal('hide');
      const newVenue = {}
      newVenue.state = formData.state.value
      if (!formData.state.value || formData.state.value == 'All') {
        return $('#errorMessage').html(`<div class="alert alert-danger fade show" role="alert">Please enter a state</div>`)
      } else {
        newVenue.state = formData.state.value
      }
      if (!formData.city.value || formData.city === '') {
        return $('#errorMessage').html(`<div class="alert alert-danger fade show" role="alert">Please enter a city</div>`)
      } else {
        newVenue.city = makeUppercase(formData.city.value)
      }
      if (!formData.venue.value || formData.venue === '') {
        return $('#errorMessage').html(`<div class="alert alert-danger fade show" role="alert">Please enter a venue</div>`)
      } else {
        newVenue.venue = makeUppercase(formData.venue.value)
      }
      if (!formData.url.value) {
        return $('#errorMessage').html(`<div class="alert alert-danger fade show" role="alert">Please enter a url</div>`)
      } else {
        newVenue.url = checkUrl(formData.url.value)
      }
      if (formData.email.value) {
        newVenue.email = checkEmail(formData.email.value)
      }
      if (formData.capacity.value) {
        newVenue.capacity = formData.capacity.value
      }
      newVenue.diy = formData.diy.checked ? true : false
      //why woudl i ahve been looking for a newvneue id?

      $.post(`/api/venues`, newVenue, (data, status) => {
        // $('input[type="text"], textarea').val('');
        // $('#state').val('All');
        // $('#venuesList').empty()
        // listVenues(data)
        if (!data.id) {
            return $('#errorMessage').html(`<div class="alert alert-danger fade show" role="alert">${data}</div>`)
        } else {
          window.location=`/venues/${data.id}`
        }
      })
    })
  })


})
