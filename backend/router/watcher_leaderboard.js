const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Path to the database file
const dbPath = path.join(__dirname, '../database.db');

// Initialize the database
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database: ' + err.message);
        process.exit(1); // Exit process if database connection fails
    } else {
        console.log('watcher_leaderboard connected to the database.');
    }
});
function handleDatabaseChange() {
    console.log('Database file has changed, checking for completed challenges...');

    const query = `
        SELECT 
            challenge_id, 
            user_id 
        FROM 
            user_challenges 
        WHERE 
            status = 'Completed' 
            AND progress = 100
            AND NOT EXISTS (
                SELECT 1 
                FROM leaderboard 
                WHERE leaderboard.challenge_id = user_challenges.challenge_id 
                AND leaderboard.user_id = user_challenges.user_id
            )
    `;

    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Error querying database:', err.message);
            return;
        }

        if (rows.length === 0) {
            console.log('No new completed challenges to process.');
            return;
        }

        // Begin a transaction
        db.serialize(() => {
            db.run('BEGIN TRANSACTION');  // Start a transaction

            rows.forEach(row => {
                const { challenge_id, user_id } = row;

                const insertQuery = `
                    INSERT INTO leaderboard (challenge_id, user_id, time_stamp, distance)
                    SELECT ?, ?, CURRENT_TIMESTAMP, ac.distance
                    FROM avail_challenges ac
                    WHERE ac.challenge_id = ?;
                `;

                db.run(insertQuery, [challenge_id, user_id, challenge_id], function (err) {
                    if (err) {
                        console.error('Error inserting into leaderboard:', err.message);
                        return;
                    }
                    console.log(`Added to leaderboard: Challenge ID ${challenge_id}, User ID ${user_id}`);
                });
            });

            db.run('COMMIT');  // Commit the transaction
        });
    });
}

// Function to watch the database file
function startDatabaseWatcher() {
    console.log(`Watching database file: ${dbPath}`);
    
    fs.watchFile(dbPath, { interval: 1000 }, (curr, prev) => {
        if (curr.mtime !== prev.mtime) {
            console.log('Database file has been updated, checking for completed challenges...');
            handleDatabaseChange();
        }
    });
}

// Export the function to start the watcher
module.exports = {
    startDatabaseWatcher,
};
