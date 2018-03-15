var express = require('express');
var router = express.Router();
const knex = require('../../knex')
const boom = require('boom')

router.get('/', function(req, res, next) {
  return knex('venue_votes')
    .select(['venues.id', 'state', 'url', 'city', 'venue', 'capacity', 'diy', 'seated', 'up', 'down', 'vote'])
    .rightOuterJoin('venues', function() {
      this.on('venues.id', '=', 'venue_votes.venue_id').andOn('venue_votes.user_id', '=', req.cookies.user.id)
    })
    .orderBy('state', 'asc')
    .orderBy('city', 'asc')
    .orderBy('venue', 'asc')
    .then( venues => {
      res.send(venues)
    })
});

router.get('/q', function(req, res, next) {
  var query = knex('venues')
              .select('*')
  const addState = (state) => {
    if (state !== 'All') {
      return query.where('state', state)
    }
  }
  const addCity = (city) => {
    return query.where('city', 'ilike', `${req.query.city}%`)
  }
  const addVenue = (venue) => {
    return query.where('venue', 'ilike', `%${req.query.venue}%`)
  }

  if (req.query.state) {
    addState(req.query.state)
  }
  if (req.query.city) {
    addCity(req.query.city)
  }
  if (req.query.venue) {
    addVenue(req.query.venue)
  }

  var rawCapQuery = ''
  var rawBindings = []
  if (req.query.capacity[0] !== 'any') {
      req.query.capacity.forEach( (cap, i) => {
        if (i === 0) {
          if (cap !== 'capxl' && cap !== 'unlabeled') {
              rawCapQuery += ' capacity BETWEEN ? and ?'
          }
          if (cap === 'capxl') {
            rawCapQuery += ' capacity > ?'
          }
          if (cap === 'unlabeled') {
            rawCapQuery += ' capacity IS NULL'
          }
          if (cap === 'capxs') rawBindings = rawBindings.concat([0, 100])
          if (cap === 'caps') rawBindings = rawBindings.concat([101, 250])
          if (cap === 'capm') rawBindings = rawBindings.concat([251, 600])
          if (cap === 'capl') rawBindings = rawBindings.concat([601, 1200])
          if (cap === 'capxl') rawBindings = rawBindings.concat([1200])
        }
        if (i > 0) {
          if (cap !== 'capxl' && cap !== 'unlabeled') {
              rawCapQuery += ' OR capacity BETWEEN ? AND ?'
          }
          if (cap === 'capxl') {
            rawCapQuery += ' OR capacity > ?'
          }
          if (cap === 'unlabeled') {
            rawCapQuery += ' capacity IS NULL'
          }
          if (cap === 'capxs') rawBindings = rawBindings.concat([0, 100])
          if (cap === 'caps') rawBindings = rawBindings.concat([101, 250])
          if (cap === 'capm') rawBindings = rawBindings.concat([251, 600])
          if (cap === 'capl') rawBindings = rawBindings.concat([601, 1200])
          if (cap === 'capxl') rawBindings = rawBindings.concat(['capacity', 1200])
        }
      })
  }
  rawCapQuery = '(' + rawCapQuery + ')'
  if (req.query.capacity[0] !== 'any') query.andWhereRaw(rawCapQuery, rawBindings)

  query.orderBy('state', 'asc').orderBy('city', 'asc').then( venues => {
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
            return knex('venues')
              .select('*')
              .where('state', state[0])
              .orderBy('id', 'desc')
              .then( venues => {
                res.send(venues)
              })
          })
      }
    })
})

module.exports = router;
