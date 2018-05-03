 // dev
// console.log(process.env.NODE_ENV === 'dev') // false
// console.log(process.env.NODE_ENV.length) // 4 (including a space at the end)
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

var express = require('express')
var app = express()

const sslRedirect = require('heroku-ssl-redirect')
app.use(sslRedirect(['production', 'development']))


var path = require('path')
var favicon = require('serve-favicon')
var logger = require('morgan')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var helpers = require('express-helpers')
const jwt = require('jsonwebtoken')
const secret = process.env.JWT_KEY
const bcrypt = require('bcrypt')
const knex = require('./knex')
const request = require('request')


var renders = require('./routes/renders')
var venueApi = require('./routes/api/venues')
var bandApi = require('./routes/api/bands')
var userApi = require('./routes/api/users')
var voteApi = require('./routes/api/votes')
var starApi = require('./routes/api/stars')
var vBookApi = require('./routes/api/vBookmarks')
var bBookApi = require('./routes/api/bBookmarks')
var token = require('./routes/token')
var bc = require('./routes/bc')
var auth = require('./routes/auth')



console.log('process.env.NODE_ENV ', process.env.NODE_ENV);

helpers(app)
// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));


app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

// const forceSsl = function (req, res, next) {
//     if (req.headers['x-forwarded-proto'] !== 'https') {
//         return res.redirect(['https://', req.get('Host'), req.url].join(''));
//     }
//     return next();
//  }
// app.use(forceSsl)


const authorize = (req, res, next) => {
  console.log('going through auth');
  if (!req.cookies.user) {
    res.render('login', {error: 'No user cookie'})
  } else if (req.cookies.user) {
    console.log('there was a user cookie ', req.cookies.user);
    return knex('users')
      .where({id: req.cookies.user.id})
      .select('authorized', 'logged_in as loggedIn')
      .first()
      .then( user => {
        if (user.loggedIn) {
          if (user.authorized) {
              next()
          } else {
           console.log('user wasnt authorized');
           res.clearCookie('user')
           res.render('login', {error: 'User has deauthorized the App'})
         }
       } else {
         //this shouldn't happen unless they've logged out on a different machine
         res.clearCookie('user')
         res.render('login', {error: 'User has logged out'})
       }
      })
    }
  }


app.use('/auth', auth)
app.use(authorize)
app.use('/', renders)
app.use('/token', token)
app.use('/bc', bc)
app.use('/api/venues', venueApi)
app.use('/api/users', userApi)
app.use('/api/votes', voteApi)
app.use('/api/bands', bandApi)
app.use('/api/stars', starApi)
app.use('/api/vBookmarks', vBookApi)
app.use('/api/bBookmarks', bBookApi)




// catch 404 and forward to error handler
app.use(function(req, res, next) {
  // var err = new Error('Not Found');
  // err.status = 404;
  res.status(404).send('Not Found')
});

// error handler
app.use(function(err, req, res, next) {

  if (err.output) {
    // console.log('err.output ', err.output);
    const {statusCode, error, message} = err.output.payload
    console.log('statusCode ', statusCode);
    console.log('message ', message);
    res.send(message)
  } else {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    // render the error page
    res.status(err.status || 500);
    res.render('error');
  }

});

module.exports = app;
