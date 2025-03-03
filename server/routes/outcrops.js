const express = require('express');
const router = express.Router();
const Outcrop = require('../models/Outcrop');

// Get semua outcrop
router.get('/', async (req, res) => {
  try {
    const outcrops = await Outcrop.find();
    res.json(outcrops);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get outcrop berdasarkan ID
router.get('/:id', async (req, res) => {
  try {
    const outcrop = await Outcrop.findOne({ assetId: req.params.id });
    if (!outcrop) return res.status(404).json({ message: 'Outcrop tidak ditemukan' });
    res.json(outcrop);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Buat outcrop baru
router.post('/', async (req, res) => {
  const outcrop = new Outcrop(req.body);
  try {
    const newOutcrop = await outcrop.save();
    res.status(201).json(newOutcrop);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update outcrop
router.patch('/:id', async (req, res) => {
  try {
    const updatedOutcrop = await Outcrop.findOneAndUpdate(
      { assetId: req.params.id },
      req.body,
      { new: true }
    );
    if (!updatedOutcrop) return res.status(404).json({ message: 'Outcrop tidak ditemukan' });
    res.json(updatedOutcrop);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Hapus outcrop
router.delete('/:id', async (req, res) => {
  try {
    const deletedOutcrop = await Outcrop.findOneAndDelete({ assetId: req.params.id });
    if (!deletedOutcrop) return res.status(404).json({ message: 'Outcrop tidak ditemukan' });
    res.json({ message: 'Outcrop berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 