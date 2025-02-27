import React from 'react';

const DescriptionBox = ({ activeTileset }) => {
  if (!activeTileset) return null;
  
  const { description } = activeTileset;
  
  return (
    <div className="description-box">
      <div className="description-header">
        <h3>{description.title}</h3>
      </div>
      <div className="description-content">
        <div className="info-column">
          <div className="info-item">
            <span className="info-label">Lokasi</span>
            <span className="info-value">{description.location}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Strike/Dip</span>
            <span className="info-value">{description.strikeDip}</span>
          </div>
        </div>
        <div className="info-column">
          <div className="info-item">
            <span className="info-label">Koordinat</span>
            <span className="info-value">{description.coordinate}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Lingkungan</span>
            <span className="info-value">{description.depositionalEnv}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DescriptionBox; 