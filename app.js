if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var helpers = require('express-helpers')
const jwt = require('jsonwebtoken')
const secret = process.env.JWT_KEY
const bcrypt = require('bcrypt')

var index = require('./routes/index');
var users = require('./routes/users');
var bands = require('./routes/bands');
var venues = require('./routes/venues');
var votes = require('./routes/votes');
var venueApi = require('./routes/api/venues')
var bandApi = require('./routes/api/bands')
var userApi = require('./routes/api/users')
var voteApi = require('./routes/api/votes')
var auth = require('./routes/auth')


var app = express();
helpers(app)
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const authorize = (req, res, next) => {
  jwt.verify(req.cookies.token, secret, (err, payload) => {
  console.log('there was an error ', err);

  if (!req.cookies.token) {
    console.log('no token rendering login');
    res.render("login")
  } else {
  console.log('  token matched!')
    console.log('payload ', payload);
    next()
  }
  })
}
app.use('/auth', auth)
app.use(authorize)
app.use('/', index);
app.use('/users', users);
app.use('/bands', bands);
app.use('/venues', venues);
app.use('/votes', votes);
app.use('/api/venues', venueApi)
app.use('/api/bands', bandApi)
app.use('/api/users', userApi)
app.use('/api/votes', voteApi)



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {

  const {statusCode, error, message} = err.output.payload
  // set locals, only providing error in development
  res.locals.message = message;
  res.locals.error = req.app.get('env') === 'development' ? error : {};

  // render the error page
  res.status(err.status || statusCode || 500);
  res.render('error');
});

module.exports = app;
