-- +goose up 
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS tokens(
    hash  BYTEA PRIMARY KEY,
    user_id Int NOT NULL REFERENCES users(id) ON DELETE CASCADE, 
    expiry TIMESTAMP(0) WITH TIME ZONE NOT NULL, 
    scope text NOT NULL
)

-- +goose StatementEnd



-- goose Down
-- +goose StatementBegin
DROP TABLE tokens ;
-- +goose StatementEnd