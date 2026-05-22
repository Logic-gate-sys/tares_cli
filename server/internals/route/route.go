package route

import (
	"githhub.com/logic-gate-sys/tares-cli/server/internals/app"
	"github.com/go-chi/chi/v5"
)


func SetupRoute(app *app.Application)*chi.Mux{
  router := chi.NewRouter()
  // POSTS 
  router.Post("/users", app.UserHandler.HandleCreateUser)


  // export router
  return router 
}