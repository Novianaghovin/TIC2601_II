CREATE TABLE "activity_log" (
	"log_id"	INTEGER,
	"activity_duration"	INTEGER NOT NULL CHECK("activity_duration" > 0),
	"distance"	DECIMAL(5, 2) NOT NULL CHECK("distance" > 0),
	"step_count"	INTEGER NOT NULL CHECK("step_count" > 0),
	"calories_burnt"	DECIMAL(5, 2),
	"timestamp"	DATETIME DEFAULT CURRENT_TIMESTAMP,
	"activity_id"	INTEGER,
	"user_id"	INTEGER,
	PRIMARY KEY("log_id" AUTOINCREMENT),
	FOREIGN KEY("user_id") REFERENCES "user_registration"("user_id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "activity_type" (
	"activity_id"	INTEGER,
	"activity_name"	TEXT NOT NULL,
	"activity_multiplier"	DECIMAL(3, 2) NOT NULL CHECK("activity_multiplier" > 0),
	PRIMARY KEY("activity_id" AUTOINCREMENT),
	FOREIGN KEY("activity_id") REFERENCES "activity_log"("activity_id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "goals" (
	"goal_id"	INTEGER NOT NULL,
	"goal_name"	TEXT NOT NULL,
	"goal_deadline"	DATE NOT NULL CHECK("goal_deadline" >= CURRENT_DATE),
	"progress"	DECIMAL(5, 2),
	"user_id"	INTEGER,
	"activity_id"	INTEGER,
	PRIMARY KEY("goal_id" AUTOINCREMENT),
	FOREIGN KEY("activity_id") REFERENCES "activity_log"("activity_id") ON DELETE CASCADE ON UPDATE CASCADE,
	FOREIGN KEY("user_id") REFERENCES "user_registration"("user_id") ON DELETE CASCADE ON UPDATE CASCADE
);
