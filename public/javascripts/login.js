$(document).ready( () => {

  $('#loginForm').submit( e => {
    e.preventDefault()
    $.post(`/users/login`, {email: $('#emailInput').val(), password: $('#pwInput').val()}, (data, status) => {
      console.log('data from login ', data);
      window.location = data.redirectURL
    })
  })
})
