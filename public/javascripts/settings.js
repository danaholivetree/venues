$(document).ready( () => {
  console.log('seeing settings');


  $.get(`/api/users/${userId}`, data => {
    console.log('got data ', data);
  })





})
