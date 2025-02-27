import React from 'react';
import { Viewer, Cesium3DTileset } from 'resium';

const MiniMap = ({ 
  miniMapRef, 
  terrainProvider, 
  clockViewModel,
  tilesetUrl,
  tilesetUrl2
}) => {
  return (
    <div className="mini-map">
      <Viewer
        ref={miniMapRef}
        terrainProvider={terrainProvider}
        clockViewModel={clockViewModel}
        animation={false}
        timeline={false}
        baseLayerPicker={false}
        navigationHelpButton={false}
        fullscreenButton={false}
        homeButton={false}
        geocoder={false}
        sceneModePicker={false}
        projectionPicker={false}
        navigationInstructionsInitiallyVisible={false}
        scene3DOnly={false}
      >
        {tilesetUrl && (
          <Cesium3DTileset
            url={tilesetUrl}
            maximumScreenSpaceError={16}
          />
        )}
        {tilesetUrl2 && (
          <Cesium3DTileset
            url={tilesetUrl2}
            maximumScreenSpaceError={16}
          />
        )}
      </Viewer>
    </div>
  );
};

export default MiniMap; 