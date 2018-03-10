$(document).ready( () => {

  $('#logout').click( e => {
    e.preventDefault()
    $.post(`/users/logout`, (data, status) => {
      console.log('data from logout ', data);
      window.location = data.redirectURL
    })
  })
})
