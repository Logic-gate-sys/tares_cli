-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS rooms (
    id BIGSERIAL PRIMARY KEY,
    owner_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    capacity INT NOT NULL DEFAULT 4,
    status VARCHAR(50) NOT NULL DEFAULT 'waiting', -- 'waiting', 'playing', 'finished', 'iddle'
    icon VARCHAR(255) NOT NULL DEFAULT '',
    icon_bg_class TEXT NOT NULL,
    icon_text_color_class TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Active player membership (handles join/leave)
CREATE TABLE IF NOT EXISTS room_players (
    room_id BIGINT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (room_id, user_id)
);

-- Persists mid-game moves, state snapshots, and game history
CREATE TABLE IF NOT EXISTS game_sessions (
    id BIGSERIAL PRIMARY KEY,
    room_id BIGINT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    state JSONB NOT NULL DEFAULT '{}'::jsonb, -- active match data, turns, scores
    status VARCHAR(50) NOT NULL DEFAULT 'in_progress', -- 'in_progress', 'completed'
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ
);
-- +goose StatementEnd


-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS game_sessions;
DROP TABLE IF EXISTS room_players;
DROP TABLE IF EXISTS rooms;
-- +goose StatementEnd