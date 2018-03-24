$(document).ready( () => {

  let tries = 0
  $('#loginForm').submit( e => {
    e.preventDefault()
    $.post(`/auth/login`, {email: $('#emailInput').val(), password: $('#pwInput').val()}, data => {
      window.location = data.redirectURL
    }).fail((err) => {
      tries++
      if (tries === 3) {
        $('#errorMessage').html(`<div>Email tourpopsicle@gmail.com if you are having trouble logging in to your account.</div>`)
      }
      // if (tries > 5) {
      //   $.post(`/auth/login/block`, {email: $('#emailInput').val()}, data => {
      //     window.location = data.redirectURL
      //   }
      // }
      $('#errorMessage').html(`<div class="alert alert-danger" role="alert">
        ${err.responseText}</div>`)
    })
  })
})
