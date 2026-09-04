package api

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"
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

func (rh *RoomHandler) HandleCreateRoom(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUser(r)
	var tempData struct {
		Name     string `json:"name"`
		Capacity int    `json:"capacity"`
		Icon     string `json:"icon"`
		IconBg   string `json:"iconBgClass"`
		IconText string `json:"iconTextColorClass"`
	}
	err := json.NewDecoder(r.Body).Decode(&tempData)
	if err != nil {
		rh.Logger.Printf("Error: %v", err)
		utils.WriteJSON(w, 400, utils.Envlope{"error": "bad request body"})
		return
	}
	roomBody := store.CreateRoom{
		Name:               tempData.Name,
		Capacity:           tempData.Capacity,
		Icon:               tempData.Icon,
		Status:             store.Idle,
		IconBgClass:        tempData.IconBg,
		IconTextColorClass: tempData.IconText,
	}
	roomBody.OwnerId = user.Id

	room, err := rh.RoomStore.CreateRoom(&roomBody, r.Context())
	if err != nil {
		rh.Logger.Printf("Error: %v", err)
		utils.WriteJSON(w, 500, utils.Envlope{"error": err.Error()})
		return
	}

	// send created room
	rh.Logger.Printf("Room created(http): %v", room)
	utils.WriteJSON(w, 201, utils.Envlope{"success": true, "data": room})
}

func (rh *RoomHandler) HandleGetRooms(w http.ResponseWriter, r *http.Request) {
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

func (rh *RoomHandler) HandleDeleteRoom(w http.ResponseWriter, r *http.Request) {
	roomId := chi.URLParam(r, "id")
	if roomId == "" {
		rh.Logger.Printf("Invalid params: %s", roomId)
		utils.WriteJSON(w, 400, utils.Envlope{"success": false})
		return
	}

	done, err := rh.RoomStore.DeleteRoom(r.Context(), roomId)
	if err != nil {
		rh.Logger.Printf("Failed to delete room with id: %s. Error: %s", roomId, err.Error())
		utils.WriteJSON(w, 500, utils.Envlope{"success": false})
		return
	}
	if !done {
		rh.Logger.Printf("Room not found: %s", roomId)
		utils.WriteJSON(w, 404, utils.Envlope{"error": "No room found with id: " + roomId})
		return
	}
	rh.Logger.Printf("Room deleted successfully: %s", roomId)
	utils.WriteJSON(w, 200, utils.Envlope{"success": true})
}

func (rh *RoomHandler) HandleUpdateRoom(w http.ResponseWriter, r *http.Request) {
	roomId := chi.URLParam(r, "id")
	var updateData store.RoomUpdateType
	err := json.NewDecoder(r.Body).Decode(&updateData)
	if err != nil {
		rh.Logger.Printf("Invalid update data: %v", updateData)
		utils.WriteJSON(w, 400, utils.Envlope{"error": "invalid updated data provided"})
		return
	}

	// update db
	err = rh.RoomStore.UpdateRoom(r.Context(), roomId, updateData)
	if err != nil {
		rh.Logger.Printf("Failed to updated room : %s", err.Error())
		utils.WriteJSON(w, 500, utils.Envlope{"error": "Failed to update room "})
	}

	rh.Logger.Printf("Room updated successfully ")
	utils.WriteJSON(w, 200, utils.Envlope{"success": true})
}
