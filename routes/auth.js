var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const secret = process.env.JWT_KEY
const knex = require('../knex')
const boom = require('boom')

// router.post('/register', (req, res, next) => {
//   if (!req.body.email || !req.body.password || !req.body.name) {
//     return next(boom.badRequest('Please fill out all fields'))
//   }
//   const {
//     name,
//     email,
//     password
//   } = req.body;
//
//   if (name.split(' ').length < 2) {
//     return next(boom.badRequest('Please provide a first and last name'))
//   }
//
//   let badPasswords = ['123456', 'password', '12345678', 'qwerty', '12345', '123456789', 'letmein',
// '1234567', 'football', 'iloveyou', 'admin', 'welcome', 'monkey', 'login', 'abc123', 'starwars', '123123',
// 'dragon', 'passw0rd', 'master', 'hello', 'freedom', 'whatever', 'qazwsx', 'trustno1', 'password1', '654321']
//
//   if (badPasswords.includes(password.toLowerCase())) {
//     return next(boom.badRequest(`That's a terrible password. Please pick a new one.`))
//   }
//   if (password.length < 8) {
//     return next(boom.badRequest('Please use a password with at least 8 characters'))
//   }
//
//   bcrypt.hash(password, 10)
//     .then( hash => {
//       return knex('users')
//         .where('email', email)
//         .first()
//         .then( exists => {
//           if (exists) {
//             return next(boom.badRequest('Registered user already exists with that email address'))
//           }
//           return knex('users')
//             .insert({
//               name,
//               email,
//               hashed_pw: hash
//             }, ['id', 'admin'])
//             .then( user => {
//               let token = jwt.sign({
//                 userId: user[0].id,
//                 admin: user[0].admin
//               }, secret)
//               res.cookie('token', token, {
//                 httpOnly: true
//               })
//               res.cookie('user', {
//                 id: user[0].id,
//                 admin: user[0].admin
//               }, {
//                 httpOnly: true
//               })
//               res.send({redirectURL: './'})
//             }).catch( err => next(err))
//         })
//       })
// })
//
// router.post('/login', (req, res, next) => {
//     if (!req.body.email || !req.body.password) {
//       return next(boom.badRequest('Please fill out both fields'))
//     }
//     knex('users')
//       .where('email', req.body.email)
//       .first()
//       .then( foundUser => {
//         if (!foundUser) {
//           return next(boom.badRequest(`${req.body.email} is not a registered user`))
//           // res.send(`${req.body.email} is not a registered user`)
//         }
//         bcrypt.compare(req.body.password, foundUser.hashed_pw).then( compares => {
//             if (compares) {
//               let token = jwt.sign({
//                 userId: foundUser.id,
//                 admin: foundUser.admin
//               }, secret)
//               res.cookie('user', {
//                 id: foundUser.id,
//                 admin: foundUser.admin
//               }, {
//                 httpOnly: true
//               })
//               res.cookie('token', token, {httpOnly:true}).send({
//                 redirectURL: './'
//               })
//             }
//             else {
//               return next(boom.badRequest('Bad password'))
//               // res.send('Incorrect Password')
//             }
//           })
//           .catch((err) => {
//             next(err)
//           })
//       })
//   })

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

router.post('/logout', (req, res, next) => {
  // res.clearCookie('token')
  res.clearCookie('user')
  res.clearCookie(`fbsr_${process.env.FACEBOOK_APP_ID}`)
  res.send({
    redirectURL: '../'
  })
})


module.exports = router;
