import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Logout from '../Auth/Logout';
import '../Auth/logout.css';
import './welcome.css';

const images = [
  '/welcome/fitness1.jpg',
  '/welcome/fitness2.jpg',
  '/welcome/fitness3.jpg',
  '/welcome/fitness4.jpg',
];

const WelcomePage = () => {
  const [userName, setUserName] = useState('User');
  const [timeOfDay, setTimeOfDay] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [image, setImage] = useState('');
  const [showLogout, setShowLogout] = useState(false);

  const navigate = useNavigate();

  // Fetch user information when component mounts
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get('/user/profile', {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } // Send JWT in headers
        });
        if (response.status === 200) {
          setUserName(response.data.first_name);
        } else {
          console.error('Failed to fetch user info');
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };
    fetchUserProfile();
  }, []);
  
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      const hour = now.getHours();
      const time = hour < 12 ? 'Morning' : hour < 18 ? 'Afternoon' : 'Evening';
      setTimeOfDay(time);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    setImage(images[Math.floor(Math.random() * images.length)]);

    return () => clearInterval(interval);
  }, []);

  const motivationalMessage = "Success starts with self-discipline.";

  const handleNavigation = (page) => {
    navigate(`/${page}`);
  };

  const handleLogout = () => {
    setShowLogout(true);    // Logout confirmation alert
  };

  const confirmLogout = async () => {
    try {
      const response = await axios.post('/user/logout', {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      if (response.status === 204) {
        localStorage.removeItem('accessToken'); // Remove JWT from localStorage
        setShowLogout(false); 
        navigate('/'); // Redirect to login page
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

  return (
    <div className="welcome-container" style={{ backgroundImage: `url(${image})` }}>
      {/* Top Right Navigation Links */}
      <div className="nav-links">
        <span onClick={() => handleNavigation('profile')}>Profile</span>
        <span onClick={() => handleNavigation('friend')}>Friend</span>
        <span onClick={() => handleNavigation('activity')}>Activity</span>
        <span onClick={() => handleNavigation('goals')}>Goals</span>
        <span onClick={() => handleNavigation('challenge')}>Challenge</span>
        <span onClick={() => handleNavigation('badge')}>Badge</span>
        <span onClick={handleLogout}>Logout</span>
      </div>

      {/* Centered Greeting */}
      <div className="greeting">
        <h1>{currentTime}</h1>
        <h2>Good {timeOfDay}, {userName}!</h2>
        <p className="motivational-message">{motivationalMessage}</p>
      </div>

      {/* Show Logout confirmation dialog */}
      {showLogout && (
        <Logout onClose={cancelLogout} onConfirm={confirmLogout} />
      )}
    </div>
  );
};

export default WelcomePage;
