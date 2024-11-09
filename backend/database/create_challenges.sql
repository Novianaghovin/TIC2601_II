CREATE TABLE  avail_challenges (
	challenge_id INTEGER PRIMARY KEY AUTOINCREMENT,
	challenge_type VARCHAR(50) NOT NULL,
	challenge_deadline DATE DEFAULT(CURRENT_DATE),
	participants_num INTEGER NOT NULL,
	status VARCHAR(10) NOT NULL CHECK (status IN ('Active', 'Expired')),
	badge_id INTEGER NOT NULL,
	activity_id INTEGER NOT NULL,
	distance INTERGER CHECK(distance IN ('5', '10' ,'21', '42')),
        target_value INTEGER DEFAULT 100,
	FOREIGN KEY (activity_id) REFERENCES activity_log(log_id) ON UPDATE CASCADE,
	FOREIGN KEY (badge_id) REFERENCES badge_type(badge_id) ON UPDATE CASCADE
);


CREATE TABLE user_challenges (
    user_challenge_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    challenge_id INTEGER NOT NULL,
    activity_id INTEGER NOT NULL,	
    status VARCHAR(10) NOT NULL CHECK (status IN ('active', 'completed', 'expired')),
    progress DECIMAL (5,2),
    FOREIGN KEY (user_id) REFERENCES user_profile(user_id) ON UPDATE CASCADE,
    FOREIGN KEY (challenge_id) REFERENCES avail_challenges(challenge_id) ON UPDATE CASCADE
    FOREIGN KEY (activity_id) REFERENCES activity_log(log_id)
);


-- Insert data into the avail_challenges table
INSERT INTO avail_challenges (challenge_type, challenge_deadline, activity_id, participants_num, status , badge_id, distance) VALUES
('Running',  '2023-10-31', 1, 50, 'Active', 1, 5),
('Running',  '2023-11-31', 2, 50, 'Active', 2, 5),
('Running',  '2023-12-31', 3, 50, 'Active', 3, 5);

INSERT INTO user_challenges (user_id, challenge_id,activity_id, status, progress) VALUES
(1, 1, 1, 'Active', 0.00),
(2, 2, 2, 'Active', 0.00),
(3, 3, 3, 'Active', 0.00);
