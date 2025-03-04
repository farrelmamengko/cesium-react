import React, { useState } from 'react';
import { addPhoto } from '../services/api';
import './AddPhotoForm.css';

const AddPhotoForm = ({ position, outcropId, onCancel, onPhotoAdded }) => {
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState('');

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      
      // Buat preview gambar
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!photo) {
      setError('Silakan pilih foto terlebih dahulu');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('photo', photo);
      formData.append('longitude', position.longitude);
      formData.append('latitude', position.latitude);
      formData.append('height', position.height);
      formData.append('outcropId', outcropId);
      formData.append('description', description);
      
      await addPhoto(formData);
      
      // Reset form
      setDescription('');
      setPhoto(null);
      setPreview('');
      
      // Panggil callback sukses
      if (onPhotoAdded) {
        onPhotoAdded();
      }
    } catch (err) {
      console.error('Error uploading photo:', err);
      setError('Gagal mengunggah foto. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-photo-form">
      <h3>Foto Baru</h3>
      
      <div className="position-info">
        <h4>Lokasi Foto</h4>
        <div>
          <strong>Longitude:</strong> {position?.longitude.toFixed(6)}
        </div>
        <div>
          <strong>Latitude:</strong> {position?.latitude.toFixed(6)}
        </div>
        <div>
          <strong>Height:</strong> {position?.height.toFixed(1)}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="description">Deskripsi:</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Masukkan deskripsi foto"
          rows="4"
        />
      </div>

      <div className="form-group">
        <label>Pilih Foto:</label>
        <input
          type="file"
          id="photo"
          accept="image/*"
          onChange={handlePhotoChange}
        />
        <label htmlFor="photo">Pilih File</label>
        <p className="photo-help-text">Format yang didukung: JPG, PNG, GIF</p>
        
        {preview && (
          <div className="photo-preview">
            <img src={preview} alt="Preview" />
          </div>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="form-actions">
        <button type="button" onClick={onCancel}>
          Batal
        </button>
        <button
          type="submit"
          onClick={handleSubmit}
          disabled={loading || !photo}
        >
          {loading ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>
    </div>
  );
};

export default AddPhotoForm; 