import React, { useEffect, useState, useRef } from 'react';
import { Viewer, Cesium3DTileset } from 'resium';
import { 
  Ion, 
  Cartesian3, 
  IonResource, 
  createWorldTerrainAsync, 
  Math as CesiumMath,
  HeightReference,
  Matrix4,
  Color,
  LabelStyle,
  VerticalOrigin,
  Cartesian2,
  ScreenSpaceEventType
} from 'cesium';
import TerrainMeasurement from './utils/TerrainMeasurement';
import "cesium/Build/Cesium/Widgets/widgets.css";
import './App.css';
import * as Cesium from 'cesium';
import { useCameraSettings } from './hooks/useCameraSettings';
import { useTilesets } from './hooks/useTilesets';
import { useMeasurement } from './hooks/useMeasurement';
import { TILESET_1, TILESET_2 } from './constants/tilesets';
import CameraSettingsPanel from './components/CameraSettings/CameraSettingsPanel';
import ControlPanel from './components/ControlPanel';
import HomeButton from './components/Navigation/HomeButton';
import MeasurementButton from './components/Navigation/MeasurementButton';
import ClearButton from './components/Navigation/ClearButton';
import CameraSettingsButton from './components/CameraSettings/CameraSettingsButton';
import CesiumViewer from './components/CesiumViewer';
import MiniMap from './components/MiniMap';

// Set token Cesium Ion - Ganti dengan token Anda yang valid
Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIyOTI1ZDYyZC1mNWEwLTQ4ZjktYjYyZC1hMDU1ZDA0MmMwZTkiLCJpZCI6MTMwNiwiaWF0IjoxNTI3ODI0OTQwfQ.C8eb-HqnuV5pG4znVWc3rBSMtTmGsxt1wIKusHfboZU';

