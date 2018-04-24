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
router.get('/venues/:id/edit', function(req, res, next) {
  let id = Number(req.params.id)
  res.render(`editVenue`)
})
router.get('/venues/:id', function(req, res, next) {
  let id = Number(req.params.id)
  res.render(`venue`)
})
router.get('/dash', (req, res, next) => {
  res.render('dash')
})


module.exports = router;
