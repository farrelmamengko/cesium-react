import { useState, useEffect } from 'react';
import { 
  IonResource, 
  Cartesian3, 
  Math as CesiumMath,
  Cesium3DTileset
} from 'cesium';
import { TILESET_1, TILESET_2, initializeTilesetsFromDB } from '../constants/tilesets';
import { getCameraFromMongoDB } from '../services/api';

export const useTilesets = () => {
  const [tilesetUrl, setTilesetUrl] = useState(null);
  const [tilesetUrl2, setTilesetUrl2] = useState(null);
  const [activeTileset, setActiveTileset] = useState(TILESET_1);
  const [activeTilesetId, setActiveTilesetId] = useState(null);
  const [error, setError] = useState(null);
  const [height1] = useState(68.0);
  const [height2] = useState(68.34);

  // Load tileset resources dan data kamera dari MongoDB
  useEffect(() => {
    const loadResources = async () => {
      try {
        // Load tileset resources
        const resource1 = await IonResource.fromAssetId(TILESET_1.assetId);
        const resource2 = await IonResource.fromAssetId(TILESET_2.assetId);
        
        setTilesetUrl(resource1);
        setTilesetUrl2(resource2);

        // Inisialisasi data kamera dari MongoDB
        await initializeTilesetsFromDB();
      } catch (error) {
        console.error('Error loading resources:', error);
        setError('Gagal memuat resources');
      }
    };

    loadResources();
  }, []);

  const flyToTileset = async (tileset, viewer) => {
    if (!viewer) return;
    
    const outcropId = tileset.assetId === TILESET_1.assetId ? 'OC1' : 'OC2';
    setActiveTilesetId(tileset.assetId);
    setActiveTileset(tileset);
    
    try {
      // Ambil posisi kamera terbaru dari MongoDB
      const latestPosition = await getCameraFromMongoDB(outcropId);
      
      if (latestPosition) {
        console.log('Menggunakan posisi kamera dari MongoDB untuk:', outcropId);
        
        viewer.camera.flyTo({
          destination: Cartesian3.fromDegrees(
            latestPosition.position.longitude,
            latestPosition.position.latitude,
            latestPosition.position.height
          ),
          orientation: {
            heading: CesiumMath.toRadians(latestPosition.orientation.heading),
            pitch: CesiumMath.toRadians(latestPosition.orientation.pitch),
            roll: CesiumMath.toRadians(latestPosition.orientation.roll)
          },
          duration: 2
        });
        
        return;
      }

      console.log('Menggunakan posisi default untuk:', outcropId);
      // Fallback ke posisi default
      viewer.camera.flyTo({
        destination: Cartesian3.fromDegrees(
          tileset.coordinates.longitude,
          tileset.coordinates.latitude,
          tileset.coordinates.height
        ),
        orientation: {
          heading: CesiumMath.toRadians(tileset.camera.heading),
          pitch: CesiumMath.toRadians(tileset.camera.pitch),
          roll: 0
        },
        duration: 2
      });
    } catch (error) {
      console.error('Error dalam flyToTileset:', error);
      setError('Gagal mengatur posisi kamera');
    }
  };

  return {
    tilesetUrl,
    tilesetUrl2,
    activeTileset,
    activeTilesetId,
    setActiveTileset,
    setActiveTilesetId,
    flyToTileset,
    error,
    height1,
    height2
  };
};

export default useTilesets; 