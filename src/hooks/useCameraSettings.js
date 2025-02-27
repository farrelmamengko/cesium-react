import { useState } from 'react';
import { Cartesian3, Math as CesiumMath } from 'cesium';

export const useCameraSettings = () => {
  const [showCameraSettings, setShowCameraSettings] = useState(false);
  const [cameraSettings, setCameraSettings] = useState({
    heading: 0,
    pitch: -45,
    range: 500
  });

  const getCurrentCameraSettings = (viewer, activeTileset) => {
    if (!viewer || !activeTileset) return null;
    
    const camera = viewer.camera;
    const position = camera.position;
    const target = activeTileset.coordinates;
    
    // Hitung jarak (range) dari kamera ke target
    const targetCartesian = Cartesian3.fromDegrees(
      target.longitude,
      target.latitude,
      target.height
    );
    const range = Cartesian3.distance(position, targetCartesian);
    
    // Dapatkan heading dan pitch saat ini
    const heading = CesiumMath.toDegrees(camera.heading);
    const pitch = CesiumMath.toDegrees(camera.pitch);
    
    return {
      heading: Math.round(heading),
      pitch: Math.round(pitch),
      range: Math.round(range)
    };
  };

  const saveCameraSettings = (viewer, activeTileset, setActiveTileset) => {
    if (!viewer || !activeTileset) return;
    
    // Buat salinan dari tileset aktif
    const updatedTileset = { ...activeTileset };
    
    // Update pengaturan kamera
    updatedTileset.camera = { ...cameraSettings };
    
    // Update state global via callback
    setActiveTileset(updatedTileset);
    
    // Sembunyikan panel pengaturan
    setShowCameraSettings(false);
    
    // Tampilkan pesan sukses
    alert(`Pengaturan kamera untuk ${updatedTileset.description.title} berhasil disimpan!`);
  };

  const previewCameraSettings = (viewer, activeTileset) => {
    if (!viewer || !activeTileset) return;
    
    viewer.camera.flyTo({
      destination: Cartesian3.fromDegrees(
        activeTileset.coordinates.longitude,
        activeTileset.coordinates.latitude,
        activeTileset.coordinates.height + cameraSettings.range
      ),
      orientation: {
        heading: CesiumMath.toRadians(cameraSettings.heading),
        pitch: CesiumMath.toRadians(cameraSettings.pitch),
        roll: 0
      },
      duration: 1
    });
  };
  
  const flyToHomeView = (viewer, duration = 2) => {
    if (!viewer) return;
    
    viewer.camera.flyTo({
      destination: Cartesian3.fromDegrees(
        120.0,  // Longitude Indonesia
        -2.0,   // Latitude Indonesia
        5000000.0  // Ketinggian (meter)
      ),
      orientation: {
        heading: CesiumMath.toRadians(0),
        pitch: CesiumMath.toRadians(-90),
        roll: 0
      },
      duration: duration
    });
  };

  return {
    cameraSettings,
    setCameraSettings,
    showCameraSettings,
    setShowCameraSettings,
    getCurrentCameraSettings,
    saveCameraSettings,
    previewCameraSettings,
    flyToHomeView
  };
};

export default useCameraSettings; 