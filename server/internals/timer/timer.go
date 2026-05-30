package timer

import (
	"sync"
	"time"
)

type GameClock struct {
	ticker  *time.Ticker
	tickChan chan time.Time
	stopChan chan struct {}
	isPause  bool 
	mu        sync.RWMutex
}

func NewGameClock() *GameClock {
	return &GameClock{ 
		tickChan: make(chan time.Time, 1),
		stopChan: make(chan struct{}),
	}
}

func (gc *GameClock)Start() {
	gc.ticker = time.NewTicker(1 *time.Second)
	// spawn a go routine for start 
	go func(){
		for{
			select {
			case t := <- gc.ticker.C :
				// check for is pause but lock read mutex
				gc.mu.RLock()
				isPaused := gc.isPause
				gc.mu.RUnlock()

				// if it's not paused
				if !isPaused {
					select {
					case gc.tickChan <- t:
						// sent the tick to channel
				    default:
						// do nothing so that you don't block room run 
					}
				}
             // if something comes down the stop channel 
			case <- gc.stopChan :
				return 
			}
		}
	}()
}

// Tick returns a read-only channel for room to user
func (gc *GameClock) Tick()<- chan time.Time {
	return gc.tickChan
}

// Pause holds the timer running 
func (gc *GameClock) Pause(){
	gc.mu.Lock()
	gc.isPause = true
	gc.mu.Unlock()
}

func (gc *GameClock) Resume(){
	gc.mu.Lock()
	gc.isPause = false
	gc.mu.Unlock()
}

// STOP  release the system resoures 
func (gc *GameClock) Stop(){ 
	if gc.ticker !=nil{
		gc.ticker.Stop()
	}
	close(gc.stopChan)
}