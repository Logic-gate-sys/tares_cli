package engine

import (
	"log"
	"os"
	"testing"
)

func TestMain(m *testing.M) {
	if err := os.Chdir("../../../"); err != nil {
	   log.Fatalf("Test setup failed with error: %v", err.Error())
	}
	os.Exit(m.Run())
}

func TestWordScoring(t *testing.T) {
	// generate take works  in 5 consercutive rounds and verify validity
	test_cases := []struct {
		name           string
		word           string
		difficulty     Difficulty
		expected_score float32
}{
		// Valid Word Scoring Tests
		{name: "Valid word - Easy tier", word: "crane", difficulty: Easy, expected_score: 1},
		{name: "Valid word - Medium tier", word: "balloon", difficulty: Medium, expected_score: 2},
		{name: "Valid word - Hard tier", word: "fabulous", difficulty: Hard, expected_score: 3},
		{name: "Valid word - Extreme tier", word: "scramble", difficulty: Extreme, expected_score: 6}, // 2 * Expert (3) = 6
		//Invalid Word Error Tests (Expected score 0 due to validation failure)
		{name: "Invalid word - Medium tier typo", word: "darious", difficulty: Medium, expected_score: 0},
		{name: "Invalid word - Hard tier typo", word: "somberr", difficulty: Hard, expected_score: 0},
		{name: "Invalid word - Easy tier garbage input", word: "xyzq", difficulty: Easy, expected_score: 0},
		{name: "Invalid word - Extreme tier failure", word: "notaword", difficulty: Extreme, expected_score: 0},
		// Structural & Input Boundary Edge Cases
		{name: "Edge Case - Empty string input", word: "", difficulty: Medium, expected_score: 0},
		{name: "Edge Case - Single letter input", word: "a", difficulty: Easy, expected_score: 0},
}
	for _, tt_c := range test_cases {
		t.Run(tt_c.name, func(t *testing.T) {
			score, err := ScoreWord(tt_c.word, tt_c.difficulty)
			if err != nil && score == 0 {
				t.Fatalf("ScoreWord returned unexpected error for '%s': %v", tt_c.word, err.Error())
				return
			}
			if tt_c.expected_score != score {
				t.Errorf("Word: %s Expected_score: %f  Actual_score: %f", tt_c.word, tt_c.expected_score, score)
			}
		})
	}
}

