package app

import (
	"database/sql"
	"log"
	"os"
	"github.com/logic-gate-sys/tares-cli/internals/api"
	"github.com/logic-gate-sys/tares-cli/internals/middleware"
	"github.com/logic-gate-sys/tares-cli/internals/migrations"
	"github.com/logic-gate-sys/tares-cli/internals/store"
)

type Application struct {
	Logger      *log.Logger
	DB          *sql.DB
	UserHandler *api.UserHandler
	RoomHandler *api.RoomHandler
	Middleware  middleware.UserMiddleware
}

func NewApplication() (*Application, error) {
	//logger
	logger := log.New(os.Stdout, " ", log.Ldate|log.Ltime)
	db, err := store.Open()

	if err != nil {
		return nil, err
	}
	userStore := store.NewPostgresUserStore(db)
	roomStore :=store.NewPostgresRoomStore(db)
	tokenStore := store.NewPostgresTokenStore(db)
	// migrate database
	err = store.MigrateFS(db, migrations.FS, ".")
	if err != nil {
		panic(err)
	}
	// all handlers
	userHandler := api.NewUserHandler(userStore, tokenStore, logger)
	roomHandler := api.NewRoomHandler(roomStore, logger)
	middleware := middleware.UserMiddleware{UserStore: *userStore}

	//application
	app := &Application{
		Logger:      logger,
		DB:          db,
		UserHandler: userHandler,
		RoomHandler: roomHandler,
		Middleware:  middleware,
	}
	return app, nil
}
