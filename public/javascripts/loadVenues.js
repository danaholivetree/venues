$(document).ready(function() {
  const {abbrState} = usStates
  const {makeUppercase, addHttp, checkUrl, checkEmail, endMessage} = helpers

  const listVenues = (data) => {
    data.forEach( venue => {

      let displayVenue = `<a href=${venue.url} target='_blank'>${venue.venue}${venue.diy ? '*' : ''}</a>`

      $('#venuesList').append($(`
        <tr onclick="window.location='/venues/${venue.id}'" data-id=${venue.id} class='venue-row'>
          <td>${abbrState(venue.state, 'abbr')}</td>
          <td>${venue.city}</td>
          <td>${displayVenue}</td>
          <td>${venue.capacity ? venue.capacity : ''}</td>
          <td id=upVote${venue.id}><span>${venue.up}</span><button class='btn btn-default thumb thumb-up' data-id=${venue.id}> <i class="material-icons md-18"  data-id=${venue.id}>thumb_up</i></button></td>
          <td id=downVote${venue.id}><span>${venue.down}</span><button class='btn btn-default thumb thumb-down' data-id=${venue.id}><i class="material-icons md-18" data-id=${venue.id}>thumb_down</i></button></td>
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

  // const setIndividualListener = () => {
  //   $('.venue-row').click( e => {
  //     e.preventDefault()
  //     console.log('redirecting to /currentTarget.dataset.id', e.currentTarget.dataset.id);
  //     window.location = `/venues/${e.currentTarget.dataset.id}`
  //     $.get(`/api/venues/${e.currentTarget.dataset.id}`, data => {
  //       console.log('got data from venue ', data);
  //     }).fail( err => {
  //       console.log('error ' ,err);
  //     })
  //
  //   })
  // }

  $('.notany').click( e => {
    if ($('.notany:checked').length === 0) {
        $('#capAny').prop("checked", true)
    } else {
        $('#capAny').prop("checked", false)
    }
  })

  $.get(`/api/venues`, (data, status) => {
    listVenues(data.slice(0,20))
    setThumbListener()
    // setIndividualListener()
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
        console.log('data' , data);
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
  })

  $('#addVenue').click( e => {
    e.preventDefault()
    console.log('clicked add venue');
      $('#venueSearchForm').toggle(false)
      $('#addVenueForm').toggle(true)
      $('#addVenue').css('background-color', 'lightblue')
      $('#searchVenues').css('background-color', 'white')
  })

  $('#addVenueForm').submit( e => {
    e.preventDefault()
    let formData = e.target.elements
    const newVenue = {}
    newVenue.state = formData.state.value
    if (!formData.city.value || formData.city.value == 'All') {
      $('#errorMessage').html(`<div class="alert alert-danger fade show" role="alert">Please enter a city</div>`)
    } else {
      newVenue.city = makeUppercase(formData.city.value)
    }
    if (!formData.venue.value) {
        $('#errorMessage').html(`<div class="alert alert-danger fade show" role="alert">Please enter a venue name</div>`)
    } else {
      newVenue.venue = makeUppercase(formData.venue.value)
    }
    if (!formData.url.value) {
        $('#errorMessage').html(`<div class="alert alert-danger fade show" role="alert">Please enter a url</div>`)
        // endMessage()
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

    $.post(`/api/venues`, newVenue, (data, status) => {
      $('input[type="text"], textarea').val('');
      $('#state').val('All');
      $('#venuesList').empty()
      listVenues(data)
    })
  })


})
