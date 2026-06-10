package route

import (
	"net/http"
	"github.com/go-chi/chi/v5"
	"github.com/logic-gate-sys/tares-cli/server/internals/app"
	"github.com/logic-gate-sys/tares-cli/server/internals/ws"
)


func SetupRoute(app *app.Application)*chi.Mux{
  router := chi.NewRouter()
  router.Post("/users/signup", app.UserHandler.HandleUserSignup)
  router.Post("/user/login", app.UserHandler.HandleUserSignin )

  // protected routes 
  router.Group(func(r chi.Router){
    // authenticate all routes here 
    r.Use(app.Middleware.Authenticate)

    // websocket upgrade require authorisation
    rm := ws.NewRoomManager() 
    r.Get("/ws/rooms", app.Middleware.RequireAuth(http.HandlerFunc(rm.HandleWS)) )
  })

  
  // export router
  return router 
}
The fun and creativity of word-scramble games never dies , but it's still stuck in the old age of static games, outside the terminal. Tares cli brings it back 'web socket' delivered with multi-player support all in the terminal. This is opensource and upon v1 release 