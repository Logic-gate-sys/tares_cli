package api

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/logic-gate-sys/tares-cli/server/internals/store"
	"github.com/logic-gate-sys/tares-cli/server/internals/tokens"
	"github.com/logic-gate-sys/tares-cli/server/internals/utils"
)


type UserHandler struct{
	userStore *store.PostresUserStore
	tokenStore *store.PostgresTokenStore
	Logger *log.Logger
}

//constructor 
func NewUserHandler(userStore *store.PostresUserStore,tokenStore *store.PostgresTokenStore, logger *log.Logger) *UserHandler{
	return &UserHandler{ 
		userStore: userStore, 
		tokenStore: tokenStore,
		Logger: logger}
}

func (uh *UserHandler) HandleUserSignup(w http.ResponseWriter, r *http.Request) {
	 var usr store.User
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

func(uh *UserHandler) HandleUserSignin(w http.ResponseWriter, r *http.Request){
	var usr struct {
		email string 
		password string
	}
	if err := json.NewDecoder(r.Body).Decode(&usr);
		err !=nil{
		uh.Logger.Printf("Invalid data provided: %v", usr)
		utils.WriteJSON(w, 400, utils.Envlope{"Bad request":"Bad request"})
		return 
	}
	// find  validate user exists 
	user, err := uh.userStore.GetUserByEmail(usr.email)
	if err !=nil{
		uh.Logger.Println("Internal server errror")
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envlope{"Error":"Internal Server error "})
		return 
	 }
	if user ==nil{
		utils.WriteJSON(w, http.StatusNotFound, utils.Envlope{"Error":"User not found "})
		return  
	}
	// get user token
	userToken, err := uh.tokenStore.GetUserToken(user.Id)
	if err !=nil{
		utils.WriteJSON(w, http.StatusInternalServerError, utils.Envlope{"Error":"Internal server error"})
		return 
	}

	if userToken ==nil {
		userToken, err = tokens.GenerateToken(user.Id, 24* time.Hour, tokens.AuthScope)
		if err !=nil{
			utils.WriteJSON(w, http.StatusInternalServerError, utils.Envlope{"Error":"Internal server error"})
			return 
		}
	}
	// write user back 
	utils.WriteJSON(w, 200, utils.Envlope{"user": user, "token": userToken.Hash})
	return 
}