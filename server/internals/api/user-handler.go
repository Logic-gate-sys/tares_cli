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

	"github.com/logic-gate-sys/tares-cli/internals/store"
	"github.com/logic-gate-sys/tares-cli/internals/tokens"
	"github.com/logic-gate-sys/tares-cli/internals/utils"
)

type UserResponse struct {
	Error   string `json:"string"`
	Details string `json:"details"`
}
type UserHandler struct {
	userStore  *store.PostresUserStore
	tokenStore *store.PostgresTokenStore
	Logger     *log.Logger
}

// types
type key string

const traceKey key = key("Create-TraceId")

// constructor
func NewUserHandler(userStore *store.PostresUserStore, tokenStore *store.PostgresTokenStore, logger *log.Logger) *UserHandler {
	return &UserHandler{
		userStore:  userStore,
		tokenStore: tokenStore,
		Logger:     logger,
	}
}

// Handles user signup(login), context aware to prevent memory leaks and improve performance
func (uh *UserHandler) HandleUserSignup(w http.ResponseWriter, r *http.Request) {
	var usr store.User
	r.ParseMultipartForm(10 << 20)
	file, _, err := r.FormFile("avatar")
	if err != nil {
		uh.Logger.Printf("Invalid data provided: %v", err)
		utils.WriteJSON(w, 400, utils.Envlope{"Bad request": "No file found"})
		return
	}
	// upload to cloudinary
	url, err := utils.UploadImg(file, "tares", "user_avatar")
	
	if err != nil {
		uh.Logger.Printf("Failed to upload image %v", err)
		utils.WriteJSON(w, 400, utils.Envlope{"Failed to upload image": err.Error()})
		return
	}
	defer file.Close()
	
	data := r.FormValue("data")
	err = json.NewDecoder(strings.NewReader(data)).Decode(&usr)
	if err != nil {
		uh.Logger.Printf("Invalid data provided: %v", usr)
		utils.WriteJSON(w, 400, utils.Envlope{"Bad request": "Bad request"})
		return
	}
	usr.Avatar= url
	// add context for logging and memory management
	ctx, cancel := context.WithTimeout(r.Context(), utils.REQUEST_TIMEOUT)
	defer cancel()
	traceID := fmt.Sprintf("req-%d", time.Now().UnixNano())
	ctx = context.WithValue(ctx, traceKey, traceID)
	// Checkout of context timeout
	select {
	case <-ctx.Done():
		res := UserResponse{Error: "Context timeout", Details: ctx.Err().Error()}
		log.Printf("Cancelled [traceID = %s] :%v", traceID, ctx.Err())
		utils.WriteJSON(w, http.StatusRequestTimeout, utils.Envlope{"error": res})
		return
	default:
	}
	// run DB in go routine
	type authResponse struct {
		error error
		user  *store.User
	}
	ch := make(chan authResponse, 1)
	// create user in routine
	go func() {
		// hash pasword
		if err := usr.Password.Set(*usr.Password.PlainText); err != nil {
			ch <- authResponse{error: err}
		}
		newUser, errs := uh.userStore.CreateUser(ctx, &usr)
		if errs != nil {
			ch <- authResponse{error: errs}
			return
		}

		ch <- authResponse{user: newUser}
	}()
	// select on channel to wait for result
	select {
	case res := <-ch:
		if res.error != nil {
			if errors.Is(res.error, sql.ErrNoRows) {
				uh.Logger.Printf("No rows affect [traceId =%s] :%v", traceID, res.error)
				utils.WriteJSON(w, http.StatusNotFound, utils.Envlope{"error": "Not found"})
				return
			}
			// esle error is server error
			uh.Logger.Printf("Sever error [traceId =%s] :%v", traceID, res.error)
			utils.WriteJSON(w, http.StatusInternalServerError, utils.Envlope{"error": "Server error"})
			return
		}
		// else everything is okay
		publicUsr := store.NewUserPublicResponse(res.user)
		uh.Logger.Printf("User signedup successfully. [traceId =%s]. Username: %s Email: %s", traceID, res.user.Username, res.user.Email)
		utils.WriteJSON(w, http.StatusOK, utils.Envlope{"user": publicUsr})
		return

	case <-ctx.Done():
		uh.Logger.Printf("Request timeout [traceId = %s] :%v", traceID, ctx.Err())
		utils.WriteJSON(w, http.StatusRequestTimeout, utils.Envlope{"error": "Request timedout"})
		return
	}

}

