import React from "react";

const ChallengeTable = ({
  challenges,
  isMyChallenges = false,
  handleViewLeaderboard,
  joinChallenge,
  isChallengeJoined,
  calculateProgressPercentage,
}) => {
  return (
    <div>
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
          {challenges.length === 0 ? (
            <tr>
              <td colSpan={isMyChallenges ? "9" : "7"}>
                {isMyChallenges
                  ? "You haven't joined any challenges yet."
                  : "No challenges available."}
              </td>
            </tr>
          ) : (
            challenges.map((challenge) => (
              <tr key={challenge.challenge_id}>
                <td>{challenge.challenge_id}</td>
                <td>{challenge.challenge_type}</td>
                <td>{challenge.distance || "N/A"}</td>
                {isMyChallenges && <td>{challenge.joined_on || "N/A"}</td>}
                <td>{challenge.challenge_deadline || "N/A"}</td>
                <td>{challenge.participants_num || "0"}</td>
                {isMyChallenges && (
                  <td>
                    {calculateProgressPercentage ? calculateProgressPercentage(challenge.progress, challenge.target_value): "0%"}
                  </td>
                )}
                <td>{challenge.status || "Active"}</td>
                {isMyChallenges ? (
                  <td>
                    <button onClick={() => handleViewLeaderboard(challenge.challenge_id)}>View Leaderboard</button>
                  </td>
                ) : (
                  <td>
                    <button
                      onClick={() => joinChallenge(challenge.activity_id, challenge.challenge_id)}
                      disabled={challenge.status === 'Expired' || (isChallengeJoined && isChallengeJoined(challenge.challenge_id))}
                      className={challenge.status === 'Expired' || (isChallengeJoined && isChallengeJoined(challenge.challenge_id)) ? "button-disabled": ""}>
                      Join
                    </button>
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
