# Game State (Socket interaction)

After a player enters a room, the room owner sends an `in:game` message with
`action: "owner:start:game"`. The WSS service validates ownership and broadcasts
the authoritative game state to every room client:

`WAITING -> COUNTDOWN -> PLAYING -> ROUND_OVER -> COUNTDOWN -> PLAYING ... -> FINISHED`

There are exactly three rounds. Each round has a three-second countdown and a
60-second playing window. Clients render `round`, `time_left`, `status`,
`scrambled_word`, and `scores` from the server event; they must not run a
separate timer. Non-owners see the same state but cannot start the game.
2. GameSocket(verifies and connect an authenticated user to lobby socket)
3. User finds online rooms(game rooms) and requests to join
4. All members receives the request via server socket
5. One member(owner) resolves request (accept or deny)
6. User (requester ) receives status of request 
7. If accepted (requester) enters game arena or else such arena locks to them for the entire game
8. If requester joins room:
   - Requestor receives timer(count down) based on when next round starts
   - Receives scramble and can submit answers(once based on scrambled word)
   - Receives real-time feedback on scores and submitted word of each player in the room 
   - Future (can chat) with members of the game during game
   - Can be part of a team against another team and play game
     - If part of a team (one team member submits word and score (whether correct or wrong is recorded for entire team))
   - In-game stats are displayed in group while game plays 
   - When game ends, final stats is broadcasted to all memebers (with leader board details)

# State transitions: 
1. User connects via wss --> User enters game lobby:
    - Here user can: 
      1. view all available rooms
      2. request to join a room
      3. leave lobby, this closes client's socket 
2. User finds room they like 
   --> request to join 
   --> wait for request to be resolved 
   --> room creator receives request 
   --> accepts/deny (if accepted, requestor automatically gets in the room else they receive a denied response)
 
    