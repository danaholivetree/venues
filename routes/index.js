var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken');
const knex = require('../knex')
const secret = process.env.JWT_KEY;

/* GET home page. */
router.get('/', function(req, res, next) {
  jwt.verify(req.cookies.token, secret, (err, payload) => {
    console.log('there was an error ', err);

    if (!req.cookies.token) {
      console.log('no token rendering login');
      res.render("login")
    } else {
    console.log('  token matched!')
      console.log('payload ', payload);
      return knex('users')
        .where('id', payload.userId)
        .select('name')
        .first()
        .then( name => {
          console.log('name ', name);
          res.render('./', {
            userId: payload.userId,
            admin: payload.admin,
            name
          })
        })

    }
  })
});

module.exports = router;
