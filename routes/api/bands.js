var express = require('express');
var router = express.Router();
const knex = require('../../knex')

/* GET bands page. */
router.get('/', function(req, res, next) {
  return knex('band_stars')
    .select(['bands.id', 'state', 'url', 'bandcamp', 'fb', 'spotify', 'city', 'band', 'genre', 'stars', 'band_stars.band_id as starred'])
    .rightOuterJoin('bands', function() {
      this.on('bands.id', '=', 'band_stars.band_id').andOn('band_stars.user_id', '=', req.cookies.user.id)
    })
    .orderBy('state', 'asc')
    .orderBy('city', 'asc')
    .orderBy('band', 'asc')
    .then( bands => {
      res.send(bands)
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
    var rawGenreQuery = ''
    var rawBindings = []
    req.query.genres.forEach( (genre, i) => {
      if (i === 0) {
        rawGenreQuery += `genre ilike '%${genre}%' `
      }
      if (i > 0) {
        rawGenreQuery += `or genre ilike '%${genre}%' `
      }
      rawBindings.push(genre)
      // query.orWhere('genre', 'ilike', `%${genre}%`)
    })

    rawGenreQuery = '(' + rawGenreQuery + ')'
    query.andWhereRaw(rawGenreQuery)
  }
  query.orderBy('state', 'asc')
  .orderBy('city', 'asc')
  .then( bands => {
      res.send(bands)
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
      res.send(reduced)
    })
})

router.post('/', (req, res, next) => {
  let data = JSON.parse(req.body.newBand)
  const {state, city, band, url, fb, bandcamp, spotify, genres} = data
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
  if (genres.length > 0) {
    newBand.genre = genres.join(' ')
  }

  return knex('bands')
    .select('*')
    .where('band', newBand.band)
    .then( exists => {
      if (exists[0]) {
        throw boom.badRequest('band already exists in db')
      } else {
        return knex('users')
          .where('id', req.cookies.user.id)
          .increment('contributions', 1)
          .then( () => {
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
          })
      }
    })
})

module.exports = router;
