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
  console.log('going through auth');
  if (!req.cookies.user) {
    console.log('there was no user cookie, rendering login');
    // res.cookie('user', {
    //                 id: 17,
    //                 admin: true,
    //                 accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImFkbWluIjpmYWxzZSwiaWF0IjoxNTIzMDQ5Mjk4fQ.4gck4LsQndrCnuveTb_MeTQRxRjhUGaJZ4vqWJzVfGY'
    //               }, {
    //                 httpOnly: true
    //               })
    res.render('login') //should i have this redirect to './' ?
  } else if (req.cookies.user) {
    console.log('there was a user cookie');
    return knex('users')
      .where({id: req.cookies.user.id})
      .select('authorized')
      .first()
      .then( user => {
        console.log('authorized' , user.authorized);
        if (user.authorized) {
          console.log('user was authorized, checking if access token is valid');
          let path = `https://graph.facebook.com/debug_token?input_token=`
          request.get(
            {url: `${path}${req.cookies.user.accessToken}&access_token=${process.env.FACEBOOK_APP_ID}|${process.env.FACEBOOK_APP_SECRET}`},
            (err, response, dat) => {
              console.log('err', err);
              // console.log('response ', response);
              console.log('dat', dat);
              let parsedData = JSON.parse(dat)
              const {data} = parsedData

              console.log('>>>> parsed Data ', data);
              if (data) {
                let expires = data.expires_at
                console.log('expires at ',(new Date(expires*1000)).toString());
                console.log('currently ', (new Date()).toString());
                if (data.is_valid) {
                  console.log('was valid', data);
                  next()
                }
                else {

                  let error = data.error.message
                  let code = data.error.code
                  console.log('error ', error ,'code ', code);
                  console.log('access token wasnt valid');
                  res.render('login', {error, code})
                }
              } else {
                console.log('err ', err);
              }


                // console.log();

            })
        }
          // next()
         else {
          console.log('user wasnt authorized');
          res.clearCookie('user')
          res.redirect('/')
        }
      })
    }
  }

    //     } else {
    //       console.log(parsedData.data.error);
    //       let err = parsedData.data.error.message
    //       let subcode = parsedData.data.error.subcode
    //       if (subcode === 463) {
    //         //token expired
    //
    //       }
    //       if (subcode === 467)  {
    //         //user logged out of Facebook
    //



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
