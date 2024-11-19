// BadgeTable.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NavBar from "../components/Shared/Navbar"; // Importing NavBar
import BadgeForm from './BadgeForm'; // Import BadgeForm component
import BadgeList from './BadgeList'; // Import BadgeList component

// Importing badge images
import badge5kmColor from './5km-color.jpg';
import badge10kmColor from './10km-color.jpg';
import badge21kmColor from './21km-color.jpg';
import badge10kStepsColor from './10ksteps-color.jpg';
import badge20kStepsColor from './20ksteps-color.jpg';
import badge30kStepsColor from './30ksteps-color.jpg';

const BadgeTable = () => {
    const [month, setMonth] = useState('');
    const [year, setYear] = useState('');
    const [badges, setBadges] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchBadges = async () => {
        if (!month || !year) {
            setError('Please select both month and year.');
            return;
        }

        setLoading(true);
        setError(null);

        const token = localStorage.getItem('accessToken');
        if (!token) {
            setError('No access token found.');
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get(`http://localhost:3000/api/badgeCompleted/${month}/${year}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setBadges(response.data);
        } catch (err) {
            setError('Error fetching badges');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const badgeImages = {
        '5km running': badge5kmColor,
        '10km running': badge10kmColor,
        '21km running': badge21kmColor,
        '10k steps walking': badge10kStepsColor,
        '20k steps walking': badge20kStepsColor,
        '30k steps walking': badge30kStepsColor,
    };

    useEffect(() => {
        fetchBadges();
    }, [month, year]);

    const handleMonthChange = (e) => setMonth(e.target.value);
    const handleYearChange = (e) => setYear(e.target.value);
    const handleFilterClick = () => fetchBadges();

    return (
        <div>
            <NavBar /> {/* Add NavBar component at the top */}

            <div style={{ marginTop: '80px' }}>
                <BadgeForm 
                    month={month}
                    year={year}
                    onMonthChange={handleMonthChange}
                    onYearChange={handleYearChange}
                    onFetch={handleFilterClick}
                />

                {loading && <p>Loading...</p>}
                {error && <p>{error}</p>}

                <BadgeList badges={badges} badgeImages={badgeImages} />
            </div>
        </div>
    );
};

export default BadgeTable;
