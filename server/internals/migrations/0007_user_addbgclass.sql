-- +goose up 
-- +goose StatementBegin
ALTER TABLE users 
  ADD COLUMN bg_class VARCHAR(255) NULL;

-- +goose StatementEnd



-- +goose down
-- +goose StatementBegin
ALTER TABLE users
 DROP COLUMN bg_class;
-- +goose StatementEnd