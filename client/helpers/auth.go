package helpers

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"os"
	"strings"

	"github.com/logic-gate-sys/tares-cli/server/internals/store"
	"github.com/logic-gate-sys/tares-cli/server/internals/tokens"
)



type authUser struct {
 User   *store.User `json:"user"`
 Token  *tokens.Token `json:"token"`
}


func signup(ctx context.Context) (*store.User, error) {
	shouldTakeUsername :=true
	inputs := TakeInput(shouldTakeUsername)
	// construct body
	authBody :=store.User{
		Username: inputs.username, 
		Email: inputs.email,
		Password: store.Password{PlainText: &inputs.password},
	}
	data := RequestData{
	      URL: "/users/signup",
		  Body: authBody,
		  RequestType: "POST",
	}

	bytesResponse, err := MakeHttpRequest(ctx, data)
	if err !=nil{
		fmt.Println("API call failed: ", err)
		return nil , err
	}
	var user store.User
	if err := json.Unmarshal(bytesResponse, &user);
		err !=nil{
			return nil, err
		}
	return &user, nil
}

// Login user 
func login(ctx context.Context)(*store.User, *tokens.Token, error){
	shouldTakeUsername := false
	inputs:= TakeInput(shouldTakeUsername)
	// construct body
	authBody := store.User {
		Email: inputs.email,
		Password: store.Password{PlainText: &inputs.password},
	}
	
	data := RequestData{
	      URL: "/user/login",
		  Body: authBody,
		  RequestType: "POST",
	}
	bytesResponse, err := MakeHttpRequest(ctx, data)
	if err != nil{
		fmt.Println(err)
		return nil, nil, err
	}
	var envlope authUser 

	if err := json.Unmarshal(bytesResponse, &envlope);
		err !=nil{
           return nil,nil, fmt.Errorf("Invalid return body. Body")
		}
    fmt.Printf("User email: %s, token_hash: %v", envlope.User.Email, envlope.Token.Hash)
	return envlope.User, envlope.Token, nil
}

// Combines login/signup to effectively authenticate a user and authorise them
func Auth(ctx context.Context) (*authUser, error) {
	for {
		fmt.Println("1. Login")
		fmt.Println("2. Signup")
		fmt.Println("3. Exit")
		fmt.Print("Enter option (1-3): \n")
		os.Stdout.WriteString("->> ")

		// pick up and clean input 
		var choice string
		fmt.Scanln(&choice)
		choice = strings.TrimSpace(choice)
        
		// case for user 
		switch choice {
		case "1":
			fmt.Println("Trying to login...")
			user, token, err := login(ctx)
			if err != nil {
				if strings.Contains(strings.ToLower(err.Error()), "not found") || strings.Contains(err.Error(), "404") {
					fmt.Println("\n[ Notice ]: Account not found. Redirecting you to sign up first...")
					// 1. Force signup
					_, err := signup(ctx)
					if err != nil {
						log.Printf("Signup failed: %v", err)
						continue // Go back to the main option loop if signup fails
					}

					// 2. Automatically prompt them to login immediately after successful signup
					fmt.Println("\nNow, please login with your newly created credentials:")
					user, token, err = login(ctx)
					if err != nil {
						return nil, fmt.Errorf("signup succeeded, but subsequent login failed: %w", err)
					}
					
					return &authUser{User: user, Token: token}, nil
				}
				// other than that, failure has another cause
				fmt.Printf("Login failed: %v\n", err)
				continue
			}
			
			return &authUser{User: user, Token: token}, nil

		case "2":
			_, err := signup(ctx)
			if err != nil {
				fmt.Printf("Signup failed: %v\n", err)
				continue
			}
			
			// Following successful manual signup, auto-trigger a login so they don't have to cycle back
			fmt.Println("\nPlease login to verify your session:")
			user, token, err := login(ctx)
			if err != nil {
				return nil, err
			}
			return &authUser{User: user, Token: token}, nil

		case "3":
			fmt.Println("Authentication cancelled")
			return nil, errors.New("Exit")

		default:
			fmt.Println("Invalid choice. Please select 1, 2, or 3.")
		}
	}
}
