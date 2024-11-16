const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');
const leaderboardroute = require('./leaderboard');
const app = express();
const router = express.Router();
const port = 3001;

/* Middleware */ 
app.use(cors());
app.use(express.json());

router.use('/leaderboard', leaderboardroute);

// Use the router for all app routes
app.use('/', router);

// Define the path to the existing database file
const DB_PATH = path.resolve(__dirname, '../database/database.db');

// Connect to the existing database instance
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Error connecting to the database:', err.message);
    } else {
        console.log('Connected to the existing SQLite database successfully.');
    }
});

// Route to fetch available challenges 
router.get('/api/available-challenges', (req, res) => {
    const sql = `SELECT * FROM avail_challenges`; // Adjust the condition based on your data structure
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('Error fetching available challenges:', err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows); // Send the available challenges back to the frontend
    });
});

// Route for users to join a challenge
router.post('/api/join-challenge/:userId/:challengeId/:activityId', (req, res) => {
    const { userId, challengeId, activityId } = req.params;
  
    // Check if the user is already part of the challenge
    db.get('SELECT * FROM user_challenges WHERE user_id = ? AND challenge_id = ? AND activity_id = ?', [userId, challengeId, activityId], (err, row) => {
        if (err) {
            console.error('Error checking existing entry:', err.message);
            return res.status(500).json({ success: false, message: 'Database query failed' });
        }
        if (row) {
            return res.status(400).json({ success: false, message: 'You have already joined this challenge.' });
        }
  
        // Insert new entry if not already joined
        db.run('INSERT INTO user_challenges (user_id, challenge_id, activity_id, status, progress) VALUES (?, ?, ?, ?, ?)',
            [userId, challengeId, activityId, 'Active', '0'], function(err) {
                if (err) {
                    console.error('Error joining challenge:', err.message);
                    return res.status(500).json({ success: false, message: 'Failed to join the challenge.' });
                }

                // Increment participants count in the avail_challenges table
                db.run('UPDATE avail_challenges SET participants_num = participants_num + 1 WHERE challenge_id = ?', [challengeId], function(err) {
                    if (err) {
                        console.error('Error updating participants count:', err.message);
                        return res.status(500).json({ success: false, message: 'Failed to update participants count.' });
                    }
                    res.json({ success: true, message: 'Successfully joined the challenge!' });
                });
            }
        );
    });
});

  

