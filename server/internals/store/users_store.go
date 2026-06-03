package store

import (
	"crypto/sha256"
	"database/sql"
	"time"
)

type User struct {
	Id           int       `json:"id"`
	Email        string    `json:"email"`
	Username     string    `json:"username"`
	PasswordHash password  `json:"_"`
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

type password struct {
	plainText string
	hash      []byte
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

func (ps *PostresUserStore) GetUserByEmail(email string) (*User, error) {
	user := &User{}
	query := `SELECT email,password,username,level,total_score 
		          FROM users
				  WHERE email = $1
				  `
	err := ps.db.QueryRow(query, email).Scan(
		&user.Email,
		&user.PasswordHash,
		&user.Username,
		&user.PlayerLevel,
		&user.TotalScore,
	)
	// check for errors
	if err != nil {
		return nil, err
	}

	return user, nil
}

type UserStore interface {
	CreateUser(*User) (*User, error)
	GetUserById(id int) (*User, error)
	GetUserByEmail(string) (*User, error)
	GetUserByToken(scope, plaintextPassword string) (*User, error)
}

// constructor
func NewPostgresUserStore(db *sql.DB) *PostresUserStore {
	return &PostresUserStore{db: db}
}

func (ps *PostresUserStore) CreateUser(user *User) (*User, error) {
	query := `INSERT INTO users (email,username,bio)
	     VALUES($1,$2,$3)
		 RETURNING email, username,bio`
	//execute query
	_, err := ps.db.Exec(query, user.Email, user.Username, &user.Bio)

	if err != nil {
		return nil, err
	}
	// return user and no error
	return user, nil
}

func (ps *PostresUserStore) GetUserById(id int) (*User, error) {
	user := &User{}
	query := `SELECT email,username,level,total_score 
	          FROM users
			  WHERE id = $1
			  `
	err := ps.db.QueryRow(query, id).Scan(
		&user.Email,
		&user.Username,
		&user.PlayerLevel,
		&user.TotalScore,
	)

	// check for errors
	if err != nil {
		return nil, err
	}

	return user, nil
}

func (s *PostresUserStore) GetUserByToken(scope, plaintextPassword string) (*User, error) {
	tokenHash := sha256.Sum256([]byte(plaintextPassword))
	//query
	query := `SELECT u.id, u.username, u.email, u.password_hash, u.bio, u.created_at
  			  FROM users u
  			  INNER JOIN tokens t ON t.user_id = u.id
  			  WHERE t.hash = $1 AND t.scope = $2 and t.expiry > $3`
	// user struct
	user := &User{
		PasswordHash: password{},
	}

	err := s.db.QueryRow(query, tokenHash[:], scope, time.Now()).Scan(
		&user.Id,
		&user.Username,
		&user.Email,
		&user.PasswordHash.hash,
		&user.Bio,
		&user.CreatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, nil
	}

	if err != nil {
		return nil, err
	}

	return user, nil
}
