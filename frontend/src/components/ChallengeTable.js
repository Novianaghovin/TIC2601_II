import React from "react";

const ChallengeTable = ({
  challenges = [],
  isMyChallenges = false,
  handleViewLeaderboard,
  joinChallenge,
  isChallengeJoined,
  calculateProgressPercentage,
  refreshAll, 
}) => {

  // Function to check if the challenge is expired based on the deadline
  const isExpired = (challengeDeadline) => {
    const currentDate = new Date();
    const deadlineDate = new Date(challengeDeadline);
    return currentDate > deadlineDate; // Returns true if the current date is past the deadline
  };

  return (
    <div style={{ maxHeight: "300px", overflowY: "auto", border: "1px solid #ddd" }}>
      {/* Refresh Button */}
      <button
        onClick={refreshAll} // Trigger the refresh for both status and progress
        style={{
          margin: "10px 0",
          backgroundColor: "#007BFF",
          color: "#fff",
          padding: "10px 20px",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Refresh
      </button>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
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
            challenges.map((challenge) => {
              // Dynamically determine the status based on the deadline
              const status = isExpired(challenge.challenge_deadline)
                ? "Expired"
                : challenge.status || "Active";

              return (
                <tr key={challenge.challenge_id}>
                  <td>{challenge.challenge_id}</td>
                  <td>{challenge.challenge_type}</td>
                  <td>{challenge.distance || "N/A"}</td>
                  {isMyChallenges && <td>{challenge.joined_at || "N/A"}</td>}
                  <td>{challenge.challenge_deadline || "N/A"}</td>
                  <td>{challenge.participants_num || "0"}</td>
                  {isMyChallenges && (
                    <td>
                      {/* Display progress dynamically */}
                      {calculateProgressPercentage
                        ? calculateProgressPercentage(
                            challenge.progress,
                            challenge.target_value
                          )
                        : `${challenge.progress || 0}%`}
                    </td>
                  )}
                  <td>{status}</td>
                  {isMyChallenges ? (
                    <td>
                      <button
                        onClick={() =>handleViewLeaderboard(challenge.challenge_id)}>View Leaderboard</button>
                    </td> ) : (
                    <td>
                      <button
                        onClick={() => joinChallenge(challenge.activity_id, challenge.challenge_id)
                        }
                        disabled={status === "Expired" ||(isChallengeJoined && isChallengeJoined(challenge.challenge_id))
                        }style={{
                          backgroundColor: status === "Expired" ||
                            (isChallengeJoined &&
                              isChallengeJoined(challenge.challenge_id))
                              ? "#ccc" // Disabled background color
                              : "#FF4B2B", // Active background color
                          color:
                            status === "Expired" ||
                            (isChallengeJoined &&
                              isChallengeJoined(challenge.challenge_id))
                              ? "#666" // Disabled text color
                              : "#fff", // Active text color
                          cursor:
                            status === "Expired" ||
                            (isChallengeJoined &&
                              isChallengeJoined(challenge.challenge_id))
                              ? "not-allowed" // Disabled cursor
                              : "pointer", // Active cursor
                          border: "1px solid",
                          borderColor:
                            status === "Expired" ||
                            (isChallengeJoined &&
                              isChallengeJoined(challenge.challenge_id))
                              ? "#aaa" // Disabled border color
                              : "#FF4B2B", // Active border color
                          padding: "10px 12px",
                          borderRadius: "4px",
                          opacity:
                            status === "Expired" ||
                            (isChallengeJoined &&
                              isChallengeJoined(challenge.challenge_id))
                              ? 0.7 // Slight transparency for disabled state
                              : 1, // Fully visible for active state
                        }}
                      >{status === "Expired"? "Expired": isChallengeJoined &&isChallengeJoined(challenge.challenge_id)? "Joined": "Join"} </button>
                    </td>
                  )}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ChallengeTable;
