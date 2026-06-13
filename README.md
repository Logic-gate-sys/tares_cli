# Tares CLI

Tares CLI is a terminal-based multiplayer word scramble game written in Go.
Players authenticate from the terminal, connect over WebSocket, and receive live game updates in the same window.

## What Lives In The Repo

```mermaid
flowchart LR
	subgraph Client
		CLI[tares-client\nterminal UI]
	end

	subgraph Server
		HTTP[HTTP API\n/signup /login]
		WS[WebSocket room endpoint\n/ws/rooms]
		RM[Room manager\nmatch lobby clients]
		ROOM[Game room\nscore + timer + broadcasts]
		DB[(PostgreSQL)]
	end

	CLI --> HTTP
	CLI --> WS
	WS --> RM
	RM --> ROOM
	ROOM --> DB
	HTTP --> DB
```

## How It Works

```mermaid
sequenceDiagram
	participant User as Player in terminal
	participant Client as tares-client
	participant API as HTTP API
	participant WS as WebSocket endpoint
	participant RM as Room manager
	participant Room as Game room
	participant DB as PostgreSQL

	User->>Client: choose Login or Signup
	Client->>API: POST /users/signup or POST /user/login
	API->>DB: create user / verify credentials / issue token
	DB-->>API: user + token
	API-->>Client: JSON response
	Client->>WS: connect to ws://localhost:8081/ws/rooms
	WS->>RM: authenticate and register lobby client
	RM->>Room: join or create room
	Room-->>Client: live broadcasts and score updates
```

## Quick Start

### Requirements

- Go 1.26.3 or compatible
- PostgreSQL running locally
- A database named `tares_db`

### Database Connection

The server currently opens PostgreSQL with this connection string:

```text
host=localhost user=logic dbname=tares_db port=5433 password=logicgate sslmode=disable
```

Adjust your local database to match that configuration, or update the server code before running.

### Run The Server

```bash
go run ./server
```

The server listens on port `8081` by default and applies database migrations on startup.

### Run The Client

```bash
go run ./client
```

The client will prompt you to:

1. Login
2. Signup
3. Exit


After authentication, it opens a WebSocket connection to:

```text
ws://localhost:8081/ws/rooms
```

## Terminal Flow

```mermaid
flowchart TD
	A[Start client] --> B[Choose Login or Signup]
	B --> C[Send HTTP request]
	C --> D[Receive user + token]
	D --> E[Open WebSocket connection]
	E --> F[Receive live room/game broadcasts]
	F --> G[Type in terminal actions]
	G --> H[Send JSON action to server]
```

## Supported Client Actions

The client currently sends these actions after the socket is open:

- `SEND_WORD`
- `PAUSE_GAME`
- `RESUME_GAME`
- `STOP_GAME`

## Project Layout

```text
client/
	main.go                 terminal entrypoint
	helpers/                auth and HTTP helper functions

server/
	main.go                 server entrypoint
	internals/api/          HTTP handlers
	internals/middleware/   request auth middleware
	internals/route/        route registration
	internals/ws/           room manager and websocket clients
	internals/store/        database access
	migrations/             goose migrations
	dictionary/             word lists
```