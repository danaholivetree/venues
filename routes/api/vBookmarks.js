var express = require('express');
var router = express.Router();
const knex = require('../../knex')
const Boom = require('boom')

//get bookmarks by user, for dash
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
      .select(['venues.id as id', 'venues.venue'])
      .innerJoin('venue_bookmarks', function() {
        this.on('venue_id', '=', 'venues.id').andOn('venue_bookmarks.user_id', '=', userId)
      }).then( venues => {
        res.send(venues)
      })
})

//user clicked bookmark
router.post('/', (req, res, next) => {
    console.log('req.body', req.body);
  // for production
  // let userId = req.cookies.user.id
  //just for testing
  let userId
  if (req.cookies.user) {
    userId = req.cookies.user.id
  } else {
    userId = 17
  }
  console.log('userid ', userId);
  console.log('typeof user id ', typeof userId);

    const {venueId} = req.body
    console.log('venueId' ,venueId);
    return knex('venue_bookmarks')
      .where('user_id', userId).andWhere('venue_id', venueId)
      .first()
      .then( exists => {
        if (!exists) {
          return knex('venue_bookmarks')
            .insert({user_id: userId, venue_id: venueId})
            .then( inserted => {
              res.send({bookmarked: true})
            })
        } else {
          return knex('venue_bookmarks')
            .where('user_id', userId).andWhere('venue_id', venueId)
            .del()
            .then( deleted => {
              res.send({bookmarked: false})
            })
        }
      })
})

module.exports = router;
