$(document).ready(function() {
  const {abbrState} = usStates

  $.get(`/api/venues`, (data, status) => {
    data.forEach( venue => {
      let urlText = (venue.url.split('/')[2] === 'www.facebook.com') ? 'facebook' : 'website'
      let capText = venue.capacity ? venue.capacity : ''
      let venueText = `${venue.venue}`
      if (venue.diy) {
        venueText = venueText + '*'
      }

      $('#venuesList').append($(`
        <tr>
          <td>${abbrState(venue.state, 'abbr')}</td>
          <td>${venue.city}</td>
          <td>${venueText}</td>
          <td><a href=${venue.url} target='_blank'>${urlText}</a></td>
          <td>${capText}</td>
          <td id=upVote${venue.id}>${venue.up} <button class='btn btn-default'> <i class="material-icons md-18">thumb_up</i></button></td>
          <td id=downVote${data.id}>${venue.down}<button class='btn btn-default'><i class="material-icons md-18">thumb_down</i></button></td>
        </tr>
      `))
    })

  })
})
