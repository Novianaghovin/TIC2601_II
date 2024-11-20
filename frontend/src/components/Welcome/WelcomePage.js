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
    <div className="welcome-body"> {/* Apply scoped class here */}
      <div className="welcome-container" style={{ backgroundImage: `url(${image})` }}>
        <div className="nav-links">
          <span onClick={() => handleNavigation('profile')}>Profile</span>
          <span onClick={() => handleNavigation('activities')}>Activities</span>
          <span onClick={() => handleNavigation('goals')}>Goals</span>
          <span onClick={() => handleNavigation('friends')}>Friends</span>
          <span onClick={() => handleNavigation('challenges')}>Challenges</span>
          <span onClick={() => handleNavigation('badges')}>Badges</span>
          <span onClick={handleLogout}>Logout</span>
        </div>

        <div className="greeting">
          <h1>{currentTime}</h1>
          <h2>Good {timeOfDay}, {userName}!</h2>
          <p className="motivational-message">{motivationalMessage}</p>
        </div>

        {showLogout && (
          <Logout onClose={cancelLogout} onConfirm={confirmLogout} />
        )}
      </div>
    </div>
  );
};

export default WelcomePage;
