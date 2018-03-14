$(document).ready(function() {
  const {abbrState} = usStates

  $.get(`/api/bands`, (data, status) => {
    data.forEach( band => {
      let displayUrl = band.url ? band.url.split('/')[2].split('.').slice(1).join('.') : ''
      let spotifyUrl = band.spotify ? band.spotify.split('/')[4] : ''
      let spotifySrc = band.spotify ? `https://open.spotify.com/embed?uri=spotify:track:${spotifyUrl}&theme=white` : ''
      $('#bandsList').append($(`
        <tr>
          <td>${abbrState(band.state, 'abbr')}</td>
          <td>${band.city}</td>
          <td>${band.band}</td>
          <td>${band.genre}</td>
          <td><a href=${band.url} target='_blank'>${displayUrl}</a></td>
          <td><a href=${band.fb} target='_blank'>fb</a></td>
          <td><a href=${band.bandcamp} target='_blank'>bandcamp</a></td>
          <td><a href=${band.spotify} target='_blank'>spotify</a></td>
        </tr>`))
    })
  })

})