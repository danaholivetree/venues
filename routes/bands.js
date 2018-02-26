var express = require('express');
var router = express.Router();
const knex = require('../knex')

/* GET home page. */
router.get('/', function(req, res, next) {
  return knex('bands')
    .select('*')
    .then( bands => {
      res.render('bands', {bands, title: 'Bands'})
    })
});

router.get('/q', function(req, res, next) {
  var query = knex('bands')
              .select('*')

  if (req.query.state && req.query.state !== 'All') {
    query.where('state', req.query.state)
    if (req.query.band) {
      query.andWhere('band', 'ilike', `%${req.query.band}%`)
    }
    if (req.query.city) {
      query.andWhere('city', 'ilike', `${req.query.city}%`)
    }
  } else if (req.query.state === 'All') {
    if (req.query.band) {
      query.where('band', 'ilike', `%${req.query.band}%`)
      if (req.query.city) {
        query.where('city', 'ilike', `${req.query.city}%`)
      }
    } else if (req.query.city) {
      query.where('city', 'ilike', `${req.query.city}%`)
    }
  }

  if (req.query.genre) {
    console.log(req.query.genre)
  }
    query.then( bands => {
      console.log('bands came back from db', bands);
      res.setHeader('content-type', 'application/json')
      res.send(JSON.stringify({bands}))
    })
});

router.post('/', (req, res, next) => {
  const {state, city, band, url, fb, bandcamp, spotify, genre} = req.body
  var newBand = {state, city, band}
  if (url) {
    newBand.url = url
  }
  if (fb) {
    newBand.fb = fb
  }
  if (bandcamp) {
    newBand.bandcamp = bandcamp
  }
  if (spotify) {
    newBand.spotify = spotify
  }
  if (genre) {
    newBand.genre = genre
  }

  return knex('bands')
    .select('*')
    .where('band', newBand.band)
    .then( exists => {
      if (exists[0]) {
        throw boom.badRequest('band already exists in db')
      } else {
        return knex('bands')
          .insert(newBand, 'state')
          .then( state => {
            console.log('state of added band ', state[0])
            return knex('bands')
              .select('*')
              .where('state', state[0])
              .orderBy('id', 'desc')
              .then( bands => {
                console.log('bands of that state ', bands);
                res.send(bands)
              })
          })
      }
    })
})

module.exports = router;
