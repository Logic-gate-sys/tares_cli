package store

import (
	"database/sql"
)

type Users struct {
	ID          int    `json:"id"`
	Email       string `json:"email"`
	FirstName   string `json:"f_name"`
	LastName    string `json:"l_name"`
	MiddleName  string `json:"m_name"`
	UserName    string `json:"username"`
	PlayerLevel string `json:"p_level"`
	Bio         string `json:"bio"`
	TotalScore  int    `json:"total_score"`
	LastLogin   string `json:"last_login"`
	Rooms       []Room
}

type Room struct {
  ID int 	`json:"id"`
  RoomName string `json:"room_name"`
  CreatorID string `json:"creator_id"`
  IsOccupied bool `json:"is_occupied"`
  ClosedAt  string `json:"closed_at"`
}

type Games struct {
	ID int `json:"id"`
	RoomId  int `json:"room_id"`
	Players []int `json:"players"` 

}

type Scores  struct {
	ID int `json:"id"`
	UserId int `json:"user_id"`
	GameId int `json:"game_Id"`
	Score int `json:"score"`
}


type PostresUserStore struct {
	db *sql.DB
}

type UserStore interface {
	CreateUser(*Users) (*Users, error)
	GetUserById(id int) (*Users, error)
}
// constructor 
func NewPostgresUserStore (db *sql.DB) *PostresUserStore{
	return &PostresUserStore{db: db}
}

func (ps *PostresUserStore)  CreateUser(user *Users)  (*Users, error){
	query :=`INSERT INTO users (email,f_name, m_name,l_name,username,bio)
	     VALUES($1,$2,$3,$4,$5,$5)
		 RETURNING email, username,bio`
	err := ps.db.QueryRow(query, user.Email,user.FirstName,user.LastName,
		user.MiddleName, user.UserName, user.Bio).Scan(&user.Email, &user.UserName,&user.Bio)
	if err !=nil{
		return nil, err
	}
    // return user and no error 
	return user , nil
}

func (ps *PostresUserStore) GetUserById(id int64) (*Users, error){
	user :=&Users{}
     query :=`SELECT email,f_name,l_name,m_name,username,level,total_score 
	          FROM users
			  WHERE id = $1
			  `
	 err := ps.db.QueryRow(query, id).Scan(
		&user.Email,
		&user.FirstName, 
		&user.LastName, 
		&user.MiddleName, 
		&user.UserName, 
		&user.PlayerLevel,
		&user.TotalScore,
	)
	
	// check for errors
	 if err !=nil{
		return nil, err
	 }

	 return user, nil
}

