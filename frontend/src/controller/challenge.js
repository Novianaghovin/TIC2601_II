import React, { useState, useEffect } from 'react';
import NavBar from './components/NavBar';
import "./challenge.css";


const Challenges = () => {
  const [userId, setUserId] = useState(null); // State to store userId fetched from the backend
  const [challenges, setChallenges] = useState([]); // "My Challenges"
  const [availableChallenges, setAvailableChallenges] = useState([]); // "Available Challenges"

  // Fetch both "My Challenges" and "Available Challenges" when the component mounts
  useEffect(() => {
    fetchMyChallenges();
    fetchAvailableChallenges();
    fetchUserId();
  }, []);

  const fetchUserId = (userID) => {
    fetch(`http://localhost:3001/api/get-user/${userID}`)
      .then(response => response.json())
      .then(data => {
        if (data.userId) {
          setUserId(data.userId); // Set the fetched userId in the state
          fetchMyChallenges(data.userId); // Fetch challenges with the fetched userId
          fetchAvailableChallenges(); // Fetch available challenges 
        } else {
          console.error('Error: User ID not found');
        }
      })
      .catch(error => console.error('Error fetching user ID:', error));
  };

  // Fetch "My Challenges" from the API
  const fetchMyChallenges = (userId) => {
    fetch(`http://localhost:3001/api/my-challenges/${userId}`)
      .then(response => response.json())
      .then(data => setChallenges(data)) // Set the state with the challenges the user has joined
      .catch(error => console.error('Error fetching my challenges:', error));
  };

  // Fetch "Available Challenges" from the API
  const fetchAvailableChallenges = () => {
    fetch('http://localhost:3001/api/available-challenges') // Update with your real API endpoint
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch Available Challenges');
        }
        return response.json();
      })
      .then(data => {
        setAvailableChallenges(data); // Set the "Available Challenges" data in the state
      })
      .catch(error => console.error('Error fetching available challenges:', error));
  };

  const joinChallenge = (challengeId) => {
    console.log('Join button clicked for challenge ID:', challengeId);
    if (!userId) {
      console.error('Error: User ID not available');
      return;
    }
    fetch(`http://localhost:3001/api/join-challenge/${userId}/${challengeId}`, {
      method: 'POST'
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to join the challenge');
        }
        return response.json();
      })
      .then(data => {
        if (data.success) {
          // Update available and my challenges after joining
          fetchAvailableChallenges();
          fetchMyChallenges(userId);
          alert(`Successfully joined the challenge!`);
        } else {
          alert(data.message); // Display message if there's any error
        }
      })
      .catch(error => console.error('Error joining challenge:', error));
  };
  

  return (
    <div className="Challenges">
    <NavBar />

    <div className="container">
      <h1>My Challenges</h1>
      <table>
        <thead>
          <tr>
            <th>Challenge ID</th>
            <th>Challenge Type</th>
            <th>Challenge Name</th>
            <th>Challenge Deadline</th>
            <th>Activity ID</th>
            <th>Participants</th>
            <th>Badge ID</th>
            <th>Status</th>
            <th>Leaderboard</th>
          </tr>
        </thead>
        <tbody>
          {challenges.length === 0 ? (
            <tr>
              <td colSpan="8">You haven't joined any challenges yet.</td>
            </tr>
          ) : (
            challenges.map(challenge => (
              <tr key={challenge.id}>
                <td>{challenge.challenge_id}</td>
                <td>{challenge.challenge_type}</td>
                <td>{challenge.challenge_name}</td>
                <td>{challenge.challenge_deadline}</td>
                <td>{challenge.activity_id}</td>
                <td>{challenge.participants_num || 'N/A'}</td>
                <td>{challenge.badge_id}</td>
                <td>{challenge.completion_status || 'Active'}</td>
                <td>
                  <button onClick={() => alert('Viewing Leaderboard for Challenge ' + challenge.id)}>Leaderboard</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <h1>Available Challenges</h1>
      <table>
        <thead>
          <tr>
            <th>Challenge ID</th>
            <th>Challenge Type</th>
            <th>Challenge Name</th>
            <th>Challenge Deadline</th>
            <th>Activity ID</th>
            <th>Badge ID</th>
            <th>Join</th>
          </tr>
        </thead>
        <tbody>
          {availableChallenges.length === 0 ? (
            <tr>
              <td colSpan="7">No challenges available.</td>
            </tr>
          ) : (
            availableChallenges.map(challenge => (
              <tr key={challenge.id}>
                <td>{challenge.challenge_id}</td>
                <td>{challenge.challenge_type}</td>
                <td>{challenge.challenge_name}</td>
                <td>{challenge.challenge_deadline}</td>
                <td>{challenge.activity_id}</td>
                <td>{challenge.badge_id}</td>
                <td>
                  <button onClick={() => joinChallenge(challenge.challenge_id)}>Join</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
    </div>
  );
};

export default Challenges;
