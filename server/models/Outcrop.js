const mongoose = require('mongoose');

const OutcropSchema = new mongoose.Schema({
  assetId: {
    type: Number,
    required: true,
    unique: true
  },
  coordinates: {
    longitude: {
      type: Number,
      required: true
    },
    latitude: {
      type: Number,
      required: true
    },
    height: {
      type: Number,
      required: true
    }
  },
  description: {
    title: {
      type: String,
      required: true
    },
    location: String,
    coordinate: String,
    strikeDip: String,
    depositionalEnv: String,
    petroleumSystem: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Outcrop', OutcropSchema); 