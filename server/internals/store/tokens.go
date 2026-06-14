package store

import (
	"context"
	"database/sql"
	"time"

	"github.com/logic-gate-sys/tares-cli/server/internals/tokens"
)

type PostgresTokenStore struct {
	db *sql.DB
}

func (t *PostgresTokenStore) DeleteAllTokensForUser(user_id int, scope string) error {
	query := `DELETE * FROM tokens
	         WHERE user_id=$1 AND scope =$2`
	_, err := t.db.Exec(query, user_id, scope)
	return err
}

func NewPostgresTokenStore(db *sql.DB) *PostgresTokenStore {
	return &PostgresTokenStore{db: db}
}

// token store interface
type TokenStore interface {
	Insert(token *tokens.Token) error
	CreateUserToken(user_id int, ttl time.Duration, scope string) (*tokens.Token, error)
	DeleteAllTokensForUser(user_id int, scope string) error
	GetUserToken(ctx context.Context, user_id int) (*tokens.Token, error)
}

func (t *PostgresTokenStore) GetUserToken(ctx context.Context, user_id int) (*tokens.Token, error) {
	var tk tokens.Token
	// query
	sqlQuery := `SELECT token_hash, scope
	              FROM tokens
				  WHERE user_id =$1 AND expiry > NOW()`
	if err := t.db.QueryRowContext(ctx, sqlQuery, user_id).Scan(&tk.Hash, &tk.Scope); err != nil {
		return nil, err
	}
	return &tk, nil
}

func (t *PostgresTokenStore) CreateUserToken(user_id int, ttl time.Duration, scope string) (*tokens.Token, error) {
	token, err := tokens.GenerateToken(user_id, ttl, scope)
	if err != nil {
		return nil, err
	}
	// insert token in db
	err = t.Insert(token)
	return token, nil
}

func (t *PostgresTokenStore) Insert(token *tokens.Token) error {
	query := `INSERT INTO tokens (token_hash,user_id,expiry,scope)
	         VALUES($1,$2,$3,$4)
			 `
	// execute query
	_, err := t.db.Exec(query, &token.Hash, &token.UserID, &token.Expiry, &token.Scope)
	return err
}
