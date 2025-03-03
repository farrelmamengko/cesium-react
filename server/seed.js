const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Outcrop = require('./models/Outcrop');

// Load environment variables
dotenv.config();

// Data outcrop yang telah diperbarui tanpa properti camera
const initialData = [
  {
    assetId: 2282213,
    coordinates: {
      longitude: 130.284065,
      latitude: -2.029881,
      height: 75.86
    },
    description: {
      title: "OC 1 - Pre - Tertiary Unit – Upper Jurassic Stratigraphy Unit – Lelinta Formation (23JUL01)",
      location: "Seget Island, Misool, Southwest Papua",
      coordinate: "UTM 52S 642809 9775585",
      strikeDip: "N 142 E / 21",
      depositionalEnv: "Shallow Marine",
      petroleumSystem: "Regional Top Seal"
    }
  },
  {
    assetId: 2298041,
    coordinates: {
      longitude: 130.310587,
      latitude: -2.018613,
      height: 67.32
    },
    description: {
      title: "OC 2 - Pre - Tertiary Unit – Lower Cretaceous Stratigraphy Unit – Gamta Formation (23JLG01)",
      location: "Ulubam Island, Misool, Southwest Papua",
      coordinate: "UTM 52S 645762 9776900",
      strikeDip: "N 360 E / 28",
      depositionalEnv: "Shallow Marine (Platform Carbonate)",
      petroleumSystem: "Reservoir Candidate"
    }
  }
];

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB terhubung berhasil untuk seed data');
    seedData();
  })
  .catch(err => {
    console.error('Koneksi MongoDB gagal:', err);
    process.exit(1);
  });

// Fungsi untuk menyemai data
async function seedData() {
  try {
    // Hapus data yang ada
    await Outcrop.deleteMany({});
    console.log('Data lama dihapus');

    // Tambahkan data baru
    const result = await Outcrop.insertMany(initialData);
    console.log(`${result.length} outcrop berhasil ditambahkan`);
    
    mongoose.connection.close();
    console.log('Koneksi MongoDB ditutup');
  } catch (error) {
    console.error('Error saat menyemai data:', error);
    mongoose.connection.close();
    process.exit(1);
  }
} 