var express = require('express');
var router = express.Router();
const knex = require('../knex')
const boom = require('boom')

/* GET votes by user. */
router.get('/:id', function(req, res, next) {
  knex('venue_votes')
    .select('*')
    .where('user_id', req.params.id)
    .then( votes => {
      console.log('votes ', votes);
      res.send(votes)
    })
});

module.exports = router;
