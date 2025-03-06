import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5004';
console.log('API URL yang digunakan:', API_URL);

export const fetchOutcrops = async () => {
  try {
    console.log('Mengambil data outcrops dari:', `${API_URL}/outcrops`);
    console.log('API_URL yang digunakan:', API_URL);
    
    const response = await fetch(`${API_URL}/outcrops`);
    if (!response.ok) {
      console.error(`Error response: ${response.status} ${response.statusText}`);
      throw new Error(`Gagal mengambil data outcrops: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Data outcrops yang diterima (raw):', JSON.stringify(data));
    
    // Periksa struktur data
    if (data && data.value && Array.isArray(data.value)) {
      console.log('Data outcrops memiliki format { value: [...], Count: ... }');
      console.log('Jumlah outcrops:', data.Count);
    } else if (Array.isArray(data)) {
      console.log('Data outcrops adalah array langsung');
      console.log('Jumlah outcrops:', data.length);
    } else {
      console.log('Data outcrops memiliki format lain:', typeof data);
    }
    
    // Periksa apakah data kosong
    if (!data || (Array.isArray(data) && data.length === 0) || (data.value && data.value.length === 0)) {
      console.warn('Data outcrops kosong');
    }
    
    return data;
  } catch (error) {
    console.error('Error saat mengambil data outcrops:', error);
    throw error;
  }
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
export const getCameraPosition = async () => {
  try {
    console.log('Mengambil posisi kamera dari:', `${API_URL}/api/camera/latest`);
    const response = await axios.get(`${API_URL}/api/camera/latest`);
    console.log('Data posisi kamera yang diterima:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching camera position:', error);
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