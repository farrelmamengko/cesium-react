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
  defined
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

  const [clockViewModel] = useState(new ClockViewModel());
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

      const syncMiniMap = () => {
        const viewCenter = new Cartesian2(
          mainViewer.canvas.clientWidth / 2,
          mainViewer.canvas.clientHeight / 2
        );

        const worldPosition = mainViewer.scene.camera.pickEllipsoid(viewCenter);
        
        if (defined(worldPosition)) {
          const distance = Cartesian3.distance(
            worldPosition,
            mainViewer.scene.globe.ellipsoid.cartographicToCartesian(
              mainViewer.camera.positionCartographic
            )
          );

          miniViewer.camera.lookAt(
            worldPosition,
            new Cartesian3(0.0, 0.0, distance * 2)
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

  // Pastikan fungsi addPointMarkers dipanggil setelah data outcrops berhasil diambil
  useEffect(() => {
    console.log('useEffect untuk loadOutcrops dipanggil');
    
    // Gunakan variabel untuk melacak apakah komponen masih terpasang
    let isMounted = true;
    
    const loadOutcrops = async () => {
      try {
        console.log('Mencoba mengambil data outcrops...');
        const outcropsData = await fetchOutcrops();
        
        // Periksa apakah komponen masih terpasang sebelum memperbarui state
        if (!isMounted) {
          console.log('Komponen tidak lagi terpasang, membatalkan pemrosesan data outcrops');
          return;
        }
        
        console.log('Data outcrops berhasil diambil:', outcropsData);
        
        // Periksa struktur data yang dikembalikan oleh API
        let outcropsArray = outcropsData;
        
        // Jika data dikembalikan dalam format {value: [...], Count: ...}
        if (outcropsData && outcropsData.value && Array.isArray(outcropsData.value)) {
          outcropsArray = outcropsData.value;
          console.log('Menggunakan data outcrops dari properti value:', outcropsArray);
        }
        
        // Tambahkan titik untuk setiap outcrop
        if (outcropsArray && outcropsArray.length > 0) {
          console.log('Memanggil addPointMarkers dengan data:', outcropsArray);
          
          // Gunakan requestAnimationFrame untuk menghindari blocking UI thread
          requestAnimationFrame(() => {
            if (isMounted) {
              addPointMarkers(outcropsArray);
            }
          });
        } else {
          console.warn('Tidak ada data outcrops yang ditemukan atau format data tidak sesuai'); 
        }
      } catch (error) {
        console.error('Gagal mengambil data outcrops:', error);
        
        // Coba lagi setelah beberapa detik jika terjadi error
        setTimeout(() => {
          if (isMounted) {
            console.log('Mencoba mengambil data outcrops lagi setelah error...');
            loadOutcrops();
          }
        }, 5000);
      }
    };
    
    loadOutcrops();
    
    // Cleanup function untuk mencegah memory leak
    return () => {
      isMounted = false;
    };
  }, []);

  // Modifikasi fungsi addPointMarkers untuk menerima data outcrops
  const addPointMarkers = (outcrops) => {
    if (!viewerRef.current?.cesiumElement) {
      console.error('Viewer belum siap');
      return;
    }
    
    const viewer = viewerRef.current.cesiumElement;
    
    // Hapus entity yang sudah ada jika perlu
    viewer.entities.removeAll();
    
    console.log('Menambahkan titik untuk outcrops:', outcrops);
    
    // Batasi jumlah entity yang ditambahkan dalam satu frame
    // Gunakan setTimeout untuk menambahkan entity secara bertahap
    const addEntitiesInBatches = (outcropsArray, batchSize = 5, startIndex = 0) => {
      const endIndex = Math.min(startIndex + batchSize, outcropsArray.length);
      const currentBatch = outcropsArray.slice(startIndex, endIndex);
      
      currentBatch.forEach(outcrop => {
        try {
          console.log('Memproses outcrop:', outcrop);
          
          // Periksa apakah outcrop memiliki properti coordinates
          if (outcrop.coordinates) {
            console.log('Menambahkan titik untuk outcrop:', outcrop.assetId, 'di koordinat:', outcrop.coordinates);
            
            // Gunakan billboard yang lebih sederhana untuk performa yang lebih baik
            const entity = viewer.entities.add({
              name: outcrop.description?.title || `Outcrop ${outcrop.assetId}`,
              position: Cartesian3.fromDegrees(
                outcrop.coordinates.longitude || 0, 
                outcrop.coordinates.latitude || 0, 
                outcrop.coordinates.height || 0
              ),
              point: {
                pixelSize: 15,
                color: Color.RED,
                outlineColor: Color.WHITE,
                outlineWidth: 2
              }
            });
            console.log('Entity berhasil ditambahkan:', entity);
          } else if (outcrop.longitude && outcrop.latitude) {
            // Format alternatif jika koordinat langsung di objek utama
            console.log('Menambahkan titik untuk outcrop dengan format alternatif:', outcrop.assetId || outcrop._id);
            
            const entity = viewer.entities.add({
              name: outcrop.name || outcrop.description?.title || `Outcrop ${outcrop.assetId || outcrop._id}`,
              position: Cartesian3.fromDegrees(
                outcrop.longitude || 0, 
                outcrop.latitude || 0, 
                outcrop.height || 0
              ),
              point: {
                pixelSize: 15,
                color: Color.RED,
                outlineColor: Color.WHITE,
                outlineWidth: 2
              }
            });
            console.log('Entity berhasil ditambahkan:', entity);
          } else {
            // Coba cari koordinat di tempat lain dalam objek
            let foundCoordinates = false;
            
            // Cek jika ada properti position dengan longitude dan latitude
            if (outcrop.position && outcrop.position.longitude && outcrop.position.latitude) {
              console.log('Menemukan koordinat di properti position:', outcrop.position);
              try {
                const entity = viewer.entities.add({
                  name: outcrop.name || outcrop.description?.title || `Outcrop ${outcrop.assetId || outcrop._id || ''}`,
                  position: Cartesian3.fromDegrees(
                    outcrop.position.longitude || 0, 
                    outcrop.position.latitude || 0, 
                    outcrop.position.height || 0
                  ),
                  point: {
                    pixelSize: 15,
                    color: Color.RED,
                    outlineColor: Color.WHITE,
                    outlineWidth: 2
                  }
                });
                console.log('Entity berhasil ditambahkan dari properti position:', entity);
                foundCoordinates = true;
              } catch (error) {
                console.error('Error saat menambahkan entity dari properti position:', error);
              }
            }
            
            if (!foundCoordinates) {
              console.warn('Outcrop tidak memiliki properti koordinat yang valid:', outcrop);
            }
          }
        } catch (error) {
          console.error('Error saat menambahkan titik untuk outcrop:', outcrop, error);
        }
      });
      
      // Jika masih ada entity yang perlu ditambahkan, jadwalkan batch berikutnya
      if (endIndex < outcropsArray.length) {
        setTimeout(() => {
          addEntitiesInBatches(outcropsArray, batchSize, endIndex);
        }, 0);
      } else {
        // Semua entity telah ditambahkan
        console.log('Jumlah entity setelah menambahkan titik:', viewer.entities.values.length);
      }
    };
    
    // Mulai menambahkan entity dalam batch
    addEntitiesInBatches(outcrops);
  };

  // Tambahkan fungsi helper untuk navigasi home view
  const flyToHomeView = (duration = 2) => {
    if (!viewerRef.current?.cesiumElement) return;
    
    const viewer = viewerRef.current.cesiumElement;
    
    // Gunakan requestAnimationFrame untuk menghindari blocking UI thread
    requestAnimationFrame(() => {
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
        duration: duration,
        // Tambahkan complete callback untuk mengurangi beban pada render
        complete: () => {
          console.log('Navigasi ke home view selesai');
        }
      });
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
            />
            
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
