import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import NavBar from "../components/Shared/Navbar";
import Badge from "./badgeMonthly";
import './badgeMonthly.css';

function Badges() {
    const currentDate = new Date();
    const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed, so add 1
    const currentYear = currentDate.getFullYear().toString();

    const [badges, setBadges] = useState([]);
    const [month, setMonth] = useState(currentMonth); // Default to current month
    const [year, setYear] = useState(currentYear); // Default to current year
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // useCallback ensures fetchBadges doesn't change on each render
    const fetchBadges = useCallback(async () => {
        setLoading(true);
        setError(null);

        // Retrieve token from localStorage
        const token = localStorage.getItem('accessToken');
        if (!token) {
            console.error('No token found');
            setError('No token found');
            setLoading(false);
            return;
        }

        try {
            const userId = 1; // Assuming you have a way to retrieve the user's ID (e.g., from the token or state)
            const response = await axios.get(`http://localhost:3001/api/badgeCompleted/${userId}/${month}/${year}`, {
                headers: {
                    Authorization: `Bearer ${token}` // Include token in Authorization header
                }
            });
            setBadges(response.data);
        } catch (error) {
            console.error("Error fetching badges:", error);
            setError('Error fetching badges');
        } finally {
            setLoading(false);
        }
    }, [month, year]); // Re-run when month or year changes

    useEffect(() => {
        fetchBadges();
    }, [fetchBadges]);

    const handleMonthChange = (e) => {
        setMonth(e.target.value);
    };

    const handleYearChange = (e) => {
        setYear(e.target.value);
    };

    const handleFilterClick = () => {
        fetchBadges(); // Trigger fetching with selected filters
    };

    return (
        <div>
            <NavBar />
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <h1>Completed Badges</h1>

                <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center', gap: '20px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <label style={{ fontSize: '18px', fontWeight: 'bold' }}>Month</label>
                        <select value={month} onChange={handleMonthChange} style={{ fontSize: '16px' }}>
                            <option value="01">January</option>
                            <option value="02">February</option>
                            <option value="03">March</option>
                            <option value="04">April</option>
                            <option value="05">May</option>
                            <option value="06">June</option>
                            <option value="07">July</option>
                            <option value="08">August</option>
                            <option value="09">September</option>
                            <option value="10">October</option>
                            <option value="11">November</option>
                            <option value="12">December</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <label style={{ fontSize: '18px', fontWeight: 'bold' }}>Year</label>
                        <select value={year} onChange={handleYearChange} style={{ fontSize: '16px' }}>
                            <option value="2023">2023</option>
                            <option value="2024">2024</option>
                        </select>
                    </div>

                    <button onClick={handleFilterClick} style={{ height: '35px', width: '100px', fontSize: '16px' }}>
                        Filter
                    </button>
                </div>

                {loading && <p>Loading...</p>}
                {error && <p>{error}</p>}

                {badges.length > 0 ? (
                    <div className="badge-list">
                        {badges.map((badge, index) => (
                            <Badge
                                key={index}
                                badgeName={badge.badge_name}
                                status={badge.status}
                                progress={badge.progress}
                                time_stamp={badge.time_stamp}
                            />
                        ))}
                    </div>
                ) : (
                    <p>No badges found for the selected filters.</p>
                )}
            </div>
        </div>
    );
}

export default Badges;
