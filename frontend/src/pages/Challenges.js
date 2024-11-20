import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useChallenges from "../components/Hooks/useChallenges";
import ChallengeTable from "../components/ChallengeTable";
import NavBar from "../components/Shared/Navbar";
import { jwtDecode } from "jwt-decode";
import Leaderboard from './leaderboard';
import { Route, Routes } from "react-router-dom";
import "./Challenges.module.css";

const Challenges = () => {
  const token = localStorage.getItem("accessToken");  

  // Decode the token to get userId 
  let userId = null;
  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      userId = decodedToken.userId; // Extract userId from the decoded token
    } catch (error) {
      console.error("Invalid token or failed to decode.");
    }
  }

  // Use userId for fetching challenges for the authenticated user
  const { challenges, availableChallenges, fetchMyChallenges } = useChallenges(userId); // Pass userId to useChallenges
  const [searchMCQuery, setSearchMCQuery] = useState(""); // Search input value
  const [searchACQuery, setSearchACQuery] = useState(""); // Search input value
  const [filteredMyChallenges, setFilteredMyChallenges] = useState([]); // Filtered My challenges
  const [filteredAvailableChallenges, setFilteredAvailableChallenges] = useState([]); // Filtered Available challenges
  const navigate = useNavigate();

  // Synchronize filteredChallenges with challenges when challenges update
  useEffect(() => {
    setFilteredMyChallenges(challenges);
    setFilteredAvailableChallenges(availableChallenges);
  }, [challenges, availableChallenges]);

  // Calculate progress percentage for challenges
  const calculateProgressPercentage = (progress, targetValue) => {
    if (!targetValue || targetValue === 0) return "0%";
    const percentage = Math.min((progress / targetValue) * 100, 100);
    return `${percentage.toFixed(2)}%`;
  };

  // Handle search input changes
  const MyChallengeSearchChange = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchMCQuery(query);

    // Filter challenges based on the search query
    const filtered = challenges.filter(
      (challenge) =>
        challenge.challenge_type.toLowerCase().includes(query) ||
        (challenge.distance && challenge.distance.toString().includes(query)) ||
        challenge.challenge_id.toString().includes(query) ||
        challenge.status.toLowerCase().includes(query) ||
        (challenge.progress && challenge.progress.toString().includes(query)) ||
        (challenge.participants_num && challenge.participants_num.toString().includes(query))
    );
    
    setFilteredMyChallenges(filtered);
  };

  const AvailChallengeSearchChange = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchACQuery(query);

    // Filter challenges based on the search query
    const filtered = availableChallenges.filter(
      (challenge) =>
        challenge.challenge_type.toLowerCase().includes(query) ||
        (challenge.distance && challenge.distance.toString().includes(query)) ||
        challenge.challenge_id.toString().includes(query) ||
        challenge.status.toLowerCase().includes(query) ||
        (challenge.progress && challenge.progress.toString().includes(query)) ||
        (challenge.participants_num && challenge.participants_num.toString().includes(query))
    );
    
    setFilteredAvailableChallenges(filtered);
  };

  const refreshAll = () => {
    fetch(`http://localhost:3000/api/challenges/refresh-all`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((err) => {
            throw new Error(err.message || "Failed to refresh challenges.");
          });
        }
        return response.json();
      })
      .then((data) => {
        if (data.success) {
          alert("Your Challenges have been updated!");
          fetchMyChallenges(); // Refresh "My Challenges" data
        } else {
          alert(data.message || "Failed to refresh challenges.");
        }
      })
      .catch((error) => {
        console.error("Error refreshing challenges:", error);
        alert("An error occurred while refreshing challenges.");
      });
  };

  // Navigate to leaderboard
  const handleViewLeaderboard = (challengeId) => {
    navigate(`leaderboard/${challengeId}`);
  };
  

  // Join a challenge
  const joinChallenge = (activityId, challengeId) => {
    if (!token) {
      alert("You need to log in to join challenges.");
      return; 
    }

    fetch(`http://localhost:3000/api/challenges/join-challenge/${challengeId}/${activityId}/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((errData) => {
            throw new Error(errData.message || "Failed to join the challenge");
          });
        }
        return response.json();
      })
      .then((data) => {
        if (data.success) {
          fetchMyChallenges(); // Refresh challenges
          alert(`Successfully joined the challenge!`);
        } else {
          alert(data.message || "Failed to join the challenge.");
        }
      })
      .catch((error) => {
        console.error("Error joining challenge:", error);
        alert("This challenge has expired, please join other challenges");
      });
  };

  const isChallengeJoined = (challengeId) => {
    return challenges.some(challenge => challenge.challenge_id === challengeId && challenge.status === 'Active');
  };

  return (
    <Routes>
      <Route path="/" element={
        <div className="my-challenges">
          <NavBar />
          <div className="header-container">
             {/* <button onClick={refreshAll} className="refresh-button">Refresh All</button> */}
            <h1 className="challenge-title">My Challenges</h1>
          </div>
          <div className="search-container">
            <input
              type="text"
              placeholder="Search My Challenges..."
              value={searchMCQuery}
              onChange={MyChallengeSearchChange}
              className="search-bar"
            />
          </div>
          <ChallengeTable
            challenges={filteredMyChallenges}
            isMyChallenges
            handleViewLeaderboard={handleViewLeaderboard}
            calculateProgressPercentage={calculateProgressPercentage}
            refreshAll={refreshAll}
          />
          <h1 className="challenge-title">Available Challenges</h1>
          <div className="search-container">
            <input
              type="text"
              placeholder="Search Available Challenges..."
              value={searchACQuery}
              onChange={AvailChallengeSearchChange}
              className="search-bar"
            />
          </div>
          <ChallengeTable
            challenges={filteredAvailableChallenges}
            joinChallenge={joinChallenge}
            isChallengeJoined={isChallengeJoined}
          />
        </div>
      } />
      <Route path="leaderboard/:challengeId" element={<Leaderboard />} />
    </Routes>
  );
};

export default Challenges;
