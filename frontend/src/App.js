import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Badge from './controller/badge.js';

const App = ({ user_id }) => {
    // State to store achievements for current and previous months
    const [currentMonthAchievements, setCurrentMonthAchievements] = useState([]);
    const [previousMonthAchievements, setPreviousMonthAchievements] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState("current");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch achievements from the backend
    useEffect(() => {
        const fetchAchievements = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await axios.get('http://localhost:3000/badge'); // Update with your actual backend URL
                const fetchedBadges = response.data;

                // Filter the achievements based on the current and previous months
                const currentMonth = new Date().getMonth();
                const currentAchievements = fetchedBadges.filter(badge => new Date(badge.challenge_deadline).getMonth() === currentMonth);
                const previousAchievements = fetchedBadges.filter(badge => new Date(badge.challenge_deadline).getMonth() === currentMonth - 1);

                setCurrentMonthAchievements(currentAchievements);
                setPreviousMonthAchievements(previousAchievements);
            } catch (error) {
                setError('Failed to fetch badge data');
            } finally {
                setLoading(false);
            }
        };

        fetchAchievements();
    }, []);

    // Toggle between current and previous month achievements
    const handleMonthChange = (event) => {
        setSelectedMonth(event.target.value);
    };

    // Determine which achievements to display
    const achievementsToShow = selectedMonth === "current" ? currentMonthAchievements : previousMonthAchievements;

    return (
        <div>
            <h1>Achievement Badges</h1>

            {/* Loading and Error States */}
            {loading && <p>Loading...</p>}
            {error && <p>{error}</p>}

            <div>
                <label htmlFor="monthSelect">Select Month:</label>
                <select id="monthSelect" value={selectedMonth} onChange={handleMonthChange}>
                    <option value="current">Current Month</option>
                    <option value="previous">Previous Month</option>
                </select>
            </div>

            {/* Display the badges in a list */}
            <div className="badge-list">
                {achievementsToShow.map((achievement, index) => (
                    <Badge
                        key={index}
                        badgeName={achievement.badge_name}
                        achieved={achievement.status === 'completed'}
                        dateAchieved={achievement.challenge_deadline}
                    />
                ))}
            </div>
        </div>
    );
};

export default App;
