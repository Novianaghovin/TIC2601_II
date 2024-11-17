import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useChallenges from "./hooks/useChallenges";
import ChallengeTable from "./components/challengeTable";
import NavBar from "./components/NavBar";
import "./challenge.css";

const Challenges = () => {
  const userId = 1; // Hardcoded user ID
  const { challenges, availableChallenges, fetchMyChallenges } = useChallenges(userId);
  const [searchQuery, setSearchQuery] = useState(""); // Search input value
  const [filteredChallenges, setFilteredChallenges] = useState([]); // Filtered challenges
  const navigate = useNavigate();

  // Synchronize filteredChallenges with challenges when challenges update
  useEffect(() => {
    setFilteredChallenges(challenges);
  }, [challenges]);

  // Calculate progress percentage for challenges
  const calculateProgressPercentage = (progress, targetValue) => {
    if (!targetValue || targetValue === 0) return "0%";
    const percentage = Math.min((progress / targetValue) * 100, 100);
    return `${percentage.toFixed(2)}%`;
  };

  // Handle search input changes
  const handleSearchChange = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    // Filter challenges based on the search query
    const filtered = challenges.filter(
        (challenge) =>
        challenge.challenge_type.toLowerCase().includes(query) ||
        (challenge.distance && challenge.distance.toString().includes(query)) ||
        challenge.challenge_id.toString().includes(query) ||
        challenge.status.toLowerCase().includes(query) ||
        (challenge.progress && challenge.progress.toString().includes(query))
    );

    setFilteredChallenges(filtered);
  };

  const refreshAll = () => {
    fetch(`http://localhost:3001/api/refresh-all/${userId}`, { 
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to refresh Challenges.");
        }
        return response.json();
      })
      .then((data) => {
        if (data.success) {
          alert("All Challenges has been updated!");
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
    navigate(`/leaderboard/${challengeId}`);
  };

  // Join a challenge 
  const joinChallenge = (activityId, challengeId) => {
    fetch(`http://localhost:3001/api/join-challenge/${userId}/${challengeId}/${activityId}`, {
      method: "POST",
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
          fetchMyChallenges(); // Refresh "My Challenges"
          alert(`Successfully joined the challenge!`);
        } else {
          alert(data.message);
        }
      })
      .catch((error) => console.error("Error joining challenge:", error));
  };

  // Determine if a challenge is already joined
  const isChallengeJoined = (challengeId) => {
    return challenges.some((challenge) => challenge.challenge_id === challengeId);
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

        <button onClick={refreshAll} className="refresh-button">Refresh All</button>

        <ChallengeTable
          challenges={filteredChallenges}
          isMyChallenges
          handleViewLeaderboard={handleViewLeaderboard}
          calculateProgressPercentage={calculateProgressPercentage}
        />

        <h1 className="title">Available Challenges</h1>
        <ChallengeTable
          challenges={availableChallenges}
          joinChallenge={joinChallenge}
          isChallengeJoined={isChallengeJoined}
        />
      </div>
    </div>
  );
};  

export default Challenges;
