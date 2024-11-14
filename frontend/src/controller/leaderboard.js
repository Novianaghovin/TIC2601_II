import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import NavBar from './components/NavBar';
import './leaderboard.css';

const Leaderboard = () => {
  const { challengeID } = useParams(); // Get challenge_id from URL parameters
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    if (challengeID) {
      fetchLeaderboardData(challengeID);
    }
  }, [challengeID]);

  const fetchLeaderboardData = (challengeID) => {
    setLoading(true); // Set loading state to true at the start of data fetch
    fetch(`http://localhost:3001/api/leaderboard/${challengeID}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch leaderboard data');
        }
        return response.json();
      })
      .then(data => {
        if (data.success) {
          setLeaderboardData(data); 
          console.log('Leaderboard data fetched successfully:', data);
        } else {
          console.error('Leaderboard data not found:', data.message);
          setErrorMessage(data.message || "No data available for this challenge.");
        }
      })
      .catch(error => {
        console.error('Error fetching leaderboard data:', error.message);
        setErrorMessage("Could not load leaderboard data. Please try again later.");
      })
      .finally(() => {
        setLoading(false); // Set loading state to false once data is fetched
      });
  };

  return (
    <div className="Leaderboard">
      <NavBar />

      <div className="leaderboard-container">
        <h1>Leaderboard for Challenge</h1>
        <p>Challenge ID: {challengeID}</p>
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
                  <td>{entry.leaderboard_id}</td>
                  <td>{index + 1}</td>
                  <td>{entry.challenge_id}</td>
                  <td>{entry.user_id}</td>
                  <td>{entry.distance}</td>
                  <td>{entry.timestamp}</td>
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
