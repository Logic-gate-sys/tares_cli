-- +goose up 
-- +goose StatementBegin
CREATE TABLE rooms IF NOT EXISTS (
    id SERIAL PRIMARY KEY,
    room_name VARCHAR(225) NOT NULL , -- NAME OF GAME ROOM 
    creator_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_occupied BOOLEAN DEFAULT false, -- if someone creator is online or any joins room , then occupied is true
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
)

CREATE TABLE games IF NOT EXISTS (
    id SERIAL PRIMARY KEY,
    room_id    INT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE , -- ROOM OF GAME 
    players  users(id)[] NOT NULL,  -- ARRAY OF ALL PLAYERS IN A ROOM 
    CREATE INDEX idx_games_rooms ON rooms(id) -- index on rooms_id 
)

CREATE TABLE scores IF NOT EXISTS (
    id  BIGSERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    game_id INT REFERENCES games(id) ON DELETE CASCADE,
    score  INT DEFAULT 0
)
-- +goose StatementEnd


-- +goose down
-- +goose StatementBegin
DROP TABLE scores;
DROP TABLE games ;
DROP TABLE rooms ;
-- +goose StatementEnd