var express = require('express');
var router = express.Router();

var names = ['dan', 'shea', 'kerry', 'robin']
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express', names});
});

module.exports = router;
