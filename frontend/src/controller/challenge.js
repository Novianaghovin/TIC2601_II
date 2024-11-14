import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "./challenge.css";

const Challenges = () => {
  const [userId, setUserId] = useState([]); 
  const [challengeID, setChallengeID] = useState([]);
  const [challenges, setChallenges] = useState([]); // "My Challenges"
  const [activityID, setActivityID] = useState([]);
  const [availableChallenges, setAvailableChallenges] = useState([]); // "Available Challenges"

  const navigate = useNavigate();

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

  const userID = 1; //using Hardcoded user ID 
  
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

  const fetchMyChallenges = (userId) => {
    fetch(`http://localhost:3001/api/my-challenges/${userId}`)
      .then(response => {
        if (!response.ok) throw new Error('Failed to fetch My Challenges');
        return response.json();
      })
      .then(data => {
        const joinedChallenges = data;
        
        const detailedChallenges = joinedChallenges.map(joined => {
          const matchingChallenge = availableChallenges.find(
            challenge => challenge.challenge_id === joined.challenge_id
          );
          return {
            challenge_id: joined.challenge_id,
            activity_id: joined.activity_id,
            distance: matchingChallenge ? matchingChallenge.distance : 'N/A',
            participants_num: matchingChallenge ? matchingChallenge.participants_num : 'N/A',
            progress: joined.progress,
            status: joined.status || 'Active', 
            challenge_type: matchingChallenge ? matchingChallenge.challenge_type : 'N/A',
            challenge_deadline: matchingChallenge ? matchingChallenge.challenge_deadline : 'N/A',
            badge_id: matchingChallenge ? matchingChallenge.badge_id : 'N/A',
            target_value: matchingChallenge ? matchingChallenge.target_value : 0
          };
        });
        setChallenges(detailedChallenges);
      })
      .catch(error => console.error('Error fetching my challenges:', error));
  };

  const calculateProgressPercentage = (progress, targetValue) => {
    if (!targetValue || targetValue === 0) return "0%";
    const percentage = Math.min((progress / targetValue) * 100, 100); // Cap at 100%
    return `${percentage.toFixed(2)}%`;
  };

  const fetchAvailableChallenges = () => {
    fetch('http://localhost:3001/api/available-challenges') 
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch Available Challenges');
        }
        return response.json();
      })
      .then(data => {
        setAvailableChallenges(data);
      })
      .catch(error => console.error('Error fetching available challenges:', error));
  };

  const joinChallenge = (activityID, challengeID) => {
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
          fetchMyChallenges(userId);
          alert(`Successfully joined the challenge!`);
        } else {
          alert(data.message);
        }
      })
      .catch(error => console.error('Error joining challenge:', error));
  };

  const refreshProgress = () => {
    fetch(`http://localhost:3001/api/refresh-progress/${userId}`, { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          alert('Progress has been updated!');
          fetchMyChallenges(userId);
        } else {
          alert('Failed to refresh progress.');
        }
      })
      .catch(error => {
        console.error('Error refreshing progress:', error);
        alert('An error occurred while refreshing progress.');
      });
  };

  const handleViewLeaderboard = (challengeId) => {
    navigate(`/leaderboard/${challengeId}`);
  };
  
  return (
    <div className="Challenges">
      <div className="container">
        <h1>My Challenges</h1>
        <button onClick={refreshProgress}>Refresh Progress</button> 
        <table>
          <thead>
            <tr>
              <th>Challenge ID</th>
              <th>Challenge Type</th>
              <th>Distance(km)</th>
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
                  <td>{challenge.distance}</td>
                  <td>{challenge.challenge_deadline}</td>
                  <td>{challenge.activity_id}</td>
                  <td>{challenge.participants_num || 'N/A'}</td>
                  <td>{challenge.badge_id}</td>
                  <td>{calculateProgressPercentage(challenge.progress, challenge.target_value)}</td>
                  <td>{challenge.status || 'Active'}</td>
                  <td>
                    <button onClick={() => handleViewLeaderboard(challenge.challenge_id)}>View Leaderboard</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="challenge-header"></div>   
        <h1>Available Challenges</h1>
        <table>
          <thead>
            <tr>
              <th>Challenge ID</th>
              <th>Challenge Type</th>
              <th>Distance(km)</th>
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
                <td colSpan="8">No challenges available.</td>
              </tr>
            ) : (
              availableChallenges.map(challenge => (
                <tr key={challenge.id}>
                  <td>{challenge.challenge_id}</td>
                  <td>{challenge.challenge_type}</td>
                  <td>{challenge.distance}</td>
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
