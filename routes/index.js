var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken');
const knex = require('../knex')
const secret = process.env.JWT_KEY;

/* GET home page. */
router.get('/', function(req, res, next) {
  // jwt.verify(req.cookies.token, secret, (err, payload) => {
  //   if (!req.cookies.token) {
  //     res.render('login')
  //   } else {
  //     res.render('index')
  //   }
  // })
  res.render('index')
})

module.exports = router;
