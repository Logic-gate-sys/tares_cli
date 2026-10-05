package engine

import (
	"bufio"
	"crypto"
	"fmt"
	"math/rand/v2"
	"strings"
	"time"
	"github.com/logic-gate-sys/wss_service/internals/dictionary"
	"github.com/logic-gate-sys/wss_service/internals/events"
)

/*
  Philosophy of the game: "Hit db less, worry less about db letency"
  Data base is updated after the game:
  - limit db inserts to reduce latency
  - When a user quits or game ends abruptly , all score for the game maybe lost
*/

type GameEngineInterface interface {
	UserScoreWord(word string, diff Difficulty) (float32, error)
	ManageTimer()
}

// NewGame initializes a new game engine instance
func NewGame(roomId string) *Game {
	return &Game{
		ID: crypto.BLAKE2b_256.Size(),
		ActiveRoom: ActiveRoom{
			ID:         roomId,
			Scores:     make(map[string]int),
			UsedWords:  make(map[string]string),
			WordCounts: make(map[string]int),
			Done:       make(chan struct{}),
		},
		// By default assuming duration per round is 60 seconds
		Duration: 60 * time.Second,
		state:    events.GameStateBroadcast{},
	}
}

// This func validates user's submitted word exist and applies the appropriate score
func ScoreWord(word string, diff Difficulty) (float32, error) {
	word = strings.ToLower(strings.TrimSpace(word))
	if word == "" {
		return 0, nil
	}
	if len(word) < 2 {
		return 0, nil
	}
	content, err := dictionary.Words.ReadFile("words.txt")
	if err != nil {
		return 0, fmt.Errorf("failed to load embedded dictionary: %w", err)
	}
	isValid, err := ValidateWordContent(word, content)
	if err != nil {
		return 0, err
	}
	if !isValid {
		return 0, nil
	}

	switch diff {
	case Easy:
		return float32(Amateur), nil
	case Medium:
		return float32(Intermediate), nil
	case Hard:
		return float32(Expert), nil
	case Extreme:
		return float32(2 * Expert), nil
	default:
		return 0, nil
	}
}

// StartRound chooses a dictionary word and creates the scrambled word shown
// to every player for the current round.
func (g *Game) StartRound() (string, error) {
	g.mux.Lock()
	defer g.mux.Unlock()

	words, err := g.dictionaryWords()
	if err != nil {
		return "", err
	}
	if len(words) == 0 {
		return "", fmt.Errorf("dictionary does not contain playable words")
	}

	word := words[rand.IntN(len(words))]
	letters := strings.Split(strings.ToUpper(word), "")
	rand.Shuffle(len(letters), func(i, j int) {
		letters[i], letters[j] = letters[j], letters[i]
	})
	g.CurrentWord = strings.ToLower(word)
	g.ScrambledWord = strings.Join(letters, "")
	g.ActiveRoom.UsedWords = make(map[string]string)
	g.ActiveRoom.WordCounts = make(map[string]int)
	return g.ScrambledWord, nil
}

// ScoreSubmission validates a word, rejects duplicate submissions for the
// current round, and updates the player's score in memory.
func (g *Game) ScoreSubmission(playerID string, word string, diff Difficulty) (float32, error) {
	g.mux.Lock()
	defer g.mux.Unlock()

	word = strings.ToLower(strings.TrimSpace(word))
	if word == "" {
		return 0, nil
	}
	if !canBuildWord(word, g.CurrentWord) {
		return 0, nil
	}
	if _, used := g.ActiveRoom.UsedWords[word]; used {
		return 0, nil
	}

	score, err := ScoreWord(word, diff)
	if err != nil || score == 0 {
		return score, err
	}
	g.ActiveRoom.UsedWords[word] = playerID
	g.ActiveRoom.Scores[playerID] += int(score)
	g.ActiveRoom.WordCounts[playerID]++
	return score, nil
}

func canBuildWord(word string, letters string) bool {
	available := make(map[rune]int)
	for _, letter := range strings.ToLower(letters) {
		available[letter]++
	}
	for _, letter := range word {
		if available[letter] == 0 {
			return false
		}
		available[letter]--
	}
	return true
}

func (g *Game) dictionaryWords() ([]string, error) {
	content, err := dictionary.Words.ReadFile("words.txt")
	if err != nil {
		return nil, fmt.Errorf("failed to load embedded dictionary: %w", err)
	}

	words := make([]string, 0)
	scanner := bufio.NewScanner(strings.NewReader(string(content)))
	for scanner.Scan() {
		word := strings.ToLower(strings.TrimSpace(scanner.Text()))
		if len(word) >= 3 && len(word) <= 12 {
			words = append(words, word)
		}
	}
	if err := scanner.Err(); err != nil {
		return nil, err
	}
	return words, nil
}

// This writes to db after the end of the game, this does not apply when play quits
func (g *Game) UpdatePlayerScore(playerId string, score float32) error {
	g.mux.Lock()
	defer g.mux.Unlock()

	g.ActiveRoom.Scores[playerId] += int(score)
	return nil
}

// Generates In-Game status report after each round : does not retrive directly from db
func (g *Game) GenerateStatsReport() events.GameStateBroadcast {
	g.mux.Lock()
	defer g.mux.Unlock()

	return events.GameStateBroadcast{
		Which: events.ToJoinedClient,
		Data: events.GameStateData{
			RoomId: g.ActiveRoom.ID,
			Status: events.Playing,
			Scores: g.ActiveRoom.Scores,
		},
	}
}

func (g *Game) CurrentGameData(roomID string, round int, status events.Status, timeLeft int) events.GameStateData {
	g.mux.Lock()
	defer g.mux.Unlock()

	scores := make(map[string]int, len(g.ActiveRoom.Scores))
	wordCounts := make(map[string]int, len(g.ActiveRoom.WordCounts))
	for playerID, score := range g.ActiveRoom.Scores {
		scores[playerID] = score
	}
	for playerID, count := range g.ActiveRoom.WordCounts {
		wordCounts[playerID] = count
	}
	return events.GameStateData{
		RoomId:        roomID,
		Round:         round,
		Status:        status,
		TimeLeft:      timeLeft,
		ScrambledWord: g.ScrambledWord,
		Scores:        scores,
		WordCounts:    wordCounts,
	}
}
