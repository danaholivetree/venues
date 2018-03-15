var express = require('express');
var router = express.Router();
const knex = require('../../knex')

/* GET bands page. */
router.get('/', function(req, res, next) {
  return knex('bands')
    .select('*')
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

  console.log('got to before genres, finished wheres req.query.genres ', req.query.genres);

  if (req.query.genres) {
    console.log('there are genres');
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
    console.log('rawGenreQuery ', rawGenreQuery);
    console.log('rawBindings ', rawBindings);
    query.andWhereRaw(rawGenreQuery)
  }
  console.log('got past genres');
  query.orderBy('state', 'asc')
  .orderBy('city', 'asc')
  .then( bands => {
    console.log('got bands ', bands);
      // res.setHeader('content-type', 'application/json')
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
