package store

import "database/sql"


type GameScore struct {
	UserId  string `json:"user_id"`
	GameID  string `json:"game_id"`
	Score  float32 `json:"score"`
}

type PostgresScoreStore struct{
	db     *sql.DB
}

type GameStore interface {
    GetUserScoreByGame(vals ...interface{})(error, Scores)
}
func  NewGameScore(UserId string, gameId string, score float32 ) *GameScore {
	return &GameScore{ 
		UserId:UserId ,
		GameID: gameId,
		Score: score,
	}
}

func (pss *PostgresScoreStore) GetUserScoreByGame(UserId string, game_id string) (*GameScore, error){
    score := GameScore{}
    // does score exist for user/game 
	query :=`SELECT * FROM game_scores 
	         WHERE user_id=$1 AND game_id=$2
			 RETURNING user_id, game_id, score 
	         `
    err := pss.db.QueryRow(query, UserId, game_id).Scan(&score.UserId,&score.GameID,&score.Score)
    if err !=nil{
        return nil , err
    }
    return &score, nil
}
