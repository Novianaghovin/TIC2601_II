// BadgeList.js
import React from 'react';

const BadgeList = ({ badges, badgeImages }) => {
    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
            {badges.length > 0 ? (
                badges.map((badge, index) => {
                    const badgeImage = badgeImages[badge.badge_name];
                    return (
                        badgeImage && (
                            <div key={index} style={{ margin: '15px', textAlign: 'center' }}>
                                <img
                                    src={badgeImage}
                                    alt={badge.badge_name}
                                    style={{ width: '120px', height: '120px', borderRadius: '10px' }}
                                />
                                <p>{badge.badge_name}</p>
                                <p>Achieved Date: {badge.time_stamp}</p>
                            </div>
                        )
                    );
                })
            ) : (
                <p>No badges found for the selected criteria.</p>
            )}
        </div>
    );
};

export default BadgeList;
