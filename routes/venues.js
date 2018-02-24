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
  var query = knex('venues')
              .select('*')

  if (req.query.state) {
    query.where('state', req.query.state)
  }
  if (req.query.city) {
    query.andWhere('city', 'ilike', `${req.query.city}%`)
  }
  if (req.query.venue) {
    query.andWhere('venue', 'ilike', `%${req.query.venue}%`)
  }
  if (req.query.capacity) {
    console.log(req.query.capacity)
  }
    query.then( venues => {
      console.log('venues came back from db', venues);
      res.setHeader('content-type', 'application/json')
      res.send(JSON.stringify({venues}))
    })
});

module.exports = router;
