package store

import (
	"database/sql"
	"fmt"
	"io/fs"
	"github.com/pressly/goose/v3"
   _ "github.com/jackc/pgx/v4/stdlib"
)



func Open()(*sql.DB, error){
	connectionString :="host=localhost user=postgres dbname=postgres port=5433 password=postgres sslmode=disable"
	db, err := sql.Open("pgx", connectionString)
	if err !=nil{
		return nil, err
	}
	// the database should now be done
    fmt.Println("Database connected, wating migration")
	return db, nil
}

func MigrateFS(db *sql.DB, migrationFS fs.FS, dir string) error{
	goose.SetBaseFS(migrationFS)
	defer func(){
		goose.SetBaseFS(nil)
	}()

	return Migrate(db, dir)     
}


func Migrate(db *sql.DB, dir string) error{
	err := goose.SetDialect("postgres")
	if err !=nil{
		fmt.Println("Failed to set goose postgres dialet")
		return err
	}
	//migrate 
	err = goose.Up(db, dir)
	if err !=nil{
		fmt.Println("Failed to migrate DB")
		return err 
	}

	return nil
}