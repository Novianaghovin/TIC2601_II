const express = require('express')
const sqlite3 = require('sqlite3').verbose()

const router = express.Router()
const db = new sqlite3.Database('C:/Users/Yuan/Documents/GitHub/TIC2601_II/backend/database/database3.db')

// Get all activity logs
router.get('/', (req, res) => {
    db.all('SELECT * FROM activity_log', (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json(rows);
    });
});

// GET a specific activity log by ID
router.get('/:log_id', (req, res) => {
    const logId = req.params.log_id;
    db.get('SELECT * FROM activity_log WHERE log_id = ?', [logId], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (row) {
            res.status(200).json(row);
        } else {
            res.status(404).json({ error: 'Activity log not found.' });
        }
    });
});

// Create a new activity log
router.route('/')
  .post((req, res) => {  // Changed to POST
    console.log('POST: /activity_log');

    const { activity_duration, distance, user_id, activity_id } = req.body;

    // Validate that required fields are provided
    if (!activity_duration || !distance || !user_id || !activity_id) {
      return res.status(400).send('Bad Request: Activity duration, distance, user ID, and activity ID are required.');
    }

    const step_count = req.body.step_count || 0;

    // Fetch the activity multiplier from the activity_type table
    const sqlGetMultiplier = `SELECT activity_multiplier FROM activity_type WHERE activity_id = ?`;
    db.get(sqlGetMultiplier, [activity_id], (err, row) => {
      if (err) {
        console.error('Error retrieving activity multiplier:', err);
        return res.status(500).send('Internal Server Error: Unable to retrieve activity multiplier.');
      }
      if (!row) {
        return res.status(404).send('Not Found: Invalid activity ID.');
      }

      // Calculate calories burned (Example formula: duration * multiplier)
      const calories_burnt = activity_duration * row.activity_multiplier;

      // Insert the new activity log
      const sqlInsert = `
        INSERT INTO activity_log (activity_duration, distance, step_count, calories_burnt, activity_id, user_id)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      db.run(sqlInsert, [activity_duration, distance, step_count, calories_burnt, activity_id, user_id], function(err) {
        if (err) {
          console.error('Error inserting activity log:', err);
          return res.status(500).send('Internal Server Error: ' + err.message);
        }
        
        // Retrieve the newly inserted log entry to send back as response
        const newLogId = this.lastID;
        const sqlSelectNewLog = `SELECT * FROM activity_log WHERE log_id = ?`;
        db.get(sqlSelectNewLog, [newLogId], (err, newLog) => {
          if (err) {
            console.error('Error retrieving new activity log:', err);
            return res.status(500).send('Internal Server Error: ' + err.message);
          }
          
          res.status(201).json(newLog);  // Return the newly created entry as JSON
        });
      });
    });
  });

module.exports = router;