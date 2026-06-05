package helpers

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"time"
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

func MakeHttpRequest(ctx context.Context,data RequestData) ([]byte, error){
    jsonData, err := json.Marshal(data.Body)
	if err !=nil{
		log.Printf("Error : %v", err)
		return nil, err
	}
	client := http.Client{Timeout: 1500*time.Millisecond}
	// request 
	req, err:=http.NewRequestWithContext(ctx,string(data.RequestType),httpBaseURL+string(data.URL),nil )
	if err !=nil{
		log.Printf("Error : %v", err)
		return nil, err
	}
	if data.Body !=nil{
		req.Body = io.NopCloser(bytes.NewBuffer(jsonData))
	}

	req.Header.Set("Content-Type","application/json")
	if data.Token !="" {
		req.Header.Set("Authorization", "Bearer "+data.Token)
	}

	resp, err := client.Do(req)
	if err !=nil{
		log.Printf("Error : %v", err)
		return nil, err
	}
	defer resp.Body.Close()

	bodyBytes, err :=io.ReadAll(resp.Body)
	if err !=nil{
		return nil, err
	}
	if resp.StatusCode >=400{
		return nil, fmt.Errorf("Bad request: %v", bodyBytes)
	}
	
	return bodyBytes, nil
}