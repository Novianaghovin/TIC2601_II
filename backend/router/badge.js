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

    /*To ensure that badge updates only occur automatically based on leaderboard status,
    we’ll modify the POST endpoint to include a check for the user's position on the 
    leaderboard for a specific challenge_id*/

    // Helper function to check leaderboard status for automatic badge assignment
    const isUserOnLeaderboard = (user_id, challenge_id, callback) => {
        const leaderboardQuery = `
            SELECT * FROM leaderboard 
            WHERE user_id = ? AND challenge_id = ?
        `;
        
        db.get(leaderboardQuery, [user_id, challenge_id], (err, row) => {
            if (err) {
                console.error('Error checking leaderboard:', err.message); // Log the error for debugging
                return callback(err); // Return error to callback
            }
            callback(null, Boolean(row)); // Return true if user is on leaderboard
        });
    };

    // GET all badges for a user
    router.get('/:user_id/badges', (req, res) => {
        const userId = req.params.user_id;
        const query = `SELECT * FROM badge_records WHERE user_id = ?`;

        db.all(query, [userId], (err, rows) => {
            if (err) {
                console.error('Error fetching badges:', err.message); // Log error
                return res.status(500).json({ error: 'Internal Server Error' });
            }
            
            res.json(rows.length > 0 ? rows : []); // Respond with badges or empty array if none found
        });
    });

    // POST a new badge record if user is on the leaderboard for the specified challenge
    router.post('/badges', (req, res) => {
        const { user_id, challenge_id, badge_name } = req.body;

        // Step 1: Check if the user is on the leaderboard for the given challenge_id
        isUserOnLeaderboard(user_id, challenge_id, (err, isOnLeaderboard) => {
            if (err) {
                console.error('Error checking leaderboard status:', err.message); // Log error
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            // If user is not on the leaderboard, prevent badge creation
            if (!isOnLeaderboard) {
                return res.status(403).json({ error: 'User must be on the leaderboard to achieve this badge.' });
            }

            // Step 2: If on leaderboard, insert the badge record
            const insertQuery = `
                INSERT INTO badge_records (user_id, challenge_id, badge_name)
                VALUES (?, ?, ?)
            `;

            db.run(insertQuery, [user_id, challenge_id, badge_name], function (err) {
                if (err) {
                    console.error('Error inserting badge:', err.message); // Log error
                    return res.status(500).json({ error: 'Internal Server Error' });
                }

                res.status(201).json({ 
                    message: 'Badge awarded successfully.', 
                    badge_id: this.lastID 
                });
            });
        });
    });

    // DELETE a badge by badge_id only if user account is deleted
    router.delete('/badges/:badgeId', (req, res) => {
        const badgeId = req.params.badgeId;

        // Step 1: Fetch user_id associated with the badge
        const badgeQuery = `SELECT user_id FROM badge_records WHERE badge_id = ?`;

        db.get(badgeQuery, [badgeId], (err, badge) => {
            if (err) {
                console.error('Error retrieving badge:', err.message); // Log error
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            if (!badge) {
                return res.status(404).json({ error: 'Badge not found.' });
            }

            const { user_id } = badge;

            // Step 2: Check if user still exists
            const userQuery = `SELECT * FROM user_profile WHERE user_id = ?`;

            db.get(userQuery, [user_id], (err, user) => {
                if (err) {
                    console.error('Error checking user existence:', err.message); // Log error
                    return res.status(500).json({ error: 'Internal Server Error' });
                }

                if (user) {
                    return res.status(403).json({ error: 'Badge cannot be deleted while user account exists.' });
                }

                // Step 3: If user account is deleted, proceed to delete the badge
                const deleteQuery = `DELETE FROM badge_records WHERE badge_id = ?`;

                db.run(deleteQuery, [badgeId], function (err) {
                    if (err) {
                        console.error('Error deleting badge:', err.message); // Log error
                        return res.status(500).json({ error: 'Internal Server Error' });
                    }

                    res.json({ message: 'Badge deleted successfully.' });
                });
            });
        });
    });


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


// notes here was running in below form 
/*app.get('/registration', (req, res) => {
    db.all('SELECT * FROM user_registration', [], (err, rows) => {
        if (err) {
            console.error('Error fetching users:', err.message); // Log the error for debugging
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        // If no users are found, you may choose to return an empty array or a specific message
        res.json(rows.length > 0 ? rows : []); // Respond with the users or an empty array
    });
});

// Get all users
app.get('/profile', (req, res) => {
    db.all('SELECT * FROM user_profile', [], (err, rows) => {
        if (err) {
            console.error('Error fetching users:', err.message); // Log the error for debugging
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        // If no users are found, you may choose to return an empty array or a specific message
        res.json(rows.length > 0 ? rows : []); // Respond with the users or an empty array
    });
});



// Add a new user example of it
/*app.post('/users', (req, res) => {
    const { name, email } = req.body;
    db.run('INSERT INTO users (name, email) VALUES (?, ?)', [name, email], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: this.lastID, name, email });
    });
});
*/
*/