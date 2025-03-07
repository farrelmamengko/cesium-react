import React, { useEffect } from 'react';
import { Viewer, Cesium3DTileset, ScreenSpaceEventHandler, ScreenSpaceEvent, Entity, CameraFlyTo } from 'resium';
import { 
  Matrix4,
  Cartesian3,
  Cartesian2,
  Cartographic,
  Math as CesiumMath,
  ScreenSpaceEventType,
  Color,
  HeightReference,
  defined,
  VerticalOrigin,
  LabelStyle,
  PinBuilder
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
  
  // Tambahkan fungsi untuk menangani klik pada entity outcrops
  const handleEntityClick = (entity) => {
    console.log('Entity yang diklik:', entity?.id);
    
    if (!entity) return;
    
    if (entity.id === 'outcrop-2282213' || entity.id === 'outcrop-2282213-prog' || entity.id === 'outcrop-2282213-alt' || entity.id === 'outcrop-2282213-marker') {
      console.log('OC1 diklik');
      const viewer = viewerRef.current.cesiumElement;
      viewer.camera.flyTo({
        destination: Cartesian3.fromDegrees(130.284065, -2.029881, 500),
        orientation: {
          heading: CesiumMath.toRadians(0),
          pitch: CesiumMath.toRadians(-45),
          roll: 0.0
        }
      });
    } else if (entity.id === 'outcrop-2298041' || entity.id === 'outcrop-2298041-prog' || entity.id === 'outcrop-2298041-alt' || entity.id === 'outcrop-2298041-marker') {
      console.log('OC2 diklik');
      const viewer = viewerRef.current.cesiumElement;
      viewer.camera.flyTo({
        destination: Cartesian3.fromDegrees(130.310587, -2.018613, 500),
        orientation: {
          heading: CesiumMath.toRadians(0),
          pitch: CesiumMath.toRadians(-45),
          roll: 0.0
        }
      });
    } else if (entity.id === 'test-entity-jakarta') {
      console.log('Jakarta diklik');
      const viewer = viewerRef.current.cesiumElement;
      viewer.camera.flyTo({
        destination: Cartesian3.fromDegrees(106.8456, -6.2088, 10000),
        orientation: {
          heading: CesiumMath.toRadians(0),
          pitch: CesiumMath.toRadians(-45),
          roll: 0.0
        }
      });
    } else if (entity.id === 'test-entity-surabaya') {
      console.log('Surabaya diklik');
      const viewer = viewerRef.current.cesiumElement;
      viewer.camera.flyTo({
        destination: Cartesian3.fromDegrees(112.7508, -7.2575, 10000),
        orientation: {
          heading: CesiumMath.toRadians(0),
          pitch: CesiumMath.toRadians(-45),
          roll: 0.0
        }
      });
    }
  };
  
  // Tambahkan useEffect untuk menerbangkan kamera ke lokasi OC1 dan OC2 saat aplikasi dimuat
  useEffect(() => {
    if (viewerRef.current?.cesiumElement) {
      console.log('Menerbangkan kamera ke lokasi OC1 dan OC2');
      
      const viewer = viewerRef.current.cesiumElement;
      
      // Pastikan depth testing dinonaktifkan agar entity selalu terlihat
      viewer.scene.globe.depthTestAgainstTerrain = false;
      
      // Pastikan entity selalu terlihat
      viewer.scene.screenSpaceCameraController.enableCollisionDetection = false;
      
      // Tambahkan konfigurasi tambahan
      viewer.scene.postProcessStages.fxaa.enabled = true;
      viewer.scene.fog.enabled = false;
      viewer.scene.globe.showGroundAtmosphere = false;
      
      // Tambahkan delay untuk memastikan entity sudah dimuat
      setTimeout(() => {
        // Terbang ke posisi yang mencakup semua entity
        viewer.camera.flyTo({
          destination: Cartesian3.fromDegrees(130.297326, -2.024247, 5000),
          orientation: {
            heading: CesiumMath.toRadians(0),
            pitch: CesiumMath.toRadians(-45),
            roll: 0.0
          },
          duration: 3,
          complete: function() {
            console.log('Kamera telah terbang ke lokasi OC1 dan OC2');
          }
        });
      }, 2000);
    }
  }, [viewerRef]);
  
  // Tambahkan useEffect untuk menambahkan entity OC1 dan OC2 dengan pendekatan berbeda
  useEffect(() => {
    if (viewerRef.current?.cesiumElement) {
      console.log('Menambahkan entity OC1 dan OC2 dengan pendekatan berbeda');
      
      const viewer = viewerRef.current.cesiumElement;
      
      // Hapus entity yang sudah ada dengan ID yang sama
      const existingEntities = viewer.entities.values.filter(
        entity => entity.id && (
          entity.id === 'outcrop-2282213-alt' || 
          entity.id === 'outcrop-2298041-alt'
        )
      );
      
      existingEntities.forEach(entity => {
        viewer.entities.remove(entity);
      });
      
      // Tambahkan OC1 dengan pendekatan berbeda
      const oc1 = new Cesium.Entity({
        id: 'outcrop-2282213-alt',
        name: 'OC 1 (Alt)',
        position: new Cesium.Cartesian3.fromDegrees(130.284065, -2.029881, 75.86),
        billboard: {
          image: new Cesium.PinBuilder().fromColor(Cesium.Color.BLUE, 48).toDataURL(),
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          scale: 1.0
        },
        label: {
          text: 'OC1 (Alt)',
          font: 'bold 20px sans-serif',
          fillColor: Cesium.Color.WHITE,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 4,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(0, -48),
          heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
        description: 'OC1 - Pre - Tertiary Unit – Upper Jurassic Stratigraphy Unit – Lelinta Formation (23JUL01)'
      });
      
      // Tambahkan OC2 dengan pendekatan berbeda
      const oc2 = new Cesium.Entity({
        id: 'outcrop-2298041-alt',
        name: 'OC 2 (Alt)',
        position: new Cesium.Cartesian3.fromDegrees(130.310587, -2.018613, 67.32),
        billboard: {
          image: new Cesium.PinBuilder().fromColor(Cesium.Color.RED, 48).toDataURL(),
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          scale: 1.0
        },
        label: {
          text: 'OC2 (Alt)',
          font: 'bold 20px sans-serif',
          fillColor: Cesium.Color.WHITE,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 4,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(0, -48),
          heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
        description: 'OC2 - Pre - Tertiary Unit – Lower Cretaceous Stratigraphy Unit – Gamta Formation (23JLG01)'
      });
      
      // Tambahkan entity ke viewer
      viewer.entities.add(oc1);
      viewer.entities.add(oc2);
      
      // Terbang ke lokasi OC1 dan OC2
      setTimeout(() => {
        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(130.297326, -2.024247, 5000),
          orientation: {
            heading: Cesium.Math.toRadians(0),
            pitch: Cesium.Math.toRadians(-45),
            roll: 0.0
          },
          duration: 3
        });
      }, 5000);
      
      console.log('Entity OC1 dan OC2 berhasil ditambahkan dengan pendekatan berbeda');
    }
  }, [viewerRef]);
  
  // Tambahkan useEffect untuk menambahkan entity sederhana
  useEffect(() => {
    if (viewerRef.current?.cesiumElement) {
      console.log('Menambahkan entity sederhana untuk testing');
      
      const viewer = viewerRef.current.cesiumElement;
      
      // Pastikan depth testing dinonaktifkan agar entity selalu terlihat
      viewer.scene.globe.depthTestAgainstTerrain = false;
      
      // Pastikan entity selalu terlihat
      viewer.scene.screenSpaceCameraController.enableCollisionDetection = false;
      
      // Tambahkan entity sederhana di Jakarta
      viewer.entities.add({
        id: 'test-entity-jakarta',
        name: 'Test Entity Jakarta',
        position: Cartesian3.fromDegrees(106.8456, -6.2088, 10),
        point: {
          pixelSize: 20,
          color: Color.YELLOW,
          outlineColor: Color.BLACK,
          outlineWidth: 3,
          heightReference: HeightReference.CLAMP_TO_GROUND,
          disableDepthTestDistance: Number.POSITIVE_INFINITY
        },
        label: {
          text: 'Jakarta',
          font: 'bold 20px sans-serif',
          fillColor: Color.WHITE,
          outlineColor: Color.BLACK,
          outlineWidth: 4,
          style: LabelStyle.FILL_AND_OUTLINE,
          verticalOrigin: VerticalOrigin.BOTTOM,
          pixelOffset: new Cartesian2(0, -20),
          heightReference: HeightReference.CLAMP_TO_GROUND,
          disableDepthTestDistance: Number.POSITIVE_INFINITY
        }
      });
      
      // Tambahkan entity sederhana di Surabaya
      viewer.entities.add({
        id: 'test-entity-surabaya',
        name: 'Test Entity Surabaya',
        position: Cartesian3.fromDegrees(112.7508, -7.2575, 10),
        billboard: {
          image: new PinBuilder().fromColor(Color.GREEN, 48).toDataURL(),
          verticalOrigin: VerticalOrigin.BOTTOM,
          heightReference: HeightReference.CLAMP_TO_GROUND,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          scale: 1.0
        },
        label: {
          text: 'Surabaya',
          font: 'bold 20px sans-serif',
          fillColor: Color.WHITE,
          outlineColor: Color.BLACK,
          outlineWidth: 4,
          style: LabelStyle.FILL_AND_OUTLINE,
          verticalOrigin: VerticalOrigin.BOTTOM,
          pixelOffset: new Cartesian2(0, -48),
          heightReference: HeightReference.CLAMP_TO_GROUND,
          disableDepthTestDistance: Number.POSITIVE_INFINITY
        }
      });
      
      // Terbang ke Indonesia
      setTimeout(() => {
        viewer.camera.flyTo({
          destination: Cartesian3.fromDegrees(110.0, -7.0, 3000000),
          orientation: {
            heading: CesiumMath.toRadians(0),
            pitch: CesiumMath.toRadians(-90),
            roll: 0.0
          },
          duration: 3
        });
      }, 1000);
      
      console.log('Entity sederhana berhasil ditambahkan');
    }
  }, [viewerRef]);
  
  // Tambahkan useEffect untuk menambahkan entity menggunakan primitives
  useEffect(() => {
    if (viewerRef.current?.cesiumElement) {
      console.log('Menambahkan entity menggunakan primitives');
      
      const viewer = viewerRef.current.cesiumElement;
      
      // Tambahkan point menggunakan primitives
      const pointPrimitives = viewer.scene.primitives.add(new Cesium.PointPrimitiveCollection());
      
      // Tambahkan OC1 sebagai point primitive
      pointPrimitives.add({
        id: 'outcrop-2282213-primitive',
        position: Cesium.Cartesian3.fromDegrees(130.284065, -2.029881, 75.86),
        color: Cesium.Color.RED,
        pixelSize: 20,
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 3,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        translucencyByDistance: new Cesium.NearFarScalar(1.0e2, 1.0, 2.0e6, 0.0)
      });
      
      // Tambahkan OC2 sebagai point primitive
      pointPrimitives.add({
        id: 'outcrop-2298041-primitive',
        position: Cesium.Cartesian3.fromDegrees(130.310587, -2.018613, 67.32),
        color: Cesium.Color.RED,
        pixelSize: 20,
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 3,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        translucencyByDistance: new Cesium.NearFarScalar(1.0e2, 1.0, 2.0e6, 0.0)
      });
      
      // Tambahkan billboard menggunakan primitives
      const billboardPrimitives = viewer.scene.primitives.add(new Cesium.BillboardCollection());
      
      // Buat gambar pin
      const pinBuilder = new Cesium.PinBuilder();
      const redPin = pinBuilder.fromColor(Cesium.Color.RED, 48).toDataURL();
      
      // Tambahkan OC1 sebagai billboard primitive
      billboardPrimitives.add({
        id: 'outcrop-2282213-billboard',
        position: Cesium.Cartesian3.fromDegrees(130.284065, -2.029881, 85.86),
        image: redPin,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
        scale: 1.0
      });
      
      // Tambahkan OC2 sebagai billboard primitive
      billboardPrimitives.add({
        id: 'outcrop-2298041-billboard',
        position: Cesium.Cartesian3.fromDegrees(130.310587, -2.018613, 77.32),
        image: redPin,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
        scale: 1.0
      });
      
      // Tambahkan label menggunakan primitives
      const labelPrimitives = viewer.scene.primitives.add(new Cesium.LabelCollection());
      
      // Tambahkan OC1 sebagai label primitive
      labelPrimitives.add({
        id: 'outcrop-2282213-label',
        position: Cesium.Cartesian3.fromDegrees(130.284065, -2.029881, 95.86),
        text: 'OC1 (Primitive)',
        font: 'bold 20px sans-serif',
        fillColor: Cesium.Color.WHITE,
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 4,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(0, -10),
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
        scale: 1.0
      });
      
      // Tambahkan OC2 sebagai label primitive
      labelPrimitives.add({
        id: 'outcrop-2298041-label',
        position: Cesium.Cartesian3.fromDegrees(130.310587, -2.018613, 87.32),
        text: 'OC2 (Primitive)',
        font: 'bold 20px sans-serif',
        fillColor: Cesium.Color.WHITE,
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 4,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(0, -10),
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
        scale: 1.0
      });
      
      console.log('Entity berhasil ditambahkan menggunakan primitives');
    }
  }, [viewerRef]);
  
  // Tambahkan useEffect untuk menginisialisasi Cesium secara langsung
  useEffect(() => {
    if (viewerRef.current?.cesiumElement) {
      console.log('Menginisialisasi Cesium secara langsung');
      
      // Dapatkan container element dari viewer
      const container = viewerRef.current.cesiumElement.container;
      
      // Simpan referensi ke viewer asli
      const originalViewer = viewerRef.current.cesiumElement;
      
      // Tambahkan div baru untuk viewer langsung
      const directViewerContainer = document.createElement('div');
      directViewerContainer.id = 'directViewerContainer';
      directViewerContainer.style.position = 'absolute';
      directViewerContainer.style.top = '0';
      directViewerContainer.style.left = '0';
      directViewerContainer.style.width = '100%';
      directViewerContainer.style.height = '100%';
      directViewerContainer.style.zIndex = '1000';
      container.appendChild(directViewerContainer);
      
      // Buat viewer langsung
      const directViewer = new Cesium.Viewer('directViewerContainer', {
        terrainProvider: terrainProvider,
        baseLayerPicker: false,
        geocoder: false,
        homeButton: false,
        infoBox: true,
        sceneModePicker: false,
        selectionIndicator: false,
        navigationHelpButton: false,
        navigationInstructionsInitiallyVisible: false,
        scene3DOnly: true,
        requestRenderMode: false,
        maximumRenderTimeChange: Infinity
      });
      
      // Konfigurasi scene
      directViewer.scene.globe.depthTestAgainstTerrain = false;
      directViewer.scene.screenSpaceCameraController.enableCollisionDetection = false;
      directViewer.scene.postProcessStages.fxaa.enabled = true;
      directViewer.scene.fog.enabled = false;
      directViewer.scene.globe.showGroundAtmosphere = false;
      
      // Tambahkan entity OC1
      directViewer.entities.add({
        id: 'outcrop-2282213-direct',
        name: 'OC 1 (Direct)',
        position: Cesium.Cartesian3.fromDegrees(130.284065, -2.029881, 75.86),
        billboard: {
          image: new Cesium.PinBuilder().fromColor(Cesium.Color.RED, 48).toDataURL(),
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          scale: 1.0
        },
        label: {
          text: 'OC1 (Direct)',
          font: 'bold 20px sans-serif',
          fillColor: Cesium.Color.WHITE,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 4,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(0, -48),
          heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
          disableDepthTestDistance: Number.POSITIVE_INFINITY
        },
        description: 'OC1 - Pre - Tertiary Unit – Upper Jurassic Stratigraphy Unit – Lelinta Formation (23JUL01)'
      });
      
      // Tambahkan entity OC2
      directViewer.entities.add({
        id: 'outcrop-2298041-direct',
        name: 'OC 2 (Direct)',
        position: Cesium.Cartesian3.fromDegrees(130.310587, -2.018613, 67.32),
        billboard: {
          image: new Cesium.PinBuilder().fromColor(Cesium.Color.RED, 48).toDataURL(),
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          scale: 1.0
        },
        label: {
          text: 'OC2 (Direct)',
          font: 'bold 20px sans-serif',
          fillColor: Cesium.Color.WHITE,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 4,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(0, -48),
          heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
          disableDepthTestDistance: Number.POSITIVE_INFINITY
        },
        description: 'OC2 - Pre - Tertiary Unit – Lower Cretaceous Stratigraphy Unit – Gamta Formation (23JLG01)'
      });
      
      // Tambahkan entity Jakarta
      directViewer.entities.add({
        id: 'jakarta-direct',
        name: 'Jakarta (Direct)',
        position: Cesium.Cartesian3.fromDegrees(106.8456, -6.2088, 10),
        point: {
          pixelSize: 20,
          color: Cesium.Color.YELLOW,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 3,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          disableDepthTestDistance: Number.POSITIVE_INFINITY
        },
        label: {
          text: 'Jakarta (Direct)',
          font: 'bold 20px sans-serif',
          fillColor: Cesium.Color.WHITE,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 4,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(0, -20),
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          disableDepthTestDistance: Number.POSITIVE_INFINITY
        }
      });
      
      // Tambahkan entity Surabaya
      directViewer.entities.add({
        id: 'surabaya-direct',
        name: 'Surabaya (Direct)',
        position: Cesium.Cartesian3.fromDegrees(112.7508, -7.2575, 10),
        point: {
          pixelSize: 20,
          color: Cesium.Color.GREEN,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 3,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          disableDepthTestDistance: Number.POSITIVE_INFINITY
        },
        label: {
          text: 'Surabaya (Direct)',
          font: 'bold 20px sans-serif',
          fillColor: Cesium.Color.WHITE,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 4,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(0, -20),
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          disableDepthTestDistance: Number.POSITIVE_INFINITY
        }
      });
      
      // Terbang ke Indonesia
      setTimeout(() => {
        directViewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(110.0, -7.0, 3000000),
          orientation: {
            heading: Cesium.Math.toRadians(0),
            pitch: Cesium.Math.toRadians(-90),
            roll: 0.0
          },
          duration: 3
        });
        
        // Setelah terbang ke Indonesia, terbang ke lokasi OC1 dan OC2
        setTimeout(() => {
          directViewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(130.297326, -2.024247, 5000),
            orientation: {
              heading: Cesium.Math.toRadians(0),
              pitch: Cesium.Math.toRadians(-45),
              roll: 0.0
            },
            duration: 3
          });
        }, 5000);
      }, 1000);
      
      console.log('Cesium berhasil diinisialisasi secara langsung');
      
      // Tambahkan event handler untuk klik entity
      const handler = new Cesium.ScreenSpaceEventHandler(directViewer.scene.canvas);
      handler.setInputAction((click) => {
        const pickedObject = directViewer.scene.pick(click.position);
        if (Cesium.defined(pickedObject) && Cesium.defined(pickedObject.id)) {
          const entity = pickedObject.id;
          console.log('Entity yang diklik (direct):', entity.id);
          
          if (entity.id === 'outcrop-2282213-direct') {
            directViewer.camera.flyTo({
              destination: Cesium.Cartesian3.fromDegrees(130.284065, -2.029881, 500),
              orientation: {
                heading: Cesium.Math.toRadians(0),
                pitch: Cesium.Math.toRadians(-45),
                roll: 0.0
              },
              duration: 2
            });
          } else if (entity.id === 'outcrop-2298041-direct') {
            directViewer.camera.flyTo({
              destination: Cesium.Cartesian3.fromDegrees(130.310587, -2.018613, 500),
              orientation: {
                heading: Cesium.Math.toRadians(0),
                pitch: Cesium.Math.toRadians(-45),
                roll: 0.0
              },
              duration: 2
            });
          } else if (entity.id === 'jakarta-direct') {
            directViewer.camera.flyTo({
              destination: Cesium.Cartesian3.fromDegrees(106.8456, -6.2088, 10000),
              orientation: {
                heading: Cesium.Math.toRadians(0),
                pitch: Cesium.Math.toRadians(-45),
                roll: 0.0
              },
              duration: 2
            });
          } else if (entity.id === 'surabaya-direct') {
            directViewer.camera.flyTo({
              destination: Cesium.Cartesian3.fromDegrees(112.7508, -7.2575, 10000),
              orientation: {
                heading: Cesium.Math.toRadians(0),
                pitch: Cesium.Math.toRadians(-45),
                roll: 0.0
              },
              duration: 2
            });
          }
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
      
      // Sembunyikan viewer asli
      originalViewer.container.style.display = 'none';
      
      // Cleanup function
      return () => {
        if (directViewer && !directViewer.isDestroyed()) {
          directViewer.destroy();
        }
        if (directViewerContainer && directViewerContainer.parentNode) {
          directViewerContainer.parentNode.removeChild(directViewerContainer);
        }
        if (originalViewer && originalViewer.container) {
          originalViewer.container.style.display = 'block';
        }
      };
    }
  }, [viewerRef, terrainProvider]);
  
  return (
    <Viewer
      ref={viewerRef}
      full
      timeline={false}
      animation={false}
      baseLayerPicker={false}
      geocoder={false}
      homeButton={false}
      infoBox={true}
      sceneModePicker={false}
      selectionIndicator={false}
      navigationHelpButton={false}
      navigationInstructionsInitiallyVisible={false}
      scene3DOnly={true}
      terrainProvider={terrainProvider}
      onClick={handleMapClick}
      onSelectedEntityChange={handleEntityClick}
      requestRenderMode={false}
      maximumRenderTimeChange={Infinity}
    >
      {/* Entity OC1 */}
      <Entity
        id="outcrop-2282213"
        name="OC 1"
        position={Cartesian3.fromDegrees(130.284065, -2.029881, 75.86)}
        billboard={{
          image: new PinBuilder().fromColor(Color.RED, 48).toDataURL(),
          verticalOrigin: VerticalOrigin.BOTTOM,
          heightReference: HeightReference.RELATIVE_TO_GROUND,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          scale: 1.0
        }}
        label={{
          text: "OC1",
          font: "bold 20px sans-serif",
          fillColor: Color.WHITE,
          outlineColor: Color.BLACK,
          outlineWidth: 4,
          style: LabelStyle.FILL_AND_OUTLINE,
          verticalOrigin: VerticalOrigin.BOTTOM,
          pixelOffset: new Cartesian2(0, -48),
          heightReference: HeightReference.RELATIVE_TO_GROUND,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        }}
        description="OC1 - Pre - Tertiary Unit – Upper Jurassic Stratigraphy Unit – Lelinta Formation (23JUL01)"
      />

      {/* Entity OC2 */}
      <Entity
        id="outcrop-2298041"
        name="OC 2"
        position={Cartesian3.fromDegrees(130.310587, -2.018613, 67.32)}
        billboard={{
          image: new PinBuilder().fromColor(Color.RED, 48).toDataURL(),
          verticalOrigin: VerticalOrigin.BOTTOM,
          heightReference: HeightReference.RELATIVE_TO_GROUND,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          scale: 1.0
        }}
        label={{
          text: "OC2",
          font: "bold 20px sans-serif",
          fillColor: Color.WHITE,
          outlineColor: Color.BLACK,
          outlineWidth: 4,
          style: LabelStyle.FILL_AND_OUTLINE,
          verticalOrigin: VerticalOrigin.BOTTOM,
          pixelOffset: new Cartesian2(0, -48),
          heightReference: HeightReference.RELATIVE_TO_GROUND,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        }}
        description="OC2 - Pre - Tertiary Unit – Lower Cretaceous Stratigraphy Unit – Gamta Formation (23JLG01)"
      />
      
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
      
      {/* Tampilkan foto yang sudah ada */}
      <PhotoPoints outcropId={activeTilesetId} viewer={viewerRef.current?.cesiumElement} />
      
      {/* Tampilkan marker OC1 dan OC2 */}
      <Entity
        id="outcrop-2282213-marker"
        name="OC 1"
        position={Cartesian3.fromDegrees(130.284065, -2.029881, 75.86)}
        billboard={{
          image: new PinBuilder().fromColor(Color.RED, 48).toDataURL(),
          verticalOrigin: VerticalOrigin.BOTTOM,
          heightReference: HeightReference.RELATIVE_TO_GROUND,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          scale: 1.0
        }}
        label={{
          text: "OC1",
          font: "bold 20px sans-serif",
          fillColor: Color.WHITE,
          outlineColor: Color.BLACK,
          outlineWidth: 4,
          style: LabelStyle.FILL_AND_OUTLINE,
          verticalOrigin: VerticalOrigin.BOTTOM,
          pixelOffset: new Cartesian2(0, -48),
          heightReference: HeightReference.RELATIVE_TO_GROUND,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        }}
        description="OC1 - Pre - Tertiary Unit – Upper Jurassic Stratigraphy Unit – Lelinta Formation (23JUL01)"
      />

      <Entity
        id="outcrop-2298041-marker"
        name="OC 2"
        position={Cartesian3.fromDegrees(130.310587, -2.018613, 67.32)}
        billboard={{
          image: new PinBuilder().fromColor(Color.RED, 48).toDataURL(),
          verticalOrigin: VerticalOrigin.BOTTOM,
          heightReference: HeightReference.RELATIVE_TO_GROUND,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          scale: 1.0
        }}
        label={{
          text: "OC2",
          font: "bold 20px sans-serif",
          fillColor: Color.WHITE,
          outlineColor: Color.BLACK,
          outlineWidth: 4,
          style: LabelStyle.FILL_AND_OUTLINE,
          verticalOrigin: VerticalOrigin.BOTTOM,
          pixelOffset: new Cartesian2(0, -48),
          heightReference: HeightReference.RELATIVE_TO_GROUND,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        }}
        description="OC2 - Pre - Tertiary Unit – Lower Cretaceous Stratigraphy Unit – Gamta Formation (23JLG01)"
      />
      
      {/* Tambahkan entity Jakarta untuk pengujian */}
      <Entity
        id="jakarta-test"
        name="Jakarta Test"
        position={Cartesian3.fromDegrees(106.8456, -6.2088, 10)}
        billboard={{
          image: new PinBuilder().fromColor(Color.YELLOW, 48).toDataURL(),
          verticalOrigin: VerticalOrigin.BOTTOM,
          heightReference: HeightReference.CLAMP_TO_GROUND,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          scale: 1.0
        }}
        label={{
          text: "Jakarta",
          font: "bold 20px sans-serif",
          fillColor: Color.WHITE,
          outlineColor: Color.BLACK,
          outlineWidth: 4,
          style: LabelStyle.FILL_AND_OUTLINE,
          verticalOrigin: VerticalOrigin.BOTTOM,
          pixelOffset: new Cartesian2(0, -48),
          heightReference: HeightReference.CLAMP_TO_GROUND,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        }}
      />
    </Viewer>
  );
};

export default CesiumViewer; 