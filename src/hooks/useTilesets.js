import { useState, useEffect } from 'react';
import { 
  IonResource, 
  Cartesian3, 
  Math as CesiumMath 
} from 'cesium';
import { TILESET_1, TILESET_2 } from '../constants/tilesets';

export const useTilesets = () => {
  const [tilesetUrl, setTilesetUrl] = useState(null);
  const [tilesetUrl2, setTilesetUrl2] = useState(null);
  const [activeTileset, setActiveTileset] = useState(TILESET_1);
  const [activeTilesetId, setActiveTilesetId] = useState(null);
  const [error, setError] = useState(null);
  const [height1] = useState(68.0);
  const [height2] = useState(68.34);

  // Load tileset resources
  useEffect(() => {
    const loadTileset = async () => {
      try {
        const resource = await IonResource.fromAssetId(TILESET_1.assetId);
        setTilesetUrl(resource);
      } catch (error) {
        console.error('Error loading tileset:', error);
        setError('Gagal memuat 3D Tileset');
      }
    };

    const loadTileset2 = async () => {
      try {
        const resource = await IonResource.fromAssetId(TILESET_2.assetId);
        setTilesetUrl2(resource);
      } catch (error) {
        console.error('Error loading second tileset:', error);
        setError('Gagal memuat 3D Tileset Kedua');
      }
    };

    loadTileset();
    loadTileset2();
  }, []);

  const flyToTileset = (tileset, viewer) => {
    if (!viewer) return;
    
    setActiveTilesetId(tileset.assetId);
    setActiveTileset(tileset);
    
    viewer.camera.flyTo({
      destination: Cartesian3.fromDegrees(
        tileset.coordinates.longitude,
        tileset.coordinates.latitude,
        tileset.coordinates.height + tileset.camera.range
      ),
      orientation: {
        heading: CesiumMath.toRadians(tileset.camera.heading),
        pitch: CesiumMath.toRadians(tileset.camera.pitch),
        roll: 0
      },
      duration: 2,
      complete: () => {
        console.log(`Terbang ke ${tileset.description.title} selesai`);
      }
    });
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