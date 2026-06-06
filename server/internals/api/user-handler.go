package api

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/logic-gate-sys/tares-cli/server/internals/store"
	"github.com/logic-gate-sys/tares-cli/server/internals/tokens"
	"github.com/logic-gate-sys/tares-cli/server/internals/utils"
)

type UserResponse struct{
	Error string `json:"string"`
	Details string `json:"details"`
}

type UserHandler struct{
	userStore *store.PostresUserStore
	tokenStore *store.PostgresTokenStore
	Logger *log.Logger
}
type key  string 
const traceKey key = key("Create-TraceId")
//constructor 
func NewUserHandler(userStore *store.PostresUserStore,tokenStore *store.PostgresTokenStore, logger *log.Logger) *UserHandler{
	return &UserHandler{ 
		userStore: userStore, 
		tokenStore: tokenStore,
		Logger: logger}
}


// Handles user signup(login), context aware to prevent memory leaks and improve performance
func (uh *UserHandler) HandleUserSignup(w http.ResponseWriter, r *http.Request) {
	 var usr store.User
	 err:=json.NewDecoder(r.Body).Decode(&usr)
	 if err !=nil{
		uh.Logger.Printf("Invalid data provided: %v", usr)
		utils.WriteJSON(w, 400, utils.Envlope{"Bad request":"Bad request"})
		return 
	 }
	 // add context for logging and memory management
	 ctx, cancel := context.WithTimeout(r.Context(), 1500*time.Millisecond)
	 defer cancel()
	 traceID := fmt.Sprintf("req-%d", time.Now().UnixNano())
	 ctx = context.WithValue(ctx, traceKey, traceID)
     // Checkout of context timeout
	 select{
		 case <-ctx.Done():
    	    res := UserResponse{Error:"Context timeout",Details: ctx.Err().Error()}
			log.Printf("Cancelled [traceID = %s] :%v", traceID, ctx.Err())
			utils.WriteJSON(w, http.StatusRequestTimeout, utils.Envlope{"error": res})
			return 
		 default:
	 }
	 // run DB in go routine 
	 type authResponse struct {
		error  error
		user   *store.User
	 }
	 ch := make(chan authResponse, 1)
     // create user in routine 
	 go func ()  {
		// hash pasword 
		if err :=usr.Password.Set(*usr.Password.PlainText);
			err !=nil{
			ch <- authResponse{error: err}
			}
		newUser, errs := uh.userStore.CreateUser(ctx, &usr)
	    if errs !=nil{
			ch <- authResponse{error: errs}
			return 
	 	}

        ch <- authResponse{user: newUser}
	 }()

	 select{
	 case res := <-ch:
		if res.error !=nil {
			if errors.Is(res.error, sql.ErrNoRows){
            uh.Logger.Printf("No rows affect [traceId =%s] :%v", traceID, res.error)
			utils.WriteJSON(w, http.StatusNotFound, utils.Envlope{"error":"Not found"})
		    return 
			}
			// esle error is server error 
			uh.Logger.Printf("Sever error [traceId =%s] :%v", traceID, res.error)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.Envlope{"error":"Server error"})
		    return 
		}
		// else everything is okay
		uh.Logger.Printf("User signedup successfully. [traceId =%s]. Username: %s Email: %s", traceID, res.user.Username, res.user.Email)
		utils.WriteJSON(w, http.StatusCreated, utils.Envlope{"details":res.user})
		return 

	case <- ctx.Done():
		uh.Logger.Printf("Request timeout [traceId = %s] :%v", traceID, ctx.Err())
		utils.WriteJSON(w, http.StatusRequestTimeout, utils.Envlope{"error":"Request timedout"})
		return
	 }

}

func(uh *UserHandler) HandleUserSignin(w http.ResponseWriter, r *http.Request){
	var usr struct {
		Email string `json:"email"`
		Password string `json:"password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&usr);
		err !=nil{
		uh.Logger.Printf("Invalid data provided: %v", usr)
		utils.WriteJSON(w, 400, utils.Envlope{"Bad request":"Bad request"})
		return 
	}
	// add context for logging and memory management
	 ctx, cancel := context.WithTimeout(r.Context(), 1500*time.Millisecond)
	 defer cancel()

	 traceID := fmt.Sprintf("req-%d", time.Now().UnixNano())
	 ctx= context.WithValue(ctx, traceKey, traceID)
     // early exit if client bails
	 select{
		 case <-ctx.Done():
    	     res := UserResponse{Error:"Context timeout",Details: ctx.Err().Error(),}
			 utils.WriteJSON(w, http.StatusRequestTimeout, utils.Envlope{"error": res})
			 log.Printf("Cancelled [traceID = %s] :%v", traceID, ctx.Err())
			 return 
		 default:
	 }
	 // run DB in go routine 
	 type authResponse struct {
		error  error
		user   *store.User
		token  *tokens.Token
	 }
	 ch := make(chan authResponse, 1)
	 
	 go func(){
		user, err := uh.userStore.GetUserByEmail(ctx, usr.Email)
		if err !=nil{
			ch <- authResponse{error: err}
			return 
	 	}
		// compare their password
		matches, err := user.Password.Matches(usr.Password)
		if err !=nil{
			ch <- authResponse{error: err}
			return 
		}
		if !matches{
			ch <- authResponse{error: errors.New("Invalid credential")}
			return 
		}
		// get user token
		userToken, err := uh.tokenStore.GetUserToken(user.Id)
		if err !=nil{
			ch <- authResponse{error: err}
			return 
		}
		if userToken == nil {
			userToken, err = tokens.GenerateToken(user.Id, 24* time.Hour, tokens.AuthScope)
			if err !=nil{
				ch <- authResponse{error: err}
				return 
			}
		}
		// send full data to channel 
		ch <- authResponse{error: nil, user: user, token: userToken}
	 }()

	// find  validate user exists 
	select {
	case res :=<- ch:
		if res.error !=nil {
			if errors.Is(res.error, sql.ErrNoRows){
				utils.WriteJSON(w, http.StatusNotFound, utils.Envlope{"error":res.error})
				return 
			} 
			if strings.Contains(res.error.Error(), "Invalid credential"){
            	utils.WriteJSON(w, http.StatusUnauthorized, utils.Envlope{"error":"Internal server error"})
				uh.Logger.Printf("Unauthorised [traceId = %s] : %v", traceID, res.error)
				return 
			}
			utils.WriteJSON(w, http.StatusInternalServerError, utils.Envlope{"error":"Internal server error"})
			uh.Logger.Printf("Server error [traceId = %s] : %v", traceID, res.error)
			return 
		}
		// else no errors 
		utils.WriteJSON(w,200, utils.Envlope{"user": res.user, "token":res.token})
		uh.Logger.Printf("User logged in [traceId = %s] :%v", traceID, res)
        
	case <- ctx.Done():
		utils.WriteJSON(w, http.StatusRequestTimeout, utils.Envlope{"error":"Request timeout"})
		log.Printf("Timedout [traceID = %s]: %v", traceID, ctx.Err())
		return 
	}
}