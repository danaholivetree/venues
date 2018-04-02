var express = require('express');
var router = express.Router();
const knex = require('../knex')
const boom = require('boom')
const request = require('request')
const bc = require('bandcamp-scraper')

router.get('/:q', (req, res, next) => {
  console.log('req.params.q', req.params.q);
  var params = {
    query: req.params.q,
    page: 1
  };

  bc.search(params, function(error, searchResults) {
    if (error) {
      console.log(error);
    } else {
      console.log(searchResults);
      res.send(searchResults.slice(0,2))
    }
  });

})


module.exports = router;
