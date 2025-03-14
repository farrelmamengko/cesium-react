import React from 'react';

const PhotoButton = ({ isActive, onClick }) => {
  return (
    <button 
      className={`navigation-button ${isActive ? 'active' : ''}`} 
      onClick={onClick}
      title={isActive ? 'Batal Mode Foto' : 'Mode Tambah Foto'}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
        <circle cx="12" cy="13" r="4"></circle>
      </svg>
    </button>
  );
};

export default PhotoButton; 