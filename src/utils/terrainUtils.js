import { createWorldTerrainAsync as cesiumCreateWorldTerrainAsync } from 'cesium';

export const createWorldTerrainAsync = (options = {}) => {
  return cesiumCreateWorldTerrainAsync({
    requestVertexNormals: true,
    requestWaterMask: true,
    ...options
  });
}; 