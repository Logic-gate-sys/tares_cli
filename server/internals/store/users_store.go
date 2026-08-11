package store

import (
	"context"
	"database/sql"
	"encoding/base64"
	"errors"
	"fmt"
	"time"
	"github.com/logic-gate-sys/tares-cli/internals/tokens"
	"golang.org/x/crypto/bcrypt"
)

type Password struct {
	PlainText *string `json:"plain_text"`
	Hash      []byte  `json:"-"`
}

func (ps *Password) Set(plaintext string) error {
	hash, err := bcrypt.GenerateFromPassword([]byte(plaintext), 12)
	if err != nil {
		fmt.Printf("Failed to hash password error: %v", err)
		return err
	}
	ps.PlainText = &plaintext
	ps.Hash = hash

	return nil
}

func (ps *Password) Matches(plaintext string) (bool, error) {
	if err := bcrypt.CompareHashAndPassword(ps.Hash, []byte(plaintext)); err != nil {
		switch {
		case errors.Is(err, bcrypt.ErrMismatchedHashAndPassword):
			return false, errors.New("Invalid credential")
		default:
			return false, err
		}
	}
	return true, nil
}

type User struct {
	Id          int       `json:"id"`
	Email       string    `json:"email"`
	Username    string    `json:"username"`
	Password    Password  `json:"password"`
	PlayerLevel string    `json:"p_level"`
	Bio         string    `json:"bio"`
	TotalScore  int       `json:"total_score"`
	CreatedAt   time.Time `json:"created_at"`
}

type UserPublicResponse struct {
	Id          int       `json:"id"`
	Email       string    `json:"email"`
	Username    string    `json:"username"`
	PlayerLevel string    `json:"p_level"`
	Bio         string    `json:"bio"`
	TotalScore  int       `json:"total_score"`
	CreatedAt   time.Time `json:"created_at"`
	// Notice: No password field exists here whatsoever.
}

func NewUserPublicResponse(u *User) UserPublicResponse {
	return UserPublicResponse{
		Id:          u.Id,
		Email:       u.Email,
		Username:    u.Username,
		PlayerLevel: u.PlayerLevel,
		Bio:         u.Bio,
		TotalScore:  u.TotalScore,
		CreatedAt:   u.CreatedAt,
	}
}

func (u *User) IsAnonymousUser() bool {
	return u == AnonymousUser
}

type Room struct {
	Id         int    `json:"id"`
	RoomName   string `json:"room_name"`
	CreatorID  string `json:"creator_id"`
	IsOccupied bool   `json:"is_occupied"`
	ClosedAt   string `json:"closed_at"`
}

type Games struct {
	ID      int   `json:"id"`
	RoomId  int   `json:"room_id"`
	Players []int `json:"players"`
}

type Scores struct {
	ID     int `json:"id"`
	UserId int `json:"user_id"`
	GameId int `json:"game_Id"`
	Score  int `json:"score"`
}

var AnonymousUser = &User{}

type PostresUserStore struct {
	db *sql.DB
}

type UserStore interface {
	CreateUser(context.Context, *User) (*User, error)
	GetUser(ctx context.Context, email string) (*User, *tokens.Token, error)
	VerifyToken(ctx context.Context, urlStr string) (bool, error)
}

// constructor
func NewPostgresUserStore(db *sql.DB) *PostresUserStore {
	return &PostresUserStore{db: db}
}

func (ps *PostresUserStore) CreateUser(ctx context.Context, user *User) (*User, error) {
	query := `INSERT INTO users (email,username,password_hash)
	     VALUES($1,$2,$3)`
	//execute query
	_, err := ps.db.ExecContext(ctx, query, &user.Email, &user.Username, &user.Password.Hash)

	if err != nil {
		if errors.Is(err, context.DeadlineExceeded) {
			return nil, errors.New("Context deadline exceeded")
		}
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("Something went wrong")
		}
		return nil, err
	}
	// return user and no error
	return user, nil
}

// Returns user and all their details (user details, token details)
func (ps *PostresUserStore) GetUser(ctx context.Context, email string) (*User, *tokens.Token, error) {
	user := &User{}
	token := &tokens.Token{}
	query := `SELECT u.email,u.username,u.p_level,u.total_score, t.token_hash, t.expiry, t.scope
	          FROM users u
					  INNER JOIN tokens t ON u.id = t.user_id
			      WHERE u.email = $1 AND t.expiry > NOW()`
	err := ps.db.QueryRowContext(ctx, query, email).Scan(
		&user.Email,
		&user.Username,
		&user.PlayerLevel,
		&user.TotalScore,
		&token.Hash,
		&token.Expiry,
		&token.Scope,
	)

	// check for errors
	if err != nil {
		if errors.Is(err, context.DeadlineExceeded) {
			return nil, nil, errors.New("Context deadline exceeded")
		}
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil, errors.New("Something went wrong")
		}
	}

	return user, token, nil
}

func (ps *PostresUserStore) VerifyToken(ctx context.Context, urlStr string) (*User, *tokens.Token, error) {
	user :=User{}
	token:= tokens.Token{}
	hash, err := base64.URLEncoding.DecodeString(urlStr)
	if err != nil {
		return nil, nil, err
	}
	query :=`SELECT t.token_hash, t.expiry, t.scope, u.email,u.username,u.level,u.total_score
	       FROM tokens t
				 INNER JOIN users u ON u.id = t.user_id
				 WHERE token_hash = $1 AND expiry > NOW()
					`
	err = ps.db.QueryRowContext(ctx, query, hash).Scan(
		&token.Hash,
		&token.Expiry,
		&token.Scope,
		&user.Email,
		&user.Username,
		&user.PlayerLevel,
		&user.TotalScore,
	)
	
	if err != nil {
		return nil, nil, err
	}
	return &user, &token, nil
}
