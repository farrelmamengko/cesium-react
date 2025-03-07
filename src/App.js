import React, { useEffect, useState, useRef } from 'react';
import { Viewer, Cesium3DTileset, Entity, CameraFlyTo, ScreenSpaceEventHandler, ScreenSpaceEvent } from 'resium';
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
  ScreenSpaceEventType,
  PinBuilder,
  Cartographic,
  ClockViewModel,
  SceneMode,
  defined,
  HeadingPitchRange
} from 'cesium';
import TerrainMeasurement from './utils/TerrainMeasurement';
import "cesium/Build/Cesium/Widgets/widgets.css";
import './App.css';
import { useTilesets } from './hooks/useTilesets';
import { useMeasurement } from './hooks/useMeasurement';
import { TILESET_1, TILESET_2 } from './constants/tilesets';
import ControlPanel from './components/ControlPanel';
import HomeButton from './components/Navigation/HomeButton';
import MeasurementButton from './components/Navigation/MeasurementButton';
import ClearButton from './components/Navigation/ClearButton';
import CameraButton from './components/Navigation/CameraButton';
import PhotoButton from './components/Navigation/PhotoButton';
import CesiumViewer from './components/CesiumViewer';
import MiniMap from './components/MiniMap';
import CameraVisualization from './components/CameraVisualization/CameraVisualization';
import { saveCameraPosition, getCameraPosition, fetchOutcrops } from './services/api';
import AddPhotoForm from './components/AddPhotoForm';

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
  
  // Tambahkan state untuk visibilitas panel kamera
  const [showCameraInfo, setShowCameraInfo] = useState(false);
  
  // Tambahkan state untuk menyimpan posisi kamera
  const [outcropCameraPositions, setOutcropCameraPositions] = useState({});
  
  // Tambahkan state untuk foto mode
  const [showPhotoMode, setShowPhotoMode] = useState(false);
  
  // Tambahkan state untuk menyimpan posisi klik pada peta
  const [clickPosition, setClickPosition] = useState(null);
  
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
      if (!viewerRef.current) {
        console.warn('Viewer belum siap, menunda pemuatan terrain');
        return;
      }
      
      console.log('Memuat terrain...');
      
      try {
        // Gunakan requestAnimationFrame untuk menghindari blocking UI thread
        requestAnimationFrame(async () => {
          try {
            // Buat terrain dengan opsi yang lebih ringan
            const terrainProvider = await createWorldTerrainAsync({
              requestVertexNormals: false, // Matikan vertex normals untuk performa lebih baik
              requestWaterMask: false      // Matikan water mask untuk performa lebih baik
            });
            
            // Terapkan terrain provider ke scene
            viewerRef.current.terrainProvider = terrainProvider;
            console.log('Terrain berhasil dimuat');
          } catch (error) {
            console.error('Error saat memuat terrain:', error);
          }
        });
      } catch (error) {
        console.error('Error saat memuat terrain:', error);
      }
    };
    
    loadTerrain();
  }, []);

  const position = Cartesian3.fromDegrees(0, 0, 0); 

  const [clockViewModel] = useState(new ClockViewModel());
  const miniMapRef = useRef(null);

  // Variabel untuk throttling
  let lastSyncTime = 0;
  const syncThrottleMs = 100; // Throttle ke 10 fps

  const syncMiniMap = () => {
    // Throttle update untuk mengurangi beban pada main thread
    const now = Date.now();
    if (now - lastSyncTime < syncThrottleMs) {
      return;
    }
    lastSyncTime = now;
    
    if (!miniMapRef.current || !viewerRef.current) {
      return;
    }
    
    const mainViewer = viewerRef.current.cesiumElement;
    const miniMapViewer = miniMapRef.current.cesiumElement;
    
    if (!mainViewer || !miniMapViewer) {
      return;
    }
    
    // Gunakan requestAnimationFrame untuk menghindari blocking UI thread
    requestAnimationFrame(() => {
      try {
        // Dapatkan posisi kamera utama
        const cameraPosition = mainViewer.camera.position;
        const ellipsoid = mainViewer.scene.globe.ellipsoid;
        const cartographic = ellipsoid.cartesianToCartographic(cameraPosition);
        
        // Perbarui posisi kamera mini map
        miniMapViewer.camera.setView({
          destination: Cartesian3.fromRadians(
            cartographic.longitude,
            cartographic.latitude,
            30000 // Ketinggian tetap untuk mini map
          ),
          orientation: {
            heading: 0,
            pitch: -Math.PI/2, // Lihat ke bawah
            roll: 0
          }
        });
      } catch (error) {
        console.error('Error saat menyinkronkan mini map:', error);
      }
    });
  };

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
    if (tilesetRef.current?.cesiumElement) {
      const tileset = tilesetRef.current.cesiumElement;
      const absoluteHeight = height1;
      const boundingSphere = tileset.boundingSphere;
      const cartographic = Cartographic.fromCartesian(boundingSphere.center);
      const surface = Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, 0.0);
      const absolutePosition = Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, absoluteHeight);
      const translation = Cartesian3.subtract(absolutePosition, surface, new Cartesian3());
      tileset.modelMatrix = Matrix4.fromTranslation(translation);
    }
  }, [tilesetRef.current, height1]);

  // Ubah useEffect untuk tileset kedua (OC 2)
  useEffect(() => {
    if (tilesetRef2.current?.cesiumElement) {
      const tileset = tilesetRef2.current.cesiumElement;
      const absoluteHeight = height2;
      const boundingSphere = tileset.boundingSphere;
      const cartographic = Cartographic.fromCartesian(boundingSphere.center);
      const surface = Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, 0.0);
      const absolutePosition = Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, absoluteHeight);
      const translation = Cartesian3.subtract(absolutePosition, surface, new Cartesian3());
      tileset.modelMatrix = Matrix4.fromTranslation(translation);
    }
  }, [tilesetRef2.current, height2]);

  // Update useEffect untuk sinkronisasi kamera
  useEffect(() => {
    if (viewerRef.current?.cesiumElement && miniMapRef.current?.cesiumElement) {
      const mainViewer = viewerRef.current.cesiumElement;
      const miniViewer = miniMapRef.current.cesiumElement;
      
      miniViewer.scene.mode = SceneMode.SCENE2D;
      miniViewer.scene.screenSpaceCameraController.enableRotate = false;
      miniViewer.scene.screenSpaceCameraController.enableTranslate = false;
      miniViewer.scene.screenSpaceCameraController.enableZoom = false;
      miniViewer.scene.screenSpaceCameraController.enableTilt = false;
      miniViewer.scene.screenSpaceCameraController.enableLook = false;

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

  // Tambahkan useEffect untuk memuat outcrops
  useEffect(() => {
    console.log('useEffect untuk loadOutcrops dipanggil');
    
    // Kita tidak perlu memanggil loadOutcrops lagi karena entity outcrops sudah ada di CesiumViewer.js
    // Namun, kita tetap bisa mengambil data outcrops untuk keperluan lain jika diperlukan
    
    console.log('useEffect untuk loadOutcrops selesai');
  }, []);

  // Fungsi untuk terbang ke posisi kamera
  const flyToPosition = (cameraPosition) => {
    if (!viewerRef.current) return;
    
    const viewer = viewerRef.current.cesiumElement;
    
    console.log('Terbang ke posisi kamera:', cameraPosition);
    
    // Gunakan requestAnimationFrame untuk menghindari blocking UI thread
    requestAnimationFrame(() => {
      try {
        // Ekstrak data posisi dan orientasi
        const position = cameraPosition.position;
        const orientation = cameraPosition.orientation;
        
        // Terbang ke posisi kamera
        viewer.camera.flyTo({
          destination: Cartesian3.fromDegrees(
            position.longitude,
            position.latitude,
            position.height
          ),
          orientation: {
            heading: CesiumMath.toRadians(orientation.heading || 0),
            pitch: CesiumMath.toRadians(orientation.pitch || -45),
            roll: orientation.roll || 0
          },
          duration: 2,
          complete: function() {
            console.log('Navigasi ke posisi kamera selesai');
          }
        });
      } catch (error) {
        console.error('Error saat terbang ke posisi kamera:', error);
      }
    });
  };

  // Tambahkan fungsi helper untuk navigasi home view
  const flyToHomeView = (duration = 2) => {
    if (!viewerRef.current) return;
    
    const viewer = viewerRef.current.cesiumElement;
    
    console.log('Terbang ke home view');
    
    // Gunakan requestAnimationFrame untuk menghindari blocking UI thread
    requestAnimationFrame(() => {
      try {
        // Simpan kamera saat ini untuk animasi yang lebih halus
        const currentPosition = viewer.camera.position.clone();
        const currentHeading = viewer.camera.heading;
        const currentPitch = viewer.camera.pitch;
        
        // Koordinat untuk Indonesia (Papua)
        const longitude = 130.284065; // Koordinat OC1
        const latitude = -2.029881;   // Koordinat OC1
        const height = 500000;        // Ketinggian dalam meter
        
        console.log(`Terbang ke koordinat: ${longitude}, ${latitude}, ${height}`);
        
        // Gunakan flyTo dengan complete callback untuk mengurangi beban pada render
        viewer.camera.flyTo({
          destination: Cartesian3.fromDegrees(longitude, latitude, height),
          orientation: {
            heading: CesiumMath.toRadians(0),
            pitch: CesiumMath.toRadians(-45),
            roll: 0
          },
          duration: duration,
          complete: function() {
            console.log('Navigasi ke home view selesai');
          },
          easingFunction: function(time) {
            // Fungsi easing yang lebih efisien
            return time < 0.5 ? 2 * time * time : -1 + (4 - 2 * time) * time;
          }
        });
      } catch (error) {
        console.error('Error saat terbang ke home view:', error);
      }
    });
  };

  // Di useEffect untuk inisialisasi
  useEffect(() => {
    if (viewerRef.current?.cesiumElement && terrainProvider) {
      flyToHomeView(0); // Tanpa animasi saat awal load
    }
  }, [terrainProvider]);

  // Toggle fungsi untuk panel kamera
  const toggleCameraInfo = () => {
    setShowCameraInfo(!showCameraInfo);
  };

  const handleSaveCameraPosition = async (outcropId, cameraPosition) => {
    try {
      // Simpan ke state
      setOutcropCameraPositions(prev => ({
        ...prev,
        [outcropId]: cameraPosition
      }));

      // Simpan ke storage
      await saveCameraPosition(outcropId, cameraPosition);
      
      alert('Posisi kamera berhasil disimpan!');
    } catch (error) {
      console.error('Gagal menyimpan posisi kamera:', error);
      alert('Gagal menyimpan posisi kamera');
    }
  };

  const togglePhotoMode = () => {
    setShowPhotoMode(prev => !prev);
    
    // Reset mode pengukuran jika sedang aktif
    if (isMeasuring) {
      setIsMeasuring(false);
    }
    
    // Atur cursor
    if (viewerRef.current?.cesiumElement) {
      viewerRef.current.cesiumElement.canvas.style.cursor = !showPhotoMode ? 'crosshair' : 'default';
    }
  };

  const handlePhotoClick = (position) => {
    if (!showPhotoMode) return;
    
    setClickPosition(position);
    
    // Reset cursor ke default
    if (viewerRef.current?.cesiumElement) {
      viewerRef.current.cesiumElement.canvas.style.cursor = 'default';
    }
    
    // Nonaktifkan mode foto
    setShowPhotoMode(false);
  };

  // Tambahkan fungsi debounce untuk event handler
  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // Gunakan debounce untuk event handler yang sering dipanggil
  const handleMouseMove = debounce((movement) => {
    if (!viewerRef.current) return;
    
    // Implementasi handler mouse move
  }, 50);

  // Gunakan throttle untuk event handler yang sangat sering dipanggil
  let lastRenderTime = 0;
  const renderThrottleMs = 16; // Sekitar 60 fps

  const onRenderHandler = () => {
    const now = Date.now();
    if (now - lastRenderTime < renderThrottleMs) {
      return;
    }
    lastRenderTime = now;
    
    // Implementasi handler render
  };

  // Fungsi yang dipanggil ketika viewer siap
  const handleViewerReady = (viewer) => {
    console.log('Viewer siap');
    
    // Terbang ke home view
    flyToHomeView(2);
  };

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
              showPhotoMode={showPhotoMode}
              onPhotoClick={handlePhotoClick}
            >
              <Entity
                name="OC 1"
                position={Cartesian3.fromDegrees(130.284065, -2.029881, 75.86)}
                point={{
                  pixelSize: 20,
                  color: Color.RED,
                  outlineColor: Color.WHITE,
                  outlineWidth: 3,
                  heightReference: HeightReference.CLAMP_TO_GROUND
                }}
                description="OC 1 - Pre - Tertiary Unit – Upper Jurassic Stratigraphy Unit – Lelinta Formation (23JUL01)"
              />
              <Entity
                name="OC 2"
                position={Cartesian3.fromDegrees(130.310587, -2.018613, 67.32)}
                point={{
                  pixelSize: 20,
                  color: Color.RED,
                  outlineColor: Color.WHITE,
                  outlineWidth: 3,
                  heightReference: HeightReference.CLAMP_TO_GROUND
                }}
                description="OC 2 - Pre - Tertiary Unit – Lower Cretaceous Stratigraphy Unit – Gamta Formation (23JLG01)"
              />
              
              <ScreenSpaceEventHandler>
                <ScreenSpaceEvent
                  action={(click) => {
                    const pickedObject = viewerRef.current.cesiumElement.scene.pick(click.position);
                    console.log('Objek yang diklik:', pickedObject);
                    
                    if (defined(pickedObject) && pickedObject.id) {
                      const entity = pickedObject.id;
                      console.log('Entity yang diklik:', entity);
                      
                      if (entity.name === 'OC 1') {
                        console.log('Entity OC 1 diklik');
                        flyToPosition({
                          position: {
                            longitude: 130.284065,
                            latitude: -2.029881,
                            height: 75.86
                          },
                          orientation: {
                            heading: 10,
                            pitch: -45,
                            roll: 0
                          }
                        });
                      } else if (entity.name === 'OC 2') {
                        console.log('Entity OC 2 diklik');
                        flyToPosition({
                          position: {
                            longitude: 130.310587,
                            latitude: -2.018613,
                            height: 67.32
                          },
                          orientation: {
                            heading: 30,
                            pitch: -35,
                            roll: 0
                          }
                        });
                      }
                    }
                  }}
                  type={ScreenSpaceEventType.LEFT_CLICK}
                />
              </ScreenSpaceEventHandler>
            </CesiumViewer>
            
            {viewerRef.current?.cesiumElement && showCameraInfo && (
              <CameraVisualization 
                viewer={viewerRef.current.cesiumElement} 
                isVisible={showCameraInfo}
                onToggleVisibility={toggleCameraInfo}
                onSavePosition={handleSaveCameraPosition}
                outcropId={activeTilesetId}
              />
            )}
            
            <div className="navigation-buttons">
              <HomeButton onClick={() => flyToHomeView(2)} />
              <MeasurementButton isMeasuring={isMeasuring} onClick={toggleMeasurement} />
              {hasCoordinates && <ClearButton onClick={clearMeasurements} />}
              <CameraButton isVisible={showCameraInfo} onClick={toggleCameraInfo} />
              <PhotoButton isActive={showPhotoMode} onClick={togglePhotoMode} />
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
        onTilesetSelect={async (tileset) => {
          await flyToTileset(tileset, viewerRef.current?.cesiumElement);
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
      
      {clickPosition && (
        <div className="photo-form-container">
          <AddPhotoForm
            position={clickPosition}
            outcropId={activeTilesetId}
            onCancel={() => {
              setClickPosition(null);
              if (viewerRef.current?.cesiumElement) {
                viewerRef.current.cesiumElement.canvas.style.cursor = 'default';
              }
            }}
            onPhotoAdded={() => {
              setClickPosition(null);
              alert('Foto berhasil ditambahkan!');
            }}
          />
        </div>
      )}
    </div>
  );
}

export default App;
