var express = require('express');
var router = express.Router();
const knex = require('../knex')
const boom = require('boom')
const request = require('request')

router.get('/', (req, res, next) => {

  const client_id = process.env.SPOTIFY_CLIENT_ID;
  console.log('client_id ', client_id);
  const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
  console.log('client_secret ', client_secret);
  const authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: {
      Authorization:
        'Basic ' +
        new Buffer(client_id + ':' + client_secret).toString('base64')
    },
    form: {
      grant_type: 'client_credentials'
    },
    json: true
  };
  console.log('authOptions ', authOptions);
  request.post(authOptions, (error, response, data) => {
    console.log('data from spotify auth request ', data);
    // console.log('data.access_token ', data.access_token);
    if (!error && response.statusCode === 200) {
      res.send(data)
    }
  })
})
module.exports = router;
