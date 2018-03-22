var express = require('express');
var router = express.Router();
const knex = require('../../knex')
const Boom = require('boom')

//get votes by user, for dash
router.get('/', function(req, res, next) {
    return knex('bands')
      .select(['bands.id as id', 'bands.band'])
      .innerJoin('band_stars', function() {
        this.on('band_id', '=', 'bands.id').andOn('band_stars.user_id', '=', req.cookies.user.id)
      }).then( bands => {
        res.send(bands)
      })
})

//user clicked star
router.post('/', (req, res, next) => {
    const {bandId} = req.body
    const userId = req.cookies.user.id
    return knex('band_stars')
      .where('user_id', userId).andWhere('band_id', bandId)
      .first()
      .then( exists => {
        if (!exists) {
          return knex('band_stars')
            .insert({user_id: userId, band_id: bandId})
            .then( inserted => {
              return knex('bands')
                .where('id', bandId)
                .increment('stars', 1)
                .returning('*')
                .then( updated => {
                  res.send(updated[0])
                })
            })
        }
        else if (exists.vote === vote) {
          next(Boom.badRequest(`you\'ve already starred this band`))
        }
      })
})

//user clicked x next to band vote on dash
router.delete('/', (req, res, next) => {
  let bandId = Number(req.body.id)
    return knex('band_stars')
      .where({user_id: req.cookies.user.id, band_id: bandId})
      .del()
      .then( () => {
        knex('bands')
          .decrement('stars', 1)
          .where('id', bandId)
          .returning(`*`)
          .then( updatedBand => {
            res.send(updatedBand[0])
          })
      })
})

module.exports = router;
