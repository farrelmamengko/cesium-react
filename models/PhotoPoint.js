const mongoose = require('mongoose');

const photoPointSchema = new mongoose.Schema({
  position: {
    longitude: { type: Number, required: true },
    latitude: { type: Number, required: true },
    height: { type: Number, required: true }
  },
  outcropId: { type: String, required: true },
  photoUrl: { type: String, required: true },
  description: { type: String, default: 'Foto Outcrop' },
  timestamp: { type: Date, default: Date.now }
}, {
  timestamps: true
});

const PhotoPoint = mongoose.model('PhotoPoint', photoPointSchema);

module.exports = PhotoPoint; 