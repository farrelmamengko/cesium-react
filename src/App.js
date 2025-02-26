import React, { useEffect, useState, useRef } from 'react';
import { Viewer, Cesium3DTileset } from 'resium';
import { 
  Ion, 
  Cartesian3, 
  IonResource, 
  createWorldTerrainAsync, 
  Math as CesiumMath,
  HeightReference,
  Matrix4
} from 'cesium';
import TerrainMeasurement from './utils/TerrainMeasurement';
import "cesium/Build/Cesium/Widgets/widgets.css";
import './App.css';
import * as Cesium from 'cesium';

// Set token Cesium Ion - Ganti dengan token Anda yang valid
Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIyOTI1ZDYyZC1mNWEwLTQ4ZjktYjYyZC1hMDU1ZDA0MmMwZTkiLCJpZCI6MTMwNiwiaWF0IjoxNTI3ODI0OTQwfQ.C8eb-HqnuV5pG4znVWc3rBSMtTmGsxt1wIKusHfboZU';

// Konstanta untuk Tileset 1
const TILESET_1 = {
  assetId: 2282213,
  description: {
    title: "OC 1 - Pre - Tertiary Unit – Upper Jurassic Stratigraphy Unit – Lelinta Formation (23JUL01)",
    location: "Seget Island, Misool, Southwest Papua",
    coordinate: "UTM 52S 642809 9775585",
    strikeDip: "N 142 E / 21",
    depositionalEnv: "Shallow Marine",
    petroleumSystem: "Regional Top Seal"
  }
};

// Update konstanta untuk Tileset 2
const TILESET_2 = {
  assetId: 2298041,
  description: {
    title: "OC 2 - Pre - Tertiary Unit – Lower Cretaceous Stratigraphy Unit – Gamta Formation (23JLG01)",
    location: "Ulubam Island, Misool, Southwest Papua",
    coordinate: "UTM 52S 645762 9776900",
    strikeDip: "N 360 E / 28",
    depositionalEnv: "Shallow Marine (Platform Carbonate)",
    petroleumSystem: "Reservoir Candidate"
  }
};

