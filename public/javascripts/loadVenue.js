$(document).ready(function() {
  let venueId = document.location.href.match(/(\d+)$/)[0]
  $.get(`/api/venues/${venueId}`, data => {
    showVenue(data)

  }).fail( err => {
    console.log('error ' , err);
  })

{/* <h3> ${venue} </h3> */}
{/* <button id='editVenue' class='btn btn-default'>Edit All</button> */}
  const showVenue = data => {
    const {id, venue, url, state, city, capacity, email, genres, type, crowd, ages, pay, promo, accessibility, contributedBy} = data

    $('#venueInfo').before($(`<div class='container' style="padding: 30px 0 0 ;"><h3> ${venue} </h3></div>`))
    $('#venueInfo').append($(`

      <div class='row'>
        <div class="col-4 offset-sm-8">
          <div> ${city}, ${state} </div>
          <div> Contributed By: ${contributedBy}</div>
        </div>
      </div>


      <form class="form-horizontal" id="editVenueForm">
        <div class="form-group row">
          <div class='col offset-sm-6'>
            <button id='editVenue' class='btn btn-default edit-all-btn'>Edit All</button>
          </div>
        </div>
        <div class="form-group row">
          <label class="control-label col-2 col-form-label" for="url">Website:</label>
            <div class=" col-4">
              <p class="info form-control-static"> ${url}  </p>
            </div>
            <div class='col-1'>
              <button id='editUrl' class='btn input-group-btn btn-default edit-btn '>Edit</button>
            </div>
            <div class='col-5'>
              <input type="text" id='url' value=${url} class="form-control edit-form" />
            </div>
        </div>
        <div class="form-group row">
          <label class="control-label col-2 col-form-label" for="booking">Booking:</label>

          <div class=" col-4">
            <p class="info form-control-static">${email ? email : ''}</p>
          </div>
          <div class='col-1'>
            <button id='editUrl' class='btn input-group-btn btn-default edit-btn '>Edit</button>
          </div>
          <div class='col-5'>
            <input type="email" id='email' class="form-control edit-form" />
          </div>
        </div>
        <div class="form-group row">
          <label class="control-label col-2 col-form-label" for="capacity">Capacity:</label>
          <div class="col-4">
            <p class="form-control-static">${capacity ? capacity : ''}</p>
          </div>
          <div class='col-1'>
            <button id='editCap' class='btn btn-default edit-btn'>Edit</button>
          </div>
          <div class='col-5'>
            <input type="number" id='capacity'  class="form-control edit-form" />
          </div>
        </div>
        <div class="form-group row">
          <label class="control-label col-2 col-form-label" for="genres">Genres booked:</label>
          <div class='col-4'>
            <p class="form-control-static"> ${genres ? genres : ''}</p>
          </div>
          <div class='col-1'>
            <button id='editGenres' class='btn btn-default edit-btn'>Edit</button>
          </div>
          <div class='col-5'>
            <input type="text" id='genres' class="form-control edit-form"  />
          </div>
        </div>
        <div class="form-group row">
          <label class="control-label col-2 col-form-label" for="type">Type of venue:</label>
          <div class='col-4'>
            <p class="form-control-static"> ${type ? type : ''}</p>
          </div>
          <div class='col-1'>
            <button id='editType' class='btn btn-default edit-btn'>Edit</button>
          </div>
          <div class='col-5'>
            <input type="text" id='type' class="form-control edit-form"  />
          </div>
        </div>
        <div class="form-group row">
          <label class="control-label col-2 col-form-label" for="crowd">Type of crowd:</label>
          <div class="col-4">
            <p class="form-control-static">${crowd ? crowd : ''}</p>
          </div>
          <div class='col-1'>
            <button id='editCrowd' class='btn btn-default edit-btn'>Edit</button>
          </div>
          <div class='col-5'>
            <input type="text" id='crowd' class="form-control edit-form"  />
          </div>
        </div>
        <div class="form-group row">
          <label class="control-label col-2 col-form-label" for="ages">Ages: </label>
          <div class="col-4">
            <p class="form-control-static">${ages ? ages : ''}</p>
          </div>
          <div class='col-1'>
            <button id='editAges' class='btn btn-default edit-btn'>Edit</button>
          </div>
          <div class='col-5'>
            <input type="text" id='ages' class="form-control edit-form"  />
          </div>
        </div>
        <div class="form-group row">
          <label class="control-label col-2 col-form-label" for="pay">Pay structure: </label>
          <div class="col-4">
            <p class="form-control-static">${pay ? pay : ''}</p>
          </div>
          <div class='col-1'>
            <button id='editPay' class='btn btn-default edit-btn'>Edit</button>
          </div>
          <div class='col-5'>
            <input type="text"  id='pay'  class="form-control edit-form"  />
          </div>
        </div>
        <div class="form-group row">
          <label class="control-label  col-2 col-form-label" for="promo">Promo info: </label>
          <div class="col-4">
            <p class="form-control-static">${promo ? promo : ''}</p>
          </div>
          <div class='col-1'>
            <button id='editPromo' class='btn btn-default edit-btn'>Edit</button>
          </div>
          <div class='col-5'>
            <input type="text"  id='promo'  class="form-control edit-form"  />
          </div>
        </div>
        <div class="form-group row">
          <label class="control-label  col-2 col-form-label" for="access">Accessibility: </label>
          <div class="col-4">
            <p class="form-control-static">${accessibility ? accessibility : ''}</p>
          </div>
          <div class='col-1'>
            <button id='editAccess' class='btn btn-default edit-btn'>Edit</button>
          </div>
          <div class='col-5'>
            <input type="text"  id='access'  class="form-control edit-form"  />
          </div>
        </div>
        <div class="form-group row">
          <div class="col-lg-offset-2 col-2">
            <button id='submitEdits' type='submit' class='btn btn-default edit-form'>Save Edits</button>
          </div>
        </div>

      </form>
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
      $(e.currentTarget).closest('div').next().children('input').show()
      // $(e.currentTarget).closest('p').hide()

    // $(e.currentTarget).parent().next().show()


    })

    $('#editVenueForm').submit( e => {
      e.preventDefault()
      let venueId = document.location.href.match(/(\d+)$/)[0]
      let formData = e.target.elements
      let editedVenue = {}
      $(formData).each(function (i, val) {
        if (val.value) {
          editedVenue[val.id] = val.value
        }
      })
      console.log(editedVenue);
      console.log(venueId);
      $.ajax({
        url: `/api/venues/${venueId}`,
        method: 'PUT',
        data: editedVenue,
        success: data => {
          console.log('data came back from ajax ', data)
          $('#venueInfo').empty()
          showVenue(data)
        }
          ,
        fail: err => {
          console.log(err);
        }
        })
    })
  }



})
