// Service untuk API calls
const API_URL = '/api';

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

// Fungsi untuk menyimpan posisi kamera
export const saveCameraPosition = async (outcropId, cameraPosition) => {
  try {
    const response = await fetch('http://localhost:5003/api/camera/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        position: {
          longitude: cameraPosition.longitude,
          latitude: cameraPosition.latitude,
          height: cameraPosition.height
        },
        orientation: {
          heading: cameraPosition.heading,
          pitch: cameraPosition.pitch,
          roll: cameraPosition.roll || 0
        },
        outcropId
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving camera position:', error);
    throw error;
  }
};

// Fungsi untuk mengambil posisi kamera yang tersimpan
export const getCameraPosition = async (outcropId) => {
  try {
    // Untuk sementara, ambil dari localStorage
    const savedPositions = JSON.parse(localStorage.getItem('cameraPositions') || '{}');
    return savedPositions[outcropId];
    
    // Jika nanti sudah ada API backend, gunakan kode di bawah ini:
    /*
    const response = await fetch(`/api/camera-positions/${outcropId}`);
    
    if (!response.ok) {
      throw new Error('Gagal mengambil posisi kamera');
    }
    
    return response.json();
    */
  } catch (error) {
    console.error('Error getting camera position:', error);
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