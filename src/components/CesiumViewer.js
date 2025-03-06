import React, { useEffect } from 'react';
import { Viewer, Cesium3DTileset, ScreenSpaceEventHandler, ScreenSpaceEvent, Entity } from 'resium';
import { 
  Matrix4,
  Cartesian3,
  Cartographic,
  Math as CesiumMath,
  ScreenSpaceEventType,
  Color
} from 'cesium';
import * as Cesium from 'cesium';
import { TILESET_1, TILESET_2 } from '../constants/tilesets';
import PhotoPoints from './PhotoPoints';
import { fetchOutcrops } from '../services/api';

const CesiumViewer = ({ 
  viewerRef,
  terrainProvider, 
  tilesetUrl, 
  tilesetUrl2, 
  tilesetRef, 
  tilesetRef2, 
  clockViewModel,
  activeTilesetId,
  height1,
  height2,
  showPhotoMode,
  onPhotoClick
}) => {
  
  const handleMapClick = (movement) => {
    if (!showPhotoMode || !viewerRef.current?.cesiumElement) return;
    
    const cesiumViewer = viewerRef.current.cesiumElement;
    const cartesian = cesiumViewer.scene.pickPosition(movement.position);
    
    if (cartesian) {
      const cartographic = Cartographic.fromCartesian(cartesian);
      const longitude = CesiumMath.toDegrees(cartographic.longitude);
      const latitude = CesiumMath.toDegrees(cartographic.latitude);
      const height = cartographic.height;
      
      onPhotoClick({
        longitude,
        latitude,
        height
      });
    }
  };
  
  // Tambahkan useEffect untuk memuat outcrops
  useEffect(() => {
    const loadOutcrops = async () => {
      try {
        console.log('Mencoba mengambil data outcrops dari CesiumViewer...');
        const outcropsData = await fetchOutcrops();
        console.log('Data outcrops berhasil diambil dari CesiumViewer:', outcropsData);
        
        if (!viewerRef.current?.cesiumElement) {
          console.error('Viewer belum siap');
          return;
        }
        
        const viewer = viewerRef.current.cesiumElement;
        
        // Tambahkan entity untuk setiap outcrop
        outcropsData.forEach(outcrop => {
          try {
            // Periksa apakah outcrop memiliki properti coordinates
            if (outcrop.coordinates) {
              console.log('Menambahkan titik untuk outcrop:', outcrop.assetId, 'di koordinat:', outcrop.coordinates);
              viewer.entities.add({
                name: outcrop.description?.title || `Outcrop ${outcrop.assetId}`,
                position: Cartesian3.fromDegrees(
                  outcrop.coordinates.longitude || 0, 
                  outcrop.coordinates.latitude || 0, 
                  outcrop.coordinates.height || 0
                ),
                point: {
                  pixelSize: 10,
                  color: Color.RED,
                  outlineColor: Color.WHITE,
                  outlineWidth: 2
                }
              });
            } else {
              console.warn('Outcrop tidak memiliki properti coordinates:', outcrop);
            }
          } catch (error) {
            console.error('Error saat menambahkan titik untuk outcrop:', outcrop, error);
          }
        });
      } catch (error) {
        console.error('Gagal mengambil data outcrops dari CesiumViewer:', error);
      }
    };
    
    // Panggil fungsi loadOutcrops setelah viewer siap
    if (viewerRef.current?.cesiumElement) {
      loadOutcrops();
    } else {
      console.error('Viewer belum siap untuk memuat outcrops');
    }
  }, [viewerRef.current]);
  
  return (
    <Viewer
      ref={viewerRef}
      terrainProvider={terrainProvider}
      clockViewModel={clockViewModel}
      animation={false}
      timeline={false}
      baseLayerPicker={true}
      navigationHelpButton={false}
      fullscreenButton={false}
      homeButton={false}
      geocoder={false}
      sceneModePicker={false}
      projectionPicker={false}
      navigationInstructionsInitiallyVisible={false}
      scene3DOnly={true}
    >
      {tilesetUrl && activeTilesetId === TILESET_1.assetId && (
        <Cesium3DTileset
          ref={tilesetRef}
          url={tilesetUrl}
          maximumScreenSpaceError={16}
          onReady={(tileset) => {
            const height = height1;
            const boundingSphere = tileset.boundingSphere;
            const cartographic = Cartographic.fromCartesian(boundingSphere.center);
            const surface = Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, 0.0);
            const absolutePosition = Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, height);
            const translation = Cartesian3.subtract(absolutePosition, surface, new Cartesian3());
            tileset.modelMatrix = Matrix4.fromTranslation(translation);
          }}
        />
      )}
      
      {tilesetUrl2 && activeTilesetId === TILESET_2.assetId && (
        <Cesium3DTileset
          ref={tilesetRef2}
          url={tilesetUrl2}
          maximumScreenSpaceError={16}
          onReady={(tileset) => {
            const height = height2;
            const boundingSphere = tileset.boundingSphere;
            const cartographic = Cartographic.fromCartesian(boundingSphere.center);
            const surface = Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, 0.0);
            const absolutePosition = Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, height);
            const translation = Cartesian3.subtract(absolutePosition, surface, new Cartesian3());
            tileset.modelMatrix = Matrix4.fromTranslation(translation);
          }}
        />
      )}
      
      {/* Tangani klik pada peta untuk mode foto */}
      <ScreenSpaceEventHandler>
        <ScreenSpaceEvent
          action={handleMapClick}
          type={ScreenSpaceEventType.LEFT_CLICK}
        />
      </ScreenSpaceEventHandler>
      
      {/* Tampilkan foto yang sudah ada */}
      <PhotoPoints outcropId={activeTilesetId} viewer={viewerRef.current?.cesiumElement} />
    </Viewer>
  );
};

export default CesiumViewer; 