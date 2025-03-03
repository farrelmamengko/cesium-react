import React, { useEffect, useState } from 'react';
import { Cartographic, Math as CesiumMath } from 'cesium';
import { handleSaveCamera } from '../../constants/tilesets';
import './CameraVisualization.css';

const CameraVisualization = ({ viewer, isVisible, onToggleVisibility, onSavePosition, outcropId }) => {
  const [cameraInfo, setCameraInfo] = useState({
    position: { longitude: 0, latitude: 0, height: 0 },
    heading: 0,
    pitch: 0,
    roll: 0
  });

  useEffect(() => {
    if (!viewer) return;

    // Fungsi untuk mengupdate informasi kamera
    const updateCameraInfo = () => {
      const camera = viewer.camera;
      const position = camera.position;
      const cartographic = Cartographic.fromCartesian(position);
      
      // Gunakan nilai asli tanpa pembulatan (toFixed)
      setCameraInfo({
        position: {
          longitude: CesiumMath.toDegrees(cartographic.longitude),
          latitude: CesiumMath.toDegrees(cartographic.latitude),
          height: cartographic.height
        },
        heading: CesiumMath.toDegrees(camera.heading),
        pitch: CesiumMath.toDegrees(camera.pitch),
        roll: CesiumMath.toDegrees(camera.roll)
      });
    };

    // Update sekali di awal
    updateCameraInfo();

    // Event listener untuk perubahan pada kamera
    const changeHandler = viewer.camera.changed.addEventListener(updateCameraInfo);
    const moveEndHandler = viewer.camera.moveEnd.addEventListener(updateCameraInfo);
    
    return () => {
      if (changeHandler) {
        viewer.camera.changed.removeEventListener(changeHandler);
      }
      if (moveEndHandler) {
        viewer.camera.moveEnd.removeEventListener(moveEndHandler);
      }
    };
  }, [viewer]);

  const toggleVisibility = () => {
    if (onToggleVisibility) {
      onToggleVisibility();
    }
  };

  const handleSavePosition = () => {
    console.log('Mencoba menyimpan posisi kamera');
    
    // Gunakan data asli tanpa konversi
    const rawCameraData = {
      longitude: cameraInfo.position.longitude,
      latitude: cameraInfo.position.latitude,
      height: cameraInfo.position.height,
      heading: cameraInfo.heading,
      pitch: cameraInfo.pitch,
      roll: cameraInfo.roll
    };
    
    console.log('Menyimpan data asli dari panel:', rawCameraData);
    
    // Panggil handleSaveCamera dengan data asli
    handleSaveCamera(viewer, rawCameraData);
  };

  // Jika panel tidak terlihat, jangan render apapun
  if (!isVisible) return null;

  return (
    <div className="camera-visualization visible">
      <div className="camera-toggle" onClick={toggleVisibility}>
        ▼ Info Kamera
      </div>
      
      <div className="camera-info">
        <h3>Posisi Kamera</h3>
        <div className="info-group">
          <div className="info-item">
            <strong>Longitude:</strong> {cameraInfo.position.longitude}°
          </div>
          <div className="info-item">
            <strong>Latitude:</strong> {cameraInfo.position.latitude}°
          </div>
          <div className="info-item">
            <strong>Ketinggian:</strong> {cameraInfo.position.height} m
          </div>
        </div>
        
        <h3>Arah Kamera</h3>
        <div className="info-group">
          <div className="info-item">
            <strong>Heading:</strong> {cameraInfo.heading}°
          </div>
          <div className="info-item">
            <strong>Pitch:</strong> {cameraInfo.pitch}°
          </div>
          <div className="info-item">
            <strong>Roll:</strong> {cameraInfo.roll}°
          </div>
        </div>
        
        <div className="camera-actions">
          <button 
            className="save-camera-btn"
            onClick={handleSavePosition}
          >
            Simpan Posisi Kamera
          </button>
        </div>
      </div>
    </div>
  );
};

export default CameraVisualization; 