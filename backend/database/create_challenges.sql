 CREATE TABLE avail_challenges (
    challenge_id INTEGER PRIMARY KEY AUTOINCREMENT,
    challenge_type VARCHAR(50) NOT NULL,
    challenge_deadline DATE DEFAULT(CURRENT_DATE),
    activity_id INTEGER NOT NULL,
    participants_num INTEGER NOT NULL,
    status VARCHAR(10) CHECK(status IS 'Active'),
    badge_id INTEGER NOT NULL,
    distance INTEGER NOT NULL,
    target_value DEFAULT 100,
    FOREIGN KEY (activity_id) REFERENCES activity_log(log_id) ON UPDATE CASCADE,
    FOREIGN KEY (badge_id) REFERENCES badge_type(badge_id) ON UPDATE CASCADE
);

CREATE TABLE user_challenges (
    user_challenge_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    challenge_id INTEGER NOT NULL,
    activity_id INTEGER NOT NULL,
    status VARCHAR(10) NOT NULL CHECK (status IN ('Active', 'Completed')),
    progress DECIMAL(5,2) DEFAULT 0,
    joined_at DATE DEFAULT(CURRENT_DATE),
    FOREIGN KEY (user_id) REFERENCES user_profile(user_id) ON UPDATE CASCADE,
    FOREIGN KEY (challenge_id) REFERENCES avail_challenges(challenge_id) ON UPDATE CASCADE,
    FOREIGN KEY (activity_id) REFERENCES activity_log(log_id) ON UPDATE CASCADE
);

INSERT INTO avail_challenges (challenge_type, challenge_deadline, activity_id, participants_num, status , badge_id, distance) VALUES
('Running',  '2023-10-31', 1, 50, 'Active', 1, 5),
('Running',  '2023-11-31', 2, 50, 'Active', 2, 10),
('Running',  '2023-12-31', 3, 50, 'Active', 3, 15),
('Walking',  '2024-01-01', 4, 50, 'Active', 4, 5);

