import { 
  Cartographic, 
  Math as CesiumMath,
  ScreenSpaceEventType,
  Cartesian3,
  Color,
  LabelStyle,
  VerticalOrigin,
  Cartesian2,
  HeightReference,
  SceneMode,
  EllipsoidTerrainProvider,
  ScreenSpaceEventHandler,
  sampleTerrainMostDetailed,
  Scene
} from 'cesium';

class TerrainMeasurement {
  constructor(viewer) {
    if (!viewer || !viewer.scene) {
      throw new Error('Viewer tidak valid atau belum siap');
    }
    
    this.viewer = viewer;
    this.scene = viewer.scene;
    this.camera = viewer.camera;
    this.globe = viewer.scene.globe;
    this.terrainProvider = viewer.terrainProvider;
    this.isActive = false;
    this.measurementPoints = [];
    this.eventHandler = null;

    // Pastikan scene dalam mode 3D
    if (this.scene.mode !== SceneMode.SCENE3D) {
      this.scene.mode = SceneMode.SCENE3D;
    }
  }

  start() {
    if (!this.scene || !this.scene.canvas) {
      console.error('Scene tidak valid');
      return;
    }
    
    if (this.isActive) return;
    
    this.isActive = true;
    this.measurementPoints = [];
    
    try {
      this.eventHandler = new ScreenSpaceEventHandler(this.scene.canvas);
      this.eventHandler.setInputAction(
        (click) => {
          this.measureTerrainHeight(click.position);
        },
        ScreenSpaceEventType.LEFT_CLICK
      );
    } catch (error) {
      console.error('Error saat memulai pengukuran:', error);
    }
  }

  stop() {
    if (!this.isActive) return;
    
    this.isActive = false;
    if (this.eventHandler) {
      this.eventHandler.destroy();
      this.eventHandler = null;
    }
    this.measurementPoints = [];
  }

  async measureTerrainHeight(windowPosition) {
    try {
      const ray = this.camera.getPickRay(windowPosition);
      if (!ray) return;

      const cartesian = this.scene.pickPosition(windowPosition);
      
      if (!cartesian) {
        console.log('Tidak dapat mengukur posisi ini');
        return;
      }

      // Dapatkan koordinat X, Y, Z dari Cartesian3
      const x = cartesian.x.toFixed(2);
      const y = cartesian.y.toFixed(2);
      const z = cartesian.z.toFixed(2);

      // Konversi ke koordinat geografis untuk backward compatibility
      const cartographic = Cartographic.fromCartesian(cartesian);
      if (!cartographic) return;

      const longitude = CesiumMath.toDegrees(cartographic.longitude);
      const latitude = CesiumMath.toDegrees(cartographic.latitude);
      const height = cartographic.height;

      // Validasi hasil
      if (isNaN(longitude) || isNaN(latitude) || height === undefined) {
        console.log('Koordinat tidak valid');
        return;
      }

      // Simpan pengukuran dengan koordinat X, Y, Z
      const measurement = {
        position: { 
          longitude, 
          latitude, 
          height,
          x: parseFloat(x),
          y: parseFloat(y),
          z: parseFloat(z)
        },
        timestamp: new Date().toISOString()
      };
      
      this.measurementPoints.push(measurement);
      
      // Tambahkan label dengan koordinat X, Y, Z
      const entity = this.addMeasurementLabel(longitude, latitude, height, x, y, z);
      
      // Trigger callback dengan data yang lengkap
      if (this.onMeasurement) {
        this.onMeasurement({
          longitude,
          latitude,
          height,
          x: parseFloat(x),
          y: parseFloat(y),
          z: parseFloat(z),
          formattedHeight: `${height.toFixed(2)} meters`
        });
      }

    } catch (error) {
      console.error('Error dalam pengukuran:', error);
    }
  }

  addMeasurementLabel(longitude, latitude, height, x, y, z) {
    try {
      const entity = this.viewer.entities.add({
        position: Cartesian3.fromDegrees(longitude, latitude, height),
        label: {
          text: `H: ${height.toFixed(2)}m\nLat: ${latitude.toFixed(6)}°\nLon: ${longitude.toFixed(6)}°\nX: ${x}m\nY: ${y}m\nZ: ${z}m`,
          font: '14px sans-serif',
          fillColor: Color.WHITE,
          outlineColor: Color.BLACK,
          outlineWidth: 2,
          style: LabelStyle.FILL_AND_OUTLINE,
          verticalOrigin: VerticalOrigin.BOTTOM,
          pixelOffset: new Cartesian2(0, -9),
          showBackground: true,
          backgroundColor: Color.fromAlpha(Color.BLACK, 0.7),
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          heightReference: HeightReference.NONE
        },
        point: {
          pixelSize: 8,
          color: Color.RED,
          outlineColor: Color.WHITE,
          outlineWidth: 2,
          heightReference: HeightReference.NONE,
          disableDepthTestDistance: Number.POSITIVE_INFINITY
        }
      });
      return entity;
    } catch (error) {
      console.error('Error menambahkan label:', error);
    }
  }

  getMeasurements() {
    return this.measurementPoints;
  }

  clearMeasurements() {
    this.viewer.entities.removeAll();
    this.measurementPoints = [];
  }

  setMeasurementCallback(callback) {
    this.onMeasurement = callback;
  }
}

export default TerrainMeasurement; 