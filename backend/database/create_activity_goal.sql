CREATE TABLE activity_type (
    activity_id INTEGER PRIMARY KEY AUTOINCREMENT,
    activity_name TEXT NOT NULL,
    activity_multiplier DECIMAL(3, 2) NOT NULL CHECK(activity_multiplier > 0)
);

CREATE TABLE activity_log (
    log_id INTEGER PRIMARY KEY AUTOINCREMENT,
    activity_duration INTEGER NOT NULL CHECK(activity_duration > 0),
    distance DECIMAL(5, 2) NOT NULL CHECK(distance > 0),
    step_count INTEGER NOT NULL DEFAULT 0 CHECK(step_count >= 0),
    calories_burnt DECIMAL(5, 2),
    timestamp DATETIME DEFAULT (DATETIME(CURRENT_TIMESTAMP, '+8 hours')),
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
    target_distance DECIMAL(5, 2) NOT NULL CHECK(target_distance > 0), -- Added column for target distance
    progress DECIMAL(5, 2) DEFAULT 0,  -- Default progress starts at 0
    user_id INTEGER NOT NULL,
    activity_id INTEGER, -- This now references activity_log for better data association
    FOREIGN KEY (activity_id) REFERENCES activity_log(log_id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user_registration(user_id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
);

-- Trigger to update progress in the goals table
CREATE TRIGGER update_goal_progress
AFTER INSERT ON activity_log
BEGIN
    UPDATE goals
    SET progress = MIN(100, (
        SELECT SUM(al.distance) * 100.0 / g.target_distance
        FROM activity_log al
        WHERE al.user_id = NEW.user_id AND al.activity_id = g.activity_id
    ))
    FROM goals g
    WHERE g.user_id = NEW.user_id AND g.activity_id = NEW.activity_id;
END;


--insert sample data
INSERT INTO activity_type (activity_name, activity_multiplier) VALUES 
('Run', 10.00),   -- MET value for running
('Swim', 8.00),   -- MET value for swimming
('Cycle', 8.00),  -- MET value for cycling
('Walk', 3.80);   -- MET value for walking

INSERT INTO activity_log (activity_duration, distance, step_count, calories_burnt, activity_id, user_id) VALUES 
(30, 5.00, 4000, 300.00, 1, 1),  -- Running for 30 mins
(60, 1.00, 0, 350.00, 2, 1),  -- Swimming for 60 mins
(45, 15.00, 0, 450.00, 3, 1), -- Cycling for 45 mins
(30, 2.00, 3000, 150.00, 4, 1);  -- Walking for 30 mins

INSERT INTO goals (goal_name, goal_deadline, target_distance, progress, user_id, activity_id) VALUES 
('Run 5 km', '2024-11-30', 5.00, 0, 1, 1), -- Goal for running 5 km by user 1
('Walk 3 km', '2024-11-30', 3.00, 0, 1, 2), -- Goal for walking 3 km by user 1
('Cycle 50 km', '2024-11-30', 50.00, 0, 1, 3), -- Goal for cycling 50 km by user 1
('Swim 2 km', '2024-11-30', 2.00, 0, 1, 4); -- Goal for swimming 2 km by user 1