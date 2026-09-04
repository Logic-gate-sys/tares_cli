-- +goose up 
-- +goose StatementBegin

ALTER TABLE users 
  ADD COLUMN avatar_url VARCHAR(255) NULL;

-- +goose StatementEnd



-- +goose down
-- +goose StatementBegin
ALTER TABLE users
 DROP COLUMN avatar_url;
-- +goose StatementEnd