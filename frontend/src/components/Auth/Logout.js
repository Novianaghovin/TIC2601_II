import React from 'react';

const Logout = ({ onClose, onConfirm }) => {
  const handleConfirmLogout = () => {
    localStorage.removeItem('accessToken');  // Clear JWT from localStorage
    onConfirm(); 
  };

  return (
    <div className="logout-overlay">
      <div className="logout-popup">
        <h2>Do you want to log out?</h2>
        <div className="button-group">
          <button onClick={handleConfirmLogout}>Yes</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default Logout;
