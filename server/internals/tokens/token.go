package tokens

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/base32"
	"time"
)


const (
	AuthScope = "authentication";
)

type Token struct {
	PlainText   string `json:"token"`
	Hash        []byte `json:"token_hash"`
	UserID      int     `json:"user_id"`
	Expiry      time.Time `json:"expiry"`
	Scope       string   `json:"scope"` 
}


func GenerateToken(user_id int, ttl time.Duration, scope string) (*Token, error){
	token := &Token{
		UserID: user_id,
		Expiry: time.Now().Add(ttl),
		Scope: scope,
	}
	//make 32 bytes empty byte 
	empty_byte := make([]byte, 32)
	//fill empty byte with random values 
	_, err := rand.Read(empty_byte)
	if err !=nil{
		return nil, err
	}
	//add plain token text
	token.PlainText = base32.StdEncoding.WithPadding(base32.NoPadding).EncodeToString(empty_byte)
	hash := sha256.Sum256([]byte(token.PlainText))
	token.Hash = hash[:]
	return token, nil
}