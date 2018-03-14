var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const secret = process.env.JWT_KEY
const knex = require('../knex')
const boom = require('boom')



router.post('/register', (req, res, next) => {
  if (!req.body.email || !req.body.password || !req.body.name) {
    return next(boom.badRequest('Please fill out all fields'))
  }
  const {
    name,
    email,
    password
  } = req.body;

  bcrypt.hash(password, 10)
    .then( hash => {
      return knex('users')
        .where('email', email)
        .first()
        .then( exists => {
          if (exists) {
            return next(boom.badRequest('Registered user already exists with that email address'))
          }
          return knex('users')
            .insert({
              name,
              email,
              hashed_pw: hash
            }, ['id', 'admin'])
            .then( user => {
              let token = jwt.sign({
                userId: user[0].id,
                admin: user[0].admin
              }, secret)
              res.cookie('token', token, {
                httpOnly: true
              })
              res.cookie('user', {
                id: user[0].id,
                admin: user[0].admin
              }, {
                httpOnly: true
              })
              res.send({redirectURL: './'})
            }).catch( err => next(err))
        })
      })
})

router.post('/login', (req, res, next) => {
    if (!req.body.email || !req.body.password) {
      return next(boom.badRequest('Please fill out both fields'))
    }
    knex('users')
      .where('email', req.body.email)
      .first()
      .then( foundUser => {
        if (!foundUser) {
          next(boom.badRequest(`${req.body.email} is not a registered user`))
        }
        bcrypt.compare(req.body.password, foundUser.hashed_pw).then( compares => {
            if (compares) {
              let token = jwt.sign({
                userId: foundUser.id,
                admin: foundUser.admin
              }, secret)
              res.cookie('user', {
                id: foundUser.id,
                admin: foundUser.admin
              }, {
                httpOnly: true
              })
              res.cookie('token', token, {httpOnly:true}).send({
                redirectURL: './'
              })
            }
            else {
              next(boom.badRequest('Bad password'))
            }
          })
          .catch((err) => {
            next(err)
          })
      })
  })

router.post('/logout', (req, res, next) => {
  res.clearCookie('token')
  res.clearCookie('user')
  res.send({
    redirectURL: './'
  })
})


module.exports = router;
