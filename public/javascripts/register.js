$(document).ready(() => {

  $('#registerForm').submit( e => {
    e.preventDefault()
    console.log('name ', $('#regName').val());
    console.log('email ',  $('#regEmail').val());
    console.log('pw ',   $('#regPw').val());
    $.post('/users/register',
      {
        name: $('#regName').val(),
        email: $('#regEmail').val(),
        password: $('#regPw').val()
      }, data => {
        console.log('data ' ,data);
        window.location = data.redirectURL
    }).fail( err => {
      console.log(err);
        alert('Error: ' + err.responseText);
    })


  })
})
