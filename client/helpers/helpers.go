package helpers

import (
	"bufio"
	"fmt"
	"os"
	"strings"
)

type UserInputs struct {
	username string 
	email    string
	password string
}


func TakeInput(takeUsername bool)(UserInputs){
	var inputs UserInputs
	var username, email, password string 
	scanner := bufio.NewScanner(os.Stdin)
	if err := scanner.Err(); err !=nil{
		panic("Can't open std scanner , please try again later")
	}
    os.Stdout.WriteString("-->> ")
	for {
		// If username should be taken 
		 if takeUsername {
			for {
            	fmt.Println("Enter your username:  ")
				scanner.Scan()
				username = strings.TrimSpace(scanner.Text())
				if username =="" {
					fmt.Printf("Invalid username: %s", username)
					continue
		    }
			inputs.username = username
			break 
	       }

		 } 

		for {
			fmt.Println("Enter your email address:  ")
		    scanner.Scan()
		    email = strings.TrimSpace(scanner.Text())
		   if email =="" {
			  fmt.Printf("Invalid email: %s", email)
			  continue
		    }
			inputs.email = email
			break
	   }

		for {
			fmt.Println("Enter your password:  ")
			scanner.Scan()
			password = strings.TrimSpace(scanner.Text())
            if password ==""{
				fmt.Printf("Invalid password: %s", password)
				continue
			}
			inputs.password = password
			break 
	   }
	   break 
	}

	return inputs
}

