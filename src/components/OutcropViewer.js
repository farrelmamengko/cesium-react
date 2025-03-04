import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Viewer, Entity, CameraFlyTo, ScreenSpaceEventHandler, ScreenSpaceEvent } from 'resium';
import { Cartesian3, Math as CesiumMath, ScreenSpaceEventType, SceneMode, Cartographic, Color } from 'cesium';
import PhotoPoints from './PhotoPoints';
import AddPhotoForm from './AddPhotoForm';
import './OutcropViewer.css';

const OutcropViewer = ({ outcrop, cameraPosition }) => {
  const viewerRef = useRef(null);
  const [cesiumViewer, setCesiumViewer] = useState(null);
  const [addingPhoto, setAddingPhoto] = useState(false);
  const [clickPosition, setClickPosition] = useState(null);
  const [showAddPhotoButton, setShowAddPhotoButton] = useState(true);
  
  useEffect(() => {
    if (viewerRef.current && viewerRef.current.cesiumElement) {
      setCesiumViewer(viewerRef.current.cesiumElement);
    }
  }, [viewerRef]);
  
  useEffect(() => {
    if (outcrop && cameraPosition) {
      // Gunakan posisi kamera yang tersimpan
      cesiumViewer?.camera.setView({
        destination: Cartesian3.fromDegrees(
          cameraPosition.longitude,
          cameraPosition.latitude,
          cameraPosition.height
        ),
        orientation: {
          heading: CesiumMath.toRadians(cameraPosition.heading),
          pitch: CesiumMath.toRadians(cameraPosition.pitch),
          roll: CesiumMath.toRadians(cameraPosition.roll)
        }
      });
    }
  }, [outcrop, cameraPosition]);

  // Fungsi untuk toggle mode tambah foto
  const toggleAddPhotoMode = useCallback(() => {
    setAddingPhoto(prev => !prev);
    setClickPosition(null);
    
    if (cesiumViewer) {
      cesiumViewer.canvas.style.cursor = !addingPhoto ? 'crosshair' : 'default';
    }
  }, [addingPhoto, cesiumViewer]);

  // Fungsi untuk menangani klik pada peta
  const handleMapClick = useCallback((movement) => {
    if (!addingPhoto) return;
    
    const cartesian = cesiumViewer.scene.pickPosition(movement.position);
    if (cartesian) {
      const cartographic = Cartographic.fromCartesian(cartesian);
      const longitude = CesiumMath.toDegrees(cartographic.longitude);
      const latitude = CesiumMath.toDegrees(cartographic.latitude);
      const height = cartographic.height;
      
      setClickPosition({
        longitude,
        latitude,
        height
      });
      
      // Kembalikan cursor ke default setelah klik
      if (cesiumViewer) {
        cesiumViewer.canvas.style.cursor = 'default';
      }
    }
  }, [addingPhoto, cesiumViewer]);

  // Fungsi untuk menangani setelah foto berhasil ditambahkan
  const handlePhotoAdded = useCallback(() => {
    setClickPosition(null);
    setAddingPhoto(false);
    
    if (cesiumViewer) {
      cesiumViewer.canvas.style.cursor = 'default';
    }
    
    // Tampilkan pesan sukses jika diperlukan
    alert('Foto berhasil ditambahkan!');
  }, [cesiumViewer]);

  return (
    <div className="outcrop-viewer-container">
      <Viewer ref={viewerRef} full>
        {outcrop && (
          <>
            <Entity
              position={Cartesian3.fromDegrees(
                outcrop.coordinates.longitude,
                outcrop.coordinates.latitude,
                outcrop.coordinates.height
              )}
              point={{ pixelSize: 10, color: Cesium.Color.RED }}
              description={outcrop.description.title}
            />
            <CameraFlyTo
              destination={Cartesian3.fromDegrees(
                outcrop.coordinates.longitude,
                outcrop.coordinates.latitude,
                outcrop.coordinates.height
              )}
              orientation={{
                heading: CesiumMath.toRadians(0), // Tetapkan nilai default 0 untuk heading
                pitch: CesiumMath.toRadians(-45), // Tetapkan nilai default -45 untuk pitch
                roll: 0
              }}
              duration={2}
            />
            
            {/* Tangani klik pada peta untuk menambahkan foto */}
            <ScreenSpaceEventHandler>
              <ScreenSpaceEvent
                action={handleMapClick}
                type={ScreenSpaceEventType.LEFT_CLICK}
              />
            </ScreenSpaceEventHandler>
            
            {/* Tampilkan foto yang sudah ada */}
            <PhotoPoints outcropId={outcrop?.outcropId || `OC${outcrop?.assetId === 2282213 ? '1' : '2'}`} />
          </>
        )}
      </Viewer>
      
      <div className="photo-controls">
        {showAddPhotoButton && (
          <button 
            className={`add-photo-button ${addingPhoto ? 'active' : ''}`}
            onClick={toggleAddPhotoMode}
          >
            {addingPhoto ? 'Batal Tambah Foto' : 'Tambah Foto'}
          </button>
        )}
        
        {addingPhoto && (
          <div className="add-photo-instruction">
            Klik pada peta untuk menentukan posisi foto
          </div>
        )}
      </div>
      
      {clickPosition && (
        <AddPhotoForm
          position={clickPosition}
          outcropId={outcrop?.outcropId || `OC${outcrop?.assetId === 2282213 ? '1' : '2'}`}
          onCancel={() => {
            setClickPosition(null);
            setAddingPhoto(false);
            
            if (cesiumViewer) {
              cesiumViewer.canvas.style.cursor = 'default';
            }
          }}
          onPhotoAdded={handlePhotoAdded}
        />
      )}
    </div>
  );
};

export default OutcropViewer; 