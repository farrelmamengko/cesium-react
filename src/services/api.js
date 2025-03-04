import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003';

export const fetchOutcrops = async () => {
  try {
    const response = await fetch(`${API_URL}/outcrops`);
    if (!response.ok) throw new Error('Gagal mengambil data outcrops');
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const fetchOutcropById = async (id) => {
  try {
    const response = await fetch(`${API_URL}/outcrops/${id}`);
    if (!response.ok) throw new Error(`Gagal mengambil outcrop dengan id ${id}`);
    return await response.json();
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
    const response = await fetch(`http://localhost:5003/api/camera/latest/${outcropId}`);
    if (!response.ok) {
      if (response.status === 404) {
        console.log(`Tidak ada data kamera tersimpan untuk outcrop ${outcropId}`);
        return null;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error mengambil data kamera:', error);
    return null;
  }
};

// Fungsi untuk mendapatkan foto berdasarkan outcropId
export const getPhotosByOutcropId = async (outcropId) => {
  try {
    const response = await axios.get(`${API_URL}/api/photos/outcrop/${outcropId}`);
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
    console.log('Mencoba upload foto ke:', `${API_URL}/api/photos`);
    
    const response = await axios.post(`${API_URL}/api/photos`, formData, {
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
    const response = await axios.delete(`${API_URL}/photos/${photoId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting photo:', error);
    throw error;
  }
};

// Fungsi untuk mendapatkan data tileset
export const getTilesets = async () => {
  try {
    const response = await axios.get(`${API_URL}/tilesets`);
    return response.data;
  } catch (error) {
    console.error('Error fetching tilesets:', error);
    throw error;
  }
};

// Fungsi untuk mendapatkan data kamera
export const getCameraPosition = async () => {
  try {
    const response = await axios.get(`${API_URL}/camera`);
    return response.data;
  } catch (error) {
    console.error('Error fetching camera position:', error);
    throw error;
  }
};

// Fungsi untuk menyimpan posisi kamera
export const saveCameraPosition = async (cameraData) => {
  try {
    const response = await axios.post(`${API_URL}/camera`, cameraData);
    return response.data;
  } catch (error) {
    console.error('Error saving camera position:', error);
    throw error;
  }
};

export const getLatestCameraPosition = async () => {
  try {
    console.log('Mengambil posisi kamera terbaru dari database...');
    const response = await fetch('http://localhost:5003/api/camera/latest');
    
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
  getPhotosByOutcropId,
  addPhoto,
  deletePhoto,
  getTilesets,
  getCameraPosition,
  saveCameraPosition
}; 