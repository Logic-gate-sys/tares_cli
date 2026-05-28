package utils

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/go-chi/chi"
)


type Envlope map[string]interface{}

func WriteJSON(w http.ResponseWriter, status int, data Envlope) error{
	js, err :=json.MarshalIndent(data, ""," ")
	if err !=nil{
		fmt.Println("Invalid data, cannot format to json")
		return err
	}
	js = append(js,'\n')
	// header
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	w.Write(js)

	return nil
}

func ReadIdParam (r *http.Request) (int64, error){
	 idParam := chi.URLParam(r, "id")

	 id, err :=strconv.ParseInt(idParam, 10, 64)
	 if err !=nil{
		return 0, err
	 }
	 return id, nil
}

