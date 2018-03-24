$(document).ready(function() {
  let venueId = document.location.href.match(/(\d+)$/)
  console.log('got venueId ', venueId[0]);
  $.get(`/api/venues/${venueId[0]}`, data => {
    console.log('got data from venue ', data)
    showVenue(data)
  }).fail( err => {
    console.log('error ' , err);
  })

  const showVenue = data => {
    const {venue, state, city, capacity, genres, type, crowd, ages, pay, promo, accessibility} = data


    $('#venueInfo').append($(`
      <h3> ${venue} </h3>
      <p> <strong> Location: </strong>${city}, ${state}</p>
      <p> <strong> Capacity: </strong>${capacity ? capacity : ''}</p>
      <p> <strong> Genres booked: </strong>${genres ? genres : ''}</p>
      <p> <strong> Type of venue: </strong>${type ? type : ''}</p>
      <p> <strong> Type of crowd: </strong>${crowd ? crowd : ''}</p>
      <p> <strong> Ages: </strong>${ages ? ages : ''}</p>
      <p> <strong> Pay structure: </strong>${pay ? pay : ''}</p>
      <p> <strong> Promo info: </strong>${promo ? promo : ''}</p>
      <p> <strong> Accessibility: </strong>${accessibility ? accessibility : ''}</p>
    `))



  }

})
