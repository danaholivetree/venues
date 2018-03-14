$(document).ready(function() {

  $.get('/api/votes', data => {
    console.log('data came back from api votes ', data);
  })

})
