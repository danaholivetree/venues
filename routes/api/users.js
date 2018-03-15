var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const secret = process.env.JWT_KEY
const knex = require('../../knex')
const boom = require('boom')

router.get('/', function(req, res, next) {
  knex('users')
    .select('*')
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

module.exports = router;
