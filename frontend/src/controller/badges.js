import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Badge from './badge'; // Import Badge component

const Badges = () => {
  const [userId] = useState(1);  // Example user_id = 1
  const [month, setMonth] = useState('current');  // Default to current month
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        setLoading(true);
        setError(null);

        const url = month === 'current'
          ? `http://localhost:3000/badge/current?user_id=${userId}`
          : `http://localhost:3000/badge/previous?user_id=${userId}`;
        
        const response = await axios.get(url);
        setBadges(response.data);
      } catch (err) {
        setError('Error fetching badges');
      } finally {
        setLoading(false);
      }
    };

    fetchBadges();
  }, [userId, month]);

  return (
    <div>
      <h1>My Badges</h1>

      <div className="button-container">
        <button onClick={() => setMonth('current')}>Current Month</button>
        <button onClick={() => setMonth('previous')}>Previous Month</button>
      </div>

      {loading && <div>Loading...</div>}
      {error && <div>{error}</div>}

      <div>
        {badges.length > 0 ? (
          <div className="badge-grid">
            {badges.map((badge, index) => (
              <Badge 
                key={index} 
                badgeName={badge.badge_name} 
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
