import React from 'react';

const MeasurementButton = ({ isMeasuring, onClick }) => {
  return (
    <button
      className={`measurement-nav-button ${isMeasuring ? 'active' : ''}`}
      onClick={onClick}
      title="Pengukur Koordinat"
    >
      <svg viewBox="0 0 24 24">
        <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M7,10L12,15L17,10H7Z" />
      </svg>
    </button>
  );
};

export default MeasurementButton; 