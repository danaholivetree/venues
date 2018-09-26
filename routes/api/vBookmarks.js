var express = require('express');
var router = express.Router();
const knex = require('../../knex')
const Boom = require('boom')
const env = process.env.NODE_ENV || 'development'
const devId = Number(process.env.USER_ID)

//get bookmarks by user, for dash
router.get('/', function(req, res, next) {
  let userId = ( env === 'development' ) ? devId : req.cookies.user.id
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
  let userId = ( env === 'development' ) ? devId : req.cookies.user.id
  const {venueId} = req.body
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
