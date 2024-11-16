import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Navbar.css';

const NavBar = () => {
  const navigate = useNavigate();
  const [showLogout, setShowLogout] = useState(false);

  const handleLogout = () => {
    setShowLogout(true);
  };

  const confirmLogout = async () => {
    try {
      const response = await axios.post('/user/logout', {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      if (response.status === 204) {
        localStorage.removeItem('accessToken');
        setShowLogout(false);
        navigate('/');
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const cancelLogout = () => {
    setShowLogout(false);
  };

  const handleNavigation = (page) => {
    navigate(`/${page}`);
  };

  return (
    <div className="navbar">
      <span onClick={() => handleNavigation('profile')}>Profile</span>
      <span onClick={() => handleNavigation('activities')}>Activities</span>
      <span onClick={() => handleNavigation('goals')}>Goals</span>
      <span onClick={() => handleNavigation('friends')}>Friends</span>
      <span onClick={() => handleNavigation('challenges')}>Challenges</span>
      <span onClick={() => handleNavigation('badges')}>Badges</span>
      <span onClick={handleLogout}>Logout</span>

      {showLogout && (
        <div className="logout-confirmation">
          <p>Are you sure you want to log out?</p>
          <button onClick={confirmLogout} className="confirm-button">Yes</button>
          <button onClick={cancelLogout} className="cancel-button">No</button>
        </div>
      )}
    </div>
  );
};

export default NavBar;
