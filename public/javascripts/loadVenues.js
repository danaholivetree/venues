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
          <td id=upVote${venue.id}><span>${venue.up}</span><button class='btn btn-default thumb-up' data-id=${venue.id}> <i class="material-icons md-18"  data-id=${venue.id}>thumb_up</i></button></td>
          <td id=downVote${venue.id}><span>${venue.down}</span><button class='btn btn-default thumb-down' data-id=${venue.id}><i class="material-icons md-18" data-id=${venue.id}>thumb_down</i></button></td>
        </tr>
      `))

      if (venue.vote === 'up') {
        $(`#upVote${venue.id} button`).css("color", "green")
      }
      if (venue.vote === 'down') {
        $(`#downVote${venue.id} button`).css("color", "red")
      }
    })

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

  })



})
