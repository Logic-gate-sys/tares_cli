package app

import (
	"database/sql"
	"log"
	"os"

	"github.com/logic-gate-sys/tares-cli/server/internals/api"
	"github.com/logic-gate-sys/tares-cli/server/internals/store"
	"github.com/logic-gate-sys/tares-cli/server/migrations"
)

type Application struct{
	Logger *log.Logger
	DB   *sql.DB
	UserHandler *api.UserHandler
}

func NewApplication()(*Application, error){
   //logger 
   logger := log.New(os.Stdout, " ", log.Ldate|log.Ltime)
   // db 
   db,err := store.Open()

   if err !=nil{
	 return nil, err
   }
   userStore := store.NewPostgresUserStore(db)
   // migrate database
   err = store.MigrateFS(db, migrations.FS, ".")
   if err !=nil{
      panic(err)
   } 
   // all handlers
   userHandler := api.NewUserHandler(userStore, logger)


   //application 
   app := &Application{
      Logger: logger, 
      DB: db, 
      UserHandler:userHandler,
   }
   return app, nil
}