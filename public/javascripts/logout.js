$(document).ready( () => {

  $('#logout').click( e => {
    e.preventDefault()
    $.post(`/auth/logout`, (data, status) => {
      console.log('data from logout ', data);
      window.location = data.redirectURL
    })
  })
})
