const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Define the path to the database file
const DB_PATH = path.resolve(__dirname, 'database.db');

// Create a new database instance
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Could not connect to database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');

        // Create user_registration table
        db.run(`
            CREATE TABLE IF NOT EXISTS user_registration (
                user_id INTEGER PRIMARY KEY AUTOINCREMENT,
                first_name VARCHAR(256) NOT NULL,
                last_name VARCHAR(256) NOT NULL,
                email VARCHAR(256) NOT NULL UNIQUE CHECK (email LIKE '%_@_%._%'),
                password VARCHAR(256) NOT NULL
            );
        `);

        // Create user_profile table
        db.run(`
            CREATE TABLE IF NOT EXISTS user_profile (
                user_id INTEGER PRIMARY KEY,
                dob DATE NOT NULL CHECK (dob < CURRENT_DATE),
                gender VARCHAR(6) NOT NULL CHECK (gender IN('Male', 'Female', 'Others')),
                height INTEGER NOT NULL CHECK (height > 0),
                weight INTEGER NOT NULL CHECK (weight > 0),
                nationality VARCHAR(64) NOT NULL,
                FOREIGN KEY (user_id) REFERENCES user_registration(user_id) 
                    ON DELETE CASCADE ON UPDATE CASCADE
            );
        `);

        // Create avail_challenges table
        db.run(`
            CREATE TABLE IF NOT EXISTS avail_challenges (
                challenge_id INTEGER PRIMARY KEY AUTOINCREMENT,
                challenge_type VARCHAR(50) NOT NULL,
                challenge_name VARCHAR(256) NOT NULL,
                challenge_deadline DATE DEFAULT(CURRENT_DATE),
                activity_id INTEGER NOT NULL,
                participants_num INTEGER NOT NULL,
                badge_id INTEGER NOT NULL,
                target_value INTEGER DEFAULT 100,
                FOREIGN KEY (activity_id) REFERENCES activity_log(log_id) ON UPDATE CASCADE,
                FOREIGN KEY (badge_id) REFERENCES badge_records(badge_id) ON UPDATE CASCADE
            );
        `);

        // Create user_challenges table
        db.run(`
            CREATE TABLE IF NOT EXISTS user_challenges (
                user_challenge_id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                challenge_id INTEGER NOT NULL,
                status VARCHAR(10) NOT NULL CHECK (status IN ('Active', 'Completed')),
                FOREIGN KEY (user_id) REFERENCES user_profile(user_id) ON UPDATE CASCADE,
                FOREIGN KEY (challenge_id) REFERENCES avail_challenges(challenge_id) ON UPDATE CASCADE
            );
        `);

        // Create activity_type table
        db.run(`
            CREATE TABLE activity_type (
                activity_id INTEGER PRIMARY KEY AUTOINCREMENT,
                activity_name TEXT NOT NULL,
                activity_multiplier DECIMAL(3, 2) NOT NULL CHECK(activity_multiplier > 0)
            );
        `);

        // Create activity_log table
        db.run(`
            CREATE TABLE activity_log (
                log_id INTEGER PRIMARY KEY AUTOINCREMENT,
                activity_duration INTEGER NOT NULL CHECK(activity_duration > 0),
                distance DECIMAL(5, 2) NOT NULL CHECK(distance > 0),
                step_count INTEGER NOT NULL DEFAULT 0 CHECK(step_count >= 0),
                calories_burnt DECIMAL(5, 2),
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                activity_id INTEGER,
                user_id INTEGER NOT NULL,
                FOREIGN KEY (activity_id) REFERENCES activity_type(activity_id) ON DELETE CASCADE ON UPDATE CASCADE,
                FOREIGN KEY (user_id) REFERENCES user_registration(user_id) ON DELETE CASCADE ON UPDATE CASCADE
            );
        `);

        // Create friendship table
        db.run(`
            CREATE TABLE IF NOT EXISTS friendship (
                friendship_id INTEGER PRIMARY KEY AUTOINCREMENT,
                responder_id INTEGER NOT NULL,
                requester_id INTEGER NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                status TEXT NOT NULL CHECK (status IN('Accepted', 'Pending', 'Rejected')),
                FOREIGN KEY (responder_id) REFERENCES user_registration(user_id) ON DELETE CASCADE,
                FOREIGN KEY (requester_id) REFERENCES user_registration(user_id) ON DELETE CASCADE,
                UNIQUE (responder_id, requester_id)
            );
        `);

        // Create badge_records table
        db.run(`
            CREATE TABLE IF NOT EXISTS badge_records (
                badge_id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                challenge_id INTEGER,
                badge_name TEXT NOT NULL,
                achieved_date DATE DEFAULT (CURRENT_DATE),
                FOREIGN KEY (user_id) REFERENCES user_profile(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
                FOREIGN KEY (challenge_id) REFERENCES user_challenges(user_challenge_id) ON DELETE CASCADE ON UPDATE CASCADE
            );
        `);
        
        // Create leaderboard table
        db.run(`
            CREATE TABLE IF NOT EXISTS leaderboard (
                leaderboard_id INTEGER PRIMARY KEY AUTOINCREMENT,
                rank INTEGER NOT NULL,
                challenge_id INTEGER,
                user_id INTEGER,
                distance DECIMAL(5, 2) NOT NULL,
                time DECIMAL(5, 2) NOT NULL,
                achieved_date DATE DEFAULT (CURRENT_DATE),
                FOREIGN KEY (challenge_id) REFERENCES user_challenges(user_challenge_id) ON DELETE CASCADE ON UPDATE CASCADE,
                FOREIGN KEY (user_id) REFERENCES user_profile(user_id) ON DELETE CASCADE ON UPDATE CASCADE
            );
        `);
    }
});

// Export the database instance for use in other modules
module.exports = db;
