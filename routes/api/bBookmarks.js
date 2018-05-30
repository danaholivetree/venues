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
    return knex('band_bookmarks')
      .select(['bands.id as id', 'bands.band'])
      .innerJoin('', function() {
        this.on('band_id', '=', 'bands.id').andOn('band_bookmarks.user_id', '=', userId)
      }).then( bands => {
        res.send(bands)
      })
})

//user clicked bookmark
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
  console.log('req.body ', req.body);
    const {bandId} = req.body
    return knex('band_bookmarks')
      .where('user_id', userId).andWhere('band_id', bandId)
      .first()
      .then( exists => {
        if (!exists) {
          return knex('band_bookmarks')
            .insert({user_id: userId, band_id: bandId})
            .then( inserted => {
              res.send({bookmarked:true})
            })
        } else {
          return knex('band_bookmarks')
            .where('user_id', userId).andWhere('band_id', bandId)
            .del()
            .then( deleted => {
              res.send({bookmarked: false})
            })
        }
      })
})

module.exports = router;
