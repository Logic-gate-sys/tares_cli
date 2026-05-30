-- +goose up 
-- +goose StatementBegin

-- Games hold a reference to room an participants as well as scores reference
CREATE TABLE IF NOT EXISTS  game (
    id SERIAL PRIMARY KEY,
    winner_id INT NOT NULL REFERENCES users(id) on DELETE CASCADE,
    rounds INT NOT NULL DEFAULT 3 -- games by defaut take 3 rounds 
);

-- Room keeps a historical account of games
CREATE TABLE IF NOT EXISTS  room (
    id SERIAL PRIMARY KEY,
    name VARCHAR(225) NOT NULL , 
    creator_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    game_id    INT NOT NULL REFERENCES game(id) ON DELETE CASCADE, -- which game took place here 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP -- When was this room ended 
);
-- Room index 
CREATE INDEX room_idx ON  room(id, game_id);



-- Scores keep track of the players scores in a game: inserted after a game
CREATE TABLE IF NOT EXISTS  score (
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    game_id INT REFERENCES game(id) ON DELETE CASCADE,
    score  INT DEFAULT 0,
    PRIMARY KEY (user_id, game_id)
);

CREATE INDEX score_idx ON score(user_id, game_id);

-- game room is supposed to act like map[games]scores of users 
CREATE TABLE IF NOT EXISTS game_room (
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    room_id INT NOT NULL REFERENCES room(id) ON DELETE CASCADE,
    game_id INT NOT NULL REFERENCES game(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, room_id)
);

-- +goose StatementEnd


-- +goose down
-- +goose StatementBegin
DROP TABLE score;
DROP TABLE game;
DROP TABLE room ;
DROP TABLE game_room;
-- +goose StatementEnd