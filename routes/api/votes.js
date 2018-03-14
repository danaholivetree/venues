var express = require('express');
var router = express.Router();
const knex = require('../../knex')
const Boom = require('boom')
const jwt = require('jsonwebtoken')
const secret = process.env.JWT_KEY

/* GET votes by user. */
router.get('/', function(req, res, next) {
  jwt.verify(req.cookies.token, secret, (err, payload) => {
    console.log('payload.userId ', payload.userId);
    let subquery = knex('venue_votes').select('venue_id').where('user_id', payload.userId)

    knex('venues')
      .select(['venues.id as id', 'venues.venue', 'venue_votes.vote'])
      .innerJoin('venue_votes', 'venue_id', 'venues.id')
      .whereIn('venues.id', subquery)
      .then( venues => {
        console.log('votes ', venues);
        res.send(venues)
      })
    })
});

router.post('/', (req, res, next) => {

  jwt.verify(req.cookies.token, secret, (err, payload) => {
    const {venueId, vote} = req.body
    const userId = payload.userId

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
          next(Boom.badRequest(`you\'ve already voted thumbs-${vote} for this venue`))
        } else {
          return knex('venue_votes')
            .where('user_id', userId).andWhere('venue_id', venueId)
            .update('vote', vote)
            .returning('*')
            .then( blah => {

              let thisVote = (vote === 'up') ? 'up' : 'down'
              let oldVote =  (vote ==='up') ? 'down' : 'up'

              // console.log('rawUpdate ', rawUpdate);
              console.log('this vote ', thisVote);
              console.log('old vote ', oldVote);

              return knex.raw('UPDATE venues SET ?? = ?? + 1, ?? = ?? - 1 WHERE ?? = ? RETURNING *', [thisVote, thisVote, oldVote, oldVote, 'id', venueId])
                .then ( updated => {
                  console.log('updated ', updated);
                  // console.log('updated.rows ',updated.rows[0]);
                   // res.send(updated.rows[0])
                   res.send(updated.rows[0])
                 }).catch( err => {
                   console.log(err)
                   return next(err)
                 })

            })
        }

      })
    })

})

module.exports = router;
