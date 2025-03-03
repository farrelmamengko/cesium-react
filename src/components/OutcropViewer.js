import React, { useRef, useEffect, useState } from 'react';
import { Viewer, Entity, CameraFlyTo } from 'resium';
import { Cartesian3, Math as CesiumMath } from 'cesium';

const OutcropViewer = ({ outcrop, cameraPosition }) => {
  const viewerRef = useRef(null);
  const [cesiumViewer, setCesiumViewer] = useState(null);
  
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
          </>
        )}
      </Viewer>
    </div>
  );
};

export default OutcropViewer; 