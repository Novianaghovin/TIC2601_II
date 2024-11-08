CREATE TABLE  avail_challenges (
	challenge_id INTEGER PRIMARY KEY AUTOINCREMENT,
	challenge_type VARCHAR(50) NOT NULL,
	challenge_deadline DATE DEFAULT(CURRENT_DATE),
	participants_num INTEGER NOT NULL,
	status VARCHAR(10) NOT NULL CHECK (status IN ('Active', 'Expired')),
	badge_id INTEGER NOT NULL,
	FOREIGN KEY (badge_id) REFERENCES badge_type(badge_id) ON UPDATE CASCADE
);


CREATE TABLE user_challenges (
    user_challenge_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    challenge_id INTEGER NOT NULL,
    status VARCHAR(10) NOT NULL CHECK (status IN ('active', 'completed', 'expired')),
    FOREIGN KEY (user_id) REFERENCES user_profile(user_id) ON UPDATE CASCADE,
    FOREIGN KEY (challenge_id) REFERENCES avail_challenges(challenge_id) ON UPDATE CASCADE
);

-- Insert data into the avail_challenges table
INSERT INTO avail_challenges (challenge_type, challenge_deadline, participants_num, status, badge_id) VALUES
    ('running', DATE('now', '+10 days'), 50, 'Active', 1),
    ('running', DATE('now', '+5 days'), 30, 'Expired', 2),
    ('running', DATE('now', '+15 days'), 75, 'Active', 3),
    ('walking', DATE('now', '+2 days'), 100, 'Expired', 4),
    ('walking', DATE('now', '+20 days'), 25, 'Active', 5),
    ('walking', DATE('now', '+1 day'), 60, 'Expired', 6);


-- sample data
INSERT INTO user_challenges (user_id, challenge_id, status) VALUES
(1, 1, 'Active'),
(2, 2, 'Active'),
(3, 3, 'Active');

- sample
INSERT INTO user_challenges (user_id, challenge_id, status) VALUES
    (1, 1, 'active'),
    (1, 2, 'completed'),
    (1, 3, 'expired'),
    (1, 4, 'completed'),
    (1, 5, 'active'),
    (1, 6, 'expired'),
    (2, 1, 'active'),
    (2, 2, 'completed'),
    (2, 3, 'expired'),
    (2, 4, 'expired'),
    (2, 5, 'active'),
    (2, 6, 'completed');
