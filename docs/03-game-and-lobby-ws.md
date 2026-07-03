State Machine (Client <-> Server wss)
User authenticate(login/signup)---> UI(take user to game-lobby)
User request to create arena ---> Server picks up ---> Process the wss request ---> Return an error/success
If error is returned ---> User is updated 
If result is returned ---> UI(updates with arena details: name, capacity, and current participants)
User can request to join an arena---> UI ---> server ---> response/error ---> UI updates appropriately
