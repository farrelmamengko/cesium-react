import React from 'react';
import DescriptionBox from './DescriptionBox';
import { TILESET_1, TILESET_2 } from '../../constants/tilesets';

const ControlPanel = ({ 
  isPanelVisible, 
  setIsPanelVisible, 
  isDropdownOpen, 
  setIsDropdownOpen, 
  activeTileset, 
  activeTilesetId, 
  onTilesetSelect,
  children
}) => {
  return (
    <div className={`control-panel ${isPanelVisible ? 'panel-visible' : 'panel-hidden'}`}>
      <button 
        className="panel-toggle" 
        onClick={() => setIsPanelVisible(!isPanelVisible)}
        title={isPanelVisible ? "Sembunyikan Panel" : "Tampilkan Panel"}
      >
        <svg viewBox="0 0 24 24">
          <path d={isPanelVisible ? 
            "M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" : 
            "M19,13H5V11H19V13Z"} />
        </svg>
        <span className="toggle-label">{isPanelVisible ? "Sembunyikan" : "Tampilkan"}</span>
      </button>
      
      <div className="panel-content">
        <div className="panel-three-column-layout">
          {/* Kolom Kiri - Selector (ditukar) */}
          <div className="panel-left-column">
            <div className="dropdown-container">
              <button 
                className="dropdown-toggle" 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                {activeTilesetId ? 
                  (activeTilesetId === TILESET_1.assetId ? 'OC 1' : 'OC 2') : 
                  'Pilih Outcrop'}
                <svg viewBox="0 0 24 24">
                  <path d="M7,10L12,15L17,10H7Z" />
                </svg>
              </button>
              
              {isDropdownOpen && (
                <div className="dropdown-menu">
                  <button 
                    className={`dropdown-item ${activeTilesetId === TILESET_1.assetId ? 'active' : ''}`}
                    onClick={() => onTilesetSelect(TILESET_1)}
                  >
                    OC 1 - Lelinta Formation
                  </button>
                  <button 
                    className={`dropdown-item ${activeTilesetId === TILESET_2.assetId ? 'active' : ''}`}
                    onClick={() => onTilesetSelect(TILESET_2)}
                  >
                    OC 2 - Gamta Formation
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Kolom Tengah - Description Box (ditukar) */}
          <div className="panel-center-column" style={{ display: activeTileset ? 'flex' : 'none' }}>
            {activeTileset && <DescriptionBox activeTileset={activeTileset} />}
          </div>
          
          {/* Kolom Kanan - Mini Map */}
          <div className="panel-right-column">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel; 