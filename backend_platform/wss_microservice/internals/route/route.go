package route

import (
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
	"github.com/logic-gate-sys/wss_service/internals/app"
	"github.com/logic-gate-sys/wss_service/internals/ws"
)

func SetupRoute(app *app.Application) *chi.Mux {
	router := chi.NewRouter()
	// 2. Configure and inject CORS middleware at the root level
	allowedOrigins := os.Getenv("ALLOWED_ORIGINS")
	if len(strings.Split(allowedOrigins, ","))<1{
	  fmt.Println("Invalid allowed origins")
	}
	origins := strings.Split(allowedOrigins, ",")
	router.Use(cors.Handler(cors.Options{
		AllowedOrigins:   origins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true, // for  HTTP-only cookies or auth headers
		MaxAge:           300,  // Maximum value for Preflight request caching (in seconds)
	}))
	roomManager := ws.NewRoomManager(app.RoomHandler.RoomStore, app.GrpcClient)

	// developer docs
	router.Get("/openapi.yaml", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/yaml; charset=utf-8")
		http.ServeFile(w, r, "openapi.yaml")
	})

	// protected routes
	router.Group(func(r chi.Router) {
		// authenticate all routes here
		r.Use(app.Middleware.Authenticate)
		r.Post("/rooms", app.Middleware.RequireAuth(http.HandlerFunc(app.RoomHandler.HandleCreateRoom)))
		r.Patch("/rooms/{id}", app.Middleware.RequireAuth(http.HandlerFunc(app.RoomHandler.HandleUpdateRoom)))
		r.Delete("/rooms/{id}", app.Middleware.RequireAuth(http.HandlerFunc(app.RoomHandler.HandleDeleteRoom)))
		r.Get("/rooms", app.Middleware.RequireAuth(http.HandlerFunc(app.RoomHandler.HandleGetRooms)))
		// websocket upgrade require authorisation
		r.Get("/ws", app.Middleware.RequireAuth(http.HandlerFunc(roomManager.HandleWS)))
	})

	// export router
	return router
}
