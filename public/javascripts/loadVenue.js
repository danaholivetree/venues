$(document).ready(function() {
  let venueId = document.location.href.match(/(\d+)$/)[0]

  $.get(`/api/venues/${venueId}`, data => {
    showVenue(data)
    getFbInfo(data.url)

  }).fail( err => {
    console.log('error ' , err);
  })

{/* <h3> ${venue} </h3> */}
{/* <button id='editVenue' class='btn btn-default'>Edit All</button> */}

  const getFbInfo = url => {
    // console.log('url ', url);
    // console.log('url.split(".")[1] ', url.split('.')[1]);
    if (url.split('.')[1] === 'facebook') {
      let fbid = url.split('/')[3]
      // console.log("url.split('/')[3] ", url.split('/')[3])
      $.get(`/token/facebook/venues/${fbid}`, data => {
        console.log('data' , data);
        let events = data.events.data

        let upcomingEvents = events.filter( event => {
          return (new Date(event.start_time) > new Date())
        })
        let displayEvents = upcomingEvents.map( event => {
          // let time = event.start_time
          // let dateString = new Date(time).toDateString();
          return `<li>${new Date(event.start_time).toDateString()}: <a href=http://www.facebook.com/events/${event.id}>${event.name}</a></li>`
        })
        displayEvents.forEach( event => {
          $('#displayEvents ul').prepend(event)
        })
        // console.log('displayevents ' , displayEvents);
      })
    }
  }

  const showVenue = data => {
    console.log('gotData ', data);
    const {id, venue, url, state, city, diy, capacity, email, sound, genres, type, crowd, ages, pay, promo, accessibility, contributedBy} = data
    $('#venueInfo').append($(`
      <div class='container' style="padding: 30px 0 0 ;"><h3>${venue}</h3></div>

      <div class='row'>
          <div class='col-2'>
            <i class="material-icons">arrow_back</i> Search Venues
          </div>
          <div class="col-md-3 col-6 offset-md-8 offset-6">

                ${city}, ${state}
                Contributed By: ${contributedBy}


          </div>

      </div>


      <form class="form-horizontal" id="editVenueForm">
        <div class="form-group row">
          <div class='col-2 offset-md-6 offset-10'>
            <button id='editVenue' class='btn btn-default edit-all-btn'>Edit All</button>
          </div>
        </div>
        <div class="form-group row">
          <label class="control-label col-2 col-form-label" for="url">Website:</label>
            <div class="col-md-4 col-8">
              <p class="info form-control-static"> <a href=${url}>${url}</a>  </p>
            </div>
            <div class='col-1'>
              <button id='editUrl' class='btn input-group-btn btn-default edit-btn edit '>Edit</button>
            </div>
            <div class='col-lg-5'>
              <input type="text" id='url' value=${url} class="form-control edit-form" />
            </div>
        </div>
        <div class="form-group row">
          <label class="control-label col-2 col-form-label" for="booking">Booking:</label>

          <div class="col-md-4 col-8">
            <p class="info form-control-static">${email ? email : ''}</p>
          </div>
          <div class='col-1'>
            <button id='editEmail' class='btn input-group-btn btn-default edit-btn edit '>Edit</button>
          </div>
          <div class='col-lg-5'>
            <input type="email" id='email' class="form-control edit-form" />
          </div>
        </div>
        <div class="form-group row">
          <label class="control-label col-2 col-form-label" for="capacity">Capacity:</label>
          <div class="col-md-4 col-8">
            <p class="form-control-static">${capacity ? capacity : ''}</p>
          </div>
          <div class='col-1'>
            <button id='editCap' class='btn btn-default edit-btn edit'>Edit</button>
          </div>
          <div class='col-lg-5'>
            <input type="number" id='capacity'  class="form-control edit-form" />
          </div>
        </div>
        <div class="form-group row">
          <label class="control-label col-2 col-form-label" for="genres">Genres booked:</label>
          <div class='col-md-4 col-8'>
            <p class="form-control-static"> ${genres ? genres : ''}</p>
          </div>
          <div class='col-1'>
            <button id='editGenres' class='btn btn-default edit-btn edit'>Edit</button>
          </div>
          <div class='col-lg-5'>
            <input type="text" id='genres' class="form-control edit-form"  />
          </div>
        </div>
        <div class="form-group row">
          <label class="control-label col-2 col-form-label" for="type">Type of venue:</label>
          <div class='col-md-4 col-8'>
            <p class="form-control-static"> ${type ? type : ''} </p>
          </div>
          <div class='col-1'>
            <button id='editType' class='btn btn-default edit-btn edit'>Edit</button>
          </div>
          <div class='col-lg-5'>
            <input type="text" id='type' class="form-control edit-form"  />
          </div>
        </div>
        <div class="form-group row">
          <label class="control-label col-2 col-form-label" for="diyChange">DIY Status:</label>
          <div class='col-md-4 col-8'>
            <p class="form-control-static"> ${diy ? 'This is a diy or not-for-profit venue.' : 'This is not a DIY venue'} </p>
          </div>

          <div class='col-1'>
            <button id='editType' class='btn btn-default edit-btn edit'>Edit</button>
          </div>
          <div class='form-check col-lg-5'>
            <input type="checkbox" id='diy' class="form-check edit-form" ${diy ? "checked" : ''} />
            <label class="form-check-label edit-form" for="diy">
              ${diy ?  'This is a diy or not-for-profit venue. Uncheck to mark as not DIY' : 'This is not a DIY venue. Check to mark as DIY.'}
            </label>
          </div>
        </div>
        <div class="form-group row">
          <label class="control-label col-2 col-form-label" for="sound">Sound: </label>
          <div class="col-md-4 col-8">
            <p class="form-control-static">${sound ? sound : ''}</p>
          </div>
          <div class='col-1'>
            <button id='editSound' class='btn btn-default edit-btn edit'>Edit</button>
          </div>
          <div class='col-lg-5'>
            <input type="text" id='sound' class="form-control edit-form"  />
          </div>
        </div>
        <div class="form-group row">
          <label class="control-label col-2 col-form-label" for="crowd">Type of crowd:</label>
          <div class="col-md-4 col-8">
            <p class="form-control-static">${crowd ? crowd : ''}</p>
          </div>
          <div class='col-1'>
            <button id='editCrowd' class='btn btn-default edit-btn edit'>Edit</button>
          </div>
          <div class='col-lg-5'>
            <input type="text" id='crowd' class="form-control edit-form"  />
          </div>
        </div>
        <div class="form-group row">
          <label class="control-label col-2 col-form-label" for="ages">Ages: </label>
          <div class="col-md-4 col-8">
            <p class="form-control-static">${ages ? ages : ''}</p>
          </div>
          <div class='col-1'>
            <button id='editAges' class='btn btn-default edit-btn edit'>Edit</button>
          </div>
          <div class='col-lg-5'>
            <input type="text" id='ages' class="form-control edit-form"  />
          </div>
        </div>
        <div class="form-group row">
          <label class="control-label col-2 col-form-label" for="pay">Pay structure: </label>
          <div class="col-md-4 col-8">
            <p class="form-control-static">${pay ? pay : ''}</p>
          </div>
          <div class='col-1'>
            <button id='editPay' class='btn btn-default edit-btn edit'>Edit</button>
          </div>
          <div class='col-lg-5'>
            <input type="text"  id='pay'  class="form-control edit-form"  />
          </div>
        </div>
        <div class="form-group row">
          <label class="control-label  col-2 col-form-label" for="promo">Promo info: </label>
          <div class="col-md-4 col-8">
            <p class="form-control-static">${promo ? promo : ''}</p>
          </div>
          <div class='col-1'>
            <button id='editPromo' class='btn btn-default edit-btn edit'>Edit</button>
          </div>
          <div class='col-lg-5'>
            <input type="text"  id='promo'  class="form-control edit-form"  />
          </div>
        </div>
        <div class="form-group row">
          <label class="control-label  col-2 col-form-label" for="accessibility">Accessibility: </label>
          <div class="col-md-4 col-8">
            <p class="form-control-static">${accessibility ? accessibility : ''}</p>
          </div>
          <div class='col-1'>
            <button id='editAccess' class='btn btn-default edit-btn edit'>Edit</button>
          </div>
          <div class='col-lg-5'>
            <input type="text"  id='accessibility'  class="form-control edit-form"  />
          </div>
        </div>
        <div class="form-group row">
          <div class="col-lg-offset-2 col-2">
            <button id='submitEdits' type='submit' class='btn btn-default edit-form'>Save Edits</button>
          </div>
        </div>

      </form>
      <div id='displayEvents'>Upcoming Facebook events:
        <ul></ul>
      </div>
    `))
    //set autofill values for form inputs
    $('input.edit-form').each( function() {
      if (data[this.id]) {
        this.value = data[this.id]
      }
    })
    $('#editVenue').click( e => {
      e.preventDefault()
      $('.edit-form').show()
      $('.edit-btn').hide()
    })
    $('.edit-btn').click( e => {
      e.preventDefault()
      let targ = $(e.currentTarget)
      let thisInput = $(e.currentTarget).closest('div').next().children('input')
      let origVal = ''

      if (targ.hasClass('edit')) {
        targ.text('Save').toggleClass('save').toggleClass('edit')
        $(thisInput).show()
        targ.closest('div').append($(`<button class="btn input-group-btn edit-btn btn-default cancel-edit">Cancel</button>`))
        $('.cancel-edit').click( event => {
          event.preventDefault()
          $(event.currentTarget).closest('div').next().children('input').hide()
          $(event.currentTarget).closest('div').children('.save').text('Edit').toggleClass('save').toggleClass('edit')
          $('.cancel-edit').remove()
        })

      } else if (targ.hasClass('save')) {
          origVal = data[$(thisInput).prop('id')]
          let editedVenue = {}
          if ($(thisInput).prop('id') === 'diy' && data['diy'] !== $(thisInput).prop('checked')) {
            editedVenue['diy'] = !data['diy']
          } else if ($(thisInput).val() !== origVal) {
            let field = $(thisInput).prop('id')
            editedVenue[field] = $(thisInput).val()
          }
            console.log('editedVenue to be sent to server ', editedVenue);
            sendEditToServer(venueId, editedVenue)
            targ.toggleClass('save').toggleClass('edit').text('Edit')
            targ.next('.cancel-edit').remove()
            targ.closest('div').next().children('input').hide()
      }
    })


    $('#editVenueForm').submit( e => {
      e.preventDefault()
      let venueId = document.location.href.match(/(\d+)$/)[0]
      let inputs = $(this).find('input')
      let editedVenue = {}
      $(inputs).each(function (i, val) {
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
  }

const sendEditToServer = (id, edits) => {
  $.ajax({
    url: `/api/venues/${id}`,
    method: 'PUT',
    data: edits,
    success: data => {
      console.log('data came back from ajax ', data)
      $('#venueInfo').empty()
      showVenue(data)
    },
    fail: err => {
      console.log(err);
    }
    })
}

})
