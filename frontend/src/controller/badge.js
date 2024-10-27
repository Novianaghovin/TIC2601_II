// Badge.js NG WILL EDIT THIS
import React from 'react';
import './badge.css'; // Importing the CSS file for styling

// Import images for each badge in both color and grayscale
import badge5kmColor from '../BadgeLogo/5km-color.jpg';
import badge5kmGray from '../BadgeLogo/5km-gray.jpg';
import badge10kmColor from '../BadgeLogo/10km-color.jpg';
import badge10kmGray from '../BadgeLogo/10km-gray.jpg';
import badge21kmColor from '../BadgeLogo/21km-color.jpg';
import badge21kmGray from '../BadgeLogo/21km-gray.jpg';
import badge10kStepsColor from '../BadgeLogo/10ksteps-color.jpg';
import badge10kStepsGray from '../BadgeLogo/10ksteps-gray.jpg';
import badge20kStepsColor from '../BadgeLogo/20ksteps-color.jpg';
import badge20kStepsGray from '../BadgeLogo/20ksteps-gray.jpg';
import badge30kStepsColor from '../BadgeLogo/30ksteps-color.jpg';
import badge30kStepsGray from '../BadgeLogo/30ksteps-gray.jpg';

const Badge = ({ badgeName, achieved, dateAchieved }) => {
    // Determine the badge image based on the badge name and achievement status
    const badgeImages = {
        '5km running': achieved ? badge5kmColor : badge5kmGray,
        '10km running': achieved ? badge10kmColor : badge10kmGray,
        '21km running': achieved ? badge21kmColor : badge21kmGray,
        '10k steps walking': achieved ? badge10kStepsColor : badge10kStepsGray,
        '20k steps walking': achieved ? badge20kStepsColor : badge20kStepsGray,
        '30k steps walking': achieved ? badge30kStepsColor : badge30kStepsGray,
    };

    const badgeImage = badgeImages[badgeName] || badge5kmGray; // Default image if no match found

    return (
        <div className={`badge-container ${achieved ? 'achieved' : 'not-achieved'}`}>
            <div className="badge-icon">
                <img 
                    src={badgeImage} 
                    alt={`${badgeName} Badge`} 
                    className="badge-icon" 
                />
                <span>{badgeName}</span>
            </div>
            <div className="badge-info">
                <p>{badgeName}</p>
                {achieved ? <p>Achieved on {dateAchieved}</p> : <p>Not achieved</p>}
            </div>
        </div>
    );
};

export default Badge;