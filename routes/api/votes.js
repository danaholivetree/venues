var express = require('express');
var router = express.Router();
const knex = require('../../knex')
const Boom = require('boom')

//get votes by user, for dash
router.get('/', function(req, res, next) {
  let userId
  if (env === 'development') {
    userId = process.env.USER_ID;
  } else {
    userId = req.cookies.user.id
  }
    return knex('venues')
      .select(['venues.id as id', 'venues.venue', 'venue_votes.vote'])
      .innerJoin('venue_votes', function() {
        this.on('venue_id', '=', 'venues.id').andOn('venue_votes.user_id', '=', userId)
      }).then( venues => {
        res.send(venues)
      })
})

//user clicked thumb up or thumb down
router.post('/', (req, res, next) => {
    const {venueId, vote} = req.body
    let userId
    if (env === 'development') {
      userId = process.env.USER_ID;
    } else {
      userId = req.cookies.user.id
    }
    return knex('venue_votes')
      .where('user_id', userId).andWhere('venue_id', venueId)
      .first()
      .then( exists => {
        if (!exists) {
          return knex('venue_votes')
            .insert({user_id: userId, venue_id: venueId, vote})
            .then( inserted => {
              console.log('inserted ', inserted);
              return knex('venues')
                .where('id', venueId)
                .increment(`${vote}`, 1)
                .returning('*')
                .then( updated => {
                  res.send(updated[0])
                })
            })
        }
        else if (exists.vote === vote) {
          return knex('venue_votes')
            .del()
            .where('user_id', userId).andWhere('venue_id', venueId)
            .returning('vote')
            .then( vote => {
              return knex.raw('UPDATE venues SET ?? = ?? - 1 WHERE ?? = ? RETURNING *', [vote, vote, 'id', venueId])
                .then ( updated => {
                  let updatedVenue = updated.rows[0]
                  updatedVenue.vote = 'none'
                  res.send(updatedVenue)
                }).catch( errr => {
                  return next(err)
                })
            })
        } else {
          return knex('venue_votes')
            .where('user_id', userId).andWhere('venue_id', venueId)
            .update('vote', vote)
            .returning('vote')
            .then( blah => {
              let thisVote = (vote === 'up') ? 'up' : 'down'
              let oldVote =  (vote ==='up') ? 'down' : 'up'
              return knex.raw('UPDATE venues SET ?? = ?? + 1, ?? = ?? - 1 WHERE ?? = ? RETURNING *', [thisVote, thisVote, oldVote, oldVote, 'id', venueId])
                .then ( updated => {
                   res.send(updated.rows[0])
                 }).catch( err => {
                   return next(err)
                 })
            })
        }
      })
})

//user clicked x next to venue vote on dash
router.delete('/', (req, res, next) => {
  let userId
  if (env === 'development') {
    userId = process.env.USER_ID;
  } else {
    userId = req.cookies.user.id
  }
    return knex('venue_votes')
      .where({user_id: userId, venue_id: Number(req.body.id)})
      .del()
      .returning('vote')
      .then( vote => {
        let oldVote = vote[0]
        knex('venues')
          .decrement(`${oldVote}`, 1)
          .where('id', Number(req.body.id))
          .returning(`*`)
          .then( updatedVenue => {
            res.send(updatedVenue[0])
          })
      })
})

module.exports = router;
