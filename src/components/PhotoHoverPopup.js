import React, { useState, useEffect } from 'react';
import './PhotoHoverPopup.css';

// Base64 placeholder image (gray square with camera icon)
const PLACEHOLDER_IMAGE = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNmMmYyZjIiLz4KPHRleHQgeD0iMTAwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiBmaWxsPSIjNjY2NjY2Ij5ObyBJbWFnZSBBdmFpbGFibGU8L3RleHQ+Cjwvc3ZnPg==";

// URL API server
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003';

const PhotoHoverPopup = ({ photo, show }) => {
  // Semua hooks di bagian atas komponen
  const [imageUrl, setImageUrl] = useState('');
  const [useDefault, setUseDefault] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    // Hanya jalankan jika photo tersedia
    if (photo && show) {
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
  }, [photo, show]);

  // Fungsi untuk menangani error loading gambar
  const handleImageError = () => {
    console.error('Error loading image:', imageUrl);
    
    // Coba dengan 1 alternatif URL jika ini percobaan pertama
    if (attempts === 0 && photo) {
      setAttempts(1);
      
      // Coba format URL alternatif
      if (photo._id) {
        const alternativeUrl = `${API_URL}/uploads/${photo._id}.jpg`;
        console.log('Mencoba URL alternatif:', alternativeUrl);
        setImageUrl(alternativeUrl);
        return;
      }
    }
    
    // Jika masih gagal setelah mencoba alternatif, gunakan default
    setUseDefault(true);
    setLoadingImage(false);
  };

  // Fungsi ketika gambar berhasil di-load
  const handleImageLoad = () => {
    console.log('Gambar berhasil dimuat:', imageUrl);
    setLoadingImage(false);
  };

  // Gunakan early return setelah semua hooks didefinisikan
  if (!show || !photo) return null;

  return (
    <div className="photo-hover-popup">
      <div className="popup-content">
        <div className="popup-image-container">
          {loadingImage && !useDefault && (
            <div className="image-loading">Memuat gambar...</div>
          )}
          
          {!useDefault ? (
            <img 
              src={imageUrl} 
              alt={photo.description || 'Foto Outcrop'} 
              className="popup-image" 
              onError={handleImageError}
              onLoad={handleImageLoad}
              style={{ display: loadingImage ? 'none' : 'block' }}
            />
          ) : (
            <div className="image-placeholder">
              <img 
                src={PLACEHOLDER_IMAGE}
                alt="Gambar tidak tersedia" 
                className="placeholder-img" 
              />
              <p>Gambar tidak tersedia</p>
            </div>
          )}
        </div>
        <div className="popup-details">
          <h4>{photo.description || 'Foto Outcrop'}</h4>
          <p>
            <small>
              Lokasi: {photo.position.longitude.toFixed(6)}, {photo.position.latitude.toFixed(6)}
              <br />
              Diambil pada: {new Date(photo.createdAt).toLocaleString()}
            </small>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PhotoHoverPopup; 