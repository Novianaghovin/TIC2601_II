import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import NavBar from '../components/Shared/Navbar'; // Ensure this is imported correctly
import './leaderboard.css';

const Leaderboard = () => {
  const { challengeId } = useParams(); // Extract challenge ID from URL parameters
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Retrieve the token from local storage
  const token = localStorage.getItem('accessToken');

  useEffect(() => {
    if (challengeId) {
      fetchLeaderboardData(challengeId);
    }
  }, [challengeId]);

  const fetchLeaderboardData = async (challengeId) => {
    if (!token) {
      setErrorMessage('You need to log in to view the leaderboard.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/api/leaderboard/leaderboard/${challengeId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Attach the token in the Authorization header
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to fetch leaderboard data for Challenge ID: ${challengeId}`);
      }

      const data = await response.json();
      if (data.success) {
        setLeaderboardData(data.leaderboard || []);
        setErrorMessage('');
      } else {
        setLeaderboardData([]);
        setErrorMessage(data.message || 'No leaderboard data found.');
      }
    } catch (error) {
      console.error('Error fetching leaderboard data:', error.message);
      setErrorMessage('Could not load leaderboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="Leaderboard">
      <NavBar />
      <div className="leaderboard-container">
        <h1>Leaderboard for Challenge</h1>
        <p>Challenge ID: {challengeId}</p>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        {loading ? (
          <p>Loading leaderboard data...</p>
        ) : leaderboardData.length > 0 ? (
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>Leaderboard ID</th>
                <th>Rank</th>
                <th>Challenge ID</th>
                <th>User ID</th>
                <th>Distance (km)</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {leaderboardData.map((entry, index) => (
                <tr key={entry.leaderboard_id}>
                  <td>{entry.leaderboard_id || 'N/A'}</td>
                  <td>{index + 1}</td>
                  <td>{entry.challenge_id || 'N/A'}</td>
                  <td>{entry.user_id || 'N/A'}</td>
                  <td>{entry.distance || 'N/A'}</td>
                  <td>{entry.time_stamp ? new Date(entry.time_stamp).toLocaleString() : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          !errorMessage && <p>No data found for this challenge.</p>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
