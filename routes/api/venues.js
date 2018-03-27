var express = require('express');
var router = express.Router();
const knex = require('../../knex')
const boom = require('boom')

router.get('/', (req, res, next) => {
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

router.get('/q', (req, res, next) => {
  console.log('getting to query' , req.query);
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

router.get('/:id', (req, res, next) => {
  console.log('Getting venue ', Number(req.params.id));
  return knex('venues')
    .where('venues.id', Number(req.params.id))
    .leftOuterJoin('venue_profiles', 'venues.id', 'venue_profiles.venue_id')
    .rightOuterJoin('users', 'users.id', 'venues.contributed_by')
    .select('venues.id as id', 'venue', 'state', 'url', 'venues.email', 'city', 'genres_booked as genres', 'capacity', 'seated', 'ages', 'accessibility', 'type', 'crowd', 'pay', 'promo', 'diy', 'users.name as contributedBy', 'sound')
    .first()
    .then( venue => {
      console.log('got the venue ', venue);
      res.send(venue)
    })
});

router.post('/', (req, res, next) => {
  console.log('post');
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
        throw boom.badRequest('venue already exists in db')
      } else {
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
  console.log('put route by id ',  Number(req.params.id));
  console.log('req.body ', req.body);
  const venueQuery =   knex('venues').where('id', Number(req.params.id))
  const profileQuery = knex('venue_profiles').where('venue_id', Number(req.params.id))

  const findVenue = venueQuery.select('*').first()
  let findProfile = profileQuery.select(['genres_booked as genres', 'type', 'crowd', 'ages', 'accessibility', 'pay', 'promo', 'sound']).first()

  const updateVenue = (venue) => {
    console.log('venue to update', venue);
    return venueQuery
      .update(venue)
      .returning('*')
  }

  const updateProfile = (venue) => {
    return findProfile
    .update(venue)
    .returning(['genres_booked as genres', 'type', 'crowd', 'ages', 'accessibility', 'pay', 'promo', 'sound'])
  }

  const newProfile = (venue) => {
    knex('venue_profiles')
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
    console.log(Object.keys(req.body).find( el => el === 'diy'));
    console.log('diy was a key');
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
  console.log('toProfile ', toProfile);
  console.log('toVenues ', toVenues);
  let updatedVenue = {}
  if (Object.keys(toVenues).length > 0) {
    toVenues.id = Number(req.params.id)
    updateVenue(toVenues)
      .then( venue => {
        console.log(venue);
        updatedVenue = venue[0]
        return findProfile
          .then (exists => {
            console.log('exists ', exists);
            // if we need to update the profile
            if (Object.keys(toProfile).length > 0) {
              toProfile.venue_id = Number(req.params.id)
              if (exists) {
                updateProfile(toProfile)
                .then( newData => {
                  // for (let key in newData[0]) {
                  //   updatedVenue[key] = newData[0][key]
                  // }

                  res.send(addProfileToUpdatedVenue(updatedVenue, newData[0]))
                })
              } else {
                newProfile(toProfile)
                  .then( newData => {
                    // for (let key in newData[0]) {
                    //   updatedVenue[key] = newData[0][key]
                    // }

                    res.send(addProfileToUpdatedVenue(updatedVenue, newData[0]))
                  })
                }
              } else { // nothing goes to profile
                // for (let key in exists) {
                //   updatedVenue[key] = exists[key]
                // }
                console.log('updatedVEnue without profile ', updatedVenue);
                console.log('updatedVEnue right before sending back ', addProfileToUpdatedVenue(updatedVenue, exists));
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
                    // for (let key in newData[0]) {
                    //   updatedVenue[key] = newData[0][key]
                    // }

                    res.send(addProfileToUpdatedVenue(updatedVenue, newData[0]))
                  })
            } else {
              newProfile(toProfile)
                .then( newData => {
                  // for (let key in newData[0]) {
                  //   updatedVenue[key] = newData[0][key]
                  // }

                  res.send(addProfileToUpdatedVenue(updatedVenue, newData[0]))
                })
              }
        })
      })
    }
  })


module.exports = router;
