-- +goose up 
-- +goose StatementBegin
CREATE TYPE difficulty_level AS ENUM ("easy","medium","hard","very-hard","extremely-hard","mission-impossible")
CREATE TABLE words IF NOT EXIST (
    id    SERIAL   PRIMARY KEY,
    scrumble text   NOT NULL,
    possible_words  text[] NOT NULL,
    difficulty  difficulty_level DEFAULT "easy",
    CREATE INDEX idx_words_diff ON words(difficulty) -- most of the fetch will be by difficulty level
)
-- +goose StatementEnd

-- +goose down
-- +goose StatementBegin
DROP TABLE words;
-- +goose StatementEnd