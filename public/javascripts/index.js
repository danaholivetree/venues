$(document).ready(function() {

  $.get('/api/votes', data => {
    if (data.length === 0) {
        $('#dashVotes').append($(`<tr><td>No votes</td></tr>`))
    } else {
      data.forEach( vote => {
        $('#dashVotes').append($(`<tr id=dashVoteRow${vote.id}><td class="voteVenue">${vote.venue}</td><td><span><i class="material-icons md-18" >thumb_${vote.vote}</i><a href="#" class="close" data-id=${vote.id} aria-label="close">&times;</a></td>`))
      })

      $('.close').click( e => {
        e.preventDefault()
        $.ajax({
            url: "/api/votes",
            method: 'DELETE',
            data: {id: e.target.dataset.id}
          }).done( data => {
            $(`#dashVoteRow${data.id}`).remove()
          });
      })
    }
  })

  $.get('/api/stars', data => {
    if (data.length === 0) {
        $('#dashStars').append($(`<tr><td>No starred bands</td></tr>`))
    } else {
      data.forEach( star => {
        $('#dashStars').append($(`<tr id=dashStarRow${star.id}><td class="voteVenue">${star.band}</td><td><a href="#" class="close" data-id=${star.id} aria-label="close">&times;</a></td>`))
      })

      $('.close').click( e => {
        e.preventDefault()
        $.ajax({
            url: "/api/stars",
            method: 'DELETE',
            data: {id: e.target.dataset.id}
          }).done( data => {
            $(`#dashStarRow${data.id}`).remove()
          });
      })
    }
  })


})
