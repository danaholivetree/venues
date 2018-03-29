$(document).ready(function() {
  let venueId = document.location.href.match(/(\d+)$/)[0]
  let venueData = {}

  $.get(`/api/venues/${venueId}`, data => {
    venueData = data
    showVenue(data)
    getFbInfo(data.url)

  }).fail( err => {
    console.log('error ' , err);
  })

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
    if (booking) {
      $('#email').show().val(booking)
      let thisButton = $('#email').closest('div').prev('div').children().first()
      thisButton.text('Save').toggleClass('save').toggleClass('edit')
      thisButton.next().attr( "style", "display: block;" )
        // thisButton.closest('div').append($(`<button class="btn input-group-btn edit-btn btn-default cancel-edit">Cancel</button>`))


  }
}

  const getFbInfo = url => {
    if (url.split('.')[1] === 'facebook') {
      let fbid = url.split('/')[3]
      if (fbid.split('-').length > 1) {
        fbid = fbid.split('-')
        fbid = fbid[fbid.length-1]
      }

      console.log('fbid ', fbid);
      $.get(`/token/facebook/venues/${fbid}`, data => {
        console.log('data' , data);
        console.log('data.events.data' , data.events.data);
        getEvents(data.events.data)
        checkForBookingEmail(data.about)
        if (data.emails) {
          data.emails.filter( email => checkForBookingEmail(email))
        }

      })
    }
  }

  const showVenue = data => {
    console.log('gotData ', data);
    const {id, venue, url, state, city, diy, capacity, email, sound, genres, type, crowd, ages, pay, promo, accessibility, contributedBy} = data

    $('.container > h3').empty().append(venue)
    $('.info.location').empty().append(`${city}, ${state}`)
    $('.info.url').empty().append(`<a href=${url} target='_blank'>${url}</a>`)
    $('.info.email').empty().append(`${email ? email : ''}`)
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
  }

    $('.edit-btn').click( e => {
      e.preventDefault()
      console.log('venueData is accessible ', venueData);
      let targ = $(e.currentTarget)
      console.log('current target was ', targ);
      let thisInput = targ.closest('div').next().children('input')
      console.log('thisInput ', thisInput);
      console.log("targ.hasClass('edit') ", targ.hasClass('edit'));
      console.log("targ.hasClass('save') ", targ.hasClass('save'));
      console.log("targ.hasClass('cancel-edit') ", targ.hasClass('cancel-edit'));
      if (targ.hasClass('edit')) {
        console.log('was edit');
        console.log('showing input field');
        thisInput.show()
        console.log('showing cancel button');
        targ.next().attr( "style", "display: block;" )
        console.log('target becomes save button');
        targ.text('Save').toggleClass('save').toggleClass('edit')
      } else if (targ.hasClass('save')) {
        console.log('was save');
        let origVal = venueData[$(thisInput).prop('id')]
        console.log('origVal ', origVal);
        let editedVenue = {}
        if (thisInput.prop('id') === 'diy' && venueData['diy'] !== $(thisInput).prop('checked')) {
          editedVenue['diy'] = !venueData['diy']
        } else if ($(thisInput).val() !== origVal) {
          console.log('currentVal is different', $(thisInput).val());
          let field = $(thisInput).prop('id')
          editedVenue[field] = $(thisInput).val()
        }
          console.log('editedVenue ', editedVenue);
          if (Object.keys(editedVenue).length > 0) {
            console.log('editedVenue had keys, sending to server ');
            sendEditToServer(venueId, editedVenue)
          }
          targ.toggleClass('save').toggleClass('edit').text('Edit')
          targ.next().hide()
          targ.closest('div').next().children('input').hide()
      } else if (targ.hasClass('cancel-edit')) {
        console.log('was cancel');
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
        console.log('capacity ', capacity);
        if (val.id === 'capacity' && val.value != '' && val.value != data[capacity]) {
          console.log('actually editing capacity setting it to ', val.value);
          editedVenue[val.id] = val.value
        }
        if (val.id !== 'diy' && val.value != data[val.id]) {
          editedVenue[val.id] = val.value
        }
        if (val.id === 'diy' && val.checked !== data['diy']) {
          editedVenue['diy'] = val.checked
        }
      })
      console.log('editedVenue to be sent to server ', editedVenue);
      sendEditToServer(venueId, editedVenue)
    })




  $('#editVenue').click( e => {
    e.preventDefault()
    $('.edit-form').show()
    $('.edit-btn').hide()
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
