var express = require('express');
var router = express.Router();
const knex = require('../../knex')
const boom = require('boom')
var userId = 17


router.get('/', function(req, res, next) {
  // for production
  // let userId = req.cookies.user.id

  //just for testing
  if (req.cookies.user) {
    userId = req.cookies.user.id
  }

  console.log("userId", userId);
  console.log('req.query in regular get ', req.query);
  let bandQuery = knex('bands')
    .select(['bands.id', 'state', 'url', 'bandcamp', 'fb', 'spotify', 'city', 'band', 'genre', 'stars', 'band_stars.id as starred', 'band_bookmarks.id as bookmark'])
    .leftOuterJoin('band_stars', function() {
      this.on('bands.id', '=', 'band_stars.band_id').andOn('band_stars.user_id', '=', userId)
    })
    .leftOuterJoin('band_bookmarks', function() {
      this.on('bands.id', '=', 'band_bookmarks.band_id').andOn('band_bookmarks.user_id', '=', userId)
    })
    .orderBy('state', 'asc')
    .orderBy('city', 'asc')
    .orderBy('band', 'asc')
    .limit(25)

    if (req.query.offset) {
      bandQuery.offset(req.query.offset)
    }
    return bandQuery
      .then( bands => {
        res.send(bands)
      })
});

router.get('/q', function(req, res, next) {
  // for production
  // let userId = req.cookies.user.id
  //just for testing
  if (req.cookies.user) {
    userId = req.cookies.user.id
  }
  let {state, city, band, genres, starred, bookmarked } = req.query
  var query = knex('bands')
              .select('bands.id', 'state', 'city', 'band', 'genre', 'url', 'fb', 'bandcamp', 'spotify', 'stars', "band_stars.id as starred", "band_bookmarks.id as bookmark")

  if (state && state !== 'All') {
    query.where('state', req.query.state)
  }
  if (city) {
    query.andWhere('city', 'ilike', `${req.query.city}%`)
  }
  if (band) {
    query.andWhere('band', 'ilike', `%${req.query.band}%`)
  }

  if (genres) {
    genres = genres.split(',')
    console.log('genres ', genres);
    var rawGenreQuery = ''
    var rawBindings = []
    genres.forEach( (genre, i) => {
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

  if (starred === 'true') {
      query.innerJoin('band_stars', function() {
        this.on('bands.id', '=', 'band_stars.band_id').andOn('band_stars.user_id', '=', userId)
      })
  } else {
    query.leftOuterJoin('band_stars', function() {
      this.on('bands.id', '=', 'band_stars.band_id').andOn('band_stars.user_id', '=', userId)
    })
  }
  if (bookmarked === 'true') {
      query.innerJoin('band_bookmarks', function() {
        this.on('bands.id', '=', 'band_bookmarks.band_id').andOn('band_bookmarks.user_id', '=', userId)
      })
      var bookmarks = true
  } else {
   query.leftOuterJoin('band_bookmarks', function() {
     this.on('bands.id', '=', 'band_bookmarks.band_id').andOn('band_bookmarks.user_id', '=', userId)
   })
 }

  query.orderBy('state', 'asc')
  .orderBy('city', 'asc')
  .orderBy('band', 'asc')
  .limit(25)

  if (req.query.offset) {
    query.offset(req.query.offset)
  }
  return query
    .then( bands => {
      console.log('bands ', bands.slice(0,5));
      res.send(bands)
    })
})

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
  // for production
  // let userId = req.cookies.user.id
  //just for testing
  if (req.cookies.user) {
    userId = req.cookies.user.id
  }
  console.log('req.body.newBand ', req.body.newBand);
  const {state, city, band, url, fb, bandcamp, spotify, genres} = req.body.newBand
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
        return next(boom.badRequest('This band is already in the database'))
        // return boom.badRequest('This band is already in the database')
      } else {
        return knex('users')
          .where('id', userId)
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
