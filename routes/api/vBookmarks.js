var express = require('express');
var router = express.Router();
const knex = require('../../knex')
const Boom = require('boom')

//get bookmarks by user, for dash
router.get('/', function(req, res, next) {
    return knex('venues')
      .select(['venues.id as id', 'venues.venue'])
      .innerJoin('venue_bookmarks', function() {
        this.on('venue_id', '=', 'venues.id').andOn('venue_bookmarks.user_id', '=', req.cookies.user.id)
      }).then( venues => {
        res.send(venues)
      })
})

//user clicked bookmark
router.post('/', (req, res, next) => {
    const {venueId} = req.body
    const userId = req.cookies.user.id
    return knex('venue_bookmarks')
      .where('user_id', userId).andWhere('venue_id', venueId)
      .first()
      .then( exists => {
        if (!exists) {
          return knex('venue_bookmarks')
            .insert({user_id: userId, venue_id: venueId})
            .then( inserted => {
              //not sure if this part is necessary
              // console.log('inserted ', inserted);
              // return knex('venues')
              //   .select('*')
              //   .where('id', venueId)
              //   .then( updated => {
              //     res.send(updated[0])
              //   })
              res.send({bookmarked: true})
            })
        } else {
          return knex('venue_bookmarks')
            .where('user_id', userId).andWhere('venue_id', venueId)
            .del()
            .then( deleted => {
              //not sure if this part is necessary
              // return knex('venues')
              //   .select('*')
              //   .where('id', venueId)
              //   .then( updated => {
              //     res.send(updated[0])
              //   })
              res.send({bookmarked: false})
            })
        }
      })
})

module.exports = router;
