package api

import (
	"encoding/json"
	"log"
	"net/http"
	"strings"

	"github.com/logic-gate-sys/tares-cli/internals/middleware"
	"github.com/logic-gate-sys/tares-cli/internals/store"
	"github.com/logic-gate-sys/tares-cli/internals/utils"
)

type RoomHandler struct {
	RoomStore *store.PostGresRoomStore
	Logger    *log.Logger
}

func NewRoomHandler(rs *store.PostGresRoomStore, lg *log.Logger) *RoomHandler {
	return &RoomHandler{
		RoomStore: rs,
		Logger:    lg,
	}
}

func (rh *RoomHandler) HandleCreateRoom( w http.ResponseWriter, r *http.Request,) {
	var roomBody store.CreateRoom
	user :=middleware.GetUser(r)
	r.ParseMultipartForm(10 << 20)
	// parse file
	iconfile, header, err := r.FormFile("icon")
	if err != nil {
		rh.Logger.Printf("Error: %v", err)
		utils.WriteJSON(w, 400, utils.Envlope{"error": "bad request"})
		return
	}
	defer iconfile.Close()
	// upload file
	url, err := utils.UploadImg(iconfile, "tares", header.Filename)
	if err != nil {
		rh.Logger.Printf("Error: %v", err)
		utils.WriteJSON(w, 400, utils.Envlope{"error": "Failed to upload icon to cloudinary"})
		return
	}
	data := r.FormValue("data")
	err = json.NewDecoder(strings.NewReader(data)).Decode(&roomBody)
	if err != nil {
		rh.Logger.Printf("Error: %v", err)
		utils.WriteJSON(w, 400, utils.Envlope{"error": "bad request body"})
		return
	}
	roomBody.Icon = url
	roomBody.OwnerId = user.Id

	room, err := rh.RoomStore.CreateRoom(&roomBody, r.Context())
	if err != nil {
		rh.Logger.Printf("Error: %v", err)
		utils.WriteJSON(w, 500, utils.Envlope{"error": err.Error()})
		return
	}

	// send created room
	rh.Logger.Printf("Room created: %v", room)
	utils.WriteJSON(w, 201, utils.Envlope{"success": true, "data": room})
}



func (rh *RoomHandler) HandleGetRooms( w http.ResponseWriter, r *http.Request,) {
	rooms, err := rh.RoomStore.GetAllRooms(r.Context())
	if err != nil {
		rh.Logger.Printf("Error: %v", err)
		utils.WriteJSON(w, 400, utils.Envlope{"error": err.Error()})
		return
	}
	// send created room
	rh.Logger.Printf("Rooms found: %d", len(rooms))
	utils.WriteJSON(w, 200, utils.Envlope{"success": true, "data": rooms})
}
