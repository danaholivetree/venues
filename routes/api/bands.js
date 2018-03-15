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
  console.log('req.body ', req.body.newBand);
  let data = JSON.parse(req.body.newBand)
  console.log('data ', data);
  const {state, city, band, url, fb, bandcamp, spotify, genres} = data
  console.log('genres ', genres);

  var newBand = {state, city, band}
  console.log('newBand with just state city and band ', newBand);
  if (url) {
    console.log('there was a url ', url);
    newBand.url = url
  }
  if (fb) {
    console.log('there was a fb ', fb);
    newBand.fb = fb
  }
  if (bandcamp) {
    console.log('there was a bandcamp ', bandcamp);
    newBand.bandcamp = bandcamp
  }
  if (spotify) {
    newBand.spotify = spotify
  }
  if (genres.length > 0) {
    console.log(genres.join(' '));
    newBand.genre = genres.join(' ')
  }

  return knex('bands')
    .select('*')
    .where('band', newBand.band)
    .then( exists => {
      console.log('exists ', exists);
      if (exists[0]) {
        throw boom.badRequest('band already exists in db')
      } else {
        return knex('bands')
          .insert(newBand, 'state')
          .then( state => {
            console.log('state[0] ', state[0] );
            return knex('bands')
              .select('*')
              .where('state', state[0])
              .orderBy('id', 'desc')
              .then( bands => {
                console.log('bands ', bands);
                res.send(bands)
              })
          })
      }
    })
})

module.exports = router;
