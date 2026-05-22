------------------ TARES GAME CLI  ----------------------
┌─────────────────────────────────────────────────────────┐
│                    TARES SYSTEM                         │
│                                                         │
│   ┌──────────────┐          ┌──────────────┐            │
│   │ tares-client │          │ tares-client │            │
│   │  (Player 1)  │          │  (Player 2)  │            │
│   │              │          │              │            │
│   │  Terminal UI │          │  Terminal UI │            │
│   └──────┬───────┘          └──────┬───────┘            │
│          │ WebSocket               │ WebSocket          │
│          │                         │                    │
│          ▼                         ▼                    │
│   ┌─────────────────────────────────────────┐           │
│   │              tares-server               │           │
│   │                                         │           │
│   │  ┌─────────┐      ┌─────────────────┐   │           │
│   │  │ Room    │      │  RoomManager    │   │           │
│   │  │ Manager │─────►│  matches players│   │           │
│   │  └─────────┘      │  into rooms     │   │           │
│   │                   └─────────────────┘   │           │
│   │  ┌──────────────────────────────────┐   │           │
│   │  │           Game Room              │   │           │
│   │  │                                  │   │           │
│   │  │  player1 ◄──────────────────►    │   │           │
│   │  │  player2   shared game state  │  │   │           │
│   │  │            (mutex protected)  │  │   │           │
│   │  │                               │  │   │           │
│   │  │  timer goroutine running      │  │   │           │
│   │  │  independently                │  │   │           │
│   │  └──────────────────────────────────┘   │           │
│   │                                         │           │
│   │  REST API: /stats /leaderboard          │           │
│   └─────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────┘

# How the components should interract together 
┌─────────────────────────────────────────────────────────────┐
│                     TARES SERVER                            │
│                                                             │
│  ┌─────────────────────┐    ┌─────────────────────────┐     │
│  │     HTTP REST API   │    │    WebSocket Server      │    │
│  │                     │    │                          │    │
│  │  POST /auth/register│    │  ws://host/game          │    │
│  │  POST /auth/login   │    │                          │    │
│  │  GET  /leaderboard  │    │  - real-time game state  │    │
│  │  GET  /stats/:name  │    │  - word submissions      │    │
│  │                     │    │  - score updates         │    │
│  └──────────┬──────────┘    └───────────┬──────────────┘    │
│             │                           │                   │
│             └─────────────┬─────────────┘                   │
│                           │                                 │
│                           ▼                                 │
│             ┌─────────────────────────┐                     │
│             │      Game Engine        │                     │
│             │                         │                     │
│             │  - Room management      │                     │
│             │  - Word validation      │                     │
│             │  - Score calculation    │                     │
│             │  - Timer management     │                     │
│             │  - Matchmaking          │                     │
│             └─────────────┬───────────┘                     │
│                           │                                 │
│                           ▼                                 │
│                  ┌─────────────────┐                        │
│                  │    Database     │                        │
│                  │                 │                        │
│                  │  - Users        │                        │
│                  │  - Game history │                        │
│                  │  - Leaderboard  │                        │
│                  └─────────────────┘                        │
└─────────────────────────────────────────────────────────────┘