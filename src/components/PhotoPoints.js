import React, { useState, useEffect, useRef } from 'react';
import { Entity } from 'resium';
import * as Cesium from 'cesium';
import { getPhotosByOutcropId } from '../services/api';
import PhotoHoverPopup from './PhotoHoverPopup';
import './PhotoPoints.css';

// URL API server
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003';

const PhotoPoints = ({ outcropId, viewer }) => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredPhoto, setHoveredPhoto] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  useEffect(() => {
    const fetchPhotos = async () => {
      if (!outcropId) return;
      
      try {
        setLoading(true);
        const data = await getPhotosByOutcropId(outcropId);
        console.log('Foto yang diambil dari API:', data);
        
        // Verifikasi data foto
        if (data && Array.isArray(data)) {
          // Validasi setiap foto
          const validatedData = data.map(photo => {
            // Pastikan URL foto ada dan valid
            if (!photo.photoUrl) {
              console.warn('Foto tanpa URL ditemukan:', photo);
              // Tambahkan placeholder default jika tidak ada URL
              photo.photoUrl = '';
            } else {
              // Normalkan format URL jika perlu
              let url = photo.photoUrl;
              
              // Jangan manipulasi URL lengkap
              if (!url.startsWith('http') && !url.startsWith('/')) {
                // Kalau tidak ada http atau /, tambahkan path relatif
                photo.photoUrl = `uploads/${photo._id}.jpg`;
              }
              
              console.log('URL foto valid:', photo.photoUrl);
            }
            return photo;
          });
          
          setPhotos(validatedData);
        } else {
          console.error('Format data foto tidak valid:', data);
          setError('Format data foto tidak valid');
        }
      } catch (err) {
        console.error('Error fetching photos:', err);
        setError('Gagal memuat foto');
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, [outcropId]);

  const handleMouseEnter = (photo, position) => {
    console.log('Hover pada foto:', photo);
    
    // Menyalin objek foto untuk memastikan referensi baru
    const photoData = { ...photo };
    
    // Pastikan URL valid dengan menambahkan base URL jika perlu
    if (photoData.photoUrl && !photoData.photoUrl.startsWith('http')) {
      // Test path-path yang mungkin
      console.log('URL relatif terdeteksi, mencoba menormalisasi:', photoData.photoUrl);
      
      // Ini akan menjadi tugas komponen PhotoHoverPopup
    }
    
    setHoveredPhoto(photoData);
    
    if (viewer && viewer.scene) {
      try {
        // Membuat Cartesian3 dari posisi geografis
        const cartesian = Cesium.Cartesian3.fromDegrees(
          position.longitude, 
          position.latitude, 
          position.height
        );
        
        // Cek apakah scene dan SceneTransforms tersedia
        if (viewer.scene && cartesian) {
          // Gunakan metode wgs84ToWindowCoordinates
          const windowPosition = Cesium.SceneTransforms.worldToWindowCoordinates(
            viewer.scene,
            cartesian
          );
          
          if (windowPosition) {
            setPopupPosition({
              x: windowPosition.x,
              y: windowPosition.y - 150 // Mengubah nilai offset agar popup tampil di atas titik
            });
          }
        }
      } catch (err) {
        console.error('Error converting coordinates:', err);
      }
    }
  };

  const handleMouseLeave = () => {
    setHoveredPhoto(null);
  };

  if (loading) return null;
  if (error) return null;
  if (!photos || photos.length === 0) return null;

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%' }}>
      {photos.map((photo) => (
        <Entity
          key={photo._id}
          position={Cesium.Cartesian3.fromDegrees(
            photo.position.longitude,
            photo.position.latitude,
            photo.position.height
          )}
          point={{
            pixelSize: 16, // Memperbesar ukuran point agar lebih terlihat
            color: Cesium.Color.DODGERBLUE,
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 3,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            disableDepthTestDistance: Number.POSITIVE_INFINITY // Memastikan point selalu terlihat
          }}
          name={`Foto ${photo._id}`}
          description={`
            <div class="cesium-infoBox-photo">
              <h3>${photo.description || 'Foto Outcrop'}</h3>
              <img src="${photo.photoUrl}" alt="Foto Outcrop" style="max-width: 100%; margin-top: 10px;" />
              <p>Diambil pada: ${new Date(photo.createdAt).toLocaleString()}</p>
            </div>
          `}
          onMouseEnter={() => handleMouseEnter(photo, photo.position)}
          onMouseLeave={handleMouseLeave}
          label={{
            text: photo.description || 'Foto Outcrop',
            font: '14px sans-serif',
            fillColor: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 2,
            style: hoveredPhoto && hoveredPhoto._id === photo._id ? 'FILL_AND_OUTLINE' : 'NONE',
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
            pixelOffset: new Cesium.Cartesian2(0, -10),
            showBackground: true,
            backgroundColor: new Cesium.Color(0, 0, 0, 0.7),
            backgroundPadding: new Cesium.Cartesian2(8, 4),
            disableDepthTestDistance: Number.POSITIVE_INFINITY
          }}
        />
      ))}

      {hoveredPhoto && (
        <div 
          className="photo-hover-container"
          style={{
            position: 'absolute',
            left: `${popupPosition.x}px`,
            top: `${popupPosition.y}px`,
            pointerEvents: 'none',
            transform: 'translate(-50%, 0)', // Mempertahankan centering horizontal
            zIndex: 1000 // Memastikan popup ada di atas entity
          }}
        >
          <PhotoHoverPopup 
            photo={hoveredPhoto}
            show={!!hoveredPhoto} 
          />
          <div className="popup-arrow"></div> 
        </div>
      )}
    </div>
  );
};

export default PhotoPoints;