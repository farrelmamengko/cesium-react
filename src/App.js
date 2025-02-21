import React, { useEffect, useState, useRef } from 'react';
import { Viewer, Cesium3DTileset } from 'resium';
import { Ion, Cartesian3, IonResource, createWorldTerrainAsync, HeadingPitchRange, Math as CesiumMath, HeightReference, Matrix4, Transforms } from 'cesium';
import TerrainMeasurement from './utils/TerrainMeasurement';
import "cesium/Build/Cesium/Widgets/widgets.css";
import './App.css';
import * as Cesium from 'cesium';

// Set token Cesium Ion - Ganti dengan token Anda yang valid
Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIyOTI1ZDYyZC1mNWEwLTQ4ZjktYjYyZC1hMDU1ZDA0MmMwZTkiLCJpZCI6MTMwNiwiaWF0IjoxNTI3ODI0OTQwfQ.C8eb-HqnuV5pG4znVWc3rBSMtTmGsxt1wIKusHfboZU';

function App() {
  const [tilesetUrl, setTilesetUrl] = useState(null);
  const [terrainProvider, setTerrainProvider] = useState(null);
  const [error, setError] = useState(null);
  const viewerRef = useRef(null);
  const tilesetRef = useRef(null);
  const position = Cartesian3.fromDegrees(0, 0, 0); 
  const [isMeasuring, setIsMeasuring] = useState(false); 
  const [measurement, setMeasurement] = useState(null);
  const measurementToolRef = useRef(null);

  const flyToTileset = () => {
    if (tilesetRef.current && viewerRef.current) {
      const tileset = tilesetRef.current.cesiumElement;
      const viewer = viewerRef.current.cesiumElement;
      
      viewer.zoomTo(tileset, new HeadingPitchRange(0.0, -0.5, tileset.boundingSphere.radius * 2.0));
    }
  };

  useEffect(() => {
    // Load terrain
    const loadTerrain = async () => {
      try {
        const terrain = await createWorldTerrainAsync({
          requestVertexNormals: true,
          requestWaterMask: true
        });
        setTerrainProvider(terrain);
      } catch (error) {
        console.error('Error loading terrain:', error);
        setError('Gagal memuat terrain');
      }
    };

    // Load tileset
    const loadTileset = async () => {
      try {
        // Ganti ASSET_ID dengan ID yang valid dari Cesium ion
        const resource = await IonResource.fromAssetId(2282213); 
        setTilesetUrl(resource); 
        
      } catch (error) {
        console.error('Error loading tileset:', error);
        setError('Gagal memuat 3D Tileset');
      }
    };

    loadTerrain();
    loadTileset();
  }, []);

  // Tambahkan useEffect untuk flyTo otomatis setelah tileset dimuat
  useEffect(() => {
    if (tilesetUrl) {
      // Beri waktu sebentar untuk tileset dimuat
      setTimeout(flyToTileset, 1000);
    }
  }, [tilesetUrl]);

  useEffect(() => {
    if (viewerRef.current?.cesiumElement && terrainProvider) {
      // Tunggu sebentar sampai viewer benar-benar siap
      setTimeout(() => {
        const viewer = viewerRef.current.cesiumElement;
        if (!measurementToolRef.current && viewer.scene) {
          measurementToolRef.current = new TerrainMeasurement(viewer);
          measurementToolRef.current.setMeasurementCallback((data) => {
            setMeasurement(data);
          });
        }
      }, 1000);
    }
  }, [terrainProvider]);

  const toggleMeasurement = () => {
    if (!measurementToolRef.current || !viewerRef.current?.cesiumElement?.scene) {
      console.log('Viewer belum siap');
      return;
    }

    if (isMeasuring) {
      measurementToolRef.current.stop();
    } else {
      measurementToolRef.current.start();
    }
    setIsMeasuring(!isMeasuring);
  };

  const clearMeasurements = () => {
    if (measurementToolRef.current) {
      measurementToolRef.current.clearMeasurements();
      setMeasurement(null);
    }
  };

  // Perbaiki fungsi setInitialView
  const setInitialView = () => {
    if (viewerRef.current && viewerRef.current.cesiumElement) {
      setTimeout(() => {
        const viewer = viewerRef.current.cesiumElement;
        if (viewer && viewer.camera) {
          viewer.camera.setView({
            destination: Cartesian3.fromDegrees(
              107.6191,
              -6.9175,
              2000
            ),
            orientation: {
              heading: CesiumMath.toRadians(0),
              pitch: CesiumMath.toRadians(-45),
              roll: 0
            }
          });
        }
      }, 1000);
    }
  };

  // Ubah useEffect untuk memastikan terrain dan viewer sudah siap
  useEffect(() => {
    if (terrainProvider && viewerRef.current && viewerRef.current.cesiumElement) {
      setInitialView();
    }
  }, [terrainProvider, viewerRef.current]);

  useEffect(() => {
    if (tilesetRef.current && tilesetRef.current.cesiumElement) {
      const tileset = tilesetRef.current.cesiumElement;
      const absoluteHeight = 68.0; // Ganti dengan ketinggian absolut yang diinginkan
      const boundingSphere = tileset.boundingSphere;
      const cartographic = Cesium.Cartographic.fromCartesian(boundingSphere.center);
      const surface = Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, 0.0);
      const absolutePosition = Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, absoluteHeight);
      const translation = Cartesian3.subtract(absolutePosition, surface, new Cartesian3());
      tileset.modelMatrix = Matrix4.fromTranslation(translation);
    }
  }, [tilesetUrl]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!terrainProvider) {
    return <div>Loading terrain...</div>;
  }

  return (
    <div className="App">
      <Viewer
        ref={viewerRef}
        full
        terrainProvider={terrainProvider}
        animation={false}
        timeline={false}
        scene3DOnly={true}
        baseLayerPicker={false}
        navigationHelpButton={false}
        fullscreenButton={false}
        homeButton={true}
        geocoder={false}
        sceneModePicker={false}
        enableTerrainLighting={true}
        terrainShadows={true}
        terrainExaggeration={1.0}
      >
        {tilesetUrl && (
          <Cesium3DTileset
            ref={tilesetRef}
            url={tilesetUrl}
            position={position} // Posisi model 
            maximumScreenSpaceError={8}
            maximumMemoryUsage={8192}
            heightReference={HeightReference.NONE}
          />
        )}
      </Viewer>
      
      {/* Kontrol pengukuran */}
      <div className="measurement-controls" style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        padding: '10px',
        backgroundColor: 'rgba(0,0,0,0.7)',
        color: 'white',
        borderRadius: '5px'
      }}>
        <button onClick={toggleMeasurement}>
          {isMeasuring ? 'Stop Pengukuran' : 'Mulai Pengukuran'}
        </button>
        <button onClick={clearMeasurements}>
          Hapus Pengukuran
        </button>
        {measurement && (
          <div style={{ marginTop: '10px' }}>
            <p>Ketinggian: {measurement.formattedHeight}</p>
            <p>Koordinat Lat/Lon: {measurement.latitude.toFixed(6)}, {measurement.longitude.toFixed(6)}</p>
            <p>X: {measurement.x.toFixed(2)}m</p>
            <p>Y: {measurement.y.toFixed(2)}m</p>
            <p>Z: {measurement.z.toFixed(2)}m</p>
          </div>
        )}
      </div>
      
      {/* Tombol flyTo yang sudah ada */}
      <button 
        onClick={flyToTileset}
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          padding: '10px',
          zIndex: 1000
        }}
      >
        Terbang ke Model
      </button>
    </div>
  );
}

export default App;
