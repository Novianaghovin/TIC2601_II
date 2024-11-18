import React from 'react';

// Import images for each badge in both color and grayscale
import badge5kmColor from './5km-color.jpg';
import badge10kmColor from './10km-color.jpg';
import badge21kmColor from './21km-color.jpg';
import badge10kStepsColor from './10ksteps-color.jpg';
import badge20kStepsColor from './20ksteps-color.jpg';
import badge30kStepsColor from './30ksteps-color.jpg';

const Badge = ({ badgeName, status, progress, time_stamp }) => {
    // Only display badges with "completed" status and progress 100
    if (status !== 'Completed' || progress !== 100) {
        return null; // Return nothing if the badge status is not "Completed" or progress is not 100
    }

    // Map badge names to colored images
    const badgeImages = {
        '5km running': badge5kmColor,
        '10km running': badge10kmColor,
        '21km running': badge21kmColor,
        '10k steps walking': badge10kStepsColor,
        '20k steps walking': badge20kStepsColor,
        '30k steps walking': badge30kStepsColor,
    };

    // Set the appropriate badge image or fallback to a default if no match
    const badgeImage = badgeImages[badgeName] || badge5kmColor;

    // Handle time_stamp and format it to display only the date
    const formatDate = (time_stamp) => {
        if (!time_stamp) {
            return 'Invalid Date'; // Return a fallback message if time_stamp is undefined or invalid
        }

        const dateParts = time_stamp.split(' '); // Split date and time (e.g., '2024-11-18' and '14:30')
        if (dateParts.length !== 2) {
            return 'Invalid Date'; // Return a fallback message if the time_stamp is not in the expected format
        }

        const date = dateParts[0]; // Date part (2024-11-18)
        // If you just need the date and no time, simply return the date part
        return date; // Return only the date in YYYY-MM-DD format
    };

    return (
        <div className="badge-container">
            <div className="badge-item">
                <div className="badge-icon">
                    <img src={badgeImage} alt={`${badgeName} Badge`} />
                    <span>{badgeName}</span>
                </div>

                {/* Badge Info Box */}
                <div className="badge-info-box">
                    <p>Achieved on:</p>
                    {/* Timestamp */}
                    <div>{formatDate(time_stamp)}</div>
                </div>
            </div>
        </div>
    );
};

export default Badge;