function App() {
  const [tilesetUrl, setTilesetUrl] = useState(null);
  const [terrainProvider, setTerrainProvider] = useState(null);
  const [error, setError] = useState(null);
  const viewerRef = useRef(null);
  const miniMapRef = useRef(null);
  const tilesetRef = useRef(null);
  const position = Cartesian3.fromDegrees(0, 0, 0); 
  const [isMeasuring, setIsMeasuring] = useState(false); 
  const [measurement, setMeasurement] = useState(null);
  const measurementToolRef = useRef(null);

  // State dan ref untuk tileset kedua
  const [tilesetUrl2, setTilesetUrl2] = useState(null);
  const tilesetRef2 = useRef(null);

  // State untuk ketinggian
  const [height1, setHeight1] = useState(68.0);  // Untuk Tileset 1 (OC 1)
  const [height2, setHeight2] = useState(68.34); // Untuk Tileset 2 (OC 2)

  // Tambahkan state untuk dropdown
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Tambahkan state untuk clock yang dibagi
  const [clockViewModel] = useState(new Cesium.ClockViewModel());

  // Tambahkan state untuk mengontrol visibility panel
  const [isPanelVisible, setIsPanelVisible] = useState(true);

  // Tambahkan state untuk tileset aktif
  const [activeTileset, setActiveTileset] = useState(TILESET_1);

  // Tambahkan state untuk mengontrol visibility tileset
  const [activeTilesetId, setActiveTilesetId] = useState(null);

  // Tambahkan state baru untuk melacak keberadaan koordinat
  const [hasCoordinates, setHasCoordinates] = useState(false);

  const flyToTileset = (tileset) => {
    // Set active tileset terlebih dahulu
    setActiveTilesetId(tileset.assetId);
    setActiveTileset(tileset);
    
    // Tunggu sebentar sampai tileset dimuat
    setTimeout(() => {
      if (viewerRef.current) {
        const viewer = viewerRef.current.cesiumElement;
        const currentTilesetRef = tileset === TILESET_1 ? tilesetRef : tilesetRef2;
        
        if (currentTilesetRef.current && currentTilesetRef.current.cesiumElement) {
          const tilesetElement = currentTilesetRef.current.cesiumElement;
          const boundingSphere = tilesetElement.boundingSphere;
          const center = boundingSphere.center;
          const cartographic = Cesium.Cartographic.fromCartesian(center);
          
          const longitude = CesiumMath.toDegrees(cartographic.longitude);
          const latitude = CesiumMath.toDegrees(cartographic.latitude);
          const height = cartographic.height;

          viewer.camera.flyTo({
            destination: Cartesian3.fromDegrees(
              longitude,
              latitude,
              height + (boundingSphere.radius * 2.0)
            ),
            orientation: {
              heading: CesiumMath.toRadians(0),
              pitch: CesiumMath.toRadians(-45),
              roll: 0
            },
            duration: 2,
            complete: () => {
              console.log(`Terbang ke ${tileset.description.title} selesai`);
            },
            easingFunction: CesiumMath.EASE_OUT_CUBIC
          });
        } else {
          console.log('Menunggu tileset dimuat...');
          // Coba lagi setelah beberapa saat jika tileset belum siap
          setTimeout(() => flyToTileset(tileset), 1000);
        }
      }
    }, 500);
  };

  // Fungsi load untuk tileset kedua
  const loadTileset2 = async () => {
    try {
      const resource = await IonResource.fromAssetId(2298041); // Ganti dengan ID asset kedua
      setTilesetUrl2(resource);
    } catch (error) {
      console.error('Error loading second tileset:', error);
      setError('Gagal memuat 3D Tileset Kedua');
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
        const resource = await IonResource.fromAssetId(TILESET_1.assetId);
        setTilesetUrl(resource);
      } catch (error) {
        console.error('Error loading tileset:', error);
        setError('Gagal memuat 3D Tileset');
      }
    };

    // Modifikasi useEffect untuk load kedua tileset
    loadTerrain();
    loadTileset();
    loadTileset2(); // Tambahkan load tileset kedua
  }, []);

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
    if (isMeasuring) {
      measurementToolRef.current?.stop();
      setIsMeasuring(false);
    } else {
      measurementToolRef.current?.start();
      setIsMeasuring(true);
    }
  };

  const clearMeasurements = () => {
    if (measurementToolRef.current) {
      measurementToolRef.current.clearMeasurements();
      setMeasurement(null);
    }
  };

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

  // Tambahkan useEffect untuk mengatur callback measurement
  useEffect(() => {
    if (measurementToolRef.current) {
      measurementToolRef.current.setMeasurementCallback((measurement) => {
        setHasCoordinates(true); // Set true ketika ada koordinat baru
      });
    }
  }, [measurementToolRef.current]);

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
            <Viewer
              ref={viewerRef}
              terrainProvider={terrainProvider}
              scene3DOnly={true}
              clockViewModel={clockViewModel}
              homeButton={false}
              animation={false}
              timeline={false}
              fullscreenButton={false}
            >
              {/* Tileset 1 */}
              {tilesetUrl && activeTilesetId === TILESET_1.assetId && (
                <Cesium3DTileset
                  ref={tilesetRef}
                  url={tilesetUrl}
                  maximumScreenSpaceError={16}
                  onReady={(tileset) => {
                    const height = height1;
                    const boundingSphere = tileset.boundingSphere;
                    const cartographic = Cesium.Cartographic.fromCartesian(boundingSphere.center);
                    const surface = Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, 0.0);
                    const absolutePosition = Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, height);
                    const translation = Cartesian3.subtract(absolutePosition, surface, new Cartesian3());
                    tileset.modelMatrix = Matrix4.fromTranslation(translation);
                  }}
                />
              )}

              {/* Tileset 2 */}
              {tilesetUrl2 && activeTilesetId === TILESET_2.assetId && (
                <Cesium3DTileset
                  ref={tilesetRef2}
                  url={tilesetUrl2}
                  maximumScreenSpaceError={16}
                  onReady={(tileset) => {
                    const height = height2;
                    const boundingSphere = tileset.boundingSphere;
                    const cartographic = Cesium.Cartographic.fromCartesian(boundingSphere.center);
                    const surface = Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, 0.0);
                    const absolutePosition = Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, height);
                    const translation = Cartesian3.subtract(absolutePosition, surface, new Cartesian3());
                    tileset.modelMatrix = Matrix4.fromTranslation(translation);
                  }}
                />
              )}
            </Viewer>
            
            {/* Tombol home baru */}
            <button
              className="home-nav-button"
              onClick={() => {
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
                    duration: 2
                  });
                }
              }}
              title="Home View"
            >
              <svg viewBox="0 0 24 24">
                <path d="M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z" />
              </svg>
            </button>

            {/* Tombol pengukur koordinat */}
            <button
              className={`measurement-nav-button ${isMeasuring ? 'active' : ''}`}
              onClick={toggleMeasurement}
              title="Pengukur Koordinat"
            >
              <svg viewBox="0 0 24 24">
                <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M7,10L12,15L17,10H7Z" />
              </svg>
            </button>

            {/* Tombol clear koordinat - hanya muncul jika ada koordinat */}
            {hasCoordinates && (
              <button
                className="clear-nav-button"
                onClick={() => {
                  if (measurementToolRef.current) {
                    measurementToolRef.current.clearMeasurements();
                    setIsMeasuring(false);
                    setHasCoordinates(false); // Reset state setelah menghapus
                  }
                }}
                title="Hapus Semua Koordinat"
              >
                <svg viewBox="0 0 24 24">
                  <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
      
      <div className={`control-panel ${isPanelVisible ? 'panel-visible' : 'panel-hidden'}`}>
        <div className="panel-header">
          <button className="panel-toggle-button" onClick={() => setIsPanelVisible(!isPanelVisible)}>
            {isPanelVisible ? 'Sembunyikan Panel' : 'Tampilkan Panel'}
          </button>
        </div>
        <div className="panel-content">
          <div className="dropdown-container">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="control-button"
            >
              Pilih Model ▼
            </button>
            
            {isDropdownOpen && (
              <div className="dropdown-menu">
                <button 
                  onClick={() => {
                    flyToTileset(TILESET_1);
                    setIsDropdownOpen(false);
                  }}
                  className="dropdown-item"
                >
                  {TILESET_1.description.title}
                </button>
                <button 
                  onClick={() => {
                    flyToTileset(TILESET_2);
                    setIsDropdownOpen(false);
                  }}
                  className="dropdown-item"
                >
                  {TILESET_2.description.title}
                </button>
              </div>
            )}
          </div>

          {/* Description box - hanya tampil jika ada tileset aktif */}
          {activeTilesetId && (
            <div className="description-box">
              <h3>{activeTileset.description.title}</h3>
              <div className="description-content">
                <p><strong>Lokasi:</strong> {activeTileset.description.location}</p>
                <p><strong>Koordinat:</strong> {activeTileset.description.coordinate}</p>
                <p><strong>Strike/Dip:</strong> {activeTileset.description.strikeDip}</p>
                <p><strong>Lingkungan Pengendapan:</strong> {activeTileset.description.depositionalEnv}</p>
                <p><strong>Sistem Petroleum:</strong> {activeTileset.description.petroleumSystem}</p>
              </div>
            </div>
          )}

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
        </div>
      </div>
    </div>
  );
}

export default App;
