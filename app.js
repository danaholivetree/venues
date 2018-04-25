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
    res.render('login', {error: 'No user cookie'}) //should i have this redirect to './' ?
  } else if (req.cookies.user) {
    console.log('there was a user cookie');
    return knex('users')
      .where({id: req.cookies.user.id})
      .select('authorized', 'logged_in as loggedIn')
      .first()
      .then( user => {
        console.log('authorized' , user.authorized);
        if (user.loggedIn) {

          if (user.authorized) {
            console.log('user was authorized, checking if access token is valid');
            let path = `https://graph.facebook.com/debug_token?input_token=`
            request.get(
              {url: `${path}${req.cookies.user.accessToken}&access_token=${process.env.FACEBOOK_APP_ID}|${process.env.FACEBOOK_APP_SECRET}`,
              json:true
            },
              (err, response, dat) => {

                console.log('>>>> dat ', dat);
                if (dat.error) {
                  console.log('works for certain errors maybe???');
                  console.log('dat.error ', dat.error);
                    let error = dat.error.message
                    let code = dat.error.code
                    console.log('error ', error ,'code ', code);
                    console.log('access token wasnt valid');
                    res.render('login', {error, code})
                } else {
                  let  {data} = dat
                  console.log('>>>> data ', data);
                  if (data.error) {

                    console.log('error ', data.error);
                    console.log('access token wasnt valid');
                    if (data.error.subcode == 463) {
                      console.log('was expired. going next anyway');
                      next()
                    }
                    // want to not render login for expired tokens because that shouldnt happen anymore
                    else {
                      //other error, render login
                      res.render('login', {error: data.error})
                    }
                  }
                  // else {
                  //   console.log('expires at ',(new Date(data.expires_at*1000)).toString());
                  //   console.log('currently ', (new Date()).toString());
                  else if (data.is_valid) {
                    console.log('access token was valid');
                    next()
                  //   } else {
                  //     console.log('going to render login with error ');
                  //     res.render('login', {error: 'User access token was not valid'})
                  //   }
                  }

                }
              })
          } else {
           console.log('user wasnt authorized');
           res.clearCookie('user')
           // res.redirect('/')
           res.render('login', {error: 'User has deauthorized the App'}) //haven't tested this
         }
       } else {
         console.log('user had logged out');
         res.clearCookie('user')
         // res.redirect('/')
         res.render('login', {error: 'User has logged out'})
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
