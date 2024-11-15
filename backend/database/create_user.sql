CREATE TABLE user_registration (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name VARCHAR(256) NOT NULL,
    last_name VARCHAR(256) NOT NULL,
    email VARCHAR(256) NOT NULL UNIQUE CHECK (email LIKE '%_@_%._%'),
    password VARCHAR(25) NOT NULL
);

CREATE TABLE user_profile (
    user_id INTEGER PRIMARY KEY, 
    dob DATE NOT NULL CHECK (dob < CURRENT_DATE),
    gender VARCHAR(6) NOT NULL CHECK (gender IN('Male', 'Female', 'Others')),
    height INTEGER NOT NULL CHECK (height > 0),
    weight INTEGER NOT NULL CHECK (weight > 0),
    nationality VARCHAR(64) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user_registration(user_id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
);

-- INSERT 100 USER DATA
INSERT INTO user_registration (first_name, last_name, email, password) VALUES
('Liam', 'OConnor', 'ostrichclimbing@gmail.com', 'password1'),
('Aisha', 'Khan', 'penguinparade@hotmail.com', 'password2'),
('Giovanni', 'Rossi', 'spaghetti_slinger@yahoo.com', 'password3'),
('Cheng', 'Li', 'kungfupanda@yahoo.com', 'password4'),
('Yara', 'Al-Farsi', 'cactusjuicer@gmail.com', 'password5'),
('Nia', 'Smith', 'bouncingbeetle@gmail.com', 'password6'),
('Kofi', 'Owusu', 'sneakyotter@gmail.com', 'password7'),
('Isabella', 'Gonzalez', 'llamajumping@gmail.com', 'password8'),
('Zhang', 'Wei', 'noodlesintheair@yahoo.com', 'password9'),
('Sofia', 'Petrov', 'crazycucumber@hotmail.com', 'password10'),
('Amir', 'Hosseini', 'flyingmonkey@live.com', 'password11'),
('Freya', 'Jensen', 'unicornfarmers@gmail.com', 'password12'),
('Ravi', 'Patel', 'sillysalmon@yahoo.com', 'password13'),
('Fatima', 'Zahra', 'quirkyquokka@gmail.com', 'password14'),
('Emre', 'Yilmaz', 'disco_dolphin@gmail.com', 'password15'),
('Anita', 'Chakraborty', 'marshmallowmonkey@gmail.com', 'password16'),
('Jamal', 'Nasser', 'snailtornado@gmail.com', 'password17'),
('Ines', 'Moreira', 'banana_bandit@gmail.com', 'password18'),
('Kiran', 'Bansal', 'adventurousant@gmail.com', 'password19'),
('Omar', 'Hussein', 'cheeseball_dude@gmail.com', 'password20'),
('Zara', 'Khan', 'merrymarmot@gmail.com', 'password21'),
('Lucas', 'Martinez', 'frogs_and_lizards@yahoo.com', 'password22'),
('Tina', 'Yadav', 'popcornpanda@gmail.com', 'password23'),
('Liam', 'MacGregor', 'flamingofury@gmail.com', 'password24'),
('Nina', 'Kovalenko', 'dancingdolphins@hotmail.com', 'password25'),
('Jasper', 'Smith', 'muffin_maniac@gmail.com', 'password26'),
('Chloe', 'Liu', 'peanutbutterpandas@yahoo.com', 'password27'),
('Eli', 'Goldstein', 'crazycatlady@gmail.com', 'password28'),
('Amina', 'Diab', 'quirkyturtle@yahoo.com', 'password29'),
('Stefan', 'Peterson', 'bouncingbacon@gmail.com', 'password30');

INSERT INTO user_profile (user_id, dob, gender, height, weight, nationality) VALUES
(1, '1995-06-15', 'Male', 180, 75, 'Ireland'),
(2, '1996-07-20', 'Female', 165, 60, 'Pakistan'),
(3, '1992-02-14', 'Male', 175, 70, 'Italy'),
(4, '1994-03-30', 'Female', 170, 55, 'China'),
(5, '1991-04-25', 'Male', 178, 80, 'Oman'),
(6, '1993-05-18', 'Female', 160, 50, 'India'),
(7, '1990-12-01', 'Male', 182, 85, 'Russia'),
(8, '1995-01-22', 'Female', 162, 58, 'Singapore'),
(9, '1988-08-05', 'Male', 177, 76, 'United States'),
(10, '1996-11-30', 'Female', 164, 59, 'Malaysia'),
(11, '1993-02-20', 'Male', 185, 90, 'United Kingdom'),
(12, '1990-03-15', 'Female', 168, 65, 'Australia'),
(13, '1992-04-12', 'Male', 180, 72, 'United States'),
(14, '1994-05-10', 'Female', 158, 52, 'Canada'),
(15, '1991-06-22', 'Male', 176, 70, 'United Kingdom'),
(16, '1996-07-18', 'Female', 165, 58, 'Thailand'),
(17, '1990-08-29', 'Male', 179, 78, 'United States'),
(18, '1992-09-15', 'Female', 170, 66, 'Vietnam'),
(19, '1993-10-05', 'Male', 184, 82, 'United Kingdom'),
(20, '1995-11-12', 'Female', 161, 57, 'Australia'),
(21, '1990-12-14', 'Male', 181, 80, 'United States'),
(22, '1993-01-19', 'Female', 163, 62, 'Canada'),
(23, '1994-02-08', 'Male', 178, 74, 'United Kingdom'),
(24, '1995-03-02', 'Female', 162, 56, 'Australia'),
(25, '1991-04-20', 'Male', 176, 77, 'Indonesia'),
(26, '1992-05-15', 'Female', 160, 51, 'Mexico'),
(27, '1993-06-30', 'Male', 181, 82, 'France'),
(28, '1994-07-25', 'Female', 164, 64, 'Germany'),
(29, '1995-08-19', 'Male', 179, 73, 'Japan'),
(30, '1996-09-14', 'Female', 165, 55, 'South Korea');
(96, '1992-03-15', 'Female', 163, 60, 'Malaysia'),
(97, '1993-04-20', 'Male', 180, 82, 'Thailand'),
(98, '1994-05-28', 'Female', 168, 66, 'Mexico'),
(99, '1995-06-30', 'Male', 178, 75, 'Indonesia'),
(100, '1996-07-18', 'Female', 164, 62, 'Singapore');
