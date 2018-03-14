var express = require('express');
var router = express.Router();
const knex = require('../../knex')
const Boom = require('boom')
const jwt = require('jsonwebtoken')
const secret = process.env.JWT_KEY

/* GET votes by user. */
// router.get('/', function(req, res, next) {
//   console.log('req.cookies.user.id ', req.cookies.user.id);
//     let subquery = knex('venue_votes').select('venue_id').where('user_id', req.cookies.user.id)
//     knex('venues')
//       .select(['venues.id as id', 'venue_votes.user_id as user', 'venues.venue', 'venue_votes.vote'])
//       .join('venue_votes', 'venue_id', 'venues.id')
//       .whereIn('venues.id', subquery)
//       .then( venues => {
//         console.log('votes ', venues);
//         res.send(venues)
//       })
// })

router.get('/', function(req, res, next) {
    return knex('venues')
      .select(['venues.id as id', 'venues.venue', 'venue_votes.vote'])
      .innerJoin('venue_votes', function() {
        this.on('venue_id', '=', 'venues.id').andOn('venue_votes.user_id', '=', req.cookies.user.id)
      }).then( venues => {
        console.log('votes ', venues);
        res.send(venues)
      })
})


router.post('/', (req, res, next) => {
    const {venueId, vote} = req.body
    const userId = req.cookies.user.id
    return knex('venue_votes')
      .where('user_id', userId).andWhere('venue_id', venueId)
      .first()
      .then( exists => {
        if (!exists) {
          return knex('venue_votes')
            .insert({user_id: userId, venue_id: venueId, vote})
            .then( inserted => {
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
          next(Boom.badRequest(`you\'ve already voted thumbs-${vote} for this venue`))
        } else {
          return knex('venue_votes')
            .where('user_id', userId).andWhere('venue_id', venueId)
            .update('vote', vote)
            .returning('*')
            .then( blah => {
              let thisVote = (vote === 'up') ? 'up' : 'down'
              let oldVote =  (vote ==='up') ? 'down' : 'up'
              return knex.raw('UPDATE venues SET ?? = ?? + 1, ?? = ?? - 1 WHERE ?? = ? RETURNING *', [thisVote, thisVote, oldVote, oldVote, 'id', venueId])
                .then ( updated => {
                   res.send(updated.rows[0])
                 }).catch( err => {
                   console.log(err)
                   return next(err)
                 })
            })
        }
      })
})

router.delete('/', (req, res, next) => {
  console.log('req.cookies.user.id ', req.cookies.user.id);
    return knex('venue_votes')
      .where({user_id: req.cookies.user.id, venue_id: Number(req.body.id)})
      .del()
      .returning('vote')
      .then( vote => {
        let oldVote = vote[0]
        console.log('oldVote ', oldVote);
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
