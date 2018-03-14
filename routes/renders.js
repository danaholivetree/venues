var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('index')
})
router.get('/bands', function(req, res, next) {
  res.render('bands')
})
router.get('/venues', function(req, res, next) {
  res.render('venues')
})
router.get('/users', function(req, res, next) {
  res.render('users')
})

module.exports = router;
