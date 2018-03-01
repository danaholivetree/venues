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
  }
  if (req.query.city) {
    query.andWhere('city', 'ilike', `${req.query.city}%`)
  }
  if (req.query.band) {
      query.andWhere('band', 'ilike', `%${req.query.band}%`)
  }
  if (req.query.genres) {
    req.query.genres.forEach( genre => {
        query.orWhere('genre', 'ilike', `%${genre}%`)
    })

  }
    query.then( bands => {
      res.setHeader('content-type', 'application/json')
      res.send(JSON.stringify({bands}))
    })
});

router.get('/genres', (req, res, next) => {
  return knex('bands')
    .select('genre')
    .then( genres => {
      let genreArray = genres.map( genre => {
        return genre.genre
      })
      for (let i = 0; i < genreArray.length; i++) {
        for (let j = i + 1; j < genreArray.length; j++) {
          if (genreArray[i] == genreArray[j]) {
            genreArray.splice(j, 1)
            j--
          }
        }
      }
      let reduced = genreArray.reduce( (acc, curr) => {
        return acc.concat(curr && ` ${curr}`)
      })
      reduced = reduced.split(' ')
      for (let k = 0; k < reduced.length; k++) {
        for (let l = k + 1; l < reduced.length; l++) {
          if (reduced[k] === reduced[l]) {
            reduced.splice(l, 1)
            l--
          }
        }
      }
      console.log(reduced);
      res.send(reduced)
    })
})

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
            return knex('bands')
              .select('*')
              .where('state', state[0])
              .orderBy('id', 'desc')
              .then( bands => {
                res.send(bands)
              })
          })
      }
    })
})

module.exports = router;
