CREATE TABLE activity_type (
    activity_id INTEGER PRIMARY KEY AUTOINCREMENT,
    activity_name TEXT NOT NULL,
    activity_multiplier DECIMAL(3, 2) NOT NULL CHECK(activity_multiplier > 0)
);

CREATE TABLE activity_log (
    log_id INTEGER PRIMARY KEY AUTOINCREMENT,
    activity_duration INTEGER NOT NULL CHECK(activity_duration > 0),
    distance DECIMAL(5, 2) NOT NULL CHECK(distance > 0),
    step_count INTEGER NOT NULL CHECK(step_count > 0),
    calories_burnt DECIMAL(5, 2),
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    activity_id INTEGER,
    user_id INTEGER NOT NULL,
    FOREIGN KEY (activity_id) REFERENCES activity_type(activity_id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user_registration(user_id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
);

CREATE TABLE goals (
    goal_id INTEGER PRIMARY KEY AUTOINCREMENT,
    goal_name TEXT NOT NULL,
    goal_deadline DATE NOT NULL CHECK(goal_deadline >= CURRENT_DATE),
    progress DECIMAL(5, 2),
    user_id INTEGER NOT NULL,
    activity_id INTEGER,
    FOREIGN KEY (activity_id) REFERENCES activity_type(activity_id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user_registration(user_id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
);

--insert sample data
INSERT INTO activity_type (activity_name, activity_multiplier) VALUES 
('Run', 10.00),   -- MET value for running
('Swim', 8.00),   -- MET value for swimming
('Cycle', 8.00),  -- MET value for cycling
('Walk', 3.80);   -- MET value for walking

INSERT INTO activity_log (activity_duration, distance, step_count, calories_burnt, activity_id, user_id) VALUES 
(30, 5.00, 4000, 300.00, 1, 1),  -- Running for 30 mins
(60, 1.00, 2000, 350.00, 2, 1),  -- Swimming for 60 mins
(45, 15.00, 7000, 450.00, 3, 1), -- Cycling for 45 mins
(30, 2.00, 3000, 150.00, 4, 1);  -- Walking for 30 mins

INSERT INTO goals (goal_name, goal_deadline, progress, user_id, activity_id) VALUES 
('Run 5 km', '2025-03-31', 0.00, 1, 1),
('Swim 2 km', '2025-02-28', 0.00, 1, 2),
('Cycle 50 km', '2025-01-31', 0.00, 1, 3),
('Walk 10,000 steps', '2025-01-15', 0.00, 1, 4);
