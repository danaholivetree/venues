var express = require('express');
var router = express.Router();
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken')
// const secret = process.env.JWT_KEY
const knex = require('../knex')
const boom = require('boom')
const base64url = require('base64url')
const crypto = require('crypto');

router.post('/login', (req, res, next) => {
    console.log('req.body ', req.body);
  const {email, name, accessToken, fbid} = req.body

  return knex('users')
    .where('email', email)
    .first()
    .then( exists => {
      if (!exists) {
        return knex('users')
          .insert({email, name, fbid})
          .returning(['id', 'admin'])
          .then( newUser => {
            console.log('newUser ', newUser);
            res.cookie('user', {
                            id: newUser[0].id,
                            admin: newUser[0].admin,
                            accessToken
                          }, {
                            httpOnly: true
                          })
            res.send({redirectURL: './'}) //should it just be  a reload?
          })
      } else {
        // if (exists.authorized === false) {
        console.log('exists.id ', exists.id);
        console.log('typeof exists.id ', typeof exists.id);
          return knex('users')
            .update({authorized: true, logged_in: true}, '*')
            .where('id', exists.id)
            .then( updatedUser => {
              console.log('updatedUser[0] ', updatedUser[0]);
              res.cookie('user', {
                              id: exists.id,
                              admin: exists.admin,
                              accessToken
                            }, {
                              httpOnly: true
                            })
              res.send({redirectURL: './'})
            })
      }
      console.log('getting to send at end of login, removed send tho');
      // res.send({redirectURL: './'})
    })
})

router.post('/deauthfb', (req, res, next) => {
  console.log(' /deauthfb was pinged');
  let split = req.body.signed_request.split('.')
  let encodedSig = base64url.decode(split[0])
  let payload = base64url.decode(split[1])
  let parsedPayload = JSON.parse(payload)
  console.log('parsedpayload ', parsedPayload);
  //signed_request: 'xh4e27wmL1TjghWNq50eLjKkqslXhmajdILO1cNUJ6c.eyJhbGdvcml0aG0iOiJITUFDLVNIQTI1NiIsImlzc3VlZF9hdCI6MTUyNDMyOTAxOCwidXNlciI6eyJjb3VudHJ5IjoidXMiLCJsb2NhbGUiOiJlbl9VUyJ9LCJ1c2VyX2lkIjoiMTExOTg4NDI2MzI3OTI0In0'
  // const hmac = crypto.createHmac('sha256', process.env.FACEBOOK_APP_SECRET);
  // hmac.update(payload)
  // let expectedSig = hmac.digest('base64')
  // console.log('expectedSig ', expectedSig);
  // console.log('encodedSig ', encodedSig);
  // if (encodedSig !== expectedSig) {
  //   console.log('Bad Signed JSON signature!');
  //   res.send({encodedSig, expectedSig})
  // }
  return knex('users')
    .update({authorized: false}, '*')
    .where('fbid', parsedPayload.user_id)
    .then( updatedUser => {
      console.log(updatedUser);
    })
})


router.post('/logout', (req, res, next) => {
  // res.clearCookie('token')
  res.clearCookie('user')
  res.clearCookie(`fbsr_${process.env.FACEBOOK_APP_ID}`)
  res.send({
    redirectURL: '../'
  })
})


module.exports = router;
