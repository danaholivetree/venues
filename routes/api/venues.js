var express = require('express');
var router = express.Router();
const knex = require('../../knex')
const boom = require('boom')

router.get('/', (req, res, next) => {
  let venueQuery = knex('venues')
    .select(['venues.id', 'state', 'url', 'email', 'city', 'venue', 'capacity', 'diy', 'up', 'down', 'vote', 'venue_bookmarks.id as bookmark'])
    .leftOuterJoin('venue_votes', function() {
      this.on('venues.id', '=', 'venue_votes.venue_id').andOn('venue_votes.user_id', '=', req.cookies.user.id)
    })
    .leftOuterJoin('venue_bookmarks', function() {
      this.on('venues.id', '=', 'venue_bookmarks.venue_id').andOn('venue_bookmarks.user_id', '=', req.cookies.user.id)
    })
    .orderBy('state', 'asc')
    .orderBy('city', 'asc')
    .orderBy('venue', 'asc')
    .limit(25)

    if (req.query.offset) {
      venueQuery.offset(req.query.offset)
    }
    return venueQuery
      .then( venues => {
        res.send(venues)
      })
});

router.get('/q', (req, res, next) => {
  var query = knex('venues')
              // .select('*')
              .select('venues.id as id', 'venue', 'state', 'url', 'diy', 'up', 'down', 'email', 'city', 'capacity', 'vote', 'venue_bookmarks.id as bookmark')
  const addState = (state) => {
    if (state !== 'All') {
      return query.where('state', state)
    }
  }
  const addCity = (city) => {
    return query.where('city', 'ilike', `${city}%`)
  }
  const addVenue = (venue) => {
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
    rawCapQuery += ' capacity IS NULL'
      req.query.capacity.forEach( (cap, i) => {
          if (cap !== 'capxl' ) {
              rawCapQuery += ' OR capacity BETWEEN ? AND ?'
          }
          if (cap === 'capxl') {
            rawCapQuery += ' OR capacity > ?'
          }
          if (cap === 'capxs') rawBindings = rawBindings.concat([0, 100])
          if (cap === 'caps') rawBindings = rawBindings.concat([101, 250])
          if (cap === 'capm') rawBindings = rawBindings.concat([251, 600])
          if (cap === 'capl') rawBindings = rawBindings.concat([601, 1200])
          if (cap === 'capxl') rawBindings = rawBindings.concat(['capacity', 1200])
      })
  }
  rawCapQuery = '(' + rawCapQuery + ')'
  if (req.query.capacity[0] !== 'any') query.andWhereRaw(rawCapQuery, rawBindings)

  if (req.query.selectors) {
    if (req.query.selectors.includes('up') || req.query.selectors.includes('down')) {
      req.query.selectors.forEach( (selector, i, selectors) => {
        if (selector === 'up') {
          query.innerJoin('venue_votes', function() {
            this.on('venues.id', '=', 'venue_votes.venue_id').andOn('venue_votes.user_id', '=', req.cookies.user.id)
          }).where('vote', '=', 'up')
        } else if (selector === 'down') {
          if (i === 1) {
            query.orWhere('vote', '=', 'down')
          } else {
            query.innerJoin('venue_votes', function() {
              this.on('venues.id', '=', 'venue_votes.venue_id').andOn('venue_votes.user_id', '=', req.cookies.user.id)
            }).where('vote', '=', 'down')
          }
        }
      })
    } else {
      query.leftOuterJoin('venue_votes', function() {
        this.on('venues.id', '=', 'venue_votes.venue_id').andOn('venue_votes.user_id', '=', req.cookies.user.id)
      })
    }
    if (req.query.selectors.includes('bookmarked')) {
      query.innerJoin('venue_bookmarks', function() {
        this.on('venues.id', '=', 'venue_bookmarks.venue_id').andOn('venue_bookmarks.user_id', '=', req.cookies.user.id)
      })
      var bookmarks = true
    } else {
     query.leftOuterJoin('venue_bookmarks', function() {
       this.on('venues.id', '=', 'venue_bookmarks.venue_id').andOn("venue_bookmarks.user_id", "=", req.cookies.user.id)
     })
   }
 } else {
   query.leftOuterJoin('venue_votes', function() {
     this.on('venues.id', '=', 'venue_votes.venue_id').andOn('venue_votes.user_id', '=', req.cookies.user.id)
   }).leftOuterJoin('venue_bookmarks', function() {
     this.on('venues.id', '=', 'venue_bookmarks.venue_id').andOn("venue_bookmarks.user_id", "=", req.cookies.user.id)
   })
 }
  query.orderBy('state', 'asc').orderBy('city', 'asc').limit(25)
  if (req.query.offset) {
    query.offset(req.query.offset)
  }
  return query.then( venues => {
    res.send({venues, bookmarks})
    })
});

