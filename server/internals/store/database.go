package store

import (
	"database/sql"
	"errors"
	"fmt"
	"io/fs"
	"os"
	_ "github.com/jackc/pgx/v4/stdlib"
	"github.com/joho/godotenv"
	"github.com/pressly/goose/v3"
)



func Open()(*sql.DB, error){
	_=godotenv.Load()
	connectionString := os.Getenv("DATABASE_URL")
	if connectionString ==""{
		return nil, errors.New("Invalid DATABASE_URL")
	}
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