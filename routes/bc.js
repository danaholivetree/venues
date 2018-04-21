var express = require('express');
var router = express.Router();
const knex = require('../knex')
const boom = require('boom')
const request = require('request')
const bc = require('bandcamp-scraper')

router.get('/search/:q', (req, res, next) => {
  var params = {
    query: req.params.q,
    page: 1
  };

  bc.search(params, function(error, searchResults) {
    if (error) {
      console.log(error);
    } else {
      res.send(searchResults.slice(0,2))
    }
  });

})

router.get('/album/:q', (req, res, next) => {
  let artistUrl = `http://${req.params.q}.bandcamp.com`
  bc.getAlbumUrls(artistUrl, function(error, albumUrls) {
    if (error) {
      console.log(error);
    } else {
      let albums = albumUrls.filter( alb => {
        return alb.split('/').includes('album')
      })
      console.log('albums '  ,albums);
      bc.getAlbumInfo(albums[0], function(error, albumInfo) {
        if (error) {
          console.log(error);
        } else {
          res.send({id: albumInfo.raw.id, band_id: albumInfo.raw.current.band_id, track: albumInfo.raw.featured_track_id, title: albumInfo.raw.current.title, band: albumInfo.raw.artist})
        }
      })
    }
  })
  // var params = {
  //   query: req.params.q,
  //   page: 1
  // };
  //
  // bc.search(params, function(error, searchResults) {
  //   if (error) {
  //     // console.log(error);
  //   } else {
  //     console.log('search results ', searchResults[0]);
  //     // res.send(searchResults.slice(0,2))
  //   }
  // })



})


module.exports = router;
