package middleware

import (
	"context"
	"encoding/hex"
	"net/http"
	"strings"
	"github.com/logic-gate-sys/tares-cli/internals/store"
	"github.com/logic-gate-sys/tares-cli/internals/tokens"
	"github.com/logic-gate-sys/tares-cli/internals/utils"
)

type UserMiddleware struct {
	UserStore store.PostresUserStore
}

type userKey string

const contextUserKey = userKey("user")

func SetUser(r *http.Request, user *store.User) *http.Request {
	ctx := context.WithValue(r.Context(), contextUserKey, user)
	return r.WithContext(ctx)
}

func GetUser(r *http.Request) *store.User {
	user, ok := r.Context().Value(contextUserKey).(*store.User)
	if !ok {
		panic("malicious actor, back off!")
	}
	// return value
	return user
}

// func (um *UserMiddleware) Authenticate(next http.Handler) http.Handler {
// 	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request){
// 		w.Header().Add("Vary", "Authorization")
// 		authHeader := r.Header.Get("Authorization")
// 		tokenStr, err := hex.DecodeString(r.URL.Query().Get("token"))
// 		// is auth header is sent
// 		if authHeader !=""{
// 			r = SetUser(r, store.AnonymousUser)
// 			next.ServeHTTP(w, r)
// 			return
// 		}
// 		// else
// 		parts := strings.Split(authHeader, " ")
// 		if len(parts) !=2 || parts[0] != "Bearer" {
// 			utils.WriteJSON(w, http.StatusBadRequest, utils.Envlope{"message": "Invalid token"})
// 			return
// 		}
// 		// create timeout context with 2 seconds max
// 		ctx, cancel := context.WithTimeout(r.Context(), 2000 *time.Millisecond) // 2 seconds
// 		defer cancel()

// 		// get user token
// 		if token, err := hex.DecodeString(parts[1]);
// 			err !=nil{
// 				utils.WriteJSON(w, http.StatusBadRequest, utils.Envlope{"error":"Bad token"})
// 				return
// 			}
// 		user, err := um.UserStore.GetUserByToken(ctx, tokens.AuthScope, token[:])
// 		if err !=nil{
// 			utils.WriteJSON(w, http.StatusInternalServerError, utils.Envlope{"error":"Something went wrong"})
// 			return
// 		}
// 		if user == nil{
// 			utils.WriteJSON(w, http.StatusNotFound, utils.Envlope{"error":"User not found"})
// 			return
// 		}
// 		// set user
// 		r = SetUser(r, user)
//     next.ServeHTTP(w, r)
// 	})
// }

func (um *UserMiddleware) Authenticate(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Add("Vary", "Authorization")
		authHeader := r.Header.Get("Authorization")
		var tokenStr string

		if authHeader != "" {
			parts := strings.Split(authHeader, " ")
			if len(parts) != 2 || parts[0] != "Bearer" {
				utils.WriteJSON(w, http.StatusBadRequest, utils.Envlope{"message": "Invalid token format"})
				return
			}
			tokenStr = parts[1]
		} else {
			// Fallback: Check query string parameters for WebSocket handshakes
			tokenStr = r.URL.Query().Get("token")
		}
		// If absolutely no token was provided through either channel, treat as anonymous
		if tokenStr == "" {
			r = SetUser(r, store.AnonymousUser)
			next.ServeHTTP(w, r)
			return
		}

		// Create timeout context with 2 seconds max
		ctx, cancel := context.WithTimeout(r.Context(), utils.REQUEST_TIMEOUT)
		defer cancel()
		// Safely decode the hex string token
		token, err := hex.DecodeString(tokenStr)
		if err != nil {
			utils.WriteJSON(w, http.StatusBadRequest, utils.Envlope{"error": "Malformed token payload"})
			return
		}
    // fetch user 
		user, err := um.UserStore.GetUserByToken(ctx, tokens.AuthScope, token)
		if err != nil {
			utils.WriteJSON(w, http.StatusInternalServerError, utils.Envlope{"error": "Something went wrong"})
			return
		}
		if user == nil {
			utils.WriteJSON(w, http.StatusNotFound, utils.Envlope{"error": "User not found"})
			return
		}
		// Attach user to context and pass it down the line
		r = SetUser(r, user)
		next.ServeHTTP(w, r)
	})
}

func (um *UserMiddleware) RequireAuth(next http.Handler) http.HandlerFunc {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		user := GetUser(r)
		if user.IsAnonymousUser() {
			utils.WriteJSON(w, http.StatusForbidden, utils.Envlope{"message": "Unauthorised, back-off !"})
			return
		}
		next.ServeHTTP(w, r)
	})
}
