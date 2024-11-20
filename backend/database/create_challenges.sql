CREATE TABLE avail_challenges (
    challenge_id INTEGER PRIMARY KEY AUTOINCREMENT,
    challenge_type VARCHAR(50) NOT NULL,
    challenge_deadline DATE DEFAULT CURRENT_DATE,
    activity_id INTEGER NOT NULL,
    participants_num INTEGER NOT NULL,
    status VARCHAR(10) CHECK(status IN ('Completed','Active', 'Expired')), -- editted from YK code to corrected sql create table
    badge_id INTEGER NOT NULL,
    distance INTEGER NOT NULL,
    target_value INTEGER DEFAULT 100,
    FOREIGN KEY (activity_id) REFERENCES activity_log(log_id) ON UPDATE CASCADE,
    FOREIGN KEY (badge_id) REFERENCES badge_type(badge_id) ON UPDATE CASCADE
);

CREATE TABLE user_challenges (
    user_challenge_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    challenge_id INTEGER NOT NULL,
    activity_id INTEGER NOT NULL,
    status VARCHAR(10) NOT NULL CHECK (status IN ('Active', 'Completed', 'Expired')),
    progress DECIMAL(5,2) DEFAULT 0,
    joined_at DATE DEFAULT(CURRENT_DATE),
    joined_month TEXT GENERATED ALWAYS AS (strftime('%Y-%m', joined_at)) STORED, -- Generated column
    FOREIGN KEY (user_id) REFERENCES user_profile(user_id) ON UPDATE CASCADE,
    FOREIGN KEY (challenge_id) REFERENCES avail_challenges(challenge_id) ON UPDATE CASCADE,
    FOREIGN KEY (activity_id) REFERENCES activity_log(log_id) ON UPDATE CASCADE,
    CONSTRAINT unique_user_challenge_per_month UNIQUE (user_id, challenge_id, joined_month)
);


INSERT INTO avail_challenges (challenge_type, challenge_deadline, activity_id, participants_num, status, badge_id, distance, target_value)
VALUES
-- Running challenges
('Running', DATE('now', 'start of month', '+1 month', '-1 day'), 1, 5, 'Active', 1, 5, 100),
('Running', DATE('now', 'start of month', '+1 month', '-1 day'), 1, 3, 'Active', 2, 10, 100),
('Running', DATE('now', 'start of month', '+1 month', '-1 day'), 1, 4, 'Active', 3, 21, 100);

INSERT INTO avail_challenges (challenge_type, challenge_deadline, activity_id, participants_num, status, badge_id, distance, target_value)
VALUES
-- Walking challenges
('Walking', DATE('now', 'start of month', '+1 month', '-1 day'), 4, 3, 'Active', 4, 5, 100),
('Walking', DATE('now', 'start of month', '+1 month', '-1 day'), 4, 4, 'Active', 5, 5, 100),
('Walking', DATE('now', 'start of month', '+1 month', '-1 day'), 4, 2, 'Active', 6, 5, 100);

