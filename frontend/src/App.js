// App.js  -- function from controller can be all added here to run before ssplitting to neww page
import React, { useState } from 'react';

import Badge from './controller/badge.js';

const App = () => {
    // State to manage badges for current and previous months will be automatically input when database have been established
    const [currentMonthAchievements] = useState([
        { badgeName: '5km running', achieved: true, dateAchieved: '2024-10-01' },
        { badgeName: '10km running', achieved: true, dateAchieved: '2024-10-05' },
        { badgeName: '21km running', achieved: false, dateAchieved: null },
        { badgeName: '10k steps walking', achieved: true, dateAchieved: '2024-10-10' },
        { badgeName: '20k steps walking', achieved: false, dateAchieved: null },
        { badgeName: '30k steps walking', achieved: true, dateAchieved: '2024-10-15' },
    ]);

    const [previousMonthAchievements] = useState([
        { badgeName: '5km running', achieved: false, dateAchieved: null },
        { badgeName: '10km running', achieved: true, dateAchieved: '2024-09-25' },
        { badgeName: '21km running', achieved: false, dateAchieved: null },
        { badgeName: '10k steps walking', achieved: true, dateAchieved: '2024-09-20' },
        { badgeName: '20k steps walking', achieved: false, dateAchieved: null },
        { badgeName: '30k steps walking', achieved: true, dateAchieved: '2024-09-18' },
    ]);

    // State to toggle between current and previous month achievements
    const [showPreviousMonth, setShowPreviousMonth] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState("current");

    // Function to toggle between current and previous month badges
    const handleMonthChange = (event) => {
        setSelectedMonth(event.target.value);
        setShowPreviousMonth(event.target.value === "previous");
    };

    // Determine which achievements to show based on the selected month
    const achievementsToShow = showPreviousMonth ? previousMonthAchievements : currentMonthAchievements;

    return (
        <div>
            <h1>Achievement Badges</h1>
            <div>
                <label htmlFor="monthSelect">Select Month:</label>
                <select id="monthSelect" value={selectedMonth} onChange={handleMonthChange}>
                    <option value="current">Current Month</option>
                    <option value="previous">Previous Month</option>
                </select>
            </div>
            <div className="badge-list">
                {achievementsToShow.map((achievement, index) => (
                    <Badge
                        key={index}
                        badgeName={achievement.badgeName}
                        achieved={achievement.achieved}
                        dateAchieved={achievement.dateAchieved}
                    />
                ))}
            </div>
        </div>
    );
};

export default App;