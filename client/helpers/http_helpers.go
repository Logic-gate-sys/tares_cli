package helpers

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
)



const httpBaseURL ="http://localhost:8081"
type ReqType  string
const (
	Post  ReqType ="POST"
	Get   ReqType = "GET"
)
type RequestData struct {
	Body      interface{}
	Token     string // acess token
	URL       string // remaining string 
	RequestType ReqType
}

func MakeHttpRequest(ctx context.Context, data RequestData) ([]byte, error){
	var bodyReader io.Reader
	if data.Body !=nil{
        jsonData, err := json.Marshal(data.Body)
		if err !=nil{
			log.Printf("Error marshalling request body : %v", err)
			return nil, err
		}
		bodyReader = bytes.NewBuffer(jsonData)
	}
    
	// request 
	req, err:= http.NewRequestWithContext(ctx, string(data.RequestType), httpBaseURL+string(data.URL),bodyReader )
	if err !=nil{
		log.Printf("Error creating new request: %v", err) 
		return nil, err
	}
    // set header & token
	req.Header.Set("Content-Type","application/json")
	if data.Token !="" {
		req.Header.Set("Authorization", "Bearer "+data.Token)
	}
    client :=&http.Client{}
	resp, err := client.Do(req)
	if err !=nil{
		log.Printf("Error executing request: %v", err)
		return nil, err
	}
	defer resp.Body.Close()

	// read bytes
	bodyBytes, err := io.ReadAll(resp.Body)
	if err !=nil{
		return nil, err
	}

	if resp.StatusCode >= 400{
		return nil, fmt.Errorf("Bad request (Status = %d)", resp.StatusCode)
	}
	
	return bodyBytes, nil
}