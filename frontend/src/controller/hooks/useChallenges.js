import { useState, useEffect } from "react";

const useChallenges = (userId) => {
  const [challenges, setChallenges] = useState([]); // "My Challenges"
  const [availableChallenges, setAvailableChallenges] = useState([]); // "Available Challenges"

  // Fetch "Available Challenges" from the API
  const fetchAvailableChallenges = () => {
    fetch("http://localhost:3001/api/available-challenges")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch Available Challenges");
        }
        return response.json();
      })
      .then((data) => {
        setAvailableChallenges(data); // Set the "Available Challenges" data
      })
      .catch((error) => console.error("Error fetching available challenges:", error));
  };

  // Fetch "My Challenges" from the API
  const fetchMyChallenges = () => {
    if (!userId) return;

    fetch(`http://localhost:3001/api/my-challenges/${userId}`)
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch My Challenges");
        return response.json();
      })
      .then((data) => {
        const joinedChallenges = data;

        // Enhance joined challenges with details from available challenges
        const detailedChallenges = joinedChallenges.map((joined) => {
          const matchingChallenge = availableChallenges.find(
            (challenge) => challenge.challenge_id === joined.challenge_id
          );
          return {
            challenge_id: joined.challenge_id,
            activity_id: joined.activity_id,
            joined_on: joined.joined_at,
            distance: matchingChallenge ? matchingChallenge.distance : "N/A",
            participants_num: matchingChallenge ? matchingChallenge.participants_num : "N/A",
            progress: joined.progress,
            status: joined.status || "Active",
            challenge_type: matchingChallenge ? matchingChallenge.challenge_type : "N/A",
            challenge_deadline: matchingChallenge ? matchingChallenge.challenge_deadline : "N/A",
            badge_id: matchingChallenge ? matchingChallenge.badge_id : "N/A",
            target_value: matchingChallenge ? matchingChallenge.target_value : 0,
          };
        });
        setChallenges(detailedChallenges);
      })
      .catch((error) => console.error("Error fetching my challenges:", error));
  };

  // Fetch challenges on mount and whenever userId changes
  useEffect(() => {
    fetchAvailableChallenges();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchMyChallenges();
    }
  }, [userId, availableChallenges]); // Re-fetch when availableChallenges changes

  return {
    challenges,
    availableChallenges,
    fetchMyChallenges,
    fetchAvailableChallenges,
  };
};

export default useChallenges;
