var express = require('express');
var router = express.Router();
const knex = require('../knex')
const boom = require('boom')

/* GET home page. */
router.get('/', function(req, res, next) {
  return knex('venues')
    .select('*')
    .then( venues => {
      res.render('venues', {venues, title: 'Venues'})
    })
});

router.get('/q', function(req, res, next) {
  var query = knex('venues')
              .select('*')

  if (req.query.state && req.query.state !== 'All') {
    query.where('state', req.query.state)
    if (req.query.city) {
      query.andWhere('city', 'ilike', `${req.query.city}%`)
    }
    if (req.query.venue) {
      query.andWhere('venue', 'ilike', `%${req.query.venue}%`)
    }
  } else if (req.query.state === 'All') {
    if (req.query.city) {
      query.where('city', 'ilike', `${req.query.city}%`)
      if (req.query.venue) {
        query.andWhere('venue', 'ilike', `%${req.query.venue}%`)
      }
    } else if (req.query.venue) {
      query.where('venue', 'ilike', `%${req.query.venue}%`)
    }
  }

  if (req.query.capacity) {
    console.log(req.query.capacity)
  }
    query.orderBy('city', 'asc')
    query.then( venues => {
      res.setHeader('content-type', 'application/json')
      res.send(JSON.stringify({venues}))
    })
});

router.post('/', (req, res, next) => {
  const {state, city, venue, capacity, email, url, diy} = req.body
  var newVenue = {state, city, venue, url}
  if (capacity) {
    newVenue.capacity = capacity
  }
  if (email) {
    newVenue.email = email
  }
  if (diy) {
    newVenue.diy = diy
  } else {
    newVenue.diy = false
  }
  return knex('venues')
    .select('*')
    .where({city, venue})
    .then( exists => {
      if (exists[0]) {
        throw boom.badRequest('venue already exists in db')
      } else {
        return knex('venues')
          .insert(newVenue, 'state')
          .then( state => {
            console.log('state of added venue ', state[0])
            return knex('venues')
              .select('*')
              .where('state', state[0])
              .orderBy('id', 'desc')
              .then( venues => {
                console.log('venues of that state ', venues);
                res.send(venues)
              })
          })
      }
    })
})

module.exports = router;
