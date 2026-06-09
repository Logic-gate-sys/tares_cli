package middleware

import (
	"context"
	"net/http"
	"strings"
	"time"
	"github.com/logic-gate-sys/tares-cli/server/internals/store"
	"github.com/logic-gate-sys/tares-cli/server/internals/tokens"
	"github.com/logic-gate-sys/tares-cli/server/internals/utils"
)


type UserMiddleware struct {
	UserStore      store.PostresUserStore
}

type userKey string 
const contextUserKey = userKey("user")

func SetUser(r *http.Request, user *store.User) *http.Request {
    ctx :=context.WithValue(r.Context(), contextUserKey, user)
	return r.WithContext(ctx)
}

func GetUser(r *http.Request) (*store.User) {
	user, ok := r.Context().Value(contextUserKey).(*store.User)
	if !ok {
		panic("malicious actor, back off!")
	}
    // return value
	return user
}

func (um *UserMiddleware) Authenticate(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request){
		w.Header().Add("Vary", "Authorization")
		authHeader := r.Header.Get("Authorization")
		if authHeader =="" {
			r = SetUser(r, store.AnonymousUser)
			next.ServeHTTP(w, r)
			return 
		}
		parts := strings.Split(authHeader, " ")
		if len(parts) !=2 || parts[0] != "Bearer" {
			utils.WriteJSON(w, http.StatusBadRequest, utils.Envlope{"message": "Invalid token"})
			return 
		}
		ctx, cancel := context.WithTimeout(r.Context(), 2000 *time.Millisecond) // 2 seconds
		defer cancel()

		// get user token
		token := parts[1]
		user, err := um.UserStore.GetUserByToken(ctx, tokens.AuthScope,token)
		if err !=nil{
			utils.WriteJSON(w, http.StatusInternalServerError, utils.Envlope{"error":"Something went wrong"})
			return 
		}
		if user == nil{
			utils.WriteJSON(w, http.StatusNotFound, utils.Envlope{"error":"User not found"})
			return 	
		}
		// set user 
		r = SetUser(r, user)
        next.ServeHTTP(w, r)
	})
}


func (um *UserMiddleware) RequireAuth(next http.Handler) http.HandlerFunc{
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request){
		user := GetUser(r)
		if user.IsAnonymousUser(){
			utils.WriteJSON(w, http.StatusForbidden, utils.Envlope{"message":"Unauthorised, get out of here!"})
			return
		}
		next.ServeHTTP(w, r)
	})
}