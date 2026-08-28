package store

import (
	"context"
	"database/sql"
	"encoding/json"
	"time"
)

type Status string

const (
	Waiting  Status = "waiting" // in lobby waiting
	Playing  Status = "playing" // currently hosting play
	Finished Status = "finished" // completed play
	Idle     Status = "idle"    // not online or not active
)

type CreateRoom struct {
	Id                 string    `json:"id"` // room unique id
	OwnerId            string    `json:"owner_id"`
	Name               string    `json:"name"`     // room name
	Capacity           int       `json:"capacity"` // number of active-players
	Status             Status    `json:"status"`
	Icon               string    `json:"icon"` // room icon url
	IconBgClass        string    `json:"icon_bg_class"`
	IconTextColorClass string    `json:"icon_text_color_class"`
	CreatedAt          time.Time `json:"created_at"`
	UpdatedAt          time.Time `json:"updated_at"`
}



type PlayerAvatar struct {
	Src     string `json:"src"`
	Alt     string `json:"alt"`
	BgClass string `json:"bgClass"`
}
 
type RoomViewModel struct {
	ID                 string         `json:"id"`
	Name               string         `json:"name"`
	Capacity           int            `json:"capacity"`
	Icon               string         `json:"icon"`
	IconBgClass        string         `json:"iconBgClass"`
	IconTextColorClass string         `json:"iconTextColorClass"`
	Players            int            `json:"playersText"`
	TimeLeftText       string         `json:"timeLeftText"`
	Avatars            []PlayerAvatar `json:"avatars"`
	ExtraPlayersCount  int            `json:"extraPlayersCount"`
}

type PostGresRoomStore struct {
	db *sql.DB
}

func NewPostgresRoomStore(db *sql.DB)*PostGresRoomStore{
	return &PostGresRoomStore{
		db: db,
	}
}

type RoomStore interface {
	CreateRoom(rm *CreateRoom)(CreateRoom, error)
	GetAllRooms(ctx context.Context) ([]RoomViewModel, error)
}

func (pr *PostGresRoomStore) CreateRoom(rm *CreateRoom, ctx context.Context) (CreateRoom, error) {
	query := ` 
	    INSERT INTO rooms (owner_id,name,capacity,status,icon,icon_bg_class,icon_text_color_class)
			VALUES ($1, $2, $3, $4, $5, $6, $7)
			RETURNING id,owner_id,name,capacity,status,icon,icon_bg_class,icon_text_color_class,created_at,updated_at;
		`
	var created CreateRoom
	err := pr.db.QueryRowContext(ctx,	query,rm.OwnerId,rm.Name,rm.Capacity,rm.Status,rm.Icon,rm.IconBgClass,rm.IconTextColorClass,).
		Scan(&created.Id,&created.OwnerId,&created.Name,&created.Capacity,&created.Status,&created.Icon,&created.IconBgClass,
		&created.IconTextColorClass,&created.CreatedAt,&created.UpdatedAt)

	if err != nil {
		return CreateRoom{}, err
	}

	return created, nil
}



func (pr *PostGresRoomStore) GetAllRooms(ctx context.Context) ([]RoomViewModel, error) {
	query := `
		SELECT 
		  r.id::text,r.name,r.capacity,r.icon,r.icon_bg_class,r.icon_text_color_class,
			COUNT(rp.user_id)::INT AS players,
			COALESCE(
		   json_agg(
					json_build_object(
						'src', COALESCE(u.avatar_url, ''),
						'alt', COALESCE(u.username, ''),
						'bgClass', COALESCE(u.bg_class, '')
					)
				) FILTER (WHERE u.id IS NOT NULL),
				'[]'::json
			) AS avatars,
			GREATEST(0, COUNT(rp.user_id)::INT - 3) AS extra_players_count
		FROM rooms r
		LEFT JOIN room_players rp ON r.id = rp.room_id
		LEFT JOIN users u ON rp.user_id = u.id
		GROUP BY r.id
		ORDER BY r.created_at DESC;
	`

	rows, err := pr.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	result := make([]RoomViewModel, 0)

	for rows.Next() {
		var rm RoomViewModel
		var avatarsRaw []byte
		err := rows.Scan(&rm.ID,&rm.Name,&rm.Capacity,&rm.Icon,&rm.IconBgClass,&rm.IconTextColorClass,&rm.Players,
			&avatarsRaw,&rm.ExtraPlayersCount)
		if err != nil {
			return nil, err
		}
		// Unmarshal the JSON aggregated string into Go slice
		if err := json.Unmarshal(avatarsRaw, &rm.Avatars); err != nil {
			return nil, err
		}
		
		result = append(result, rm)
	}

	return result, nil
}