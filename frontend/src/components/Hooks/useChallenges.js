import { useState, useEffect } from "react";

const useChallenges = (userId) => {
  const [challenges, setChallenges] = useState([]);
  const [availableChallenges, setAvailableChallenges] = useState([]);

  const fetchMyChallenges = () => {
    const token = localStorage.getItem("accessToken"); // Retrieve token for authorization
  
    if (!userId) return; // Ensure userId exists
  
    fetch(`http://localhost:3000/api/challenges/my-challenges/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Add token to headers
      },
    })  
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch My Challenges");
        return response.json();
      })
      .then((joinedChallenges) => {
        console.log("Fetched My Challenges Data:", joinedChallenges);
        
        // Enhance joined challenges with details from available challenges
        const detailedChallenges = joinedChallenges.map((joined) => {
          const matchingChallenge = availableChallenges.find(
            (challenge) => challenge.challenge_id === joined.challenge_id
          );
  
          return {
            challenge_id: joined.challenge_id,
            activity_id: joined.activity_id,
            joined_at: joined.joined_at,
            distance: matchingChallenge ? matchingChallenge.distance : "N/A",
            participants_num: matchingChallenge ? matchingChallenge.participants_num : "N/A",
            progress: joined.progress || 0,
            status: joined.status || "Active",
            challenge_type: matchingChallenge ? matchingChallenge.challenge_type : "N/A",
            challenge_deadline: matchingChallenge ? matchingChallenge.challenge_deadline : "N/A",
            badge_id: matchingChallenge ? matchingChallenge.badge_id : "N/A",
            target_value: matchingChallenge ? matchingChallenge.target_value : 0,
          };
        });
  
        setChallenges(detailedChallenges); // Update state with enriched challenges
        console.log("Detailed My Challenges:", detailedChallenges); // Debug the result
      })
      .catch((error) => console.error("Error fetching my challenges:", error));
  };
  
  

  const fetchAvailableChallenges = async () => {
    try {
      const token = localStorage.getItem("accessToken"); // Get token from localStorage
      const response = await fetch("http://localhost:3000/api/challenges/available-challenges", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Pass token in Authorization header
        },
      });
  
      if (!response.ok) {
        throw new Error("Failed to fetch available challenges.");
      }
  
      const data = await response.json();
      console.log("Available Challenges Data:", data); // Log the response data
      setAvailableChallenges(data); // Update state
    } catch (error) {
      console.error("Error fetching available challenges:", error);
    }
  };
  

  useEffect(() => {
    fetchAvailableChallenges().then(() => fetchMyChallenges());
  }, []);
  

  return { challenges, availableChallenges, fetchMyChallenges };
};

export default useChallenges;
