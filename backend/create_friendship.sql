CREATE TABLE friendship (
    friendship_id INTEGER PRIMARY KEY AUTOINCREMENT,  
    responder_id INTEGER NOT NULL,                         
    requester_id INTEGER NOT NULL,                         
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (responder_id) REFERENCES users_registration(user_id) ON DELETE CASCADE,
    FOREIGN KEY (requester_id) REFERENCES users_registration(user_id) ON DELETE CASCADE,
    UNIQUE (responder_id, requester_id)
);

INSERT INTO friendship (responder_id, requester_id) VALUES 
    (1, 2),
    (1, 3),
    (1, 4),
    (2, 3),
    (2, 4),
    (3, 4),
    (4, 5),
    (5, 6),
    (6, 7),
    (7, 8);