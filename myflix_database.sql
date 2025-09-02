-- =========================================================
-- myflix schema + seed (PostgreSQL)
-- Idempotent table creation, then sample data
-- =========================================================
ROLLBACK;
SELECT name, COUNT(*) FROM public.genres GROUP BY name HAVING COUNT(*) > 1;
SELECT name, COUNT(*) FROM public.directors GROUP BY name HAVING COUNT(*) > 1;
-- delete or fix extras, then try again
SELECT GenreID, Name FROM Genres ORDER BY GenreID;
SELECT DirectorID, Name FROM Directors ORDER BY DirectorID;


-- Work in the public schema
SET search_path TO public;

-- create some tables 
CREATE TABLE IF NOT EXISTS Genres (
	GenreID serial PRIMARY KEY,
	Name varchar(50) NOT NULL,
	Description varchar(1000)
);

CREATE TABLE IF NOT EXISTS Directors (
	DirectorID serial PRIMARY KEY,
	Name varchar(50) NOT NULL,
	Bio varchar(1000),
	Birthyear date,
	Deathyear date
);


CREATE TABLE IF NOT EXISTS Movies (
  MovieID     serial PRIMARY KEY,
  Title       varchar(100)  NOT NULL,
  Description varchar(1000),
  DirectorID  integer       NOT NULL,
  GenreID     integer       NOT NULL,
  ImageURL    varchar(300),
  Featured    boolean       DEFAULT false,
  CONSTRAINT fk_movies_genre
    FOREIGN KEY (GenreID) REFERENCES Genres (GenreID),
  CONSTRAINT fk_movies_director
    FOREIGN KEY (DirectorID) REFERENCES Directors (DirectorID)
);

CREATE TABLE IF NOT EXISTS Users (
  UserID      serial PRIMARY KEY,
  Username    varchar(50)  NOT NULL UNIQUE,
  Password    varchar(200) NOT NULL,   -- plain text only for demo!
  Email       varchar(120) NOT NULL UNIQUE,
  Birth_date  date
);

CREATE TABLE IF NOT EXISTS User_Movies (
  UserMovieID serial PRIMARY KEY,
  UserID      integer NOT NULL,
  MovieID     integer NOT NULL,
  CONSTRAINT fk_um_user
    FOREIGN KEY (UserID)  REFERENCES Users (UserID)  ON DELETE CASCADE,
  CONSTRAINT fk_um_movie
    FOREIGN KEY (MovieID) REFERENCES Movies (MovieID) ON DELETE CASCADE,
  CONSTRAINT uq_user_movie UNIQUE (UserID, MovieID)   -- prevent duplicates
);


INSERT INTO Genres (Name, Description) VALUES
	('Action', 'High-intensity films with stunts and set pieces'),
	('Drama', 'Character-driven stories and serious themes'),
	('Comedy', 'Humorous films designed to make the audinendce laugh');

INSERT INTO Directors (Name, Bio, Birthyear,   Deathyear) VALUES
	('Christopher Nolan', 'Britisch American filmmaker', '1970-03-30', NULL),
	('Greta Gerwig', 'American actress and director', '1983-08-04', NULL),
	('James Cameron', 'Canadian filmmaker and explorer', '1954-08-16', NULL);

INSERT INTO Users (Username, Password, Email, Birth_date) VALUES
  ('alice',  'password123', 'alice@example.com',  '1998-02-15'),
  ('bob',    'secret456',   'bob@example.com',    '1995-06-01'),
  ('carol',  'hunter2',     'carol@example.com',  '2000-11-20');

-- Insert 10 movies
INSERT INTO Movies (Title, Description, DirectorID, GenreID, ImageURL, Featured) VALUES
  ('Inception',     'Dream heist thriller.',                  1, 1, 'inception.png', true),
  ('Interstellar',  'Wormhole mission to save humanity.',     1, 2, 'interstellar.png', false),
  ('The Dark Knight','Batman faces the Joker in Gotham.',     1, 1, 'darkknight.png', true),

  ('Lady Bird',     'Coming-of-age story about a teenager.',  2, 2, 'ladybird.png', false),
  ('Barbie',        'Life in Barbieland is upended.',         2, 1, 'barbie.png', true),
  ('Frances Ha',    'Young woman chasing dreams in NYC.',     2, 1, 'francesha.png', false),

  ('Avatar',        'A paraplegic Marine on Pandora.',        2, 1, 'avatar.png', true),
  ('Titanic',       'Romance aboard RMS Titanic.',            1, 2, 'titanic.png', false),
  ('True Lies',     'A spy balances work and family life.',   2, 1, 'truelies.png', false),
  ('The Abyss',     'Divers encounter an alien underwater.',  1, 2, 'abyss.png', false);


INSERT INTO User_Movies (UserID, MovieID) VALUES
  (4, 32),  -- alice likes Inception
  (4, 33),  -- alice likes Titanic
  (6, 34),  -- bob likes Avatar
  (5, 37);  -- carol likes Barbie


-- Read a single genre by name
SELECT genreid, name, description
FROM genres
WHERE name = 'Action';

-- Get the ID of the genre "Action"
SELECT genreid
FROM genres
WHERE name = 'Action';


-- Update the email of the single user 
UPDATE users
SET email = 'new_email@example.com'
WHERE username = 'alice';

-- 1) Check pairs by director and genre (must be ≥ 2)
SELECT directorid, COUNT(*) AS cnt
FROM movies
GROUP BY directorid
ORDER BY cnt DESC;

SELECT genreid, COUNT(*) AS cnt
FROM movies
GROUP BY genreid
ORDER BY cnt DESC;

-- 2) Check the target movie’s director & genre
SELECT movieid, directorid, genreid
FROM movies
WHERE title = 'Titanic';

-- If that director has ≥3 movies and that genre has ≥3 movies,
-- deleting one will still leave ≥2. Then delete:

DELETE FROM movies
WHERE title = 'Titanic';

