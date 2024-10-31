const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3001;

/* Middleware */ 
app.use(cors());
app.use(express.json());

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
app.get('/api/available-challenges', (req, res) => {
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
app.post('/api/join-challenge/:userId/:challengeId/:activityId', (req, res) => {
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
  
          res.json({ success: true, message: 'Successfully joined the challenge!' });
        });
    });
  });
  

// Route to fetch "My Challenges" (challenges the user has joined)
app.get('/api/my-challenges/:userId', (req, res) => {
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

// Route to fetch activity id from the database
app.get('/api/get-activity/:activityID', (req, res) => {
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
app.get('/api/get-challenge/:challengeID', (req, res) => {
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
app.get('/api/get-user/:userID', (req, res) => {
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
