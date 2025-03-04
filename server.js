const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

// Inisialisasi Express
const app = express();
const PORT = 5003;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Koneksi MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/belajaroutcrop-db', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB Connected ke belajaroutcrop-db...');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

connectDB();

// Model Camera
const CameraSchema = new mongoose.Schema({
  position: {
    longitude: mongoose.Schema.Types.Mixed,
    latitude: mongoose.Schema.Types.Mixed,
    height: mongoose.Schema.Types.Mixed
  },
  orientation: {
    heading: mongoose.Schema.Types.Mixed,
    pitch: mongoose.Schema.Types.Mixed,
    roll: mongoose.Schema.Types.Mixed
  },
  timestamp: { type: Date, default: Date.now },
  description: String,
  outcropId: { type: String, required: true }
}, {
  collection: 'camerapositions',
  timestamps: true
});

// Model Photo Point
const PhotoPointSchema = new mongoose.Schema({
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

// Konfigurasi penyimpanan file untuk foto
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

// Membuat model
const Camera = mongoose.model('Camera', CameraSchema);
const PhotoPoint = mongoose.model('PhotoPoint', PhotoPointSchema);

// API Endpoint untuk menyimpan posisi kamera
app.post('/api/camera/save', async (req, res) => {
  try {
    console.log('Menerima request untuk menyimpan kamera');
    console.log('Body lengkap:', JSON.stringify(req.body, null, 2));

    const { position, orientation, description, outcropId } = req.body;

    // Validasi data
    if (!position || !orientation || !outcropId) {
      console.error('Data tidak lengkap');
      return res.status(400).json({
        message: 'Data tidak lengkap',
        error: 'Position, orientation, dan outcropId harus ada'
      });
    }

    const camera = new Camera({
      position,
      orientation,
      description: description || 'Saved Camera Position',
      outcropId
    });

    console.log('Data kamera yang akan disimpan ke database:', JSON.stringify(camera, null, 2));
    const savedCamera = await camera.save();
    console.log('Data kamera berhasil disimpan:', savedCamera);
    
    res.status(201).json({
      message: 'Posisi kamera berhasil disimpan',
      data: savedCamera
    });
  } catch (error) {
    console.error('Error saat menyimpan posisi kamera:', error);
    res.status(500).json({
      message: 'Gagal menyimpan posisi kamera',
      error: error.message
    });
  }
});

// Endpoint baru untuk mengambil posisi kamera terbaru berdasarkan outcropId
app.get('/api/camera/latest/:outcropId', async (req, res) => {
  try {
    const { outcropId } = req.params;
    console.log('Mengambil data kamera untuk outcrop:', outcropId);

    const latestPosition = await Camera.findOne({ outcropId })
      .sort({ timestamp: -1 });
    
    if (!latestPosition) {
      return res.status(404).json({
        message: `Tidak ada posisi kamera tersimpan untuk outcrop ${outcropId}`
      });
    }
    
    console.log('Posisi kamera terbaru untuk outcrop', outcropId, ':', latestPosition);
    res.json(latestPosition);
  } catch (error) {
    console.error('Error saat mengambil posisi kamera:', error);
    res.status(500).json({
      message: 'Gagal mengambil posisi kamera',
      error: error.message
    });
  }
});

// Endpoint untuk mengambil semua posisi kamera untuk outcrop tertentu
app.get('/api/camera/positions/:outcropId', async (req, res) => {
  try {
    const { outcropId } = req.params;
    const positions = await Camera.find({ outcropId }).sort({ timestamp: -1 });
    res.json(positions);
  } catch (error) {
    console.error('Error saat mengambil data kamera:', error);
    res.status(500).json({
      message: 'Gagal mengambil data kamera',
      error: error.message
    });
  }
});

// Endpoint: Mendapatkan semua foto untuk outcrop tertentu
app.get('/api/photos/outcrop/:outcropId', async (req, res) => {
  try {
    const { outcropId } = req.params;
    console.log('Mengambil foto untuk outcrop:', outcropId);
    
    const photos = await PhotoPoint.find({ outcropId }).sort({ timestamp: -1 });
    res.json(photos);
  } catch (error) {
    console.error('Error mengambil foto:', error);
    res.status(500).json({ 
      message: 'Terjadi kesalahan saat mengambil foto',
      error: error.message
    });
  }
});

// Endpoint: Menambahkan foto baru (endpoint alternatif)
app.post('/api/photos', upload.single('photo'), async (req, res) => {
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
    console.log('Foto berhasil disimpan:', newPhotoPoint);
    
    res.status(201).json({
      message: 'Foto berhasil disimpan',
      data: newPhotoPoint
    });
  } catch (error) {
    console.error('Error menambahkan foto:', error);
    res.status(500).json({ 
      message: 'Terjadi kesalahan saat menambahkan foto',
      error: error.message
    });
  }
});

// Endpoint: Mendapatkan semua foto (endpoint alternatif)
app.get('/api/photos/:outcropId', async (req, res) => {
  try {
    const { outcropId } = req.params;
    console.log('Mengambil foto untuk outcrop:', outcropId);
    
    const photos = await PhotoPoint.find({ outcropId }).sort({ timestamp: -1 });
    res.json(photos);
  } catch (error) {
    console.error('Error mengambil foto:', error);
    res.status(500).json({ 
      message: 'Terjadi kesalahan saat mengambil foto',
      error: error.message
    });
  }
});

// Endpoint: Menghapus foto
app.delete('/api/photos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const photo = await PhotoPoint.findById(id);
    
    if (!photo) {
      return res.status(404).json({ message: 'Foto tidak ditemukan' });
    }
    
    // Hapus file foto dari server
    const filePath = path.join(__dirname, photo.photoUrl.substring(1));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    await PhotoPoint.findByIdAndDelete(id);
    console.log('Foto berhasil dihapus:', id);
    
    res.json({ message: 'Foto berhasil dihapus' });
  } catch (error) {
    console.error('Error menghapus foto:', error);
    res.status(500).json({ 
      message: 'Terjadi kesalahan saat menghapus foto',
      error: error.message
    });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Terjadi kesalahan di server',
    error: err.message
  });
});

// Jalankan server
app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
}); 