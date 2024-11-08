CREATE TABLE badge_type (
        badge_id INTEGER PRIMARY KEY AUTOINCREMENT,
        activity_id INTEGER NOT NULL,
        badge_name VARCHAR(256),
        FOREIGN KEY (activity_id) REFERENCES activity_type (activity_id) ON UPDATE CASCADE
);


--insert sample data
INSERT INTO badge_type (activity_id, badge_name) VALUES 
(1, '5km running'), -- run 1 activity_id
(1, '10km running'),
(1, '21km running'),
(4, '10k steps walking'), -- walk 4 activity_id
(4, '20k steps walking'),
(4, '30k steps walking'); 


