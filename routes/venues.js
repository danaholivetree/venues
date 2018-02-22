var express = require('express');
var router = express.Router();
const knex = require('../knex')

/* GET home page. */
router.get('/', function(req, res, next) {
  return knex('venues')
    .select('*')
    .then( venues => {
      res.render('venues', {venues, title: 'Venues'})
    })
});

router.get('/q', function(req, res, next) {
  const {city, state, venue, capacity} = req.query

  return knex('venues')
    .select('*')
    .where({
      state, city
    })
    .then( venues => {
      console.log('venues came back from db', venues);
      res.setHeader('content-type', 'application/json')
      res.send(JSON.stringify({venues}))
    })
});

module.exports = router;
