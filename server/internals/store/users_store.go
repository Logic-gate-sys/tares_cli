package store

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"
	"golang.org/x/crypto/bcrypt"
)

type Password struct {
	PlainText *string `json:"plain_text"`
	Hash      []byte  `json:"_"`
}

func(ps *Password) Set(plaintext string)(error){
	hash, err := bcrypt.GenerateFromPassword([]byte(plaintext), 12)
	if err !=nil{
		fmt.Printf("Failed to hash password error: %v", err)
		return err
	}
	ps.PlainText = &plaintext
	ps.Hash = hash

	return nil
}

func(ps *Password) Matches(plaintext string )(bool , error){
	if err := bcrypt.CompareHashAndPassword(ps.Hash, []byte(plaintext));
		err !=nil{
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
	Id           int       `json:"id"`
	Email        string    `json:"email"`
	Username     string    `json:"username"`
	Password     Password  `json:"password"`
	PlayerLevel  string    `json:"p_level"`
	Bio          string    `json:"bio"`
	TotalScore   int       `json:"total_score"`
	CreatedAt    time.Time `json:"created_at"`
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
	GetUserById(ctx context.Context, id int) (*User, error)
	GetUserByEmail(ctx context.Context, email string)(*User, error)
	GetUserByToken(ctx context.Context, scope string, tokenHash []byte) (*User, error)
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
		if errors.Is(err, context.DeadlineExceeded){
			return nil, errors.New("Context deadline exceeded")
		}
		if errors.Is(err, sql.ErrNoRows){
			return nil, errors.New("Something went wrong")
		}
		return nil, err 
	}
	// return user and no error
	return user, nil
}

func (ps *PostresUserStore) GetUserById(ctx context.Context, id int) (*User, error) {
	user := &User{}
	query := `SELECT email,username,level,total_score 
	          FROM users
			  WHERE id = $1
			  `
	err := ps.db.QueryRowContext(ctx, query, id).Scan(
		&user.Email,
		&user.Username,
		&user.PlayerLevel,
		&user.TotalScore,
	)

	// check for errors
	if err != nil {
		if errors.Is(err, context.DeadlineExceeded){
			return nil, errors.New("Context deadline exceeded")
		}
		if errors.Is(err, sql.ErrNoRows){
			return nil, errors.New("Something went wrong")
		}
	}

	return user, nil
}

func (s *PostresUserStore) GetUserByToken(ctx context.Context, scope string, tokenHash []byte) (*User, error) {
	//query
	query := `SELECT u.id, u.username, u.email, u.password_hash, u.bio, u.created_at
  			  FROM users u
  			  INNER JOIN tokens t ON t.user_id = u.id
  			  WHERE t.token_hash = $1 AND t.scope = $2 and t.expiry > Now()`
	// user struct
	user := &User{
		Password: Password{},
	}

	err := s.db.QueryRowContext(ctx, query, tokenHash[:], scope).Scan(
		&user.Id,
		&user.Username,
		&user.Email,
		&user.Password.Hash,
		&user.Bio,
		&user.CreatedAt,
	)

	if err != nil {
		if errors.Is(err, context.DeadlineExceeded){
			return nil, errors.New("Context deadline exceeded")
		}
		if errors.Is(err, sql.ErrNoRows){
			return nil, errors.New("Something went wrong")
		}
	}

	return user, nil
}

func (ps *PostresUserStore) GetUserByEmail(ctx context.Context, email string)(*User, error) {
	user := &User{}
	query := `SELECT id,email,password_hash,username,p_level,total_score 
		          FROM users
				  WHERE email = $1
				  `
	err := ps.db.QueryRowContext(ctx, query, email).Scan(
		&user.Id,
		&user.Email,
		&user.Password.Hash,
		&user.Username,
		&user.PlayerLevel,
		&user.TotalScore,
	)
	// check for errors
	if err != nil {
		// error could be sql.ErrNoRows or context.DeadlineExceeded
		return nil, err 
	}

	return user, nil
}

