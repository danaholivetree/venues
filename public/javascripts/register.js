$(document).ready(() => {

  $('#registerForm').submit( e => {
    e.preventDefault()
    let name = $('#regName').val()
    let email = $('#regEmail').val()
    let password = $('#regPw').val()

    // console.log('name ', $('#regName').val());
    // console.log('email ',  $('#regEmail').val());
    // console.log('pw ',   $('#regPw').val());
    $.post('/auth/register', {name, email, password}, data => {
        window.location = data.redirectURL
    }).fail( err => {
      $('#registerErrorMessage').html(`<div class="alert alert-danger" role="alert">${err.responseText}</div>`)
    })


  })
})
