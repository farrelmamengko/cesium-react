const mongoose = require('mongoose');

const CameraPositionSchema = new mongoose.Schema({
  position: {
    longitude: Number,
    latitude: Number,
    height: Number
  },
  orientation: {
    heading: Number,
    pitch: Number,
    roll: Number
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  description: String
});

module.exports = mongoose.model('CameraPosition', CameraPositionSchema); 