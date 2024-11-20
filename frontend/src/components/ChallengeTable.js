import React, { useEffect, useState } from "react";
import './ChallengeTableStyles.css';

const ChallengeTable = ({
  challenges = [],  // Ensure challenges default to an array to prevent undefined
  isMyChallenges = false,
  handleViewLeaderboard,
  joinChallenge,
  isChallengeJoined,
  calculateProgressPercentage,
  refreshAll,
}) => {
  
  // Initialize challengeList with challenges, defaulting to an empty array if challenges are undefined
  const [challengeList, setChallengeList] = useState(challenges || []);

  const handleRefresh = async () => {
    if (isMyChallenges) {
      try {
        const refreshedChallenges = await refreshAll();
        // Ensure that refreshedChallenges is an array before setting state
        setChallengeList(Array.isArray(refreshedChallenges) ? refreshedChallenges : []);
      } catch (error) {
        console.error("Error refreshing challenges:", error);
      }
    }
  };

  useEffect(() => {
    // Ensure challenges is an array before updating state
    setChallengeList(Array.isArray(challenges) ? challenges : []);
  }, [challenges]);

  return (
    <div className="challenge-table-container">
      {isMyChallenges && (
        <button onClick={handleRefresh} className="refresh-button">
          Refresh
        </button>
      )}

      <table>
        <thead>
          <tr>
            <th>Challenge ID</th>
            <th>Challenge Type</th>
            <th>Distance (km)</th>
            {isMyChallenges && <th>Joined On</th>}
            <th>Challenge Deadline</th>
            <th>Participants</th>
            {isMyChallenges && <th>Progress</th>}
            <th>Status</th>
            {isMyChallenges ? <th>Leaderboard</th> : <th>Join</th>}
          </tr>
        </thead>
        <tbody>
          {challengeList.length === 0 ? (
            <tr>
              <td colSpan={isMyChallenges ? "9" : "7"}>
                {isMyChallenges? "You haven't joined any challenges yet.": "No challenges available."}
              </td>
            </tr>
          ) : (
            challengeList.map((challenge, index) => (
              <tr key={challenge.challenge_id}>
                <td>{challenge.challenge_id}</td>
                <td>{challenge.challenge_type}</td>
                <td>{challenge.distance || "N/A"}</td>
                {isMyChallenges && <td>{challenge.joined_at || "N/A"}</td>}
                <td>{challenge.challenge_deadline || "N/A"}</td>
                <td>{challenge.participants_num || "0"}</td>
                {isMyChallenges && (
                  <td>
                    {calculateProgressPercentage? calculateProgressPercentage(challenge.progress,challenge.target_value): "0%"}
                  </td>
                )}
                <td>{challenge.status || "Active"}</td>{isMyChallenges ? (
                  <td>
                    <button onClick={() => handleViewLeaderboard(challenge.challenge_id)}>View Leaderboard</button>
                  </td>
                ) : (
                  <td>
                    <button
                      onClick={() =>
                        joinChallenge(challenge.activity_id, challenge.challenge_id)
                      }
                      disabled={
                        challenge.status === "Expired" || challenge.status === "Completed" ||(isChallengeJoined &&isChallengeJoined(challenge.challenge_id))}>Join</button>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ChallengeTable;
