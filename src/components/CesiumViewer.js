import React, { useEffect } from 'react';
import { Viewer, Cesium3DTileset, ScreenSpaceEventHandler, ScreenSpaceEvent } from 'resium';
import { 
  Matrix4,
  Cartesian3,
  Cartographic,
  Math as CesiumMath,
  ScreenSpaceEventType
} from 'cesium';
import * as Cesium from 'cesium';
import { TILESET_1, TILESET_2 } from '../constants/tilesets';
import PhotoPoints from './PhotoPoints';

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