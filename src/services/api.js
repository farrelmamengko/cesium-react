import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5004';
console.log('API URL yang digunakan:', API_URL);

export const fetchOutcrops = async () => {
  try {
    console.log('Mengambil data outcrops dari:', `${API_URL}/outcrops`);
    console.log('API_URL yang digunakan:', API_URL);
    
    // Tambahkan timeout untuk menghindari permintaan yang terlalu lama
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 detik timeout
    
    try {
      const response = await fetch(`${API_URL}/outcrops`, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.error(`Error response: ${response.status} ${response.statusText}`);
        throw new Error(`Gagal mengambil data outcrops: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Data outcrops yang diterima (raw):', JSON.stringify(data));
      
      // Periksa struktur data
      if (Array.isArray(data)) {
        console.log('Data outcrops adalah array dengan panjang:', data.length);
        
        // Validasi data
        const validData = data.filter(outcrop => {
          if (!outcrop) {
            console.warn('Outcrop adalah null atau undefined');
            return false;
          }
          
          if (outcrop.coordinates) {
            if (!outcrop.coordinates.longitude || !outcrop.coordinates.latitude) {
              console.warn('Outcrop memiliki koordinat yang tidak valid:', outcrop);
              return false;
            }
            return true;
          } else if (outcrop.position) {
            if (!outcrop.position.longitude || !outcrop.position.latitude) {
              console.warn('Outcrop memiliki posisi yang tidak valid:', outcrop);
              return false;
            }
            return true;
          }
          
          console.warn('Outcrop tidak memiliki koordinat atau posisi:', outcrop);
          return false;
        });
        
        console.log('Data outcrops yang valid:', validData.length);
        
        if (validData.length === 0) {
          console.warn('Tidak ada data outcrops yang valid, menggunakan data hardcoded');
          return getHardcodedOutcrops();
        }
        
        return validData;
      } else if (data && typeof data === 'object') {
        // Jika data adalah objek, coba cari properti yang berisi array
        for (const key in data) {
          if (Array.isArray(data[key])) {
            console.log(`Menemukan array di properti ${key} dengan panjang:`, data[key].length);
            return data[key];
          }
        }
      }
      
      console.warn('Format data outcrops tidak dikenali, menggunakan data hardcoded:', data);
      return getHardcodedOutcrops();
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error('Permintaan timeout setelah 10 detik');
        console.warn('Menggunakan data hardcoded karena timeout');
        return getHardcodedOutcrops();
      }
      throw error;
    }
  } catch (error) {
    console.error('Error saat mengambil data outcrops:', error);
    
    // Coba fallback ke data hardcoded jika tidak bisa mengambil dari API
    console.log('Menggunakan data outcrops hardcoded sebagai fallback');
    return getHardcodedOutcrops();
  }
};

// Fungsi untuk mendapatkan data outcrops hardcoded
const getHardcodedOutcrops = () => {
  console.log('Menggunakan data outcrops hardcoded');
  
  // Data hardcoded untuk OC1 dan OC2
  return [
    {
      _id: 'OC1',
      assetId: 2282213,
      coordinates: { longitude: 130.284065, latitude: -2.029881, height: 75.86 },
      camera: { heading: 10, pitch: 90, range: 500 },
      description: {
        title: 'OC 1 - Pre - Tertiary Unit – Upper Jurassic Stratigraphy Unit – Lelinta Formation (23JUL01)',
        location: 'Seget Island, Misool, Southwest Papua',
        coordinate: 'UTM 52S 642809 9775585',
        strikeDip: 'N 142 E / 21',
        depositionalEnv: 'Shallow Marine',
        petroleumSystem: 'Regional Top Seal'
      }
    },
    {
      _id: 'OC2',
      assetId: 2298041,
      coordinates: { longitude: 130.310587, latitude: -2.018613, height: 67.32 },
      camera: { heading: 30, pitch: -35, range: 400 },
      description: {
        title: 'OC 2 - Pre - Tertiary Unit – Lower Cretaceous Stratigraphy Unit – Gamta Formation (23JLG01)',
        location: 'Ulubam Island, Misool, Southwest Papua',
        coordinate: 'UTM 52S 645762 9776900',
        strikeDip: 'N 360 E / 28',
        depositionalEnv: 'Shallow Marine (Platform Carbonate)',
        petroleumSystem: 'Reservoir Candidate'
      }
    }
  ];
};

export const fetchOutcropById = async (id) => {
  try {
    console.log('Mengambil outcrop dengan id:', id, 'dari:', `${API_URL}/outcrops/${id}`);
    const response = await fetch(`${API_URL}/outcrops/${id}`);
    if (!response.ok) throw new Error(`Gagal mengambil outcrop dengan id ${id}`);
    const data = await response.json();
    console.log('Data outcrop yang diterima:', data);
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const createOutcrop = async (outcropData) => {
  try {
    const response = await fetch(`${API_URL}/outcrops`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(outcropData),
    });
    if (!response.ok) throw new Error('Gagal membuat outcrop');
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const updateOutcrop = async (id, outcropData) => {
  try {
    const response = await fetch(`${API_URL}/outcrops/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(outcropData),
    });
    if (!response.ok) throw new Error(`Gagal memperbarui outcrop dengan id ${id}`);
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const deleteOutcrop = async (id) => {
  try {
    const response = await fetch(`${API_URL}/outcrops/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error(`Gagal menghapus outcrop dengan id ${id}`);
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

// Fungsi untuk mengambil data kamera dari MongoDB berdasarkan outcropId
export const getCameraFromMongoDB = async (outcropId) => {
  try {
    console.log('Mengambil data kamera untuk outcrop:', outcropId, 'dari:', `${API_URL}/api/camera/latest/${outcropId}`);
    console.log('API_URL yang digunakan:', API_URL);
    console.log('Tipe outcropId:', typeof outcropId);
    
    const response = await fetch(`${API_URL}/api/camera/latest/${outcropId}`);
    if (!response.ok) {
      if (response.status === 404) {
        console.log(`Tidak ada data kamera tersimpan untuk outcrop ${outcropId}`);
        return null;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('Data kamera yang diterima:', data);
    return data;
  } catch (error) {
    console.error('Error mengambil data kamera:', error);
    return null;
  }
};

// Fungsi untuk mendapatkan foto berdasarkan outcropId
export const getPhotosByOutcropId = async (outcropId) => {
  try {
    console.log('Mengambil foto untuk outcrop:', outcropId, 'dari:', `${API_URL}/api/photos/outcrop/${outcropId}`);
    const response = await axios.get(`${API_URL}/api/photos/outcrop/${outcropId}`);
    console.log('Response foto:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching photos:', error);
    throw error;
  }
};

// Fungsi untuk menambahkan foto baru
export const addPhoto = async (formData) => {
  try {
    // Log untuk debugging
    console.log('Mencoba upload foto ke:', `${API_URL}/api/photos/upload`);

    const response = await axios.post(`${API_URL}/api/photos/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('Response upload:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error uploading photo:', error);
    console.error('Error response:', error.response?.data);
    throw error;
  }
};

// Fungsi untuk menghapus foto
export const deletePhoto = async (photoId) => {
  try {
    const response = await axios.delete(`${API_URL}/api/photos/${photoId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting photo:', error);
    throw error;
  }
};

// Fungsi untuk mendapatkan data tileset
export const getTilesets = async () => {
  try {
    console.log('Mengambil data tilesets dari:', `${API_URL}/tilesets`);
    const response = await axios.get(`${API_URL}/tilesets`);
    console.log('Data tilesets yang diterima:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching tilesets:', error);
    throw error;
  }
};

// Fungsi untuk mendapatkan data kamera
export const getCameraPosition = async (outcropId) => {
  try {
    console.log(`Mengambil posisi kamera untuk outcrop ${outcropId} dari:`, `${API_URL}/api/camera/latest/${outcropId}`);
    
    // Coba endpoint /api/camera/latest/:outcropId terlebih dahulu
    try {
      const response = await fetch(`${API_URL}/api/camera/latest/${outcropId}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`Posisi kamera untuk outcrop ${outcropId} ditemukan dari endpoint /api/camera/latest:`, data);
        return data;
      } else {
        console.log(`Endpoint /api/camera/latest/${outcropId} tidak tersedia, mencoba endpoint alternatif...`);
      }
    } catch (error) {
      console.log(`Error saat mengakses endpoint /api/camera/latest/${outcropId}:`, error.message);
    }
    
    // Coba endpoint /camerapositions
    try {
      console.log(`Mencoba mendapatkan posisi kamera dari endpoint /camerapositions dengan outcropId ${outcropId}`);
      const response = await fetch(`${API_URL}/camerapositions`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`Data camerapositions:`, data);
        
        // Cari posisi kamera dengan outcropId yang sesuai
        let cameraPositions = data;
        if (!Array.isArray(data) && data.value) {
          cameraPositions = data.value;
        }
        
        const cameraPosition = cameraPositions.find(pos => 
          pos.outcropId === outcropId || 
          pos.outcropId === outcropId.toString() || 
          (pos.outcropId && pos.outcropId.toString() === outcropId.toString())
        );
        
        if (cameraPosition) {
          console.log(`Posisi kamera untuk outcrop ${outcropId} ditemukan dari endpoint /camerapositions:`, cameraPosition);
          return cameraPosition;
        } else {
          console.log(`Tidak ada posisi kamera yang ditemukan untuk outcrop ${outcropId} di endpoint /camerapositions`);
        }
      } else {
        console.log(`Endpoint /camerapositions tidak tersedia atau mengembalikan error:`, response.status);
      }
    } catch (error) {
      console.log(`Error saat mengakses endpoint /camerapositions:`, error.message);
    }
    
    // Jika tidak ada posisi kamera yang ditemukan, coba cari di data outcrops
    try {
      console.log(`Mencoba mendapatkan posisi kamera dari data outcrop dengan id ${outcropId}`);
      const response = await fetch(`${API_URL}/outcrops/${outcropId}`);
      
      if (response.ok) {
        const outcrop = await response.json();
        console.log(`Data outcrop:`, outcrop);
        
        if (outcrop && outcrop.camera) {
          // Konversi format data outcrop.camera ke format yang diharapkan
          const cameraPosition = {
            position: outcrop.coordinates || {},
            orientation: {
              heading: outcrop.camera.heading || 0,
              pitch: outcrop.camera.pitch || -45,
              roll: 0
            }
          };
          
          console.log(`Posisi kamera dibuat dari data outcrop:`, cameraPosition);
          return cameraPosition;
        } else if (outcrop && outcrop.coordinates) {
          // Jika tidak ada data kamera, gunakan koordinat outcrop dengan orientasi default
          const cameraPosition = {
            position: outcrop.coordinates,
            orientation: {
              heading: 0,
              pitch: -45,
              roll: 0
            }
          };
          
          console.log(`Posisi kamera dibuat dari koordinat outcrop:`, cameraPosition);
          return cameraPosition;
        }
      }
    } catch (error) {
      console.log(`Error saat mengakses endpoint /outcrops/${outcropId}:`, error.message);
    }
    
    // Jika tidak ada posisi kamera yang ditemukan, coba cari outcrop berdasarkan assetId
    try {
      console.log(`Mencoba mendapatkan outcrop dengan assetId ${outcropId}`);
      const response = await fetch(`${API_URL}/outcrops`);
      
      if (response.ok) {
        const outcrops = await response.json();
        console.log(`Data outcrops:`, outcrops);
        
        // Cari outcrop dengan assetId yang sesuai
        const outcrop = outcrops.find(o => 
          o.assetId === parseInt(outcropId) || 
          o.assetId === outcropId || 
          (o.assetId && o.assetId.toString() === outcropId.toString())
        );
        
        if (outcrop && outcrop.coordinates) {
          // Gunakan koordinat outcrop dengan orientasi default
          const cameraPosition = {
            position: outcrop.coordinates,
            orientation: {
              heading: outcrop.camera?.heading || 0,
              pitch: outcrop.camera?.pitch || -45,
              roll: 0
            }
          };
          
          console.log(`Posisi kamera dibuat dari outcrop dengan assetId ${outcropId}:`, cameraPosition);
          return cameraPosition;
        }
      }
    } catch (error) {
      console.log(`Error saat mencari outcrop dengan assetId ${outcropId}:`, error.message);
    }
    
    console.warn(`Tidak dapat menemukan posisi kamera untuk outcrop ${outcropId} dari semua endpoint yang tersedia`);
    return null;
  } catch (error) {
    console.error(`Error saat mengambil posisi kamera untuk outcrop ${outcropId}:`, error);
    throw error;
  }
};

// Fungsi untuk menyimpan posisi kamera
export const saveCameraPosition = async (cameraData) => {
  try {
    console.log('Menyimpan posisi kamera ke:', `${API_URL}/api/camera/save`, 'dengan data:', cameraData);
    const response = await axios.post(`${API_URL}/api/camera/save`, cameraData);
    console.log('Response save camera:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error saving camera position:', error);
    throw error;
  }
};

export const getLatestCameraPosition = async () => {
  try {
    console.log('Mengambil posisi kamera terbaru dari database...');
    const response = await fetch(`${API_URL}/api/camera/latest`);

    if (!response.ok) {
      throw new Error('Gagal mengambil posisi kamera terbaru');
    }

    const data = await response.json();
    console.log('Posisi kamera terbaru:', data);
    return data;
  } catch (error) {
    console.error('Error getting latest camera position:', error);
    throw error;
  }
};

export default {
  fetchOutcrops,
  fetchOutcropById,
  createOutcrop,
  updateOutcrop,
  deleteOutcrop,
  getPhotosByOutcropId,
  addPhoto,
  deletePhoto,
  getTilesets,
  getCameraPosition,
  saveCameraPosition,
  getLatestCameraPosition,
  getCameraFromMongoDB
};