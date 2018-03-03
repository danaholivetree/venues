var express = require('express');
var router = express.Router();
const knex = require('../knex')
const boom = require('boom')

/* GET home page. */
router.get('/', function(req, res, next) {
  return knex('venues')
    .select('*')
      .orderBy('state', 'asc')
      .orderBy('city', 'asc')
    .orderBy('venue', 'asc')


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

  // if (req.query.capacity[0] !== 'any') {
  //     req.query.capacity.forEach( cap => {
  //       if (cap === 'unlabeled') query.whereNull('capacity')
  //       if (cap === 'capxs') query.andWhere('capacity', '<', 101)
  //       if (cap === 'caps') query.orWhere('capacity', '>', 100).andWhere('capacity', '<', 251)
  //       if (cap === 'capm') query.orWhere('capacity', '>', 250).andWhere('capacity', '<', 601)
  //       if (cap === 'capl') query.orWhere('capacity', '>', 600).andWhere('capacity', '<', 1201)
  //       if (cap === 'capxl') query.orWhere('capacity', '>', 1200)
  //     })
  // }
  if (req.query.capacity[0] !== 'any') {
      req.query.capacity.forEach( cap => {
        if (cap === 'unlabeled') query.whereNull('capacity')
        if (cap === 'capxs') query.orWhereBetween('capacity', [0,100])
        if (cap === 'caps') query.orWhereBetween('capacity', [101,250])
        if (cap === 'capm') query.orWhereBetween('capacity', [251,600])
        if (cap === 'capl') query.orWhereBetween('capacity', [601,1200])
        if (cap === 'capxl') query.orWhere('capacity', '>', 1200)
      })
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

router.post('/vote', (req, res, next) => {
  const {venueId, userId, vote} = req.body
  return knex('venue_votes')
    .where('user_id', userId).andWhere('venue_id', venueId)
    .first()
    .then( exists => {
      if (!exists) {
        return knex('venue_votes')
          .insert({user_id: userId, venue_id: venueId, vote})
          .then( inserted => {
            console.log('trying to increment up on venue where id is ', venueId);
            return knex('venues')
              .where('id', venueId)
              .increment(`${vote}`, 1)
              .returning('*')

              .then( updated => {
                console.log('updated ', updated);
                res.send(updated[0])
              })
          })
      }
      else if (exists.vote === vote) {
        throw boom.badRequest(`you\'ve already voted thumbs-${vote} for this venue`)
      } else {
        return knex('venue_votes')
          .where('user_id', userId).andWhere('venue_id', venueId)
          .update('vote', vote)
          .returning('*')
          .then( updated => {
            let thisVote = (vote === 'up') ? 'up' : 'down'
            let oldVote =  (vote ==='up') ? 'down' : 'up'
            console.log('this vote ', thisVote);
            console.log('old vote ', oldVote);
            return knex('venues')
              .where('id', venueId)
              .returning('*')
              .then ( updated => {
                 console.log(updated);
                 res.send(updated)
               })

          })
      }

    })

})

module.exports = router;
