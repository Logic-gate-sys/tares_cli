-- +goose up 
-- +goose StatementBegin
CREATE TYPE player_level as ENUM (
    "beginner",
    "intermediate",
    "professional",
    "expert",
    "genius"
)
CREATE TABLE
    users IF NOT EXISTS (
        id BIGSERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        username VARCHAR(255) NOT NULL,
        p_level player_level DEFAULT "beginner",
        bio TEXT,
        total_score INT   DEFAULT 0 ,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, 
        last_login TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CREATE INDEX idx_users_email on (email)
    )

-- +goose StatementEnd


-- +goose down
-- +goose StatementBegin
DROP TABLE users;
-- +goose StatementEnd