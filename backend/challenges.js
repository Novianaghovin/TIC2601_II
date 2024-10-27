const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3001;

/* To handle FE and BE different ports issue */ 
app.use(cors());

// Define the path to the existing database file
const DB_PATH = path.resolve(__dirname, 'challenges.db');

// Connect to the existing database instance
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Error connecting to the database:', err.message);
    } else {
        console.log('Connected to the existing SQLite database successfully.');
    }
});

// Middleware to parse JSON
app.use(express.json());

// Route to fetch available challenges (challenges the user hasn't joined yet)
app.get('/api/available-challenges', (req, res) => {
    const sql = `SELECT * FROM Challenges`; // Adjust the condition based on your data structure
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
app.post('/api/join-challenge/:userId/:challengeId', async (req, res) => {
    const { userId, challengeId } = req.params;
  
    try {
      // Check if the user is already part of the challenge
      const existingEntry = await db.query(
        'SELECT * FROM User_Challenges WHERE user_id = $1 AND challenge_id = $2',
        [userId, challengeId]
      );
  
      if (existingEntry.rows.length > 0) {
        return res.status(400).json({ success: false, message: 'You have already joined this challenge.' });
      }
  
      // Insert new entry into User_Challenges table
      const currentDate = new Date(); // Get the current date for the start_date
      await db.query(
        `INSERT INTO User_Challenges (user_id, challenge_id, completion_status, progress, start_date) 
         VALUES ($1, $2, 'Active', 0, $3)`,
        [userId, challengeId, currentDate]
      );
  
      res.json({ success: true, message: 'Successfully joined the challenge!' });
    } catch (error) {
      console.error('Error joining challenge:', error);
      res.status(500).json({ success: false, message: 'Failed to join the challenge.' });
    }
  });
  
  

// Route to fetch "My Challenges" (challenges the user has joined)
app.get('/api/my-challenges/:userId', (req, res) => {
    const userId = req.params.userId;

    // SQL query to fetch the challenges that the user has joined
    const sql = `
        SELECT c.*
        FROM Challenges c
        JOIN User_Challenges uc ON c.challenge_id = uc.user_challenge_id
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

// Route to fetch user id from the database
app.get('/api/get-user/:username', (req, res) => {
    const { username } = req.params;
    
    
    db.query('SELECT user_id FROM User_Profile WHERE user_id = $1', [username])
      .then(result => {
        if (result.rows.length > 0) {
          res.json({ userId: result.rows[0].user_id });
        } else {
          res.status(404).json({ message: 'User not found' });
        }
      })
      .catch(error => res.status(500).json({ error: 'Database error' }));
  });
  

// Start the server
app.listen(3001, () => {
    console.log('Server is running on http://localhost:3001');
});