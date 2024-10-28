// server.js
const express = require('express');
const bodyParser = require('body-parser');
const db = require('./database');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Middleware to check if user exists in User_Profile
const userExists = (user_id, callback) => {
    const query = 'SELECT * FROM user_profile WHERE user_id = ?';
    db.get(query, [user_id], (err, user) => {
        if (err) return callback(err);
        callback(null, user !== undefined);
    });
};

// Helper function to check if the user has achieved the activity
const hasAchievedActivity = (user_id, challenge_id, callback) => {
    const activityQuery = `
        SELECT SUM(distance) as total_distance FROM activities
        WHERE user_id = ? AND challenge_id = ? AND MONTH(achieved_date) = MONTH(CURRENT_DATE)
    `;

    db.get(activityQuery, [user_id, challenge_id], (err, row) => {
        if (err) return callback(err);
        const achieved = row && row.total_distance > 0; // Check if total distance is greater than 0
        callback(null, achieved);
    });
};

// POST to update leaderboard based on user achievements
router.post('/leaderboard', (req, res) => {
    const { user_id, challenge_id, distance, time } = req.body;

    // Check if user exists
    userExists(user_id, (err, exists) => {
        if (err) {
            console.error('Error checking user existence:', err.message);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        if (!exists) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // Check if user has achieved the activity
        hasAchievedActivity(user_id, challenge_id, (err, achieved) => {
            if (err) {
                console.error('Error checking activity:', err.message);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            // Only update leaderboard if user has achieved the activity
            if (achieved) {
                const insertQuery = `
                    INSERT INTO leaderboard (challenge_id, user_id, distance, time, rank)
                    VALUES (?, ?, ?, ?, ?)
                `;

                // Determine rank (this could be based on your existing logic)
                const rank = 1; // Assume rank 1 for simplicity; replace with actual ranking logic

                db.run(insertQuery, [challenge_id, user_id, distance, time, rank], function (err) {
                    if (err) {
                        console.error('Error inserting leaderboard entry:', err.message);
                        return res.status(500).json({ error: 'Internal Server Error' });
                    }
                    res.status(201).json({ message: 'Leaderboard entry added successfully.', leaderboard_id: this.lastID });
                });
            } else {
                res.status(403).json({ error: 'User did not achieve the required activity for this challenge.' });
            }
        });
    });
});

// DELETE leaderboard entry only if user account is deleted
router.delete('/leaderboard/:leaderboardId', (req, res) => {
    const leaderboardId = req.params.leaderboardId;

    // Fetch user_id associated with the leaderboard entry
    const query = `SELECT user_id FROM leaderboard WHERE leaderboard_id = ?`;
    db.get(query, [leaderboardId], (err, entry) => {
        if (err) {
            console.error('Error retrieving leaderboard entry:', err.message);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        if (!entry) {
            return res.status(404).json({ error: 'Leaderboard entry not found.' });
        }

        const { user_id } = entry;

        // Check if user still exists
        userExists(user_id, (err, exists) => {
            if (err) {
                console.error('Error checking user existence:', err.message);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            if (exists) {
                return res.status(403).json({ error: 'Leaderboard entry cannot be deleted while user account exists.' });
            }

            // If user account is deleted, proceed to delete the leaderboard entry
            const deleteQuery = `DELETE FROM leaderboard WHERE leaderboard_id = ?`;
            db.run(deleteQuery, [leaderboardId], function (err) {
                if (err) {
                    console.error('Error deleting leaderboard entry:', err.message);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }

                res.json({ message: 'Leaderboard entry deleted successfully.' });
            });
        });
    });
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


