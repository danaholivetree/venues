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
router.get('/user/settings', function(req, res, next) {
  console.log('req.cookies.user.id ', req.cookies.user.id);
  res.render('settings', {userId: req.cookies.user.id})
})

module.exports = router;
