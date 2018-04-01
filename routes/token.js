var express = require('express');
var router = express.Router();
const knex = require('../knex')
const boom = require('boom')
const request = require('request')

router.get('/spotify', (req, res, next) => {

  const client_id = process.env.SPOTIFY_CLIENT_ID;
  const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
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
    if (!error && response.statusCode === 200) {
      res.send(data)
    }
  })
})

router.get('/facebook/venues/:qs', (req, res, next) => {

  const app_id = process.env.FACEBOOK_APP_ID;
  const app_secret = process.env.FACEBOOK_APP_SECRET;
  const query = req.params.qs
  let uri = `https://graph.facebook.com/v2.12/${query}?`
  let qs = `fields=name,about, website,single_line_address,emails,location,events{name,start_time,id}`
  // let auth = `&access_token=${app_id}|${app_secret}`
  let auth = `&access_token=${process.env.TEMP_TOKEN}`
  request.get({url: uri+qs+auth, json: true}, (error, response, data) => {
    if (!error && response.statusCode === 200) {
      res.send(data)
    }
    console.log('data ', data);

  })
})


router.get('/facebook/bands/:qs', (req, res, next) => {

  const app_id = process.env.FACEBOOK_APP_ID;
  const app_secret = process.env.FACEBOOK_APP_SECRET;
  const query = req.params.qs
  let uri = `https://graph.facebook.com/v2.12/${query}?`
  let qs = `fields=name,website,link,genre,hometown,current_location,fan_count,events.limit(5){name,start_time,place{name,location{city,state}}}`
  //
  // let auth = `&access_token=${app_id}|${app_secret}`
  let auth = `&access_token=${process.env.TEMP_TOKEN}`
  request.get({url: uri+qs+auth, json: true}, (error, response, data) => {
    console.log('got data from bands ' , data);
    if (!error && response.statusCode === 200) {
      res.send(data)
    }

  })
})


module.exports = router;
