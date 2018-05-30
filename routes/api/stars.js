var express = require('express');
var router = express.Router();
const knex = require('../../knex')
const Boom = require('boom')

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
    return knex('bands')
      .select(['bands.id as id', 'bands.band'])
      .innerJoin('band_stars', function() {
        this.on('band_id', '=', 'bands.id').andOn('band_stars.user_id', '=', userId)
      }).then( bands => {
        res.send(bands)
      })
})

//user clicked star
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
    const {bandId} = req.body
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
                    console.log('updated[0].stars ',updated[0].stars );
                  updated[0].starred = true
                    console.log(updated[0].starred);
                  res.send(updated[0])
                })
            })
        }
        else if (exists) {
          return knex('band_stars')
            .del()
            .where({user_id: userId, band_id: bandId})
            .then( deleted => {
              return knex('bands')
                .where('id', bandId)
                .decrement('stars', 1)
                .returning('*')
                .then( updated => {
                  console.log('updated[0].stars ',updated[0].stars );
                  updated[0].starred = false
                  console.log(updated[0].starred);
                  res.send(updated[0])
                })

            })
        }
      })
})

//user clicked x next to band vote on dash
router.delete('/', (req, res, next) => {
  // for production
  // let userId = req.cookies.user.id
  //just for testing
  let userId
  if (req.cookies.user) {
    userId = req.cookies.user.id
  } else {
    userId = 17
  }
  let bandId = Number(req.body.id)
    return knex('band_stars')
      .where({user_id: userId, band_id: bandId})
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