router.get('/:id', (req, res, next) => {
  return knex('venues')
    .where('venues.id', Number(req.params.id))
    .leftOuterJoin('venue_profiles', 'venues.id', 'venue_profiles.venue_id')
    .rightOuterJoin('users', 'users.id', 'venues.contributed_by')
    .leftOuterJoin('venue_votes', function() {
      this.on('venues.id', '=', 'venue_votes.venue_id').andOn('venue_votes.user_id', '=', req.cookies.user.id)
    })
    .select('venues.id as id', 'venue', 'state', 'url', 'diy', 'up', 'down', 'vote', 'venues.email', 'city', 'capacity','genres_booked as genres', 'ages', 'accessibility', 'type', 'crowd', 'pay', 'promo',  'users.name as contributedBy', 'sound')
    .first()
    .then( venue => {
      res.send(venue)
    })
});

router.post('/', (req, res, next) => {
  const {state, city, venue, capacity, email, url, diy} = req.body
  var newVenue = {state, city, venue, url, contributed_by: req.cookies.user.id}
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
        return next(boom.badRequest('This venue is already in the database'))
      } else {
        return knex('users')
          .where('id', req.cookies.user.id)
          .increment('contributions', 1)
          .then( () => {
            return knex('venues')
              .insert(newVenue, '*')
              .then( venue => {
                res.send(venue[0])
              })
          })

      }
    })
})

router.put('/:id', (req, res, next) => {
  const venueQuery =   knex('venues').where('id', Number(req.params.id))
  const profileQuery = knex('venue_profiles').where('venue_id', Number(req.params.id))

  const findVenue = venueQuery.select('*').first()
  let findProfile = profileQuery.select(['genres_booked as genres', 'type', 'crowd', 'ages', 'accessibility', 'pay', 'promo', 'sound']).first()

  const updateVenue = (venue) => {
    venue.updated_at = new Date()
    return venueQuery
      .update(venue)
      .returning('*')
  }

  const updateProfile = (venue) => {
    venue.updated_at = new Date()
    return findProfile
      .update(venue)
      .returning(['genres_booked as genres', 'type', 'crowd', 'ages', 'accessibility', 'pay', 'promo', 'sound'])
  }

  const newProfile = (venue) => {
    return knex('venue_profiles')
      .insert(venue)
      .returning(['genres_booked as genres', 'type', 'crowd', 'ages', 'accessibility', 'pay', 'promo', 'sound'])
  }

  const addProfileToUpdatedVenue = (updatedVenue, profile) => {
    for (let key in profile) {
      updatedVenue[key] = profile[key]
    }
    return updatedVenue
  }

  const {url, email, capacity, diy, genres, type, crowd, ages, accessibility, pay, promo, sound} = req.body
  let toVenues = {}
  let toProfile = {}
  if (url || url === '') {
    toVenues.url = url
  }
  if (email || email === '') {
    toVenues.email = email
  }
  if (capacity) {
    toVenues.capacity = capacity
  }
  if (Object.keys(req.body).find( el => el === 'diy')) {
    toVenues.diy = diy
  }
  if (genres || genres === '') {
    toProfile.genres_booked = genres
  }
  if (type || type === '') {
    toProfile.type = type
  }
  if (crowd || crowd === '') {
    toProfile.crowd = crowd
  }
  if (ages || ages === '') {
    toProfile.ages = ages
  }
  if (accessibility || accessibility === '') {
    toProfile.accessibility = accessibility
  }
  if (pay || pay === '') {
    toProfile.pay = pay
  }
  if (promo || promo === '') {
    toProfile.promo = promo
  }
  if (sound || sound === '') {
    toProfile.sound = sound
  }
  let updatedVenue = {}
  if (Object.keys(toVenues).length > 0) {
    toVenues.id = Number(req.params.id)
    updateVenue(toVenues)
      .then( venue => {
        updatedVenue = venue[0]
        return findProfile
          .then (exists => {
            // if we need to update the profile
            if (Object.keys(toProfile).length > 0) {
              toProfile.venue_id = Number(req.params.id)
              if (exists) {
                updateProfile(toProfile)
                .then( newData => {
                  res.send(addProfileToUpdatedVenue(updatedVenue, newData[0]))
                })
              } else {
                newProfile(toProfile)
                  .then( newData => {
                    res.send(addProfileToUpdatedVenue(updatedVenue, newData[0]))
                  })
                }
              } else { // nothing goes to profile
                res.send(addProfileToUpdatedVenue(updatedVenue, exists))
              }
            })
          })
  } else if (Object.keys(toProfile).length > 0)  {
    toProfile.venue_id = Number(req.params.id)
      return findVenue
        .then( venue => {
          updatedVenue = venue
          return findProfile
          .then (exists => {
            if (exists) {
                updateProfile(toProfile)
                  .then( newData => {
                    res.send(addProfileToUpdatedVenue(updatedVenue, newData[0]))
                  })
            } else {
              newProfile(toProfile)
                .then( newData => {
                  res.send(addProfileToUpdatedVenue(updatedVenue, newData[0]))
                })
              }
        })
      })
    }
  })


module.exports = router;
