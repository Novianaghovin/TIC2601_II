import React, { useState, useEffect } from 'react';
import NavBar from './components/NavBar';
import { useNavigate } from 'react-router-dom';
import "./challenge.css";


const Challenges = () => {
  const [userId, setUserId] = useState([]); 
  const [challengeID, setChallengeID] = useState([]);
  const [challenges, setChallenges] = useState([]); // "My Challenges"
  const [activityID, setActivityID] = useState([]);
  const [availableChallenges, setAvailableChallenges] = useState([]); // "Available Challenges"
  const [filteredChallenges, setFilteredChallenges] = useState([]); // Filtered challenges based on search
  const [searchQuery, setSearchQuery] = useState(''); // Search input value

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

  // Synchronize filteredChallenges with challenges when challenges update
  useEffect(() => {
    setFilteredChallenges(challenges);
  }, [challenges]);

  
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


  // Fetch "My Challenges" from the API
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
            joined_on: joined.joined_at,
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
    return `${percentage.toFixed(2)}%`; // Display with 2 decimal places
};

  // Fetch "Available Challenges" from the API
  const fetchAvailableChallenges = () => {
    fetch('http://localhost:3001/api/available-challenges') 
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

  function disableJoinButton(challengeID) {
    const button = document.getElementById(`joinButton${challengeID}`);
    if (button) {
      button.disabled = true;
      button.classList.add('button-disabled');
    }
  }
  
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
          disableJoinButton(challengeID); // Disable the join button
          alert(`Successfully joined the challenge!`);
        } else {
          alert(data.message); // Display message if there's any error
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
          fetchMyChallenges(userId); // Refresh "My Challenges" data
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
    // Navigate to the leaderboard page with the specific challenge ID
    navigate(`/leaderboard/${challengeId}`);
  };

  // Handle search input changes
  const handleSearchChange = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    // Filter challenges based on the search query
    const filtered = challenges.filter((challenge) =>
      challenge.challenge_type.toLowerCase().includes(query) ||
     (challenge.distance && challenge.distance.toString().includes(query)) ||  
      challenge.challenge_id.toString().includes(query) ||
      challenge.activity_id.toString().includes(query) ||
      challenge.status.toLowerCase().includes(query) ||
      (challenge.progress && challenge.progress.toString().includes(query))
    );

    setFilteredChallenges(filtered);
  };

  // Utility function to determine if a challenge is joined
  const isChallengeJoined = (challengeID) => {
    return challenges.some(challenge => challenge.challenge_id === challengeID);
  };
  
  
  return (
    <div className="Challenges">
    <NavBar />

    <div className="container">
    <div className="header-container">
    <h1 className="title">My Challenges</h1>
    <div className="search-container">
      <input
        type="text"
        placeholder="Search challenges..."
        value={searchQuery}
        onChange={handleSearchChange}
        className="search-bar"
      />
    </div>
  </div>

  <button onClick={refreshProgress}>Refresh</button>

  <table>
    <thead>
      <tr>
        <th>Challenge ID</th>
        <th>Challenge Type</th>
        <th>Distance(km)</th>
        <th>Joined On</th>
        <th>Challenge Deadline</th>
        <th>Participants</th>
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
            filteredChallenges.map(challenge => (
              <tr key={challenge.id}>
                <td>{challenge.challenge_id}</td>
                <td>{challenge.challenge_type}</td>
                <td>{challenge.distance}</td>
                <td>{challenge.joined_on}</td>
                <td>{challenge.challenge_deadline}</td>
                <td>{challenge.participants_num || 'N/A'}</td>
                <td>{calculateProgressPercentage(challenge.progress, challenge.target_value)}</td>
                <td>{challenge.status || 'Active'}</td>
                <td>
                  {/* Use handleViewLeaderboard to navigate to the leaderboard */}
                    <button onClick={() => handleViewLeaderboard(challenge.challenge_id)}>View Leaderboard</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className = "challenge-header"></div>   
      <h1 className="title">Available Challenges</h1>
      <table>
        <thead>
          <tr>
            <th>Challenge ID</th>
            <th>Challenge Type</th>
            <th>Distance(km)</th>
            <th>Challenge Deadline</th>
            <th>Participants Num</th>
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
                <td>{challenge.status || 'Active'}</td>
                <td>
                <button
                  onClick={() => joinChallenge(challenge.activity_id, challenge.challenge_id)}
                  disabled={isChallengeJoined(challenge.challenge_id)}
                  className={isChallengeJoined(challenge.challenge_id) ? 'button-disabled' : ''}>Join</button>
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