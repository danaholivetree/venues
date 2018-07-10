var express = require('express');
var router = express.Router();



const knex = require('../../knex')
const boom = require('boom')

router.get('/', function(req, res, next) {
  knex('users')
    .select('*')
    .orderBy('id', 'asc')
    .then( users => {
      res.send(users)
    })
})

router.get('/:id', function(req, res, next) {
  console.log('got to :id route in users ', req.params.id);
  knex('users')
    .select('*')
    .where('id', req.params.id)
    .first()
    .then( user => {
      res.send(user)
    })
})

router.put('/:id', function(req, res, next) {
  const {bio, location, previousLocation, bands, previousBands, favoriteVenue} = req.body
  let newEmail = ''
  console.log('got to :id route in PUT users ', req.params.id);
  knex('users')
    .select('*')
    .where('id', req.params.id)
    .first()
    .then( user => {
      if (!user) {
        throw boom.badRequest('no existing user')
      } else {
        if (req.query.email) {
          knex('users')
            .update({email: req.query.email}, 'email')
            .where('id', req.params.id)
            .then( email => {
              newEmail = email
            })
        }
        knex('user_profile')
          .update({})
      }
    })
})

module.exports = router;
