$(document).ready( () => {

  $('#loginForm').submit( e => {
    e.preventDefault()
    $.post(`/auth/login`, {email: $('#emailInput').val(), password: $('#pwInput').val()}, (data, status) => {
      console.log('data from login ', data);
      window.location = data.redirectURL
    })
  })
})
