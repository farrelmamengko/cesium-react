import React from 'react';

const HomeButton = ({ onClick }) => {
  return (
    <button
      className="home-nav-button"
      onClick={onClick}
      title="Home View"
    >
      <svg viewBox="0 0 24 24">
        <path d="M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z" />
      </svg>
    </button>
  );
};

export default HomeButton; 