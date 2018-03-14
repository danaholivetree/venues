$(document).ready(function() {

  $.get('/api/votes', data => {
    console.log('data came back from api votes ', data);
    data.forEach( vote => {
      let thumb = ''
      console.log(vote.vote);
      if (vote.vote === 'up') {
        thumb = 'thumb_up'
        console.log(thumb);
      } else if (vote.vote ==='down') {
        thumb = 'thumb_down'
        console.log(thumb);
      }
      console.log('vote.id ', vote.id);
      $('#dashVotes').append($(`<tr id=dashVoteRow${vote.id}><td>${vote.venue}</td><td><span><i class="material-icons md-18" >${thumb}</i><a href="#" class="close" data-id=${vote.id} aria-label="close">&times;</a></td>`))

    })
    $('.close').click( e => {
      e.preventDefault()
      console.log(  'e.target.dataset.id', e.target.dataset.id)
      $.ajax({
          url: "/api/votes",
          method: 'DELETE',
          data: {id: e.target.dataset.id}
        }).done( (data) => {
          console.log('data from done ', data);
          $(`#dashVoteRow${data.id}`).remove()
        });
    })
  })

})
