package ws

import (
	"net/http"
	"strconv"
	"sync"
	"github.com/go-chi/chi/v5"
)

type roomManager struct {
   sync.RWMutex
   rooms  map[string]*Room
}

func NewRoomManager()*roomManager{
	return &roomManager{
		rooms: make( map[string]*Room),
	}
}

// Check if everything is in order for a client to join or create a room:
// - Room exist and is not full 
// - In case room does not exist client creates a new room and joins it 
func(rm *roomManager) HandleWS(w http.ResponseWriter,req *http.Request){
  var options []RoomOption //room options like capacity etc
  // extract unique room id with chi 
  roomId := chi.URLParam(req, "id")
  queryString := req.URL.Query()
  // query parameters E.g : http//localhost:8081/room/:23?name=Junoo&capacity=5
  nQuery := queryString.Get("name")
  cQuery := queryString.Get("capacity")
  // lock manager mutex 
  rm.Lock()
  targetRoom, exists := rm.rooms[roomId]
  // in a situation where room is full 
  if targetRoom.isFull(){
     http.Error(w, "Room is full", http.StatusForbidden )
     return 
  }
  // if room does no exist , create one 
  if !exists {
    // if name is in the URL
    if nQuery !=""{
      options = append(options, WithName(nQuery))
    }
    if cQuery !=""{
       if cVal, err :=strconv.Atoi(cQuery); err == nil{
         options = append(options, WithCapacity(cVal))
       }
    }
	  targetRoom = NewRoom(options...)
	  rm.rooms[roomId] = targetRoom
	   // spawn the run function of targetted room silently
    go targetRoom.Run()
  }
  // unlock mutex 
  rm.Unlock()
  //Run serve http on Room and joins client to room via the join chan on room 
  targetRoom.ServeHTTP(w, req)
}