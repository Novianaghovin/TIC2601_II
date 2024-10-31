import React, { useState, useEffect } from 'react';
import NavBar from './components/NavBar';
import "./challenge.css";


const Challenges = () => {
  const [userId, setUserId] = useState([]); 
  const [challengeID, setChallengeID] = useState([]);
  const [challenges, setChallenges] = useState([]); // "My Challenges"
  const [activityID, setActivityID] = useState([]);
  const [availableChallenges, setAvailableChallenges] = useState([]); // "Available Challenges"

  useEffect(() => {
    fetchUserId();
    fetchAvailableChallenges();
  }, []);
  
  useEffect(() => {
    if (userId) {
      fetchMyChallenges(userId);
    }
  }, [userId]); 

  useEffect(() => {
    if (challengeID) {
      fetchChallengeID(challengeID);
    }
  }, [challengeID]);

  useEffect(() => {
    if (activityID) {
      fetchActivityID(activityID);
    }
  }, [activityID]);
  
  const userID = 1;
  
  const fetchUserId = () => {
    fetch(`http://localhost:3001/api/get-user/${userID}`)
      .then(response => { 
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        return response.json(); 
      })  
      .then(data => {
        setUserId(data.userId);
        console.log('User ID fetched:', data.userId);
      })
      .catch(error => console.error('Error fetching user ID:', error));
  };
  

  
  const fetchChallengeID = (challengeID) => {
    fetch(`http://localhost:3001/api/get-challenge/${challengeID}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch Challenge ID');
        }
        return response.json();
      })
      .then(data => {
        if (data.success) {
          setChallengeID(data.data.challenge_id); 
          console.log('Challenge ID fetched successfully:', data.challenge);
        } else {
          console.error('Challenge ID not found:', data.message);
        }
      })
      .catch(error => console.error('Error fetching Challenge ID:', error));
  };
  
  const fetchActivityID = (activityID) => {
    fetch(`http://localhost:3001/api/get-activity/${activityID}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch Activity ID');
        }
        return response.json();
      })
      .then(data => {
        if (data.success) {
          setActivityID(data.data.activity_id); 
          console.log('Activity ID fetched successfully:', data.activity);
        } else {
          console.error('Activity ID not found:', data.message);
        }
      })
      .catch(error => console.error('Error fetching activity ID:', error));
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

  const joinChallenge = (activityID, challengeID) => {
    console.log('Join button clicked for challenge ID:', challengeID);
    console.log('Join button clicked for Activity ID:', activityID);

    if (!userId) {
      console.error('Error: User ID not available');
      return;
    }
    fetch(`http://localhost:3001/api/join-challenge/${userId}/${challengeID}/${activityID}`, {
      method: 'POST'
    })
      .then(response => {
        if (!response.ok) {
          return response.json().then(errData => {
            throw new Error(errData.message || 'Failed to join the challenge');
          });
        }
        return response.json();
      })
      .then(data => {
        if (data.success) {
          // Update available and my challenges after joining
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
            <th>Challenge Deadline</th>
            <th>Activity ID</th>
            <th>Participants</th>
            <th>Badge ID</th>
            <th>Progress</th>
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
                <td>{challenge.challenge_deadline}</td>
                <td>{challenge.activity_id}</td>
                <td>{challenge.participants_num || 'N/A'}</td>
                <td>{challenge.badge_id}</td>
                <td>{challenge.progress}</td>
                <td>{challenge.status || 'Active'}</td>
                <td>
                  <button onClick={() => alert('Viewing Leaderboard for Challenge ' + challenge.challenge_id)}>Leaderboard</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className = "challenge-header"></div>   
      <h1>Available Challenges</h1>
      <table>
        <thead>
          <tr>
            <th>Challenge ID</th>
            <th>Challenge Type</th>
            <th>Challenge Deadline</th>
            <th>Participants Num</th>
            <th>Activity ID</th>
            <th>Badge ID</th>
            <th>Status</th>
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
                <td>{challenge.challenge_deadline}</td>
                <td>{challenge.participants_num || '0'}</td>
                <td>{challenge.activity_id}</td>
                <td>{challenge.badge_id}</td>
                <td>{challenge.status || 'Active'}</td>
                <td>
                <button onClick={() => joinChallenge(challenge.activity_id, challenge.challenge_id)}>Join</button>
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
