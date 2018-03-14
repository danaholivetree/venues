$(document).ready(function() {

  $.get('/api/votes', data => {
    console.log('data ' , data);
    if (data.length === 0) {
        $('#dashVotes').append($(`<tr><td>No votes</td></tr>`))
    } else {
      data.forEach( vote => {
        $('#dashVotes').append($(`<tr id=dashVoteRow${vote.id}><td>${vote.venue}</td><td><span><i class="material-icons md-18" >thumb_${vote.vote}</i><a href="#" class="close" data-id=${vote.id} aria-label="close">&times;</a></td>`))
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
})
