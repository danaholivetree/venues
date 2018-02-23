$(document).ready(function() {


  let states = ['Alabama','Alaska','Arizona','Arkansas','California','Colorado',
  'Connecticut','Delaware','DC','Florida','Georgia','Hawaii','Idaho','Illinois',
  'Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland',
  'Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana',
  'Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York',
  'North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania',
  'Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah',
  'Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming']
  for (let i = 0; i <= states.length; i++ ) {
    states[i] !== "Colorado" ?
    $('#stateSelector').append($(`<option value=${states[i]}>${states[i]}</option>`)) :
    $('#stateSelector').append($(`<option value=${states[i]} selected>${states[i]}</option>`))
  }


  $('#searchForm').submit( e => {
    e.preventDefault()
    let formData = e.target.elements
    let state = formData.state.value
    let city = formData.city.value
    let venue = formData.venue.value
    let capacity = formData.capacity.value
    const params = {state, city, venue, capacity}
    const queryString = $.param(params)
    console.log('queryString ', `/venues/q?${queryString}`);
    $.get(`/venues/q?${queryString}`, (data, status) => {
        $('#venuesList').empty()
        data.venues.forEach( venue => {
          let urlText = (venue.url.split('/')[2] === 'www.facebook.com') ? 'facebook' : 'website'
          $('#venuesList').append($(`
            <tr>
              <td>${venue.state}</td>
              <td>${venue.city}</td>
              <td>${venue.venue}</td>
              <td><a href=${venue.url} target='_blank'>${urlText}</a></td>
              <td>${venue.capacity}</td>
              <td>${venue.diy}</td>
              <td>${venue.up} <i class="material-icons md-18">thumb_up</i></td>
              <td>${venue.down} <i class="material-icons md-18">thumb_down</i></td>
            </tr>
          `))
        })


    })
  })




})
