/**
 * bird_sights.js - Bird Sight Model
 */
var mongoose = require('mongoose');
var mongoDB = 'mongodb://127.0.0.1:27017/bird_sights';
mongoose.Promise = global.Promise;

/**
 * Define the bird sight schema
 */
const BirdSightSchema = new mongoose.Schema({
    author: String,
    datetime: String,
    geolocation: {
       latitude: Number,
       longitude: Number
    },
    DBPediaURL: String,
    identification: String,
    description: String,
    photo: String,
    DBPediaDescription: String,
    scientificName: String,
}, {
    timestamps: true
});

/**
 * Define the Bird sight model
 */
const BirdSightModel = mongoose.model('BirdSight', BirdSightSchema);
/**
 * build the database connection
 */
try {
    connection = mongoose.connect(mongoDB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        checkServerIdentity: false,
    });
    console.log('connection to mongodb worked!');
} catch (e) {
    console.log('error in db connection: ' + e.message);
}
/**
 * Export the BirdSightModel
 */
module.exports = {
    BirdSightModel
}