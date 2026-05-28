package api

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/logic-gate-sys/tares-cli/server/internals/store"
	"github.com/logic-gate-sys/tares-cli/server/internals/utils"
)


type UserHandler struct{
	userStore *store.PostresUserStore
	Logger *log.Logger
}

//constructor 
func NewUserHandler(userStore *store.PostresUserStore, logger *log.Logger) *UserHandler{
	return &UserHandler{ userStore: userStore, Logger: logger}
}

func (uh *UserHandler) HandleCreateUser(w http.ResponseWriter, r *http.Request) {
	 var usr store.Users
	 err:=json.NewDecoder(r.Body).Decode(&usr)
	 if err !=nil{
		uh.Logger.Printf("Invalid data provided: %v", usr)
		utils.WriteJSON(w, 400, utils.Envlope{"Bad request":"Bad request"})
		return 
	 }

	 newUser, errs := uh.userStore.CreateUser(&usr)
	 if errs !=nil{
		uh.Logger.Println("Failed to create user")
		utils.WriteJSON(w, 400, utils.Envlope{"Failed":"Failed to create user"})
		return 
	 }
  
	 utils.WriteJSON(w, http.StatusCreated, utils.Envlope{"user":newUser})
     
}