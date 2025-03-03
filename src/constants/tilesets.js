import * as Cesium from 'cesium';

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

// Fungsi untuk mengambil data kamera dari MongoDB
const getCameraFromMongoDB = async (outcropId) => {
  try {
    const response = await fetch(`http://localhost:5003/api/camera/latest/${outcropId}`);
    if (!response.ok) {
      throw new Error('Gagal mengambil data kamera');
    }
    return await response.json();
  } catch (error) {
    console.error('Error mengambil data kamera:', error);
    return null;
  }
};

// Fungsi untuk menginisialisasi data tileset dari MongoDB
const initializeTilesetsFromDB = async () => {
  try {
    // Ambil data untuk OC 1
    const camera1 = await getCameraFromMongoDB('OC1');
    if (camera1) {
      TILESET_1 = {
        ...TILESET_1,
        coordinates: {
          longitude: camera1.position.longitude,
          latitude: camera1.position.latitude,
          height: camera1.position.height
        },
        camera: {
          heading: camera1.orientation.heading,
          pitch: camera1.orientation.pitch,
          range: TILESET_1.camera.range
        }
      };
    }

    // Ambil data untuk OC 2
    const camera2 = await getCameraFromMongoDB('OC2');
    if (camera2) {
      TILESET_2 = {
        ...TILESET_2,
        coordinates: {
          longitude: camera2.position.longitude,
          latitude: camera2.position.latitude,
          height: camera2.position.height
        },
        camera: {
          heading: camera2.orientation.heading,
          pitch: camera2.orientation.pitch,
          range: TILESET_2.camera.range
        }
      };
    }

    console.log('Data tileset berhasil diinisialisasi dari MongoDB');
  } catch (error) {
    console.error('Error inisialisasi tileset:', error);
  }
};

// Panggil inisialisasi saat file di-load
initializeTilesetsFromDB();

const saveCameraPosition = async (cameraData, outcropId) => {
  console.log('Mencoba menyimpan data kamera asli:', cameraData);
  try {
    const dataToSave = {
      position: {
        longitude: cameraData.longitude,
        latitude: cameraData.latitude,
        height: cameraData.height
      },
      orientation: {
        heading: cameraData.heading,
        pitch: cameraData.pitch,
        roll: cameraData.roll
      },
      timestamp: new Date().toISOString(),
      description: 'Saved Camera Position',
      outcropId: outcropId // Tambahkan outcropId
    };

    console.log('Data yang akan dikirim ke server:', dataToSave);

    const response = await fetch('http://localhost:5003/api/camera/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataToSave)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('Response dari server:', result);

    // Update tileset lokal setelah berhasil menyimpan
    if (outcropId === 'OC1') {
      TILESET_1.coordinates = dataToSave.position;
      TILESET_1.camera = {
        heading: dataToSave.orientation.heading,
        pitch: dataToSave.orientation.pitch,
        range: TILESET_1.camera.range
      };
    } else if (outcropId === 'OC2') {
      TILESET_2.coordinates = dataToSave.position;
      TILESET_2.camera = {
        heading: dataToSave.orientation.heading,
        pitch: dataToSave.orientation.pitch,
        range: TILESET_2.camera.range
      };
    }

    return result;
  } catch (error) {
    console.error('Error dalam saveCameraPosition:', error);
    throw new Error('Gagal menyimpan posisi kamera: ' + error.message);
  }
};

const applyCameraPosition = (viewer, savedPosition) => {
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(
      savedPosition.position.longitude,
      savedPosition.position.latitude,
      savedPosition.position.height
    ),
    orientation: {
      heading: Cesium.Math.toRadians(savedPosition.orientation.heading),
      pitch: Cesium.Math.toRadians(savedPosition.orientation.pitch),
      roll: Cesium.Math.toRadians(savedPosition.orientation.roll)
    },
    duration: 2 // Durasi animasi dalam detik
  });
};

const handleSaveCamera = async (viewer, customData = null) => {
  try {
    let cameraData;
    let outcropId;
    
    if (customData) {
      cameraData = customData;
      console.log('Menggunakan data kamera dari panel:', cameraData);
    } else {
      const camera = viewer.camera;
      const position = camera.position;
      const cartographic = Cesium.Cartographic.fromCartesian(position);
      
      cameraData = {
        longitude: Cesium.Math.toDegrees(cartographic.longitude),
        latitude: Cesium.Math.toDegrees(cartographic.latitude),
        height: cartographic.height,
        heading: Cesium.Math.toDegrees(camera.heading),
        pitch: Cesium.Math.toDegrees(camera.pitch),
        roll: Cesium.Math.toDegrees(camera.roll)
      };
    }

    // Tentukan outcropId berdasarkan jarak
    const distanceToTileset1 = Cesium.Cartesian3.distance(
      Cesium.Cartesian3.fromDegrees(TILESET_1.coordinates.longitude, TILESET_1.coordinates.latitude, TILESET_1.coordinates.height),
      Cesium.Cartesian3.fromDegrees(cameraData.longitude, cameraData.latitude, cameraData.height)
    );
    
    const distanceToTileset2 = Cesium.Cartesian3.distance(
      Cesium.Cartesian3.fromDegrees(TILESET_2.coordinates.longitude, TILESET_2.coordinates.latitude, TILESET_2.coordinates.height),
      Cesium.Cartesian3.fromDegrees(cameraData.longitude, cameraData.latitude, cameraData.height)
    );

    outcropId = distanceToTileset1 < distanceToTileset2 ? 'OC1' : 'OC2';
    
    const result = await saveCameraPosition(cameraData, outcropId);
    console.log('Data kamera berhasil disimpan untuk:', outcropId);

    alert('Posisi kamera berhasil disimpan!');
  } catch (error) {
    console.error('Error saat menyimpan:', error);
    alert(error.message);
  }
};

export {
  TILESET_1,
  TILESET_2,
  saveCameraPosition,
  applyCameraPosition,
  handleSaveCamera,
  initializeTilesetsFromDB
}; 