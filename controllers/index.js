/**
 * Module dependencies
 */
var express = require('express');
const {BirdSightModel} = require("../models/bird_sights");
var router = express.Router();
var createError = require('http-errors');
/* GET home page. */
/**
 * GET go to index page.
 */
router.get('/', async function(req, res, next) {
  res.set("Content-Type", 'text/html');
  res.render('index');
});

/**
 * Route: /identify_bird_sight/:id
 * Method: GET
 * Description: Render to identify bird sight view with the provided ID
 */
router.get('/identify_bird_sight/:id', function (req, res) {
  res.render('identify_bird_sight', {
    id: req.params.id
  });
})

/**
 * Route: /add_sight
 * Method: GET
 * Description: Render the add bird sight view
 */
router.get('/add_sight', function(req, res, next) {
  res.render('add_bird_sight', {title: 'Add  a Bird Sight'});
})

/**
 * Route: /bird_sight/:id
 * Method: GET
 * Description: Render the bird sight view with the provided ID
 */
router.get('/bird_sight/:id', async function(req, res) {
  const {id} = req.params;
  const bird_sight = await BirdSightModel.findById(id);
  if (!bird_sight) {
    return createError(404);
  }
  res.render("bird_sight", {
    bird_sight
  })
});

router.get('/if_online', function (req, res) {
  res.status(200).send();
})

module.exports = router;
