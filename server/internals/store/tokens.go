package store

import (
	"context"
	"database/sql"
	"time"
	"github.com/logic-gate-sys/tares-cli/internals/tokens"
)

type PostgresTokenStore struct {
	db *sql.DB
}

func NewPostgresTokenStore(db *sql.DB) *PostgresTokenStore {
	return &PostgresTokenStore{db: db}
}

// token store interface
type TokenStore interface {
	Insert(token *tokens.Token) error
	CreateUserToken(ctx context.Context, user_id int, ttl time.Duration, scope string) (*tokens.Token, error)
	DeleteAllTokensForUser(user_id int, scope string) error
}

func (t *PostgresTokenStore) DeleteAllTokensForUser(user_id int, scope string) error {
	query := `DELETE  FROM tokens WHERE user_id=$1 AND scope =$2`
	results, err := t.db.Exec(query, user_id, scope)
	if err != nil {
		return err
	}
	rowsAffected, err := results.RowsAffected()
	if err != nil {
		return err
	}
	if rowsAffected <= 0 {
		return nil
	}
	return err
}

func (t *PostgresTokenStore) CreateUserToken(ctx context.Context, user_id int, ttl time.Duration, scope string) (*tokens.Token, error) {
	trx, err := t.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, err
	}
	defer trx.Rollback()
	// delete query
	deleteQuery := `DELETE  FROM tokens WHERE user_id=$1 AND scope =$2`
	results, err := trx.ExecContext(ctx, deleteQuery, user_id, scope)
	if err != nil {
		return nil, err
	}
	_, err = results.RowsAffected()
	if err != nil {
		return nil, err
	}
	// insert query
	insertQuery := `INSERT INTO tokens (token_hash,user_id,expiry,scope) VALUES($1,$2,$3,$4)`
	token, err := tokens.GenerateToken(user_id, ttl, scope)
	if err != nil {
		return nil, err
	}

	_, err = trx.ExecContext(ctx, insertQuery, &token.Hash, &token.UserID, &token.Expiry, &token.Scope)
	if err != nil {
		return nil, err
	}

	trx.Commit()
	return token, nil
}

// func (t *PostgresTokenStore) CreateUserToken(user_id int, ttl time.Duration, scope string) (*tokens.Token, error) {
// 	token, err := tokens.GenerateToken(user_id, ttl, scope)
// 	if err != nil {
// 		return nil, err
// 	}
// 	// first clear all tokens belong to user
// 	err = t.DeleteAllTokensForUser(user_id, scope)
// 	if err != nil {
// 		return nil, err
// 	}
// 	// insert new token
// 	err = t.Insert(token)
// 	return token, nil
// }

// func (t *PostgresTokenStore) Insert(token *tokens.Token) error {
// 	query := `INSERT INTO tokens (token_hash,user_id,expiry,scope)
// 	         VALUES($1,$2,$3,$4)
// 			 `
// 	// execute query
// 	_, err := t.db.Exec(query, &token.Hash, &token.UserID, &token.Expiry, &token.Scope)
// 	return err
// }
