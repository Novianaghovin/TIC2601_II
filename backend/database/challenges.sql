INSERT INTO avail_challenges (challenge_type, challenge_name, challenge_deadline, activity_id, participants_num, badge_id) VALUES
('Running', 'Oct 2024 5km Run Challenge', '2023-10-31', 1, 50, 1),
('Running', 'Nov 2024 5km Run Challenge', '2023-11-31', 2, 50, 2),
('Running', 'Dec 2024 5km Run Challenge', '2023-12-31', 3, 50, 3);

INSERT INTO user_challenges (user_id, challenge_id, status) VALUES
(1, 1, 'Active'),
(2, 2, 'Active'),
(3, 3, 'Active');