func (uh *UserHandler) HandleUserSignin(w http.ResponseWriter, r *http.Request) {
	//decode user input
	var usr store.User

	if err := json.NewDecoder(r.Body).Decode(&usr); err != nil {
		uh.Logger.Printf("Invalid data provided: %v", err)
		utils.WriteJSON(w, 400, utils.Envlope{"error": "Bad request"})
		return
	}
	// add context for logging and memory management
	ctx, cancel := context.WithTimeout(r.Context(), utils.REQUEST_TIMEOUT)
	defer cancel()

	traceID := fmt.Sprintf("req-%d", time.Now().UnixNano())
	ctx = context.WithValue(ctx, traceKey, traceID) // infuse value into context
	// early exit if client bails out
	select {
	case <-ctx.Done():
		res := UserResponse{Error: "Context timeout", Details: ctx.Err().Error()}
		utils.WriteJSON(w, http.StatusRequestTimeout, utils.Envlope{"error": res})
		log.Printf("Cancelled [traceID = %s] :%v", traceID, ctx.Err())
		log.Printf("Cancelled [traceID = %s] :%v", traceID, ctx.Err())
		return
	default:
	}

	// response to channel
	type authResponse struct {
		error error
		user  *store.User
		token *tokens.Token
	}
	// routine (user and token )
	ch := make(chan authResponse, 1)

	go func() {
		user, err := uh.userStore.GetUserByEmail(ctx, usr.Email)
		if err != nil {
			ch <- authResponse{error: err}
			return
		}
		// compare their password
		matches, err := user.Password.Matches(*usr.Password.PlainText)
		if err != nil {
			ch <- authResponse{error: err}
			return
		}
		if !matches {
			ch <- authResponse{error: errors.New("Invalid credential")}
			return
		}
		// token work
		_, token, err := uh.userStore.GetUser(ctx, usr.Email)
		// error could be : contextTimeout, or sql.NoRows
		if err != nil {
			if !errors.Is(err, sql.ErrNoRows) {
				ch <- authResponse{error: err}
				fmt.Println("Dagn it: ", err.Error())
				return
			}
			// else create new token
			token, err = uh.tokenStore.CreateUserToken(user.Id, 30*time.Second, tokens.AuthScope)
			if err != nil {
				ch <- authResponse{error: err}
				return
			}
		}
		// send full data to channel
		ch <- authResponse{error: nil, user: user, token: token}
	}()

	// find  validate user exists
	select {
	case res := <-ch:
		if res.error != nil {
			// if no matching rows is found
			if errors.Is(res.error, sql.ErrNoRows) || strings.Contains(res.error.Error(), "Invalid credential") {
				uh.Logger.Printf("Not Found -> [traceId = %s] : %v", traceID, res.error)
				utils.WriteJSON(w, http.StatusNotFound, utils.Envlope{"error": res.error.Error()})
				return
			}
			// this is some generalised error
			utils.WriteJSON(w, http.StatusInternalServerError, utils.Envlope{"error": res.error.Error()})
			uh.Logger.Printf("Server Error -> [traceId = %s] : %v", traceID, res.error)
			return
		}
		// else everything is successful
		publicUsr := store.NewUserPublicResponse(res.user)
		utils.WriteJSON(w, http.StatusOK, utils.Envlope{"user": publicUsr, "token": res.token.PlainText})
		uh.Logger.Printf("User logged in -> [traceId = %s] :%v", traceID, res)
		return

	case <-ctx.Done():
		utils.WriteJSON(w, http.StatusRequestTimeout, utils.Envlope{"error": "Request timeout"})
		log.Printf("Request Timedout -> [traceID = %s]: %v", traceID, ctx.Err())
		return
	}
}
