package main

import (
	"flag"
	"fmt"
	"net/http"
	"time"
	"githhub.com/logic-gate-sys/tares-cli/server/internals/app"
	"githhub.com/logic-gate-sys/tares-cli/server/internals/route"
)

func main(){
	// port value
	var port int 
	flag.IntVar(&port, "port", 8080,"Backend server port")
	flag.Parse()

	// initialise application
     app, err := app.NewApplication()
	 if err !=nil{
		fmt.Println("Application failed to start")
		return 
	 }
	// defer db close
     defer app.DB.Close()
	// initialise router
    router := route.SetupRoute(app)
	// initialise server 
	server:=&http.Server{
		Addr: fmt.Sprintf(":%d", port),
		Handler: router,
		IdleTimeout: time.Minute,
		ReadTimeout: 10 * time.Second,
		WriteTimeout: 30 * time.Second,
	}

	err = server.ListenAndServe()
    if err !=nil{
		app.Logger.Fatal("Server failed to start properly")
	}

}