import { useState, useEffect, useRef } from 'react';
import TerrainMeasurement from '../utils/TerrainMeasurement';

export const useMeasurement = (viewerRef) => {
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [measurement, setMeasurement] = useState(null);
  const [hasCoordinates, setHasCoordinates] = useState(false);
  const measurementToolRef = useRef(null);

  // Inisialisasi TerrainMeasurement
  useEffect(() => {
    if (viewerRef.current?.cesiumElement) {
      // Pastikan hanya inisialisasi sekali
      if (!measurementToolRef.current) {
        const viewer = viewerRef.current.cesiumElement;
        measurementToolRef.current = new TerrainMeasurement(viewer);
        
        // Set callback untuk update pengukuran
        measurementToolRef.current.setMeasurementCallback((data) => {
          setMeasurement(data);
          setHasCoordinates(true);
        });
      }
    }
    
    return () => {
      if (measurementToolRef.current) {
        measurementToolRef.current.stop();
      }
    };
  }, [viewerRef]);

  // Toggle pengukuran on/off
  useEffect(() => {
    if (measurementToolRef.current) {
      if (isMeasuring) {
        measurementToolRef.current.start();
      } else {
        measurementToolRef.current.stop();
      }
    }
  }, [isMeasuring]);

  const toggleMeasurement = () => {
    setIsMeasuring(prevState => !prevState);
  };

  const clearMeasurements = () => {
    if (measurementToolRef.current) {
      measurementToolRef.current.clearMeasurements();
      setHasCoordinates(false);
      setMeasurement(null);
    }
  };

  return {
    isMeasuring,
    setIsMeasuring,
    measurement,
    setMeasurement,
    hasCoordinates,
    setHasCoordinates,
    toggleMeasurement,
    clearMeasurements,
    measurementToolRef
  };
};

export default useMeasurement; 