const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const authenticateToken = require('../authenticateToken');
const router = express.Router();

// Define the path to the existing database file
const DB_PATH = path.resolve(__dirname, '../database.db');

// Connect to the existing database instance
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Error connecting to the database:', err.message);
    } else {
        console.log('Connected to the database successfully.');
    }
});

console.log('Challenges route loaded');

// Route to fetch available challenges 
router.get('/available-challenges', (req, res) => {
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
router.post('/join-challenge/:challengeId/:activityId', authenticateToken, (req, res) => {
    const { challengeId, activityId } = req.params; // Extract challengeId and activityId from the URL params
    const userId = req.user.userId; // Extract userId from the authenticated token

    if (!userId || !challengeId || !activityId) {
        return res.status(400).json({ success: false, message: 'Missing required fields.' });
    }

    // First, get the challenge deadline
    db.get('SELECT challenge_deadline FROM avail_challenges WHERE challenge_id = ?', [challengeId], (err, challenge) => {
        if (err) {
            console.error('Error fetching challenge deadline:', err.message);
            return res.status(500).json({ success: false, message: 'Database query failed' });
        }
        if (!challenge) {
            return res.status(404).json({ success: false, message: 'Challenge not found.' });
        }

        const currentDate = new Date();
        const deadlineDate = new Date(challenge.challenge_deadline);

        // Check if current date is before the deadline
        if (currentDate > deadlineDate) {
            return res.status(400).json({ success: false, message: 'This challenge has already expired.' });
        }

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
});



// Route to fetch "My Challenges" (challenges the user has joined)
router.get('/my-challenges',authenticateToken, (req, res) => {
    const userId = req.user.userId;

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

// Route to refresh all challenges
router.post('/refresh-all', authenticateToken, (req, res) => {
    const userId = req.user.userId;

    // Fetch all challenges for the user along with their distances, deadlines, and statuses
    const fetchChallengesQuery = `
    SELECT uc.challenge_id, uc.user_id, uc.status, ac.distance, ac.challenge_deadline
    FROM user_challenges AS uc
    JOIN avail_challenges AS ac ON uc.challenge_id = ac.challenge_id
    WHERE uc.user_id = ?`;

    db.serialize(() => {
        db.run("BEGIN TRANSACTION;");

        // Execute the fetch challenges query
        db.all(fetchChallengesQuery, [userId], (err, challenges) => {
            if (err) {
                console.error('Error fetching challenges:', err.message);
                db.run("ROLLBACK;");
                return res.status(500).json({ success: false, message: 'Failed to fetch challenges.' });
            }

            challenges.forEach(challenge => {
                const { user_id, distance, challenge_id, challenge_deadline, status } = challenge;
                const currentDate = new Date();
                const deadlineDate = new Date(challenge_deadline);

                if (currentDate > deadlineDate) {
                    if (status !== 'Expired') {
                        // If the user challenge has passed its deadline and is not already expired, mark it as expired
                        const updateExpiredStatus = `UPDATE user_challenges SET status = 'Expired' WHERE user_id = ? AND challenge_id = ?`;
                        db.run(updateExpiredStatus, [user_id, challenge_id], function(err) {
                            if (err) {
                                console.error('Error updating user challenge status to Expired:', err.message);
                                db.run("ROLLBACK;");
                                return;
                            }
                        });
                    }

                    // Update the avail_challenges table to mark the challenge as expired
                    const updateAvailChallengesStatus = `UPDATE avail_challenges SET status = 'Expired' WHERE challenge_id = ?`;
                    db.run(updateAvailChallengesStatus, [challenge_id], function(err) {
                        if (err) {
                            console.error('Error updating avail_challenges status to Expired:', err.message);
                            db.run("ROLLBACK;");
                            return;
                        }
                    });
                } else if (status !== 'Expired') {
                    // Only calculate and update progress for challenges that are not expired
                    const totalDistanceQuery = `
                    SELECT SUM(al.distance) AS totalDistance
                    FROM activity_log AS al
                    WHERE al.user_id = ? AND al.timestamp <= ? AND al.timestamp >= 
                    (SELECT joined_at FROM user_challenges WHERE user_id = ? AND challenge_id = ?)`;

                    db.get(totalDistanceQuery, [user_id, challenge_deadline, user_id, challenge_id], (err, row) => {
                        if (err) {
                            console.error('Error calculating total distance:', err.message);
                            db.run("ROLLBACK;");
                            return;
                        }

                        const totalDistance = row.totalDistance || 0;
                        let progress = (totalDistance / distance) * 100;
                        progress = progress > 100 ? 100 : progress;
                        const newStatus = progress >= 100 ? 'Completed' : 'Active';

                        db.run(`UPDATE user_challenges SET progress = ?, status = ? WHERE user_id = ? AND challenge_id = ?`, 
                            [progress, newStatus, user_id, challenge_id], function(err) {
                                if (err) {
                                    console.error('Error updating progress and status:', err.message);
                                    db.run("ROLLBACK;");
                                    return;
                                }
                        });
                    });
                }
            });
            db.run("COMMIT;", (err) => {
                if (err) {
                    console.error('Error during COMMIT:', err.message);
                    db.run("ROLLBACK;");
                    return res.status(500).json({ success: false, message: 'Failed to commit transaction.' });
                }
                res.json({ success: true, message: 'Progress updates completed, and challenges updated as needed.' });
            });
        });
    });
});

// Route to fetch activity id from the database
router.get('/get-activity/:activityID', (req, res) => {
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


module.exports = router;