function App() {
  // Refs
  const viewerRef = useRef(null);
  const tilesetRef = useRef(null);
  const tilesetRef2 = useRef(null);
  
  // State untuk terrain dan error
  const [terrainProvider, setTerrainProvider] = useState(null);
  const [error, setError] = useState(null);
  const [isPanelVisible, setIsPanelVisible] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Gunakan hooks
  const {
    tilesetUrl,
    tilesetUrl2,
    activeTileset,
    activeTilesetId,
    setActiveTileset,
    setActiveTilesetId,
    flyToTileset,
    height1,
    height2
  } = useTilesets();
  
  const {
    cameraSettings,
    setCameraSettings,
    showCameraSettings,
    setShowCameraSettings,
    getCurrentCameraSettings,
    saveCameraSettings,
    previewCameraSettings
  } = useCameraSettings();
  
  const {
    isMeasuring,
    setIsMeasuring,
    measurement,
    setMeasurement,
    hasCoordinates,
    setHasCoordinates,
    toggleMeasurement,
    clearMeasurements,
    measurementToolRef
  } = useMeasurement(viewerRef);
  
  // Load terrain
  useEffect(() => {
    const loadTerrain = async () => {
      try {
        const terrain = await createWorldTerrainAsync();
        setTerrainProvider(terrain);
      } catch (error) {
        console.error('Error loading terrain:', error);
        setError('Gagal memuat terrain');
      }
    };
    
    loadTerrain();
  }, []);

  const position = Cartesian3.fromDegrees(0, 0, 0); 

  const [clockViewModel] = useState(new Cesium.ClockViewModel());
  const miniMapRef = useRef(null);

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

  // Ubah useEffect untuk tileset pertama (OC 1)
  useEffect(() => {
    if (tilesetRef.current && tilesetRef.current.cesiumElement) {
      const tileset = tilesetRef.current.cesiumElement;
      const absoluteHeight = height1;
      const boundingSphere = tileset.boundingSphere;
      const cartographic = Cesium.Cartographic.fromCartesian(boundingSphere.center);
      const surface = Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, 0.0);
      const absolutePosition = Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, absoluteHeight);
      const translation = Cartesian3.subtract(absolutePosition, surface, new Cartesian3());
      tileset.modelMatrix = Matrix4.fromTranslation(translation);
    }
  }, [height1]);

  // Ubah useEffect untuk tileset kedua (OC 2)
  useEffect(() => {
    if (tilesetRef2.current && tilesetRef2.current.cesiumElement) {
      const tileset = tilesetRef2.current.cesiumElement;
      const absoluteHeight = height2;
      const boundingSphere = tileset.boundingSphere;
      const cartographic = Cesium.Cartographic.fromCartesian(boundingSphere.center);
      const surface = Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, 0.0);
      const absolutePosition = Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, absoluteHeight);
      const translation = Cartesian3.subtract(absolutePosition, surface, new Cartesian3());
      tileset.modelMatrix = Matrix4.fromTranslation(translation);
    }
  }, [height2]);

  // Update useEffect untuk sinkronisasi kamera
  useEffect(() => {
    if (viewerRef.current?.cesiumElement && miniMapRef.current?.cesiumElement) {
      const mainViewer = viewerRef.current.cesiumElement;
      const miniViewer = miniMapRef.current.cesiumElement;
      
      miniViewer.scene.mode = Cesium.SceneMode.SCENE2D;
      miniViewer.scene.screenSpaceCameraController.enableRotate = false;
      miniViewer.scene.screenSpaceCameraController.enableTranslate = false;
      miniViewer.scene.screenSpaceCameraController.enableZoom = false;
      miniViewer.scene.screenSpaceCameraController.enableTilt = false;
      miniViewer.scene.screenSpaceCameraController.enableLook = false;

      const syncMiniMap = () => {
        const viewCenter = new Cesium.Cartesian2(
          Math.floor(mainViewer.canvas.clientWidth / 2),
          Math.floor(mainViewer.canvas.clientHeight / 2)
        );

        const worldPosition = mainViewer.scene.camera.pickEllipsoid(viewCenter);
        
        if (Cesium.defined(worldPosition)) {
          const distance = Cesium.Cartesian3.distance(
            worldPosition,
            mainViewer.scene.camera.positionWC
          );

          miniViewer.scene.camera.lookAt(
            worldPosition,
            new Cesium.Cartesian3(0.0, 0.0, distance * 2)
          );
        }
      };

      mainViewer.camera.percentageChanged = 0.01;
      const cameraChangeListener = mainViewer.camera.changed.addEventListener(syncMiniMap);
      
      syncMiniMap();

      return () => {
        if (cameraChangeListener) {
          cameraChangeListener();
        }
      };
    }
  }, [viewerRef.current, miniMapRef.current]);

  // Tambahkan useEffect baru untuk mengatur posisi kamera awal
  useEffect(() => {
    if (viewerRef.current?.cesiumElement) {
      const viewer = viewerRef.current.cesiumElement;
      viewer.camera.flyTo({
        destination: Cartesian3.fromDegrees(
          120.0,
          -2.0,
          5000000.0
        ),
        orientation: {
          heading: CesiumMath.toRadians(0),
          pitch: CesiumMath.toRadians(-90),
          roll: 0
        },
        duration: 0 // Set duration 0 agar langsung ke posisi tanpa animasi
      });
    }
  }, [viewerRef.current]); // Jalankan sekali saat viewer siap

  // Fungsi addPointMarkers yang perbaikan
  const addPointMarkers = () => {
    if (!viewerRef.current?.cesiumElement) return;
    
    const viewer = viewerRef.current.cesiumElement;
    
    // Hapus entitas yang ada terlebih dahulu untuk menghindari duplikasi
    viewer.entities.removeAll();

    // Tambahkan point marker untuk OC 1
    viewer.entities.add({
      name: 'OC 1',
      position: Cartesian3.fromDegrees(
        TILESET_1.coordinates.longitude,
        TILESET_1.coordinates.latitude,
        TILESET_1.coordinates.height
      ),
      point: {
        pixelSize: 10,
        color: Color.RED,
        outlineColor: Color.WHITE,
        outlineWidth: 2,
        heightReference: HeightReference.CLAMP_TO_GROUND
      },
      label: {
        text: 'OC 1',
        font: '14px sans-serif',
        fillColor: Color.WHITE,
        outlineColor: Color.BLACK,
        outlineWidth: 2,
        style: LabelStyle.FILL_AND_OUTLINE,
        verticalOrigin: VerticalOrigin.BOTTOM,
        pixelOffset: new Cartesian2(0, -10),
        heightReference: HeightReference.RELATIVE_TO_GROUND,
        showBackground: true,
        backgroundColor: Color.fromAlpha(Color.BLACK, 0.7)
      }
    });

    // Tambahkan point marker untuk OC 2
    viewer.entities.add({
      name: 'OC 2',
      position: Cartesian3.fromDegrees(
        TILESET_2.coordinates.longitude,
        TILESET_2.coordinates.latitude,
        TILESET_2.coordinates.height
      ),
      point: {
        pixelSize: 10,
        color: Color.RED,
        outlineColor: Color.WHITE,
        outlineWidth: 2,
        heightReference: HeightReference.CLAMP_TO_GROUND
      },
      label: {
        text: 'OC 2',
        font: '14px sans-serif',
        fillColor: Color.WHITE,
        outlineColor: Color.BLACK,
        outlineWidth: 2,
        style: LabelStyle.FILL_AND_OUTLINE,
        verticalOrigin: VerticalOrigin.BOTTOM,
        pixelOffset: new Cartesian2(0, -10),
        heightReference: HeightReference.RELATIVE_TO_GROUND,
        showBackground: true,
        backgroundColor: Color.fromAlpha(Color.BLACK, 0.7)
      }
    });

    // Event handler untuk klik pada titik
    viewer.screenSpaceEventHandler.setInputAction((click) => {
      const pickedObject = viewer.scene.pick(click.position);
      if (Cesium.defined(pickedObject)) {
        const entity = pickedObject.id;
        if (entity && entity.label) {
          const tileset = entity.label.text._value === 'OC 1' ? TILESET_1 : TILESET_2;
          flyToTileset(tileset, viewer);
        }
      }
    }, ScreenSpaceEventType.LEFT_CLICK);
  };

  // Update useEffect untuk menambahkan point markers
  useEffect(() => {
    if (viewerRef.current?.cesiumElement && terrainProvider) {
      // Beri sedikit waktu bagi viewer untuk benar-benar siap
      setTimeout(() => {
        addPointMarkers();
      }, 1000);
    }
  }, [terrainProvider]);

  // Tambahkan fungsi helper untuk navigasi home view
  const flyToHomeView = (duration = 0) => {
    if (viewerRef.current?.cesiumElement) {
      const viewer = viewerRef.current.cesiumElement;
      viewer.camera.flyTo({
        destination: Cartesian3.fromDegrees(
          120.0,  // Longitude Indonesia
          -2.0,   // Latitude Indonesia
          5000000.0  // Ketinggian (meter)
        ),
        orientation: {
          heading: CesiumMath.toRadians(0),
          pitch: CesiumMath.toRadians(-90),
          roll: 0
        },
        duration: duration
      });
    }
  };

  // Di useEffect untuk inisialisasi
  useEffect(() => {
    if (viewerRef.current?.cesiumElement && terrainProvider) {
      flyToHomeView(0); // Tanpa animasi saat awal load
    }
  }, [terrainProvider]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!terrainProvider) {
    return <div>Loading terrain...</div>;
  }

  return (
    <div className="App">
      <div className="cesium-container">
        <div className="viewer-container">
          <div className="viewer-wrapper">
            <CesiumViewer
              viewerRef={viewerRef}
              terrainProvider={terrainProvider}
              clockViewModel={clockViewModel}
              tilesetUrl={tilesetUrl}
              tilesetRef={tilesetRef}
              tilesetUrl2={tilesetUrl2}
              tilesetRef2={tilesetRef2}
              activeTilesetId={activeTilesetId}
              height1={height1}
              height2={height2}
              TILESET_1={TILESET_1}
              TILESET_2={TILESET_2}
            />
            
            <div className="navigation-buttons">
              <HomeButton onClick={() => flyToHomeView(2)} />
              <MeasurementButton isMeasuring={isMeasuring} onClick={toggleMeasurement} />
              {hasCoordinates && <ClearButton onClick={clearMeasurements} />}
              <CameraSettingsButton onClick={() => setShowCameraSettings(true)} />
            </div>
          </div>
        </div>
      </div>
      
      <ControlPanel
        isPanelVisible={isPanelVisible}
        setIsPanelVisible={setIsPanelVisible}
        isDropdownOpen={isDropdownOpen}
        setIsDropdownOpen={setIsDropdownOpen}
        activeTileset={activeTileset}
        activeTilesetId={activeTilesetId}
        onTilesetSelect={(tileset) => {
          flyToTileset(tileset, viewerRef.current?.cesiumElement);
          setIsDropdownOpen(false);
        }}
      >
        <MiniMap
          miniMapRef={miniMapRef}
          terrainProvider={terrainProvider}
          clockViewModel={clockViewModel}
          tilesetUrl={tilesetUrl}
          tilesetUrl2={tilesetUrl2}
        />
      </ControlPanel>

      <CameraSettingsPanel 
        showCameraSettings={showCameraSettings}
        cameraSettings={cameraSettings}
        setCameraSettings={setCameraSettings}
        onSave={() => saveCameraSettings(
          viewerRef.current?.cesiumElement,
          activeTileset,
          setActiveTileset
        )}
        onCancel={() => setShowCameraSettings(false)}
        onPreview={() => previewCameraSettings(
          viewerRef.current?.cesiumElement,
          activeTileset
        )}
      />
    </div>
  );
}

export default App;
