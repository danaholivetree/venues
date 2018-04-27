var express = require('express');
var router = express.Router();
const knex = require('../knex')
const boom = require('boom')
const request = require('request')
const scrapeIt = require('scrape-it')

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
  request.post(authOptions, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      res.send(body)
    }
  })
})

router.get('/facebook/venues/:qs', (req, res, next) => {

  const app_id = process.env.FACEBOOK_APP_ID;
  const app_secret = process.env.FACEBOOK_APP_SECRET;
  const query = req.params.qs
  let uri = `https://graph.facebook.com/v2.12/${query}?`
  let qs = `fields=name,about,link,website,single_line_address,emails,location,events.time_filter(upcoming){name,start_time,id}`
  //use app token (once approved)
  // let auth = `&access_token=${app_id}|${app_secret}`
  //use token stolen from graph api for testing
  let auth = `&access_token=${process.env.TEMP_TOKEN}`
  //use user access token
  // let auth = `&access_token=${req.cookies.user.accessToken}`
  request.get({url: uri+qs+auth, json: true}, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      res.send(body)
    } else {
      console.log(body.error.message);
      res.send(body)
    }
  })
})


router.get('/facebook/bands/:qs', (req, res, next) => {

  const app_id = process.env.FACEBOOK_APP_ID;
  const app_secret = process.env.FACEBOOK_APP_SECRET;
  const query = req.params.qs
  console.log(req.params.qs);
  let uri = `https://graph.facebook.com/v2.12/${query}`
  let qs = `?fields=name,website,link,genre,hometown,current_location,category,fan_count,events.limit(5){name,start_time,place{name,location{city,state}}}`
  //use app token (once approved)
  // let auth = `&access_token=${app_id}|${app_secret}`
  //use token stolen from graph api for testing
  let auth = `&access_token=${process.env.TEMP_TOKEN}`
  //use user access token doesn't work either
  // let auth = `&access_token=${req.cookies.user.accessToken}`
  request.get({url: uri+qs+auth, json: true}, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      res.send(body)
    } else if (body.error) {
      console.log(body.error);
      if (body.error.code == 803) { //try adding music to fb name
        console.log('try adding music to fb name');
        request.get({url: uri+'music'+qs+auth, json: true}, (error, response, body) => {
          console.log(body)
          if (!error && response.statusCode === 200) {
            res.send(body)
          } else {
            console.log(body.error);
            // res.send(body)
          }
        })
      }
    } else {
      //shouldn't ever get here, i dont think
      res.send({error: {message: 'no such data'}})
    }

  })
})

router.get('/si/:q', (req, res, next) => {
  let query = req.params.q
  console.log('query ', query);
  scrapeIt(`https://www.indieonthemove.com/venues/view/${query}`, {
    genres: '.alignleft ul li:nth-of-type(6)',
    capacity: '.alignleft ul li:nth-of-type(7)',
    ages: '.alignleft ul li:nth-of-type(8)'
  }).then(({ data, response }) => {
      console.log(data)
      let {genres, ages, capacity} = data
      genres = genres.slice(8)
      ages = ages.slice(5)
      capacity = capacity.slice(10)
      res.send({genres, ages, capacity})
  })

})


module.exports = router;
