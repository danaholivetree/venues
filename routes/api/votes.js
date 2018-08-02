var express = require('express');
var router = express.Router();
const knex = require('../../knex')
const boom = require('boom')

//get votes by user, for dash
router.get('/', function(req, res, next) {
  // for production
  // let userId = req.cookies.user.id
  //just for testing
  let userId
  if (req.cookies.user) {
    userId = req.cookies.user.id
  } else {
    userId = 17
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
  // for production
  // let userId = req.cookies.user.id
  //just for testing
  let userId
  if (req.cookies.user) {
    userId = req.cookies.user.id
  } else {
    userId = 17
  }
    const {venueId, vote} = req.body
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
router.delete('/:id', (req, res, next) => {
  console.log('got to delete , req.params.id', typeof req.params.id);
  // for production
  // let userId = req.cookies.user.id
  //just for testing
  // console.log('req.body', req.body);
  // console.log('req.body.id' , req.body.id);
  // if (!req.body.id) {
  //   return next(boom.badRequest('DELETE request requires venue id in body.'))
  // }
  // console.log('typeof req.body.id', typeof req.body.id);
  let userId
  if (req.cookies.user) {
    userId = req.cookies.user.id
  } else {
    userId = 17
  }
    return knex('venue_votes')
      .where({user_id: userId, venue_id: req.params.id})
      .del()
      .returning('vote')
      .then( vote => {
        let oldVote = vote[0]
        knex('venues')
          .decrement(`${oldVote}`, 1)
          .where('id', req.params.id)
          .returning(`*`)
          .then( updatedVenue => {
            res.send(updatedVenue[0])
          })
      })
})

module.exports = router;
