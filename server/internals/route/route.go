package route

import (
	"github.com/go-chi/chi/v5"
	"github.com/logic-gate-sys/tares-cli/server/internals/app"
	"github.com/logic-gate-sys/tares-cli/server/internals/ws"
)


func SetupRoute(app *app.Application)*chi.Mux{
  router := chi.NewRouter()
  // POSTS 
  router.Post("/users", app.UserHandler.HandleCreateUser)

  // ------- web socket -------
  rm := ws.NewRoomManager()
  
  // WS upgrader routes 
  router.Get("/ws/room/{id}", rm.HandleWS)
  // export router
  return router 
}