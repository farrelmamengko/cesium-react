const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

// Inisialisasi Express
const app = express();
const PORT = process.env.PORT || 5004;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware untuk menyajikan file statis
// Pastikan path uploads tersedia untuk akses publik
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
console.log('Serving static files from:', path.join(__dirname, 'uploads'));

// Serve static files
app.use(express.static(path.join(__dirname, 'build')));

// Middleware untuk logging request
app.use((req, res, next) => {
  const start = Date.now();
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  
  // Tambahkan listener untuk event 'finish' pada response
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} ${res.statusCode} - ${duration}ms`);
  });
  
  next();
});

// Tambahkan middleware CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Koneksi MongoDB
const connectDB = async () => {
  try {
    // Gunakan MONGODB_URI dari environment variable (untuk Docker)
    // atau gunakan localhost (untuk development)
    const dbUri = process.env.MONGODB_URI || 'mongodb://mongodb:27017/belajaroutcrop-db';
    
    console.log('Mencoba terhubung ke MongoDB dengan URI:', dbUri);
    
    await mongoose.connect(dbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    });
    
    console.log('MongoDB Connected ke database...');
    console.log(`Database URL: ${dbUri}`);
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    // Jangan keluar dari proses, coba lagi nanti
    setTimeout(connectDB, 5000);
  }
};

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

connectDB();

// Model Outcrop
const OutcropSchema = new mongoose.Schema({
  assetId: { type: Number, required: true },
  coordinates: {
    longitude: { type: Number, required: true },
    latitude: { type: Number, required: true },
    height: { type: Number, required: true }
  },
  camera: {
    heading: { type: Number, required: true },
    pitch: { type: Number, required: true },
    range: { type: Number, required: true }
  },
  description: {
    title: { type: String, required: true },
    location: { type: String, required: true },
    coordinate: { type: String, required: true },
    strikeDip: { type: String, required: true },
    depositionalEnv: { type: String, required: true },
    petroleumSystem: { type: String, required: true }
  }
}, {
  collection: 'outcrops',
  timestamps: true
});

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
  outcropId: { type: String, required: false } // Membuat outcropId opsional untuk kompatibilitas
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
  collection: 'photopoints',
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
const Outcrop = mongoose.model('Outcrop', OutcropSchema);
const Camera = mongoose.model('Camera', CameraSchema);
const PhotoPoint = mongoose.model('PhotoPoint', PhotoPointSchema);

// API Endpoint untuk outcrops
app.get('/outcrops', async (req, res) => {
  try {
    console.log('Mengambil semua outcrops');
    const outcrops = await Outcrop.find();
    
    // Log untuk debugging
    console.log('Data outcrops yang ditemukan:', outcrops);
    
    // Kembalikan dalam format yang konsisten
    res.json({
      value: outcrops,
      Count: outcrops.length
    });
  } catch (error) {
    console.error('Error mengambil outcrops:', error);
    res.status(500).json({
      message: 'Terjadi kesalahan saat mengambil outcrops',
      error: error.message
    });
  }
});

app.get('/outcrops/:id', async (req, res) => {
  try {
    console.log('Mengambil outcrop dengan id:', req.params.id);
    const outcrop = await Outcrop.findOne({ assetId: req.params.id });
    if (!outcrop) {
      return res.status(404).json({ message: 'Outcrop tidak ditemukan' });
    }
    res.json(outcrop);
  } catch (error) {
    console.error('Error mengambil outcrop:', error);
    res.status(500).json({
      message: 'Terjadi kesalahan saat mengambil outcrop',
      error: error.message
    });
  }
});

// API Endpoint untuk menyimpan posisi kamera
app.post('/api/camera/save', async (req, res) => {
  try {
    const cameraData = req.body;
    console.log('Menyimpan posisi kamera:', cameraData);
    
    // Pastikan outcropId selalu string jika ada
    if (cameraData.outcropId) {
      cameraData.outcropId = String(cameraData.outcropId);
    }
    
    const camera = new Camera(cameraData);
    const savedCamera = await camera.save();
    res.status(201).json(savedCamera);
  } catch (error) {
    console.error('Error menyimpan posisi kamera:', error);
    res.status(500).json({
      message: 'Terjadi kesalahan saat menyimpan posisi kamera',
      error: error.message
    });
  }
});

// API Endpoint untuk mendapatkan posisi kamera terbaru
app.get('/api/camera/latest', async (req, res) => {
  try {
    console.log('Mengambil posisi kamera terbaru');
    const latestCamera = await Camera.findOne().sort({ timestamp: -1 });
    if (!latestCamera) {
      return res.status(404).json({ message: 'Tidak ada posisi kamera tersimpan' });
    }
    res.json(latestCamera);
  } catch (error) {
    console.error('Error mengambil posisi kamera terbaru:', error);
    res.status(500).json({
      message: 'Terjadi kesalahan saat mengambil posisi kamera terbaru',
      error: error.message
    });
  }
});

// API Endpoint untuk mendapatkan posisi kamera terbaru berdasarkan outcropId
app.get('/api/camera/latest/:outcropId', async (req, res) => {
  try {
    const { outcropId } = req.params;
    console.log('Mengambil posisi kamera terbaru untuk outcrop:', outcropId);
    
    // Pastikan outcropId selalu string untuk konsistensi
    const outcropIdStr = String(outcropId);
    console.log('outcropId yang digunakan untuk query:', outcropIdStr);
    
    const latestCamera = await Camera.findOne({ outcropId: outcropIdStr }).sort({ timestamp: -1 });
    if (!latestCamera) {
      return res.status(404).json({ message: `Tidak ada posisi kamera tersimpan untuk outcrop ${outcropId}` });
    }
    res.json(latestCamera);
  } catch (error) {
    console.error('Error mengambil posisi kamera terbaru berdasarkan outcropId:', error);
    res.status(500).json({
      message: 'Terjadi kesalahan saat mengambil posisi kamera terbaru berdasarkan outcropId',
      error: error.message
    });
  }
});

// API Endpoint untuk upload foto
app.post('/api/photos/upload', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Tidak ada file yang diupload' });
    }

    const { outcropId, description, longitude, latitude, height } = req.body;
    console.log('Data foto yang diterima:', { outcropId, description, longitude, latitude, height });
    console.log('File yang diupload:', req.file);

    // Pastikan outcropId selalu string
    const outcropIdStr = String(outcropId);
    
    // Buat URL foto yang konsisten
    const photoUrl = `/uploads/photos/${req.file.filename}`;
    console.log('URL foto yang disimpan:', photoUrl);

    const photoPoint = new PhotoPoint({
      position: {
        longitude: parseFloat(longitude),
        latitude: parseFloat(latitude),
        height: parseFloat(height)
      },
      outcropId: outcropIdStr,
      photoUrl: photoUrl,
      description: description || 'Foto Outcrop',
      timestamp: new Date()
    });

    const savedPhotoPoint = await photoPoint.save();
    console.log('Foto berhasil disimpan:', savedPhotoPoint);
    
    res.status(201).json({
      message: 'Foto berhasil diupload',
      photoPoint: savedPhotoPoint
    });
  } catch (error) {
    console.error('Error uploading photo:', error);
    res.status(500).json({
      message: 'Terjadi kesalahan saat mengupload foto',
      error: error.message
    });
  }
});

// API Endpoint untuk mendapatkan foto berdasarkan outcropId
app.get('/api/photos/outcrop/:outcropId', async (req, res) => {
  try {
    const { outcropId } = req.params;
    console.log('Mengambil foto untuk outcrop:', outcropId);
    
    // Pastikan outcropId selalu string untuk konsistensi
    const outcropIdStr = String(outcropId);
    console.log('outcropId yang digunakan untuk query:', outcropIdStr);
    
    const photos = await PhotoPoint.find({ outcropId: outcropIdStr });
    res.json(photos);
  } catch (error) {
    console.error('Error mengambil foto berdasarkan outcropId:', error);
    res.status(500).json({
      message: 'Terjadi kesalahan saat mengambil foto berdasarkan outcropId',
      error: error.message
    });
  }
});

// API Endpoint untuk menghapus foto
app.delete('/api/photos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Menghapus foto dengan id:', id);
    
    const photo = await PhotoPoint.findById(id);
    if (!photo) {
      return res.status(404).json({ message: 'Foto tidak ditemukan' });
    }

    // Hapus file foto dari sistem
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

// API Endpoint untuk tilesets
app.get('/tilesets', (req, res) => {
  try {
    console.log('Mengambil data tilesets');
    // Contoh data tilesets
    const tilesets = [
      {
        id: 1,
        name: 'Misool Outcrop',
        url: '/assets/tilesets/misool/tileset.json'
      }
    ];
    res.json(tilesets);
  } catch (error) {
    console.error('Error mengambil tilesets:', error);
    res.status(500).json({
      message: 'Terjadi kesalahan saat mengambil tilesets',
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

// Semua route yang tidak ditangani oleh API akan diarahkan ke aplikasi React
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Jalankan server
app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
}); 