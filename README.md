# Tares CLI

Terminal-based multiplayer word scramble game built in Go.

## Architecture

```mermaid
flowchart TB
	subgraph Clients
		C1[tares-client\nPlayer 1]
		C2[tares-client\nPlayer 2]
	end

	subgraph Server[tares-server]
		RM[Room Manager\nmatch players into rooms]
		WS[WebSocket Server]
		API[REST API\n/auth/login /auth/register\n/leaderboard /stats]
		GE[Game Engine]
		DB[(Database)]
	end

	C1 -- WebSocket --> WS
	C2 -- WebSocket --> WS
	WS --> RM
	RM --> GE
	API --> GE
	GE --> DB
```

## Notes

- GitHub renders Mermaid diagrams directly.
- If a renderer does not support Mermaid, it will fall back to showing the fenced block as text.
