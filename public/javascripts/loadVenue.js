$(document).ready(function() {
  let venueId = document.location.href.match(/(\d+)$/)[0]
  $.get(`/api/venues/${venueId}`, data => {
    showVenue(data)

  }).fail( err => {
    console.log('error ' , err);
  })


  const showVenue = data => {
    const {id, venue, url, state, city, capacity, email, genres, type, crowd, ages, pay, promo, accessibility} = data

    $('#venueInfo').append($(`
     <h3> ${venue} </h3>
       <button id='editVenue' class='btn default'>Edit All</button>
      <form id='editVenueForm'>
        <p> <strong> Location: </strong> ${city}, ${state} </p>
        <p> <strong> Website: </strong> ${url}  <input type="text" id='url' value=${url} class="form-control edit-form aria-label="Default" aria-describedby="inputGroup-sizing-default" /> <button id='editUrl' class='btn default edit-btn'>Edit</button> </p>
        <p> <strong> Booking: </strong> ${email ? email : ''} <input type="email" id='email' class="form-control edit-form " aria-label="Default" aria-describedby="inputGroup-sizing-default" /> <button id='editEmail' class='btn default edit-btn'>Edit</button></p>
        <p> <strong> Capacity: </strong> ${capacity ? capacity : ''} <input type="number" id='capacity'  class="form-control edit-form" aria-label="Default" aria-describedby="inputGroup-sizing-default" /> <button id='editCap' class='btn default edit-btn'>Edit</button></p>
        <p> <strong> Genres booked: </strong >${genres ? genres : ''} <input type="text" id='genres' class="form-control edit-form" aria-label="Default" aria-describedby="inputGroup-sizing-default" /> <button id='editGenres' class='btn default edit-btn'>Edit</button></p>
        <p> <strong> Type of venue: </strong> ${type ? type : ''} <input type="text" id='type' class="form-control edit-form" aria-label="Default" aria-describedby="inputGroup-sizing-default" /> <button id='editType' class='btn default edit-btn'>Edit</button></p>
        <p> <strong> Type of crowd: </strong> ${crowd ? crowd : ''} <input type="text" id='crowd' class="form-control edit-form" aria-label="Default" aria-describedby="inputGroup-sizing-default" /> <button id='editCrowd' class='btn default edit-btn'>Edit</button></p>
        <p> <strong> Ages: </strong> ${ages ? ages : ''} <input type="text" id='ages' class="form-control edit-form" aria-label="Default" aria-describedby="inputGroup-sizing-default" /> <button id='editAges' class='btn default edit-btn'>Edit</button></p>
        <p> <strong> Pay structure: </strong> ${pay ? pay : ''} <input type="text" id='pay' class="form-control edit-form" aria-label="Default" aria-describedby="inputGroup-sizing-default" /> <button id='editPay' class='btn default edit-btn'>Edit</button></p>
        <p> <strong> Promo info: </strong> ${promo ? promo : ''} <input type="text" id='promo' class="form-control edit-form" aria-label="Default" aria-describedby="inputGroup-sizing-default" /> <button id='editPromo' class='btn default edit-btn'>Edit</button></p>
        <p> <strong> Accessibility: </strong> ${accessibility ? accessibility : ''} <input type="text" id='access' class="form-control edit-form" aria-label="Default" aria-describedby="inputGroup-sizing-default" /> <button id='editAccess' class='btn default edit-btn'>Edit</button></p>
        <button id='submitEdits' type='submit' class='btn default edit-form'>Save Edits</button>
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
      $(e.currentTarget).prev().show()
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
