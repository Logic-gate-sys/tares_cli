package engine

import (
	"sync"
	"time"
	"golang.org/x/net/websocket"
)
 
// structs and interfaces
type Game struct {
	ID 	int 
	Players []Player
	Letters []LetterSet
	ActiveRoom ActiveRoom
	Duration time.Duration
	mux         sync.Mutex // controls data changes efficiently
}

type Player struct{
	ID   int `json:"id"`
	UserName string `json:"user_name"`
	Send    chan struct{}
	Conn    *websocket.Conn

}

type LetterSet struct {
	Letters    []string // e.g: ["T","A","R","E","S","N","I"]
	ValidWords []string // all words formable from these letters
}
 
// ActiveRoom 
type ActiveRoom struct {
	ID        string `json:"id"`
	Players   []*Player
	LetterSet *LetterSet
	UsedWords map[string]string // word → name 
	Scores    map[string]int    // name → their current score
	StartedAt time.Time `json:"started_at"`
	Done      chan struct{} 
	mu        sync.Mutex   
}
// game difficulty 
type Difficulty int
const (
	Easy    Difficulty = iota  // 5 letters, more vowels
	Medium  
	Hard    
	Extreme 
)

type MaxScore int 
const (
	Amateur          MaxScore =1
	Intermediate     MaxScore =2
	Expert           MaxScore =3 
)
