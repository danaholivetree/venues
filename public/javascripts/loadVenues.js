$(document).ready(function() {
  const {abbrState} = usStates
  const {makeUppercase, addHttp, checkUrl, checkEmail, endMessage} = helpers

  $.get(`/api/venues`, (data, status) => {
    // console.log('got data ', data);
    listVenues(data.slice(0,20))
    setThumbListener()
  })

  const listVenues = (data) => {
    data.forEach( venue => {

      let displayVenue = `<a href=${venue.url} target='_blank'>${venue.venue}${venue.diy ? '*' : ''}</a>`

      $('#venuesList').append($(`

        <tr scope='row' data-id=${venue.id} class='venue-row'>
          <td>${abbrState(venue.state, 'abbr')}</td>
          <td>${venue.city}</td>
          <td>${displayVenue}</td>
          <td class='d-none d-md-table-cell'>${venue.capacity ? venue.capacity : ''}</td>
          <td class='d-none d-md-table-cell' id=upVote${venue.id}><span>${venue.up}</span><button class='btn btn-default thumb thumb-up' data-id=${venue.id}> <i class="material-icons md-18"  data-id=${venue.id}>thumb_up</i></button></td>
          <td class='d-none d-md-table-cell' id=downVote${venue.id}><span>${venue.down}</span><button class='btn btn-default thumb thumb-down' data-id=${venue.id}><i class="material-icons md-18" data-id=${venue.id}>thumb_down</i></button></td>
        </tr>

      `))

      if (venue.vote === 'up') {
        $(`#upVote${venue.id} button`).css("color", "green")
      }
      if (venue.vote === 'down') {
        $(`#downVote${venue.id} button`).css("color", "red")
      }
    })
  }
  const setThumbListener = () => {
    $('.thumb-up').click( e => {
        $.post(`/api/votes`, {venueId: e.target.dataset.id, vote: 'up'}, data => {
          $(`#upVote${data.id} span`).text(`${data.up}`)
          $(`#upVote${data.id} button`).css("color", "green")
          $(`#downVote${data.id} span`).text(`${data.down}`)
          $(`#downVote${data.id} button`).css("color", "black")
        })
    })

    $('.thumb-down').click( e => {
        $.post(`/api/votes`, {venueId: e.target.dataset.id, vote: 'down'}, data => {
          $(`#upVote${data.id} span`).text(`${data.up}`)
          $(`#upVote${data.id} button`).css("color", "black")
          $(`#downVote${data.id} span`).text(`${data.down}`)
          $(`#downVote${data.id} button`).css("color", "red")
        })
    })
  }

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
    if (formData.capAny.checked) {
      capacity.push('any')
    } else {
      if (formData.unlabeled.checked) {
        capacity.push('unlabeled')
      }
      if (formData.capxs.checked) {
        capacity.push('capxs')
      }
      if (formData.caps.checked) {
        capacity.push('caps')
      }
      if (formData.capm.checked) {
        capacity.push('capm')
      }
      if (formData.capl.checked) {
        capacity.push('capl')
      }
      if (formData.capxl.checked) {
        capacity.push('capxl')
      }
    }
    if (capacity.length < 1) {
      capacity.push('any')
    }
    const params = {state, city, venue, capacity}
    const queryString = $.param(params)
    console.log('queryString ', queryString);
    $.get(`/api/venues/q?${queryString}`, (data, status) => {
      console.log('data length ', data.length);
      if (state !== 'All') {
        $('.stateDisplay').text(`Venues in ${state}`).show()
      } else if (city) {
        $('.stateDisplay').text(`Venues in ${city}`).show()
      } else if (venue) {
        $('.stateDisplay').text(`Venues matching '${venue}'`).show()
      }
        $('#venuesList').empty()
        $('input[type="checkbox"]').prop('checked', false);
        $('#capAny').prop('checked', true) //maybe dont want these three
        $('input[type="text"], textarea').val('');
        $('#venueState').val('All');
        listVenues(data)
        setThumbListener()
    })
  })

  $('#searchVenues').click( e => {
    e.preventDefault()
      $('#venueSearchForm').toggle(true)
      $('#addVenueForm').toggle(false)
      $('#searchVenues').css('background-color', 'lightblue')
      $('#addVenue').css('background-color', 'white')
      $('#venueState').val('All');
  })

  $('#addVenue').click( e => {
    e.preventDefault()
    console.log('clicked add venue');
      $('#venueSearchForm').toggle(false)
      $('#addVenueForm').toggle(true)
      $('#addVenue').css('background-color', 'lightblue')
      $('#searchVenues').css('background-color', 'white')
  })

// try to get email, city and state from venue name alone
  $('#venue').blur( e => {
    e.preventDefault()
    let venue = e.currentTarget.value
    $('#venue').val(makeUppercase(e.currentTarget.value))
    console.log('should be trying fb search for ', venue, 'after geting rid of white space ', venue.split(" ").join(''));
    $.get(`/token/facebook/venues/${venue.split(" ").join('')}`, ({name,about,link,website,single_line_address,emails,location,events}) => {
      $('#url').val(checkUrl(link))
      let booking = checkForBookingEmail(about)
      console.log('booking from about ', booking);
      if (emails) {
        booking = emails.filter( email => checkForBookingEmail(email))
      }
      console.log('may have gotten booking from emails ', booking);
      if (booking) {
        $('#email').val(booking)
      }
      $('#city').val(location.city)
      $('#state').val(abbrState(location.state, 'name'))
      let siQuery = venue.split(' ').join('-') + '-' +location.city+ '-' + abbrState(location.state, 'name')
      console.log('siQuery ', siQuery);
      $.get(`/token/si/${siQuery}`, data => {
        console.log('data came back from scrape ', data);
        console.log(Number(data.capacity));
        if (data.capacity) {
          $('#capacity').val(Number(data.capacity))
        }
      })
    })

  })

// check for email from url if it hasn't been found already
  $('#url').blur( e => {
    e.preventDefault()
    let url = e.currentTarget.value
    if (!$('#email').val()) {
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
      $.get(`/token/facebook/venues/${fbid}`, ({name,about,link,website,single_line_address,emails,location,events}) => {
        let booking = checkForBookingEmail(about)
        if (emails) {
          booking = emails.filter( email => checkForBookingEmail(email))
        }
        $('#email').val(booking)
        $('#city').val(location.city)
        $('#state').val(abbrState(location.state, 'name'))
      })
    }
  })

  const checkForBookingEmail = (field) => {
    console.log('field ', field);
    let clean = field.replace(/(\r\n|\n|\r)/gm, " ");
    let em = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/g
    // let book = /(booking)/gi
    let booking = clean.split(' ').find( el => el.match(em))
    console.log('booking ', booking);
    return booking
}




  $('#addVenueForm').submit( e => {
    e.preventDefault()
    let formData = e.target.elements
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
    console.log('newVenue.id', newVenue.id);
    console.log('type of  ', typeof newVenue.id);

    $.post(`/api/venues`, newVenue, (data, status) => {
      // $('input[type="text"], textarea').val('');
      // $('#state').val('All');
      // $('#venuesList').empty()
      // listVenues(data)
      window.location=`/venues/${data.id}`
    })
  })


})
