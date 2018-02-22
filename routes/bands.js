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

module.exports = router;
