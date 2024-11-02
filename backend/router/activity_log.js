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

// GET all activity logs by user ID
router.get('/user/:user_id', (req, res) => {
  const userId = req.params.user_id;
  db.all('SELECT * FROM activity_log WHERE user_id = ?', [userId], (err, rows) => {
      if (err) {
          return res.status(500).json({ error: err.message });
      }
      if (rows.length > 0) {
          res.status(200).json(rows);
      } else {
          res.status(404).json({ error: 'No activity logs found for this user.' });
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


  // Update an existing activity log by ID
router.put('/:log_id', (req, res) => {
  const logId = req.params.log_id;
  const { activity_duration, distance, step_count, activity_id, user_id } = req.body;

  const sqlUpdate = `
      UPDATE activity_log
      SET activity_duration = ?, distance = ?, step_count = ?, activity_id = ?, user_id = ?
      WHERE log_id = ?
  `;

  db.run(sqlUpdate, [activity_duration, distance, step_count, activity_id, user_id, logId], function (err) {
      if (err) {
          return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
          return res.status(404).json({ error: 'Activity log not found.' });
      }
      res.status(200).json({ message: 'Activity log updated successfully.' });
  });
});

// Delete an activity log by ID
router.delete('/:log_id', (req, res) => {
  const logId = req.params.log_id; // Get the log ID from the URL parameters
  const sqlDelete = 'DELETE FROM activity_log WHERE log_id = ?'; // SQL query to delete the log

  // Execute the delete operation
  db.run(sqlDelete, [logId], function (err) {
      if (err) {
          // If there is an error during execution, return a 500 status with error details
          return res.status(500).json({ error: err.message });
      }
      // Check if any rows were deleted
      if (this.changes === 0) {
          // If no rows were deleted, the log ID may not exist, return a 404 status
          return res.status(404).json({ error: 'Activity log not found.' });
      }
      // If deletion is successful, return a success message
      res.status(200).json({ message: 'Activity log deleted successfully.' });
  });
});

module.exports = router;