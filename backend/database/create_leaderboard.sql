CREATE TABLE "leaderboard" (
	"leaderboard_id"	INTEGER,
	"rank"	INTEGER NOT NULL CHECK("rank" > 0),
	"challenge_id"	INTEGER,
	"user_id"	INTEGER,
	"distance"	DECIMAL(5, 2) NOT NULL CHECK("distance" > 0),
	"time_stamp"	DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP UNIQUE,
	PRIMARY KEY("leaderboard_id" AUTOINCREMENT),
	FOREIGN KEY("challenge_id") REFERENCES "user_profile"("user_id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO leaderboard (rank, challenge_id, user_id, distance, time_stamp) VALUES
(1, 1, 1, 5, '2024-01-01 14:30'),
(2, 2, 2, 10, '2024-01-02 14:30'),
(3, 3, 3, 21, '2024-01-03 14:30');

