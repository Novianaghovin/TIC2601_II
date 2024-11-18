import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Badge from './badge'; // Import Badge component
import NavBar from "../components/Shared/Navbar"; // Import NavBar
import './badges.css'; // Import CSS

const Badges = () => {
  const [userId, setUserId] = useState(null);
  const [month, setMonth] = useState('current');
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('accessToken');

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      setError('User not logged in.');
    }
  }, []);

  useEffect(() => {
    if (userId && token) {
      const fetchBadges = async () => {
        try {
          setLoading(true);
          setError(null);

          const url = month === 'current'
            ? `http://localhost:3000/badge/current?user_id=${userId}`
            : `http://localhost:3000/badge/previous?user_id=${userId}`;

          const response = await axios.get(url, {
            headers: { Authorization: `Bearer ${token}` },
          });

          setBadges(response.data);
        } catch (err) {
          setError('Error fetching badges');
        } finally {
          setLoading(false);
        }
      };

      fetchBadges();
    } else {
      setError('Please log in to view badges.');
    }
  }, [userId, month, token]);

  const handleMonthChange = (selectedMonth) => {
    setMonth(selectedMonth);
  };

  return (
    <div className="page-container">
      <NavBar />

      <h1 className="header">My Badges</h1>

      <div className="button-container">
        <button
          onClick={() => handleMonthChange('current')}
          className={`month-button ${month === 'current' ? 'active' : ''}`}
        >
          Current Month
        </button>
        <button
          onClick={() => handleMonthChange('previous')}
          className={`month-button ${month === 'previous' ? 'active' : ''}`}
        >
          Previous Month
        </button>
      </div>

      {loading && <div>Loading...</div>}
      {error && <div>{error}</div>}

      <div className="badge-container">
        {badges.length > 0 ? (
          <div className="badge-grid">
            {badges.map((badge, index) => (
              <Badge
                key={index}
                status={badge.status}
                challengeDeadline={badge.challenge_deadline}
              />
            ))}
          </div>
        ) : (
          <p>No badges found for this month.</p>
        )}
      </div>
    </div>
  );
};

export default Badges;
