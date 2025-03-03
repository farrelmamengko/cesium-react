const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Inisialisasi Express
const app = express();
const PORT = 5003; // Menggunakan port yang sama dengan yang digunakan di client

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Koneksi MongoDB
mongoose.connect('mongodb://localhost:27017/cesium_camera', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000
}).then(() => {
  console.log('Terhubung ke MongoDB');
  console.log('Database URL: mongodb://localhost:27017/cesium_camera');
}).catch((error) => {
  console.error('Koneksi ke MongoDB gagal:', error);
  process.exit(1);
});

// Event listeners untuk koneksi MongoDB
mongoose.connection.on('connected', () => {
  console.log('Mongoose terhubung ke MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose terputus dari MongoDB');
});

// Model Camera
const CameraSchema = new mongoose.Schema({
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
  timestamp: { type: Date, default: Date.now },
  description: String
}, {
  collection: 'camerapositions', // Nama collection yang konsisten
  timestamps: true // Menambahkan createdAt dan updatedAt
});

const Camera = mongoose.model('Camera', CameraSchema);

// API Endpoints
// 1. Endpoint untuk menyimpan posisi kamera
app.post('/api/camera/save', async (req, res) => {
  try {
    console.log('Data yang diterima:', req.body);
    const { position, orientation, description } = req.body;

    // Validasi data
    if (!position || !orientation) {
      return res.status(400).json({
        message: 'Data tidak lengkap',
        error: 'Position dan orientation harus ada'
      });
    }

    const camera = new Camera({
      position,
      orientation,
      description
    });

    await camera.save();
    console.log('Data kamera berhasil disimpan:', camera);
    
    res.status(201).json({
      message: 'Posisi kamera berhasil disimpan',
      data: camera
    });
  } catch (error) {
    console.error('Error menyimpan data kamera:', error);
    res.status(500).json({
      message: 'Gagal menyimpan posisi kamera',
      error: error.message
    });
  }
});

// 2. Endpoint untuk mengambil semua posisi kamera
app.get('/api/camera/positions', async (req, res) => {
  try {
    const positions = await Camera.find().sort({ timestamp: -1 });
    res.json(positions);
  } catch (error) {
    console.error('Error mengambil data kamera:', error);
    res.status(500).json({
      message: 'Gagal mengambil data kamera',
      error: error.message
    });
  }
});

// Serve React app
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
}

// Jalankan server
app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
}); 