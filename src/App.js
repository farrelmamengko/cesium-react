import React from 'react';
import { Viewer } from 'resium';
import { Ion } from 'cesium';
import "cesium/Build/Cesium/Widgets/widgets.css";
import './App.css';

// Set token Cesium Ion
Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlMGRkOWUwNy1iYTEwLTQ4ZTYtYTU5Yi1jMjBlNTFjYzhlNGQiLCJpZCI6Mjc2OTA0LCJpYXQiOjE3NDAwMjU5NDh9.7AJHa7BKwg37j0DY_Hm-guJBMw7v0fkfkyu7pl2KO94';

function App() {
  return (
    <div className="App">
      <Viewer
        full
        animation={false}
        timeline={false}
        scene3DOnly={true}
        baseLayerPicker={true}
        navigationHelpButton={false}
        fullscreenButton={false}
        homeButton={true}
        geocoder={false}
        sceneModePicker={false}
      />
    </div>
  );
}

export default App;
