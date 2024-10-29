
CREATE TABLE badge_records (
            badge_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            challenge_id INTEGER,
            badge_name TEXT NOT NULL,
            achieved_date DATE DEFAULT (CURRENT_DATE),
            FOREIGN KEY (user_id) REFERENCES user_profile(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
            FOREIGN KEY (challenge_id) REFERENCES user_challenges(user_challenge_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE leaderboard (
                leaderboard_id INTEGER PRIMARY KEY AUTOINCREMENT,
                rank INTEGER NOT NULL CHECK (rank > 0),
                challenge_id INTEGER,
                user_id INTEGER,
                distance DECIMAL(5, 2) NOT NULL CHECK (distance > 0),
                time DECIMAL(5, 2) NOT NULL CHECK (distance > 0),
                achieved_date DATE DEFAULT (CURRENT_DATE),
                FOREIGN KEY (challenge_id) REFERENCES user_challenges(user_challenge_id) ON DELETE CASCADE ON UPDATE CASCADE,
                FOREIGN KEY (user_id) REFERENCES user_profile(user_id) ON DELETE CASCADE ON UPDATE CASCADE
);
