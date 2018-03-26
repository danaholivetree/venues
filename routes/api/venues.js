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

router.get('/:id', function(req, res, next) {
  return knex('venues')
    .where('venues.id', Number(req.params.id))
    .leftOuterJoin('venue_profiles', 'venues.id', 'venue_profiles.venue_id')
    .rightOuterJoin('users', 'users.id', 'venues.contributed_by')
    .select('venues.id as id', 'venue', 'state', 'url', 'venues.email', 'city', 'genres_booked as genres', 'capacity', 'seated', 'ages', 'accessibility', 'type', 'crowd', 'pay', 'promo', 'diy', 'users.name as contributedBy')
    .first()
    .then( venue => {
      console.log('got the venue ', venue);
      res.send(venue)
    })
});

router.get('/q', function(req, res, next) {
  console.log(req.query);
  var query = knex('venues')
              .select('*')
  const addState = (state) => {
    if (state !== 'All') {
      console.log('adding state ', state);
      return query.where('state', state)
    }
  }
  const addCity = (city) => {
    console.log('adding city ', city);
    return query.where('city', 'ilike', `${city}%`)
  }
  const addVenue = (venue) => {
    console.log('adding venue ', venue);
    return query.where('venue', 'ilike', `%${venue}%`)
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
    console.log('venues matched', venues);
      res.send(venues)
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
    console.log('diy was true ', diy);
    newVenue.diy = diy
    console.log('set newVenue.diy to true ', newVenue.diy);
  } else {
    newVenue.diy = false
    console.log('set newVenue.diy to false ' , newVenue.diy);
  }
  return knex('venues')
    .select('*')
    .where({city, venue})
    .then( exists => {
      if (exists[0]) {
        throw boom.badRequest('venue already exists in db')
      } else {
        console.log('req.cookies.user.id ', req.cookies.user.id);
        return knex('users')
          .where('id', req.cookies.user.id)
          .increment('contributions', 1)
          .then( () => {
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
          })

      }
    })
})

router.put('/:id', (req, res, next) => {
  console.log(Number(req.params.id));
  const {url, email, capacity, genres, type, crowd, ages, accessibility, pay, promo} = req.body
  let toVenues = {}
  let toProfile = {}
  if (url) {
    toVenues.url = url
  }
  if (email) {
    toVenues.email = email
  }
  if (capacity) {
    toVenues.capacity = capacity
  }
  if (genres) {
    toProfile.genres_booked = genres
  }
  if (type) {
    toProfile.type = type
  }
  if (crowd) {
    toProfile.crowd = crowd
  }
  if (ages) {
    toProfile.ages = ages
  }
  if (accessibility) {
    toProfile.accessibility = accessibility
  }
  if (pay) {
    toProfile.pay = pay
  }
  if (promo) {
    toProfile.promo = promo
  }
  let updatedVenue = {}
  return knex('venues')
    .where('id', Number(req.params.id))
    .update(toVenues)
    .returning('*')
    .then ( venue => {
      updatedVenue = venue[0]
      // let profileQuery = knex('venue_profiles').where('venue_id', Number(req.params.id))
      return knex('venue_profiles')
        .where('venue_id', Number(req.params.id))
        .first()
        .then (exists => {
          if (exists) {
            return knex('venue_profiles')
              .where('venue_id', Number(req.params.id))
              .update(toProfile)
              .returning(['genres_booked as genres', 'type', 'crowd', 'ages', 'accessibility', 'pay', 'promo'])
              .then( newData => {
                for (let key in newData[0]) {
                  updatedVenue[key] = newData[0][key]
                }
                res.send(updatedVenue)
              })
          } else {
            toProfile.venue_id = Number(req.params.id)
            return knex('venue_profiles')
              .insert(toProfile)
              .returning(['genres_booked as genres', 'type', 'crowd', 'ages', 'accessibility', 'pay', 'promo'])
              .then( newData => {
                console.log(newData[0]);
                for (let key in newData[0]) {
                  updatedVenue[key] = newData[0][key]
                }
                res.send(updatedVenue)
              })
          }
        })
    })



})

module.exports = router;
