 CREATE TABLE IF NOT EXISTS avail_challenges (
    challenge_id INTEGER PRIMARY KEY AUTOINCREMENT,
    challenge_type VARCHAR(50) NOT NULL,
    challenge_name VARCHAR(256) NOT NULL,
    challenge_deadline DATE DEFAULT(CURRENT_DATE),
    activity_id INTEGER NOT NULL,
    participants_num INTEGER NOT NULL,
    badge_id INTEGER NOT NULL,
    FOREIGN KEY (activity_id) REFERENCES activity_log(log_id) ON UPDATE CASCADE,
);

CREATE TABLE user_challenges (
    user_challenge_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    challenge_id INTEGER NOT NULL,
    status VARCHAR(10) NOT NULL CHECK (status IN ('Active', 'Completed')),
    FOREIGN KEY (user_id) REFERENCES user_profile(user_id) ON UPDATE CASCADE,
    FOREIGN KEY (challenge_id) REFERENCES avail_challenges(challenge_id) ON UPDATE CASCADE
);

INSERT INTO avail_challenges (challenge_type, challenge_name, challenge_deadline, activity_id, participants_num, badge_id) VALUES
('Running', 'Oct 2024 5km Run Challenge', '2023-10-31', 1, 50, 1),
('Running', 'Nov 2024 5km Run Challenge', '2023-11-31', 2, 50, 2),
('Running', 'Dec 2024 5km Run Challenge', '2023-12-31', 3, 50, 3);

INSERT INTO user_challenges (user_id, challenge_id, status) VALUES
(1, 1, 'Active'),
(2, 2, 'Active'),
(3, 3, 'Active');
