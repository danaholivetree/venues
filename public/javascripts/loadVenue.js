$(document).ready(function() {

  let {copyToClipboard} = helpers

  let venueId = document.location.href.match(/(\d+)$/)[0]
  let venueData = {}

  $.get(`/api/venues/${venueId}`, data => {
    venueData = data
    showVenue(data)
    getFbInfo(data.url) //maybe not have to do this more than once?
    getSi(data.venue, data.city, data.state)
    editSingleOn()
    submitFormOff()
  }).fail( err => {
    console.log('error ' , err);
  })

  const showVenue = data => {
    venueData = data
    console.log('gotData ', data);
    const {id, venue, url, state, city, diy, capacity, email, sound, genres, type, crowd, ages, pay, promo, accessibility, contributedBy, up, down, vote} = data
    //empty and append no matter what OR check if values have changed first , which is more intensive
    $('.container > h3').empty().append(venue)
    $('.info.location').empty().append(`${city}, ${state}`)
    $('.info.thumb-up').next('span').append(`${up}`)
    $('.info.thumb-down').next('span').append(`${down}`)
    $('.info.url').empty().append(`<a href=${url} target='_blank'>${url}</a>`)
    $('.info.email').empty().append(`${email ? email + `  <button type="button" class="btn btn-default thumb btn-copy js-tooltip js-copy" data-toggle="tooltip" data-placement="top" data-copy=${email} title="Copy to clipboard"><svg class="icon" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="18" height="18" viewBox="0 0 24 24"><path d="M17,9H7V7H17M17,13H7V11H17M14,17H7V15H14M12,3A1,1 0 0,1 13,4A1,1 0 0,1 12,5A1,1 0 0,1 11,4A1,1 0 0,1 12,3M19,3H14.82C14.4,1.84 13.3,1 12,1C10.7,1 9.6,1.84 9.18,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3Z" /></svg></button>` : ''}`)
    $('.info.capacity').empty().append(`${(capacity !== 0) && capacity ? capacity : ''}`)
    $('.info.genres').empty().append(`${genres ? genres : ''}`)
    $('.info.type').empty().append(`${type ? type : ''}`)
    $('.info.crowd').empty().append(`${crowd ? crowd : ''}`)
    $('.info.sound').empty().append(`${sound ? sound : ''}`)
    $('.info.accessibility').empty().append(`${accessibility ? accessibility : ''}`)
    $('.info.ages').empty().append(`${ages ? ages : ''}`)
    $('.info.pay').empty().append(`${pay ? pay : ''}`)
    $('.info.promo').empty().append(`${promo ? promo : ''}`)
    $('.info.diy').empty().append(`${diy ? 'This is a diy or not-for-profit venue.' : 'This is not a DIY venue'}`)
    $('#diy').prop('checked', diy )
    $('#contrib').text(`Contributed by ${contributedBy === 'Danah Olivetree' ? 'Tour Popsicle' : contributedBy}`)
    //set autofill values for form inputs
    $('input.edit-form').each( function() {
      if (data[this.id]) {
        // console.log('input.edit-form. each ==> .value = data[',this.id,'] (',data[this.id]);
        this.value = data[this.id]
      }
    })
    if (vote === 'up') {
      $(`.info.thumb-up`).css("color", "green")
    }
    if (vote === 'down') {
      $(`.info.thumb-down`).css("color", "red")
    }
    setThumbListener(id)
    // $('#diy').next('label').empty().append(`${diy ?  'This is a diy or not-for-profit venue. Uncheck to mark as not DIY' : 'This is not a DIY venue. Check to mark as DIY.'}`)
    $('.js-tooltip').tooltip()
    $('.js-copy').click( (e) => {
      e.preventDefault()
      var text = $(e.currentTarget).attr('data-copy')
      var el = $(e.currentTarget)
      copyToClipboard(text, el)
    })
  }

  //find a way to share this from loadVenues.js?
  const setThumbListener = (id) => {
    $('.thumb-up').click( e => {
        $.post(`/api/votes`, {venueId: id, vote: 'up'}, data => {
          $(`.thumb-up`).next('span').empty().append(`${data.up}`)
          $(`.thumb-down`).next('span').empty().append(`${data.down}`)
          $(`.thumb-down`).css("color", "black")
          if (data.vote && data.vote === 'none') {
            $(`.thumb-up`).css("color", "black")
          } else {
            $(`.thumb-up`).css("color", "green")
          }
        })
    })

    $('.thumb-down').click( e => {
        $.post(`/api/votes`, {venueId: id, vote: 'down'}, data => {
           $(`.thumb-up`).next('span').empty().append(`${data.up}`)
           $(`.thumb-down`).next('span').empty().append(`${data.down}`)
           $(`.thumb-up`).css("color", "black")
          if (data.vote && data.vote === 'none') {
            $(`.thumb-down`).css("color", "black")
          } else {
            $(`.thumb-down`).css("color", "red")
          }
        })
    })
  }

  const getFbInfo = url => {
    let fbid
    if (url.split('.')[1] === 'facebook') {
      fbid = url.split('/')[3]
      if (fbid.split('-').length > 1) {
        fbid = fbid.split('-')
        fbid = fbid[fbid.length-1]
      }
    } else {
      fbid = url.split('.')[1]
      console.log('trying fbid from website url', fbid);
    }
      $.get(`/token/facebook/venues/${fbid}`, data => {
        console.log('fb data ', data);
        if (data.events) {
          getEvents(data.events.data)
        }
        if (data.about) {
          checkForBookingEmail(data.about)
        }
        if (data.emails) {
          data.emails.filter( email => checkForBookingEmail(email))
        }
      })
  }

  const getSi = (venue, city, state) => {
    let cityParam = city
    if (city.split(' ').length > 1) {
      cityParam = city.split(' ').join('-')
    }
    let siQuery = venue.split(' ').join('-') + '-' + cityParam + '-' + state
    $.get(`/token/si/${siQuery}`, ({capacity, ages, genres}) => {
      capacity = Number(capacity)
      if (capacity && Number($('#capacity').val()) !== capacity) {
        $('#capacity').val(capacity).show()
        editOn('capacity')
      }
      let prevAgesVal = $('.info.ages').text().trim()
      if (ages && ages !== '' && prevAgesVal !== ages ) {
        $('#ages').val(ages + ' ' + prevAgesVal).show()
        editOn('ages')
      }
      if (genres) {
        let eachGenre = genres.split(', ')
        let curr = $('.info.genres').text()
        let currentGenres = curr.split(', ')
        let eachNewGenre = eachGenre.filter( genre => {
          return !currentGenres.find( curr => curr.toLowerCase() === genre.toLowerCase()) && genre !== 'All Genres'
        })
        if (eachNewGenre.length > 0) {
          $('#genres').val(eachNewGenre.join(', ')).show()
          editOn('genres')
        }
      }
    })
  }

  const editOn = (id) => {
    let thisButton = $(`#${id}`).closest('div').prev('div').children().first()
    thisButton.text('Save').toggleClass('save').toggleClass('edit').prop('type', 'submit')
    thisButton.next().attr( "style", "display: block;" )
  }

{/* <h3> ${venue} </h3> */}
{/* <button id='editVenue' class='btn btn-default'>Edit All</button> */}
  const getEvents = events => {
    let upcomingEvents = events.filter( event => (new Date(event.start_time) > new Date()))
    if (upcomingEvents.length > 0) {
      let displayEvents = upcomingEvents.map( event => {
        return `<li>${new Date(event.start_time).toDateString()}: <a href=http://www.facebook.com/events/${event.id} target='_blank'>${event.name}</a></li>`
      })
      displayEvents.forEach( event => {
        $('#displayEvents ul').prepend(event)
      })
    }
  }

  const checkForBookingEmail = (field) => {
    let clean = field.replace(/(\r\n|\n|\r)/gm, " ");
    let em = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/g
    // will add test for if found email contains 'booking' or if there may be a typo
    // in already-listed email address
    // let book = /(booking)/gi
    // let bookingEm = /(booking)+@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/gi

    let booking = clean.split(' ').find( el => el.match(em))
    if (booking && !venueData.email) {
      $('#email').show().val(booking)
      editOn('email')
  }
}

  const editSingleOn = () => {
    $('.edit-btn').click( e => {
      e.preventDefault()
      let targ = $(e.currentTarget)
      let thisInput = targ.closest('div').next().children('input')
      if (targ.hasClass('edit')) {
        clickedEdit(targ, thisInput)
      } else if (targ.hasClass('save')) {
        clickedSave(targ, thisInput)
      } else if (targ.hasClass('cancel-edit')) {
        clickedCancel(targ, thisInput)
      }
    })
    $('#editVenue').click( e => {
      let targ = $(e.currentTarget)
      e.preventDefault()
      if (targ.hasClass("edit-all")) {
        editSingleOff()
        submitFormOn()
        $('.edit-form').show()
        $('.save').toggleClass('save').toggleClass('edit').text('Edit')
        $('.edit-btn').hide()
        $('#editVenue').text('Cancel').addClass('cancel-all').removeClass('edit-all')
      } else if (targ.hasClass("cancel-all")) {
        editSingleOn()
        submitFormOff()
        $('.edit-form').hide()
        $('.edit').show()
        $('#editVenue').text('Edit All').removeClass('cancel-all').addClass('edit-all')
      }
    })
  }

  const editSingleOff = () => {
    $('.edit-btn').off('click').prop('type', 'button').hide()
  }

  const clickedEdit = (editBtn, thisInput) => {
    thisInput.show() //show text field
    editBtn.next().attr( "style", "display: block;" ) //show adjacent cancel button
    editBtn.text('Save').toggleClass('save').toggleClass('edit').prop('type', 'submit').focus() //edit turns into save type submit
  }

  const clickedSave = (btn, thisInput) => {
    let origVal = venueData[$(thisInput).prop('id')]
    let field = $(thisInput).prop('id')
    let editedVenue = {}
    let newVal = (field === 'diy') ? $(thisInput).prop('checked') : $(thisInput).val()
    if (newVal !== origVal) {
      editedVenue[field] = newVal
      sendEditToServer(venueId, editedVenue)
      venueData[field] = editedVenue[field]
    }
    if (field === 'diy') {
      $(`.info.${field}`).text(`${venueData.diy ? 'This is a diy or not-for-profit venue.' : 'This is not a DIY venue'}`)
    } else {
      $(`.info.${field}`).text($(thisInput).val())
    }
    btn.toggleClass('save').toggleClass('edit').text('Edit').prop('type', 'button')
    thisInput.hide()
    btn.next().hide()
  }

  const clickedCancel = (btn, thisInput) => {
    thisInput.hide()
    btn.prev('.save').text('Edit').toggleClass('save').toggleClass('edit').prop('type', 'button')
    btn.hide()
  }

  const submitFormOn = () => {
    $('.edit-form').keydown( function(e) {
      if (e.key === 'Enter') {
        $(this).closest('.row').next('.row').find('input.edit-form').focus()
        if ($(this).prop('id') === 'accessibility') {
          $("#submitEdits").focus()
        }
      }
    })
    $('#submitEdits').click( e => {
      e.preventDefault()
      console.log('edit venue form was submitted');
      let venueId = document.location.href.match(/(\d+)$/)[0]
      let inputs = $(this).find('input')
      let editedVenue = {}
      $(inputs).each(function (i, val) {
        let field = val.id
        let newValue = val.value
        let origValue = venueData[field]
        if (field === 'capacity' && newValue != '' && newValue != origValue) {
          editedVenue[field] = newValue
        }
        if (field === 'diy' && val.checked !== origValue) {
          editedVenue[field] = val.checked
        }
        if (field !== 'diy' && val.value != origValue) {
          editedVenue[field] = newValue
        }
      })

      if (Object.keys(editedVenue).length > 0) {
        console.log('editedVenue about to be sent to server', editedVenue);
        sendEditToServer(venueId, editedVenue, true)
      }
      inputs.hide()
      $('.edit').show()
      $('#editVenue').text('Edit All')
      $('#cancelEdits').hide()
      editSingleOn()
    })
  }

  const submitFormOff = () => {
    $('#editVenueForm').off('submit')
  }

  // $('#editVenue').click( e => {
  //   let targ = $(e.currentTarget)
  //   e.preventDefault()
  //   if (targ.hasClass("edit-all")) {
  //     editSingleOff()
  //     submitFormOn()
  //     $('.edit-form').show()
  //     $('.save').toggleClass('save').toggleClass('edit').text('Edit')
  //     $('.edit-btn').hide()
  //     $('#editVenue').text('Cancel').addClass('cancel-all').removeClass('edit-all')
  //   } else if (targ.hasClass("cancel-all")) {
  //     editSingleOn()
  //     submitFormOff()
  //     $('.edit-form').hide()
  //     $('.edit').show()
  //     $('#editVenue').text('Edit All').removeClass('cancel-all').addClass('edit-all')
  //   }
  // })

  $('#cancelEdits').click( e => {
    $('.edit-form').hide()
    $('.edit').show()
    $('#editVenue').text('Edit All').removeClass('cancel-all').addClass('edit-all')
    $('#submitEdits').hide()
    $('#cancelEdits').hide()
    editSingleOn()
  })

const sendEditToServer = (id, edits, all) => {
  $.ajax({
    url: `/api/venues/${id}`,
    method: 'PUT',
    data: edits,
    success: data => {
      console.log('edited data came back from server ', data)
      if (all) {
        showVenue(data) //might be able to avoid this
      }
    },
    fail: err => {
      console.log(err);
    }
  })
}

})