// Route to fetch "My Challenges" (challenges the user has joined)
router.get('/api/my-challenges/:userId', (req, res) => {
    const userId = req.params.userId;

    // SQL query to fetch the challenges that the user has joined
    const sql = `
        SELECT *
        FROM user_challenges uc
        WHERE uc.user_id = ? `;

    db.all(sql, [userId], (err, rows) => {
        if (err) {
            console.error('Error fetching user challenges:', err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows); // Return the joined challenges for the user
    });
});

// Route to refresh progress for all user challenges
router.post('/api/refresh-progress/:userId', (req, res) => {
    const userId = req.params.userId; 

    // Fetch all challenges for the user along with their distances and deadline
    const fetchChallengesQuery = `
    SELECT uc.challenge_id, uc.user_id, ac.distance, ac.challenge_deadline
    FROM user_challenges AS uc
    JOIN avail_challenges AS ac ON uc.challenge_id = ac.challenge_id
    WHERE uc.user_id = ?`;

    db.all(fetchChallengesQuery, [userId], (err, challenges) => {
        if (err) {
            console.error('Error fetching user challenges:', err.message);
            return res.status(500).json({ success: false, message: 'Failed to fetch challenges.' });
        }

        // Get current date for expired check
        const currentDate = new Date().toISOString().split('T')[0]; // Format as YYYY-MM-DD

        // Iterate over each challenge and calculate progress
        challenges.forEach(challenge => {   
            const { user_id, distance, challenge_id, challenge_deadline } = challenge;

            // Check if the challenge is expired
            let status = 'Active'; // Default status
            if (challenge_deadline < currentDate) {
                status = 'Expired'; // Set status to Expired if the deadline has passed
            }

            if (status === 'Expired') {
                // Update the user's status to 'Expired' and skip progress calculation
                db.run(`UPDATE user_challenges SET status = ? WHERE user_id = ? AND challenge_id = ?`, 
                    ['Expired', user_id, challenge_id], function(err) {
                    if (err) {
                        console.error('Error updating status to Expired:', err.message);
                    }
                });
                return; // Skip further processing for expired challenges
            }

            // Calculate total distance for this challenge
            const totalDistanceQuery = `
            SELECT SUM(al.distance) AS totalDistance 
            FROM activity_log AS al
            JOIN user_challenges AS uc ON al.log_id = uc.activity_id
            WHERE al.user_id = ? AND al.timestamp <= ? AND al.timestamp >= uc.joined_at`;

            db.get(totalDistanceQuery, [user_id, challenge_deadline], (err, row) => {
                if (err) {
                    console.error('Error calculating total distance:', err.message);
                    return;
                }

                const totalDistance = row.totalDistance || 0;

                // Calculate progress percentage
                let progress = (totalDistance / distance) * 100;
                if (progress >= 100) {
                    progress = 100; // Cap progress at 100%
                }

                // Update the user's progress and status in the user_challenges table
                db.run(`UPDATE user_challenges SET progress = ?, status = ? WHERE user_id = ? AND challenge_id = ?`, 
                    [progress, status, user_id, challenge_id], function(err) {
                    if (err) {
                        console.error('Error updating progress:', err.message);
                    }
                });
            });
        });

        // Send a success response
        res.json({ success: true, message: 'Challenge progress updated successfully.' });
    });
});



// Route to fetch activity id from the database
router.get('/api/get-activity/:activityID', (req, res) => {
    const activityId = req.params.activityID;

    // Check if activity id is a valid number
    if (isNaN(activityId)) {
        return res.status(400).json({ error: 'Invalid Activity ID' });
    }

    console.log('Fetching Activity ID:', activityId);

    // Query the database to fetch the activity_id from the avail_challenges table
    db.get('SELECT * FROM avail_challenges WHERE activity_id = ?', [activityId], (err, row) => {
        if (err) {
            console.error('Database error:', err);
            res.status(500).json({ error: 'Database query failed' });
            return;
        }
        if (row) {
            res.json(row);
        } else {
            res.status(404).json({ message: 'Activity ID not found' });
        }
    });
});


// Route to fetch challenge id from the database
router.get('/api/get-challenge/:challengeID', (req, res) => {
    const challengeId = req.params.challengeID;

    // Check if challenge ID is a valid number
    if (isNaN(challengeId)) {
        return res.status(400).json({ error: 'Invalid Challenge ID' });
    }

    console.log('Fetching Challenge ID:', challengeId);

    // Query the database to fetch the challenge_id from the avail_challenges table
    db.get('SELECT * FROM avail_challenges WHERE challenge_id = ?', [challengeId], (err, row) => {
        if (err) {
            console.error('Database error:', err);
            res.status(500).json({ error: 'Database query failed' });
            return;
        }
        if (row) {
            res.json(row);
        } else {
            res.status(404).json({ message: 'Challenge not found' });
        }
    });
});

// Route to fetch user id from the database
router.get('/api/get-user/:userID', (req, res) => {
    const userID = req.params.userID;

    // Check if userID is a valid number
    if (isNaN(userID)) {
        return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Convert userID to an integer
    const userIDInt = parseInt(userID, 10);

    console.log('Fetching user with ID:', userIDInt);

    // Query the database to fetch the user_id from the User_Profile table
    db.get('SELECT user_id FROM user_profile WHERE user_id = ?', [userIDInt], (err, row) => {
        if (err) {
            console.error('Database error:', err);
            res.status(500).json({ error: 'Database query failed' });
            return;
        }
        if (row) {
            res.json({ userId: row.user_id });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

module.exports = router;
