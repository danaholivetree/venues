var express = require('express');
var router = express.Router();
const knex = require('../knex')

/* GET home page. */
router.get('/', function(req, res, next) {
  return knex('bands')
    .select('*')
    .then( bands => {
      res.render('bands', {bands, title: 'Bands'})
    })
});

router.get('/q', function(req, res, next) {
  var query = knex('bands')
              .select('*')

  if (req.query.state) {
    query.where('state', req.query.state)
  }
  if (req.query.city) {
    query.andWhere('city', 'ilike', `${req.query.city}%`)
  }
  if (req.query.band) {
    query.andWhere('band', 'ilike', `%${req.query.band}%`)
  }
  if (req.query.genre) {
    console.log(req.query.genre)
  }
    query.then( bands => {
      console.log('bands came back from db', bands);
      res.setHeader('content-type', 'application/json')
      res.send(JSON.stringify({bands}))
    })
});

module.exports = router;
