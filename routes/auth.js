var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const secret = process.env.JWT_KEY
const knex = require('../knex')
const boom = require('boom')

router.post('/login', (req, res, next) => {
  const {email, name, accessToken, id} = req.body
  return knex('users')
    .where('email', email)
    .first()
    .then( exists => {
      if (!exists) {
        return knex('users')
          .insert({email, name, fbid: id})
          .returning('id', 'admin')
          .then( newUser => {
            res.cookie('user', {
                            id: newUser[0].id,
                            admin: newUser[0].admin,
                            accessToken
                          }, {
                            httpOnly: true
                          })
          })
      } else {
        res.cookie('user', {
                        id: exists.id,
                        admin: exists.admin,
                        accessToken
                      }, {
                        httpOnly: true
                      })
      }
      res.send({redirectURL: './'})
    })
})

router.post('/deauthfb', (req, res, next) => {
  console.log(' /deauthfb was pinged');


  console.log('req /deauthfb', req.body);
  // let log = req.signed_request.split('.').forEach( part => Buffer.from(part, 'base64').toString())
  // console.log(Buffer.from(req.body.signed_request, 'base64').toString())
  // console.log('>>>>>>>>>req.signed_request ' , req.signed_request);

  // console.log('++++++++req.params.signed_request split and decoded ', log)
  // console.log(req.body.signed_request.split('.'));

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
