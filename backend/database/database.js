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

    // PLEASE ADD YOUR DATABASE BELOW
    
        // Create user_registration table
     db.run(`
        CREATE TABLE IF NOT EXISTS user_registration (
            user_id INTEGER PRIMARY KEY AUTOINCREMENT,
            first_name VARCHAR(256) NOT NULL,
            last_name VARCHAR(256) NOT NULL,
            email VARCHAR(256) NOT NULL UNIQUE CHECK (email LIKE '%_@_%._%'),
            password VARCHAR(25) NOT NULL
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
                ON DELETE CASCADE 
                ON UPDATE CASCADE
        );
    `);
        
    
    // Create the friendship
    db.run(`
        CREATE TABLE IF NOT EXISTS friendship (
            friendship_id INTEGER PRIMARY KEY AUTOINCREMENT,  
            responder_id INTEGER NOT NULL,                         
            requester_id INTEGER NOT NULL,                         
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (responder_id) REFERENCES users_registration(user_id) ON DELETE CASCADE,
            FOREIGN KEY (requester_id) REFERENCES users_registration(user_id) ON DELETE CASCADE,
            UNIQUE (responder_id, requester_id)
    )`, (err) => {
        if (err) {
            console.error('Error creating Badge_Records table:', err.message);
        } else {
            console.log('Badge_Records table created or already exists.');
        }
    });    
        
        // Create the use challenges table pend YK confirmation
        
    /* db.run(`
        CREATE TABLE user_challenges (
            user_challenge_id INTEGER PRIMARY KEY AUTOINCREMENT, 
            user_id INTEGER NOT NULL,               
            challenge_id INTEGER NOT NULL,          
            completion_status VARCHAR(50),        
            progress INTEGER,                    
            start_date DATE,                       
            end_date DATE,                          
            FOREIGN KEY (user_id) REFERENCES User_Registration(user_id),        
            FOREIGN KEY (challenge_id) REFERENCES Challenges(challenge_id)  
        )`, (err) => {
            if (err) {
                console.error('Error creating Badge_Records table:', err.message);
            } else {
                console.log('Badge_Records table created or already exists.');
            }
    });  */
     
        // since we agree that badge name == challenge name there is no need to input badge name in badge_records database
    db.run(`
        CREATE TABLE IF NOT EXISTS badge_records (
            badge_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            challenge_id INTEGER,
            achieved_date DATE,
            FOREIGN KEY (user_id) REFERENCES User_Profile(user_id),
            FOREIGN KEY (challenge_id) REFERENCES Challenge(challenge_id)
    )`, (err) => {
        if (err) {
            console.error('Error creating Badge_Records table:', err.message);
        } else {
            console.log('Badge_Records table created or already exists.');
        }
    });

    }
});


// Export the database instance for use in other modules
module.exports = db;