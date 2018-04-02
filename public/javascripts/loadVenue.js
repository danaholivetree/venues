$(document).ready(function() {

  let {copyToClipboard} = helpers

  let venueId = document.location.href.match(/(\d+)$/)[0]
  let venueData = {}
  console.log('venueId ', venueId);

  $.get(`/api/venues/${venueId}`, data => {
    venueData = data
    showVenue(data)
    getFbInfo(data.url) //maybe not have to do this more than once?
    getSi(data.venue, data.city, data.state)
  }).fail( err => {
    console.log('error ' , err);
  })

  const showVenue = data => {
    console.log('gotData ', data);
    const {id, venue, url, state, city, diy, capacity, email, sound, genres, type, crowd, ages, pay, promo, accessibility, contributedBy} = data

    $('.container > h3').empty().append(venue)
    $('.info.location').empty().append(`${city}, ${state}`)
    $('.info.url').empty().append(`<a href=${url} target='_blank'>${url}</a>`)
    $('.info.email').empty().append(`${email ? email + `  <button class="btn btn-default thumb btn-copy js-tooltip js-copy" data-toggle="tooltip" data-placement="top" data-copy=${email} title="Copy to clipboard"><svg class="icon" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="18" height="18" viewBox="0 0 24 24"><path d="M17,9H7V7H17M17,13H7V11H17M14,17H7V15H14M12,3A1,1 0 0,1 13,4A1,1 0 0,1 12,5A1,1 0 0,1 11,4A1,1 0 0,1 12,3M19,3H14.82C14.4,1.84 13.3,1 12,1C10.7,1 9.6,1.84 9.18,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3Z" /></svg></button>` : ''}`)
    $('.info.capacity').empty().append(`${capacity !== 0 ? capacity : ''}`)
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
    $('#diy').next('label').empty().append(`${diy ?  'This is a diy or not-for-profit venue. Uncheck to mark as not DIY' : 'This is not a DIY venue. Check to mark as DIY.'}`)

    //set autofill values for form inputs
    $('input.edit-form').each( function() {
      if (data[this.id]) {
        this.value = data[this.id]
      }
    })

    $('.js-tooltip').tooltip();
    $('.js-copy').click( (e) => {
      e.preventDefault()
      var text = $(e.currentTarget).attr('data-copy');
      var el = $(e.currentTarget);
      console.log('el before copy', el);
      copyToClipboard(text, el);
    });
  }

  const getFbInfo = url => {
    let fbid
    if (url.split('.')[1] === 'facebook') {
      fbid = url.split('/')[3]
      if (fbid.split('-').length > 1) {
        fbid = fbid.split('-')
        fbid = fbid[fbid.length-1]
      }
      console.log('fbid ', fbid);
    } else {
      fbid = url.split('.')[1]
      console.log('trying fbid ', fbid);
    }
      $.get(`/token/facebook/venues/${fbid}`, data => {
        console.log('data' , data);
        getEvents(data.events.data)
        checkForBookingEmail(data.about)
        if (data.emails) {
          data.emails.filter( email => checkForBookingEmail(email))
        }
      })
  }

  const getSi = (venue, city, state) => {
    let siQuery = venue.split(' ').join('-') + '-' + city + '-' + state
    console.log('siQuery ', siQuery);
    $.get(`/token/si/${siQuery}`, ({capacity, ages, genres}) => {
      capacity = Number(capacity)
      if (capacity && Number($('#capacity').val()) !== capacity) {
        $('#capacity').val(capacity).show()
      }
      let prevAgesVal = $('.info.ages').text().trim()
      if (ages && ages !== '' && prevAgesVal !== ages ) {
        console.log('prevVal ', prevAgesVal);
        $('#ages').val(ages + ' ' + prevAgesVal).show()
        editOn('ages')
      }
    })
  }

  const editOn = (id) => {
    let thisButton = $(`#${id}`).closest('div').prev('div').children().first()
    thisButton.text('Save').toggleClass('save').toggleClass('edit')
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
    } else {
      if (events.length > 0) {
        let displayEvents = events.map( event => `<li>${new Date(event.start_time).toDateString()}: <a href=http://www.facebook.com/events/${event.id} target='_blank'>${event.name}</a></li>`)
        displayEvents.forEach( event => {
          $('#displayEvents ul').append(event)
        })
        $('#displayEvents').prev('div').text('Past FB events:')
      }
    }
  }

  const checkForBookingEmail = (field) => {
    let clean = field.replace(/(\r\n|\n|\r)/gm, " ");
    let em = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/g
    // let book = /(booking)/gi
    let booking = clean.split(' ').find( el => el.match(em))
    console.log('booking ', booking);
    if (booking && venueData.email !== booking) {
      $('#email').show().val(booking)
      editOn('email')
  }
}

    $('.edit-btn').click( e => {
      e.preventDefault()
      let targ = $(e.currentTarget)
      let thisInput = targ.closest('div').next().children('input')
      if (targ.hasClass('edit')) {
        thisInput.show()
        targ.next().attr( "style", "display: block;" )
        targ.text('Save').toggleClass('save').toggleClass('edit')
      } else if (targ.hasClass('save')) {
        let origVal = venueData[$(thisInput).prop('id')]
        let editedVenue = {}
        if (thisInput.prop('id') === 'diy' && venueData['diy'] !== $(thisInput).prop('checked')) {
          editedVenue['diy'] = !venueData['diy']
        } else if ($(thisInput).val() !== origVal) {
          console.log('origVal ', origVal);
          console.log('currentVal is different', $(thisInput).val());
          let field = $(thisInput).prop('id')
          editedVenue[field] = $(thisInput).val()
        }
          if (Object.keys(editedVenue).length > 0) {
            console.log('editedVenue had keys, sending to server ');
            sendEditToServer(venueId, editedVenue)
          }
          targ.toggleClass('save').toggleClass('edit').text('Edit')
          targ.next().hide()
          targ.closest('div').next().children('input').hide()
      } else if (targ.hasClass('cancel-edit')) {
          targ.closest('div').next().children('input').hide()
          targ.closest('div').children('.save').text('Edit').toggleClass('save').toggleClass('edit')
          targ.hide()
      }
    })

    $('#editVenueForm').submit(e => {
      e.preventDefault()
      let venueId = document.location.href.match(/(\d+)$/)[0]
      let inputs = $(this).find('input')
      let editedVenue = {}
      $(inputs).each(function (i, val) {
        let field = val.id
        let newValue = val.value
        let origValue = venueData[field]
        console.log('capacity ', capacity);
        if (field === 'capacity' && newValue != '' && newValue != origValue) {
          console.log('actually editing capacity setting it to ', newValue);
          editedVenue[field] = newValue
        }
        if (field === 'diy' && val.checked !== origValue) {
          console.log('diy changed ', diy);
          editedVenue[field] = val.checked
        }
        if (field !== 'diy' && val.value != origValue) {
          console.log('something other than cap or diy changed ', newValue);
          editedVenue[field] = newValue
        }
      })
      console.log('editedVenue to be sent to server ', editedVenue);
      sendEditToServer(venueId, editedVenue)
      inputs.hide()
      $('.edit').show()
      $('#editVenue').text('Edit All')
      $('#cancelEdits').hide()
    })

  $('#editVenue').click( e => {
    let targ = $(e.currentTarget)
    e.preventDefault()
    if (targ.hasClass("edit-all")) {
      $('.edit-form').show()
      $('.edit-btn').hide()
      $('#editVenue').text('Cancel').addClass('cancel-all').removeClass('edit-all')
    } else if (targ.hasClass("cancel-all")) {
      $('.edit-form').hide()
      $('.edit').show()
      $('#editVenue').text('Edit All').removeClass('cancel-all').addClass('edit-all')
    }
  })

  $('#cancelEdits').click( e => {
    $('.edit-form').hide()
    $('.edit').show()
    $('#editVenue').text('Edit All').removeClass('cancel-all').addClass('edit-all')
    $('#submitEdits').hide()
    $('#cancelEdits').hide()
  })

const sendEditToServer = (id, edits) => {
  $.ajax({
    url: `/api/venues/${id}`,
    method: 'PUT',
    data: edits,
    success: data => {
      console.log('data came back from ajax ', data)
      showVenue(data)
    },
    fail: err => {
      console.log(err);
    }
  })
}

})
