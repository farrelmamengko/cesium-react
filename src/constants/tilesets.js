import * as Cesium from 'cesium';
import { getCameraFromMongoDB, saveCameraPosition } from '../services/api';

// Data default untuk fallback
const DEFAULT_TILESET_1 = {
  assetId: 2282213,
  coordinates: {
    longitude: 130.284065,
    latitude: -2.029881,
    height: 75.86
  },
  camera: {
    heading: 0,
    pitch: -90,
    range: 500
  },
  description: {
    title: "OC 1 - Pre - Tertiary Unit – Upper Jurassic Stratigraphy Unit – Lelinta Formation (23JUL01)",
    location: "Seget Island, Misool, Southwest Papua",
    coordinate: "UTM 52S 642809 9775585",
    strikeDip: "N 142 E / 21",
    depositionalEnv: "Shallow Marine",
    petroleumSystem: "Regional Top Seal"
  }
};

const DEFAULT_TILESET_2 = {
  assetId: 2298041,
  coordinates: {
    longitude: 130.310587,
    latitude: -2.018613,
    height: 67.32
  },
  camera: {
    heading: 30,
    pitch: -35,
    range: 400
  },
  description: {
    title: "OC 2 - Pre - Tertiary Unit – Lower Cretaceous Stratigraphy Unit – Gamta Formation (23JLG01)",
    location: "Ulubam Island, Misool, Southwest Papua",
    coordinate: "UTM 52S 645762 9776900",
    strikeDip: "N 360 E / 28",
    depositionalEnv: "Shallow Marine (Platform Carbonate)",
    petroleumSystem: "Reservoir Candidate"
  }
};

// State untuk menyimpan data tileset yang diambil dari database
let TILESET_1 = { ...DEFAULT_TILESET_1 };
let TILESET_2 = { ...DEFAULT_TILESET_2 };

// Fungsi untuk menginisialisasi data tileset dari database
const initializeTilesetsFromDB = async () => {
  try {
    console.log('Menginisialisasi data tileset dari database...');
    
    // Ambil data kamera untuk tileset 1
    const camera1 = await getCameraFromMongoDB(TILESET_1.assetId.toString());
    if (camera1) {
      console.log('Data kamera untuk tileset 1 ditemukan:', camera1);
      // Update data kamera di TILESET_1 jika ada
      TILESET_1.camera = {
        heading: camera1.orientation.heading,
        pitch: camera1.orientation.pitch,
        range: 500 // Range tetap default
      };
      TILESET_1.coordinates = {
        longitude: camera1.position.longitude,
        latitude: camera1.position.latitude,
        height: camera1.position.height
      };
    }
    
    // Ambil data kamera untuk tileset 2
    const camera2 = await getCameraFromMongoDB(TILESET_2.assetId.toString());
    if (camera2) {
      console.log('Data kamera untuk tileset 2 ditemukan:', camera2);
      // Update data kamera di TILESET_2 jika ada
      TILESET_2.camera = {
        heading: camera2.orientation.heading,
        pitch: camera2.orientation.pitch,
        range: 400 // Range tetap default
      };
      TILESET_2.coordinates = {
        longitude: camera2.position.longitude,
        latitude: camera2.position.latitude,
        height: camera2.position.height
      };
    }
    
    console.log('Inisialisasi data tileset selesai');
  } catch (error) {
    console.error('Error saat inisialisasi data tileset:', error);
  }
};

// Fungsi untuk menyimpan posisi kamera
const handleSaveCamera = async (viewer) => {
  try {
    const camera = viewer.camera;
    const ellipsoid = Cesium.Ellipsoid.WGS84;
    const cartographic = ellipsoid.cartesianToCartographic(camera.position);
    
    const cameraData = {
      position: {
        longitude: Cesium.Math.toDegrees(cartographic.longitude),
        latitude: Cesium.Math.toDegrees(cartographic.latitude),
        height: cartographic.height
      },
      orientation: {
        heading: Cesium.Math.toDegrees(camera.heading),
        pitch: Cesium.Math.toDegrees(camera.pitch),
        roll: Cesium.Math.toDegrees(camera.roll)
      },
      description: 'Saved Camera Position'
    };
    
    // Tentukan outcropId berdasarkan jarak
    const position = Cesium.Cartesian3.fromDegrees(
      cameraData.position.longitude,
      cameraData.position.latitude,
      cameraData.position.height
    );
    
    const distanceToTileset1 = Cesium.Cartesian3.distance(
      Cesium.Cartesian3.fromDegrees(
        TILESET_1.coordinates.longitude,
        TILESET_1.coordinates.latitude,
        TILESET_1.coordinates.height
      ),
      position
    );
    
    const distanceToTileset2 = Cesium.Cartesian3.distance(
      Cesium.Cartesian3.fromDegrees(
        TILESET_2.coordinates.longitude,
        TILESET_2.coordinates.latitude,
        TILESET_2.coordinates.height
      ),
      position
    );
    
    // Gunakan assetId sebagai outcropId
    const outcropId = distanceToTileset1 < distanceToTileset2 
      ? TILESET_1.assetId.toString() 
      : TILESET_2.assetId.toString();
    
    // Tambahkan outcropId ke data kamera
    cameraData.outcropId = outcropId;
    
    console.log('Menyimpan posisi kamera untuk outcropId:', outcropId);
    const result = await saveCameraPosition(cameraData);
    console.log('Data kamera berhasil disimpan:', result);
    
    alert('Posisi kamera berhasil disimpan!');
  } catch (error) {
    console.error('Error saat menyimpan posisi kamera:', error);
    alert('Gagal menyimpan posisi kamera: ' + error.message);
  }
};

// Fungsi untuk menerapkan posisi kamera
const applyCameraPosition = (viewer, cameraPosition) => {
  if (!viewer || !cameraPosition) return;
  
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(
      cameraPosition.position.longitude,
      cameraPosition.position.latitude,
      cameraPosition.position.height
    ),
    orientation: {
      heading: Cesium.Math.toRadians(cameraPosition.orientation.heading),
      pitch: Cesium.Math.toRadians(cameraPosition.orientation.pitch),
      roll: Cesium.Math.toRadians(cameraPosition.orientation.roll)
    },
    duration: 2
  });
};

export {
  TILESET_1,
  TILESET_2,
  saveCameraPosition,
  applyCameraPosition,
  handleSaveCamera,
  initializeTilesetsFromDB
}; 