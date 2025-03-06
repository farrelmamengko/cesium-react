import React, { useState, useEffect } from 'react';
import './PhotoHoverPopup.css';

// Base64 placeholder image (gray square with camera icon)
const PLACEHOLDER_IMAGE = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNmMmYyZjIiLz4KPHRleHQgeD0iMTAwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiBmaWxsPSIjNjY2NjY2Ij5ObyBJbWFnZSBBdmFpbGFibGU8L3RleHQ+Cjwvc3ZnPg==";

const PhotoHoverPopup = ({ photo, position, apiUrl }) => {
  // Semua hooks di bagian atas komponen
  const [imageUrl, setImageUrl] = useState('');
  const [useDefault, setUseDefault] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);
  const [attempts, setAttempts] = useState(0);

  // Gunakan apiUrl yang diberikan atau default
  const API_URL = apiUrl || process.env.REACT_APP_API_URL || 'http://localhost:5004';

  useEffect(() => {
    // Hanya jalankan jika photo tersedia
    if (photo) {
      console.log('Photo data untuk hover popup:', photo);

      // Reset state
      setUseDefault(false);
      setLoadingImage(true);
      setAttempts(0);
      
      if (photo.photoUrl) {
        // Coba format URL yang benar
        let url = photo.photoUrl;

        // Jika URL tidak dimulai dengan http atau / tambahkan base URL
        if (!url.startsWith('http') && !url.startsWith('/')) {
          url = `${API_URL}/${url}`;
        } else if (url.startsWith('/')) {
          // Jika URL dimulai dengan / tetapi bukan //, tambahkan base URL tanpa /
          url = `${API_URL}${url}`;
        }

        console.log('URL Foto yang akan digunakan:', url);
        setImageUrl(url);
      } else if (photo.imageUrl) {
        // Alternatif nama field
        console.log('Menggunakan imageUrl sebagai alternatif:', photo.imageUrl);
        setImageUrl(photo.imageUrl);
      } else {
        console.warn('Tidak ada URL foto yang valid dalam data:', photo);
        setUseDefault(true);
        setLoadingImage(false);
      }
    }
  }, [photo, API_URL]);

  // Handler untuk error loading gambar
  const handleImageError = (e) => {
    console.error('Error loading image:', imageUrl);

    // Jika sudah mencoba beberapa kali, gunakan default
    if (attempts >= 2) {
      console.log('Terlalu banyak percobaan, menggunakan gambar default');
      setUseDefault(true);
      setLoadingImage(false);
      return;
    }

    // Coba format URL alternatif
    if (photo && photo._id) {
      const alternativeUrl = `${API_URL}/uploads/photos/${photo._id}.jpg`;
      console.log('Mencoba URL alternatif:', alternativeUrl);
      setImageUrl(alternativeUrl);
      setAttempts(prev => prev + 1);
    } else {
      setUseDefault(true);
      setLoadingImage(false);
    }
  };

  // Fungsi ketika gambar berhasil di-load
  const handleImageLoad = () => {
    console.log('Gambar berhasil dimuat:', imageUrl);
    setLoadingImage(false);
  };

  // Jika tidak ada data foto, return null
  if (!photo) return null;

  return (
    <div 
      className="photo-hover-container"
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        pointerEvents: 'none',
        transform: 'translate(-50%, 0)',
        zIndex: 1000
      }}
    >
      <div className="photo-hover-popup">
        <div className="popup-content">
          <h4>{photo.description || 'Foto Outcrop'}</h4>

          <div className="popup-image-container">
            {loadingImage && <div className="image-loading"></div>}

            {useDefault ? (
              <div className="image-placeholder">
                <img src={PLACEHOLDER_IMAGE} alt="Placeholder" className="placeholder-img" />
                <p>Gambar tidak tersedia</p>
              </div>
            ) : (
              <img
                src={imageUrl}
                alt={photo.description || 'Foto Outcrop'}
                className="popup-image"
                onLoad={handleImageLoad}
                onError={handleImageError}
                style={{ maxWidth: '100%', maxHeight: '100%' }}
              />
            )}
          </div>
          
          <div className="popup-details">
            <p>
              <strong>Lokasi:</strong> {photo.position ? 
                `${photo.position.longitude.toFixed(6)}, ${photo.position.latitude.toFixed(6)}` : 
                'Tidak tersedia'}
            </p>
            <small>Diambil pada: {new Date(photo.createdAt).toLocaleString()}</small>
          </div>
        </div>
      </div>
      <div className="popup-arrow"></div>
    </div>
  );
};

export default PhotoHoverPopup; 