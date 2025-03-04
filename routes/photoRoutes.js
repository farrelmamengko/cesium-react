const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const PhotoPoint = require('../models/PhotoPoint');

// Konfigurasi penyimpanan file
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = 'uploads/photos';
    
    // Buat direktori jika belum ada
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'photo-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Batas 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Hanya file gambar yang diizinkan'), false);
    }
  }
});

// Endpoint: Mendapatkan semua foto untuk outcrop tertentu
router.get('/outcrop/:outcropId', async (req, res) => {
  try {
    const { outcropId } = req.params;
    const photos = await PhotoPoint.find({ outcropId });
    res.json(photos);
  } catch (error) {
    console.error('Error mengambil foto:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat mengambil foto' });
  }
});

// Endpoint: Menambahkan foto baru
router.post('/upload', upload.single('photo'), async (req, res) => {
  try {
    const { longitude, latitude, height, outcropId, description } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Tidak ada file yang diunggah' });
    }
    
    const photoUrl = `/uploads/photos/${req.file.filename}`;
    
    const newPhotoPoint = new PhotoPoint({
      position: {
        longitude: parseFloat(longitude),
        latitude: parseFloat(latitude),
        height: parseFloat(height)
      },
      outcropId,
      photoUrl,
      description: description || 'Foto Outcrop'
    });
    
    await newPhotoPoint.save();
    
    res.status(201).json(newPhotoPoint);
  } catch (error) {
    console.error('Error menambahkan foto:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat menambahkan foto' });
  }
});

// Endpoint: Menghapus foto
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const photo = await PhotoPoint.findById(id);
    
    if (!photo) {
      return res.status(404).json({ message: 'Foto tidak ditemukan' });
    }
    
    // Hapus file foto dari server
    const filePath = path.join(__dirname, '..', photo.photoUrl.replace('/', ''));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    await PhotoPoint.findByIdAndDelete(id);
    
    res.json({ message: 'Foto berhasil dihapus' });
  } catch (error) {
    console.error('Error menghapus foto:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat menghapus foto' });
  }
});

module.exports = router; 