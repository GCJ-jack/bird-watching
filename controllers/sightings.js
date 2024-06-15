/**
 * Module dependencies.
 */
const express = require("express");
const {BirdSightModel} = require("../models/bird_sights");
const {getBirdData} = require("../dbpedia");
/**
 * Router initialization.
 */
const router = express.Router();

/**
 * Route: GET /query/:name
 * Description: Retrieves bird data from DBpedia based on the provided bird name.
 * Response: Returns a JSON array containing the retrieved bird data.
 */
router.get('/query/:name', async (req, res) => {
  try {
    const {name} = req.params;
    const birdData = await getBirdData(name);
    res.status(200).json([birdData]);
  } catch (err) {
    res.status(200).json([]);
  }
})

/**
 * Route: POST /
 * Description: Creates a new bird sighting.
 * Request Body: Expects the sighting data in the request body.
 * Response: Returns a 201 status if the sighting is created successfully.
 */
router.post('/', async (req, res) => {
  try {
    const sightData = req.body;

    await BirdSightModel.create(sightData);
    res.status(201).send();
  } catch (err) {
    console.log(err);
  }
});

/**
 * Route: POST /many
 * Description: Creates multiple bird sightings.
 * Request Body: Expects an array of sighting data in the request body.
 * Response: Returns a 201 status if all sightings are created successfully.
 */
router.post('/many', async (req, res) => {
  try {
    const sightData = req.body;
    await BirdSightModel.insertMany(sightData);
    res.status(201).send();
  } catch (err) {
    console.log(err);
  }
})

/**
 * Route: GET /
 * Description: Retrieves all bird sightings.
 * Response: Returns a JSON array containing all bird sightings.
 */
router.get('/', async (req, res) => {
  let allSights = await BirdSightModel.find().sort({'createdAt': -1});
  res.status(200).json(allSights);
});

/**
 * Route: PUT /:id
 * Description: Updates a bird sighting with the provided ID.
 * Request Params: Expects the ID of the sighting to be updated.
 * Request Body: Expects the updated sighting data in the request body.
 * Response: Returns a 200 status if the update is successful, or a 403 status if the requester is not the author.
 */
router.put('/:id', async (req, res) => {
  const {id} = req.params;
  const sight = await BirdSightModel.findById(id);
  const {
    sender,
    identification,
    scientificName,
    DBPediaDescription,
    DBPediaURL
  } = req.body;
  if (sender !== sight.author) {
    return res.status(403).send("You are not the author!");
  }
  await BirdSightModel.findByIdAndUpdate(
    id, {
      identification,
      DBPediaURL,
      scientificName,
      DBPediaDescription
    }
  );
  res.status(200).send();
})
/**
 * Export the router module.
 */
module.exports = router;