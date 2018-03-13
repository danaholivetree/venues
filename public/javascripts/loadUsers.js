$(document).ready( () => {

  $.get(`/api/users`, data => {
    data.forEach( user => {

      $('#usersList').append($(`
        <tr>
          <td>${user.name}</td>
          <td>${user.contributions}</td>
        </tr>`))
    })
  })
})
