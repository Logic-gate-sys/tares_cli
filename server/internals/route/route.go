package route

import (
	"net/http"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
	"github.com/logic-gate-sys/tares-cli/internals/app"
	"github.com/logic-gate-sys/tares-cli/internals/ws"
)

func SetupRoute(app *app.Application) *chi.Mux {
	router := chi.NewRouter()
	// 2. Configure and inject CORS middleware at the root level
	router.Use(cors.Handler(cors.Options{
		// AllowedOrigins:   []string{"https://foo.com"}, // Use this for production
		AllowedOrigins:   []string{"http://localhost:5173","http://localhost:5174"}, 
		AllowedMethods:   []string{"GET", "POST", "PUT","PATCH","DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true, // for  HTTP-only cookies or auth headers
		MaxAge:           300,  // Maximum value for Preflight request caching (in seconds)
	}))
	router.Post("/users/signup", app.UserHandler.HandleUserSignup)
	router.Post("/users/login", app.UserHandler.HandleUserSignin)

	// protected routes
	router.Group(func(r chi.Router) {
		// authenticate all routes here
		r.Use(app.Middleware.Authenticate)
		r.Post("/rooms", app.Middleware.RequireAuth(http.HandlerFunc(app.RoomHandler.HandleCreateRoom)))
		r.Patch("/rooms/{id}", app.Middleware.RequireAuth(http.HandlerFunc(app.RoomHandler.HandleUpdateRoom)))
		r.Delete("/rooms/{id}", app.Middleware.RequireAuth(http.HandlerFunc(app.RoomHandler.HandleDeleteRoom)))
		r.Get("/rooms", app.Middleware.RequireAuth(http.HandlerFunc(app.RoomHandler.HandleGetRooms)))
		// websocket upgrade require authorisation
		rm := ws.NewRoomManager()
		r.Get("/ws", app.Middleware.RequireAuth(http.HandlerFunc(rm.HandleWS)));
	})

	// export router
	return router
}
