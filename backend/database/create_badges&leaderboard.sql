
CREATE TABLE IF NOT EXISTS badge_records (
            badge_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            challenge_id INTEGER,
            badge_name TEXT NOT NULL,
            achieved_date DATE DEFAULT (CURRENT_DATE),
            FOREIGN KEY (user_id) REFERENCES User_Profile(user_id) 
            ON DELETE CASCADE ON UPDATE CASCADE ,
            FOREIGN KEY (challenge_id) REFERENCES Challenge(challenge_id) 
            ON DELETE CASCADE ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS leaderboard (
            leaderboard_id INTEGER PRIMARY KEY AUTOINCREMENT,
            rank INTEGER NOT NULL,
            challenge_id INTEGER,
            user_id INTEGER,
            distance DECIMAL(5, 2) NOT NULL,
            time DECIMAL(5, 2) NOT NULL,
            achieved_date DATE DEFAULT (CURRENT_DATE),
            FOREIGN KEY (challenge_id) REFERENCES Challenge(challenge_id) 
            ON DELETE CASCADE ON DELETE CASCADE ON UPDATE CASCADE,
            FOREIGN KEY (user_id) REFERENCES User_Profile(user_id) 
            ON DELETE CASCADE ON DELETE CASCADE ON UPDATE CASCADE
);