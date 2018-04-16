var express = require('express');
var router = express.Router();
const knex = require('../../knex')
const Boom = require('boom')

//get bookmarks by user, for dash
router.get('/', function(req, res, next) {
    return knex('band_bookmarks')
      .select(['bands.id as id', 'bands.band'])
      .innerJoin('', function() {
        this.on('band_id', '=', 'bands.id').andOn('band_bookmarks.user_id', '=', req.cookies.user.id)
      }).then( bands => {
        res.send(bands)
      })
})

//user clicked bookmark
router.post('/', (req, res, next) => {
    const {bandId} = req.body
    const userId = req.cookies.user.id
    return knex('band_bookmarks')
      .where('user_id', userId).andWhere('band_id', bandId)
      .first()
      .then( exists => {
        if (!exists) {
          return knex('band_bookmarks')
            .insert({user_id: userId, band_id: bandId})
            .then( inserted => {
              //not sure if this part is necessary
              console.log('inserted ', inserted);
              return knex('bands')
                .select('*')
                .where('id', bandId)
                .then( updated => {
                  res.send(updated[0])
                })
            })
        } else {
          return knex('band_bookmarks')
            .where('user_id', userId).andWhere('band_id', bandId)
            .del()
            .then( deleted => {
              //not sure if this part is necessary
              return knex('bands')
                .select('*')
                .where('id', bandId)
                .then( updated => {
                  res.send(updated[0])
                })
            })
        }
      })
})

module.exports = router;
