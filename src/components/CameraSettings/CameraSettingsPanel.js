import React from 'react';

const CameraSettingsPanel = ({ 
  showCameraSettings, 
  cameraSettings, 
  setCameraSettings, 
  onSave, 
  onCancel, 
  onPreview 
}) => {
  if (!showCameraSettings) return null;
  
  return (
    <div className="camera-settings-panel">
      <h3>Pengaturan Kamera</h3>
      <div className="settings-group">
        <label>
          Heading (derajat):
          <input
            type="number"
            value={cameraSettings.heading}
            onChange={(e) => setCameraSettings({
              ...cameraSettings,
              heading: parseInt(e.target.value) || 0
            })}
            min="-180"
            max="180"
          />
        </label>
      </div>
      <div className="settings-group">
        <label>
          Pitch (derajat):
          <input
            type="number"
            value={cameraSettings.pitch}
            onChange={(e) => setCameraSettings({
              ...cameraSettings,
              pitch: parseInt(e.target.value) || 0
            })}
            min="-90"
            max="0"
          />
        </label>
      </div>
      <div className="settings-group">
        <label>
          Range (meter):
          <input
            type="number"
            value={cameraSettings.range}
            onChange={(e) => setCameraSettings({
              ...cameraSettings,
              range: parseInt(e.target.value) || 500
            })}
            min="10"
            max="10000"
          />
        </label>
      </div>
      <div className="settings-buttons">
        <button onClick={onSave}>Simpan</button>
        <button onClick={onCancel}>Batal</button>
        <button onClick={onPreview}>Pratinjau</button>
      </div>
    </div>
  );
};

export default CameraSettingsPanel; 