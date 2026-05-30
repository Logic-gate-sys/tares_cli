package store

import "database/sql"


type GameScore struct {
	UserID  string `json:"user_id"`
	GameID  string `json:"game_id"`
	Score  float32 `json:"score"`
}

type PostgresScoreStore struct{
	db     *sql.DB
}

type GameStore interface {
    GetUserScoreByGame(vals ...interface{})(error, Scores)
}
func  NewGameScore(userId string, gameId string, score float32 ) *GameScore {
	return &GameScore{ 
		UserID:userId ,
		GameID: gameId,
		Score: score,
	}
}

func (pss *PostgresScoreStore) GetUserScoreByGame(userId string, game_id string) (*GameScore, error){
    score := GameScore{}
    // does score exist for user/game 
	query :=`SELECT * FROM game_scores 
	         WHERE user_id=$1 AND game_id=$2
			 RETURNING user_id, game_id, score 
	         `
    err := pss.db.QueryRow(query, userId, game_id).Scan(&score.UserID,&score.GameID,&score.Score)
    if err !=nil{
        return nil , err
    }
    return &score, nil
}
/*


CREATE TABLE room IF NOT EXISTS (
    id SERIAL PRIMARY KEY,
    name VARCHAR(225) NOT NULL , -- NAME OF GAME ROOM 
    creator_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    game_id    INT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    is_occupied BOOLEAN DEFAULT false, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- When was this room ended 
    CREATE INDEX room_idx ON  rooms(id, game_id)
)

CREATE TABLE game_room IF NOT EXISTS(
    id SERIAL 
    user_id INT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    room_id INT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, room_id, id )
)

CREATE TABLE game IF NOT EXISTS (
    id SERIAL PRIMARY KEY,
    winner_id INT NOT NULL REFERENCES users(id) on DELETE CASCADE, 
    CREATE INDEX idx_games_rooms ON rooms(id) -- index on rooms_id 
)

CREATE TABLE game_score IF NOT EXISTS (
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    game_id INT REFERENCES games(id) ON DELETE CASCADE,
    score  INT DEFAULT 0
    PRIMARY KEY (user_id, game_id)
)

*/