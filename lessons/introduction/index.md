# Web Client Setup & Architecture Foundation

**The pain:** _We have a working Go backend with WebSockets and real-time game logic. But without a production-grade React frontend, we're shipping a terminal CLI to Gen-Z kids. We need a vibrant, real-time web client that can handle multiplayer chaos, instant feedback, and beautiful animations. Where do we even start?_

We're not building features today. We're building the **foundation** that every feature will live on. It's a React + Vite + TypeScript project, a build pipeline, and the architectural blueprints that keep the client and server in sync. Get this wrong and animation flickers, state desynchronizes, and every feature becomes a mess of prop drilling and context leaks.

> The line we repeat all day: **the web client is a state machine wrapped in animations.** The React component tree renders the machine's state; GSAP owns the motion; the WebSocket keeps it synchronized with the server.**

---

## What you start with

Your `tares_cli` repository currently has:

- **`server/`** – Fully functional Go game server with WebSocket support
  - HTTP API endpoints (`/signup`, `/login`)
  - WebSocket endpoint (`/ws/rooms`)
  - Real-time game broadcasts (score, timer, word submissions)
  - PostgreSQL database with migrations
  
- **`client/`** – Deprecated Go CLI client (we're replacing this)

- **`Makefile`** – Basic build targets for the server

- **Root-level `docker-compose.yaml`** – PostgreSQL and server setup

- **No `docs/` folder** – Documentation structure doesn't exist yet

- **No `web-client/` folder** – Frontend workspace is blank

What we're building today:
- A modular **`web-client/`** folder with Vite + React + TypeScript + Tailwind + GSAP
- A **`docs/`** folder structure for feature documentation
- An updated **`Makefile`** that builds both server and client
- A **dev environment** you can run locally in minutes

---

## The failure mode

If we skip this foundation and just start building components:

1. **No build pipeline** → components fail to render, types aren't checked, dev server crashes
2. **React structure unclear** → components are scattered, hooks are mixed with business logic, state management is a mess of props
3. **No TypeScript types** → WebSocket messages are `any`, state is untyped, refactoring breaks everything
4. **No documentation** → next feature you build doesn't know where it goes or what it depends on
5. **Local dev broken** → can't run the full stack (server + client) together, slow feedback loop
6. **GSAP animations disabled** → no way to test motion, timing, or interaction polish
7. **Server connection untested** → you build components that talk to WebSocket, but the WebSocket isn't wired up yet

Each of these kills your velocity. We fix them all upfront, so every feature after this is a breeze.

---

## Live code

We build **5 files** in this exact order. When you're done, you'll have a working dev environment where the React client can boot and connect to the Go server.

### Step 1: Create the `web-client/` folder structure

**Why this matters:** We're building a monorepo (server + client in one repo). The `web-client/` folder is completely self-contained: its own `package.json`, its own build, its own TypeScript config. This keeps concerns separated and makes it easy to build/deploy each independently later.

**Your action:** In the repository root, create this folder structure:

```
web-client/
├── public/
├── src/
│   ├── assets/
│   │   └── (future: icons, images)
│   ├── components/
│   │   ├── layout/
│   │   │   └── (future: shared layouts)
│   │   ├── game/
│   │   │   └── (future: game-specific UI)
│   │   └── auth/
│   │       └── (future: login/signup)
│   ├── hooks/
│   │   └── (future: useGameSocket, useAnimation, etc.)
│   ├── state/
│   │   ├── reducers/
│   │   │   └── (future: game state machines)
│   │   └── context/
│   │       └── (future: auth context, game context)
│   ├── services/
│   │   ├── api.ts
│   │   └── websocket.ts
│   ├── types/
│   │   ├── api.ts
│   │   ├── game.ts
│   │   └── messages.ts
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

**Why this layout?**
- `src/components/` – React components, organized by feature
- `src/hooks/` – Custom React hooks (state machines, WebSocket, animations)
- `src/state/` – Reducers and context (no external state lib, pure React)
- `src/services/` – API calls, WebSocket client (decoupled from UI)
- `src/types/` – TypeScript interfaces for the entire frontend (API responses, game state, WebSocket messages)

This structure keeps **business logic decoupled from UI**, making components reusable and testable.

---

### Step 2: Create `web-client/package.json`

**File:** `web-client/package.json`

**Reason:** This is the manifest for the web client project. It declares all dependencies (React, Vite, TypeScript, Tailwind, GSAP) and build scripts. Vite will use this to build the dev server and production bundle.

```json
{
  "name": "tares-web-client",
  "version": "1.0.0",
  "description": "Real-time multiplayer word scramble game client",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext ts,tsx",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "gsap": "^3.12.2",
    "axios": "^1.6.2"
  },
  "devDependencies": {
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.2.1",
    "@typescript-eslint/eslint-plugin": "^7.0.0",
    "@typescript-eslint/parser": "^7.0.0",
    "eslint": "^8.50.0",
    "eslint-plugin-react": "^7.33.2",
    "eslint-plugin-react-hooks": "^4.6.0",
    "typescript": "^5.3.3",
    "vite": "^5.0.8",
    "tailwindcss": "^3.4.1",
    "postcss": "^8.4.31",
    "autoprefixer": "^10.4.16"
  }
}
```

**Key dependencies:**
- `react` + `react-dom` – UI library
- `gsap` – High-performance animation (required for micro-interactions and physics)
- `axios` – HTTP client for API calls
- `typescript` – Type safety across the codebase
- `vite` – Lightning-fast dev server and bundler
- `tailwindcss` – Utility CSS framework for styling (no custom CSS for common patterns)

---

### Step 3: Create `web-client/tsconfig.json`

**File:** `web-client/tsconfig.json`

**Reason:** TypeScript configuration. This tells the TypeScript compiler how strict to be, what syntax to support, and where to find types. We use strict mode because it catches bugs at compile time, not runtime.

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,

    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,

    "resolveJsonModule": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "baseUrl": ".",
    "paths": {
      "@components/*": ["src/components/*"],
      "@hooks/*": ["src/hooks/*"],
      "@state/*": ["src/state/*"],
      "@services/*": ["src/services/*"],
      "@types/*": ["src/types/*"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

**What this does:**
- `"strict": true` – Catches type errors before they reach the browser
- `"paths"` – Aliases like `@components/` so imports don't have relative paths (`../../components`)
- `"target": "ES2020"` – Modern JavaScript, works in all browsers we care about
- `"module": "ESNext"` – Vite will handle the rest

**Why this matters:** With strict types, a mismatched WebSocket message type gets caught at build time. Without it, the app crashes at runtime and you spend hours debugging.

---

### Step 4: Create `web-client/vite.config.ts`

**File:** `web-client/vite.config.ts`

**Reason:** Vite configuration. This tells Vite how to build the React app, where assets live, and how to talk to the dev server. We configure it to proxy API calls to the Go backend so your local dev environment is complete.

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Resolve aliases (matches tsconfig paths)
  resolve: {
    alias: {
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@state': path.resolve(__dirname, './src/state'),
      '@services': path.resolve(__dirname, './src/services'),
      '@types': path.resolve(__dirname, './src/types'),
    },
  },

  server: {
    port: 5173,
    strictPort: false,
    
    // Proxy API calls to the Go backend
    // Example: http://localhost:5173/api/signup → http://localhost:8081/api/signup
    proxy: {
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
      '/ws': {
        target: 'ws://localhost:8081',
        ws: true,
      },
    },
  },

  build: {
    target: 'ES2020',
    minify: 'terser',
    sourcemap: false,
  },
})
```

**Key settings:**
- `plugins: [react()]` – Enables JSX transformation
- `proxy` – Dev server redirects API calls to your Go backend, so you don't need CORS setup during development
- `port: 5173` – Standard Vite dev port (fast reload, HMR)
- `build.sourcemap: false` – Keep production bundles small

**Why this matters:** The proxy means you can hit `http://localhost:5173` in your browser, and it seamlessly talks to the Go server on `:8081`. You're testing the full stack locally without extra configuration.

---

### Step 5: Create `web-client/tailwind.config.js`

**File:** `web-client/tailwind.config.js`

**Reason:** Tailwind CSS configuration. We extend the default theme with custom colors that match the vibrant, Gen-Z aesthetic (bold, oversized typography, outline styles).

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Vibrant, Gen-Z aesthetic
        'neon-pink': '#FF006E',
        'neon-cyan': '#00D9FF',
        'neon-lime': '#76EE00',
        'neon-purple': '#B537F2',
        'neon-orange': '#FF6B35',
        'dark-bg': '#0A0E27',
        'dark-card': '#1A1F3A',
      },
      fontSize: {
        // Oversized typography for high-impact UI
        'display-xl': ['72px', '1.1'],
        'display-lg': ['56px', '1.1'],
        'display-md': ['48px', '1.15'],
        'display-sm': ['36px', '1.2'],
      },
      fontFamily: {
        'display': ['Space Grotesk', 'sans-serif'],
        'sans': ['Inter', 'sans-serif'],
      },
      borderWidth: {
        '3': '3px',
        '4': '4px',
      },
    },
  },
  plugins: [],
}
```

**Why this matters:** Custom colors and typography mean you don't hardcode `#FF006E` everywhere. Change the theme once, it updates all over the app. The oversized text (`display-xl`, `display-lg`) gives that bold, playful vibe kids love.

---

### Step 6: Create `web-client/index.html`

**File:** `web-client/index.html`

**Reason:** Entry point. Vite loads this first, injects the React bundle, and renders into the `#root` div.

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Tares – Real-Time Word Scramble</title>
    
    <!-- Preload custom fonts (optional, for faster load) -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

---

### Step 7: Create `web-client/src/main.tsx`

**File:** `web-client/src/main.tsx`

**Reason:** React entrypoint. This renders the `App` component into the DOM. Minimal, just bootstrapping.

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

---

### Step 8: Create `web-client/src/index.css`

**File:** `web-client/src/index.css`

**Reason:** Global CSS. Tailwind directives + custom base styles for a cohesive look.

```css
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=Inter:wght@400;500;600&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #root {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

body {
  background-color: #0A0E27;
  color: #FFFFFF;
  font-family: 'Inter', sans-serif;
  line-height: 1.6;
}

/* Base heading styles */
h1, h2, h3, h4, h5, h6 {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  line-height: 1.1;
}

/* Outline text for vibrant look (inspired by https://globalpizza.party/) */
.text-outline {
  -webkit-text-stroke: 2px currentColor;
  paint-order: stroke fill;
  color: transparent;
}

/* High-energy button base */
button {
  cursor: pointer;
  font-weight: 600;
  transition: all 150ms ease-out;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 16px;
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
}

button:active {
  transform: translateY(0);
}

/* Smooth scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #1A1F3A;
}

::-webkit-scrollbar-thumb {
  background: #FF006E;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #FF1A7C;
}
```

---

### Step 9: Create `web-client/src/App.tsx`

**File:** `web-client/src/App.tsx`

**Reason:** Root React component. This is the entry point for the component tree. For now, it's a stub that renders a welcome screen. Future features (login, game lobby, game board) will be wired in here.

```typescript
import React, { useState } from 'react'

function App() {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleTestConnection = async () => {
    setStatus('connecting')
    try {
      // Test API call to the Go backend
      const response = await fetch('http://localhost:8081/api/health', {
        method: 'GET',
      })
      
      if (response.ok) {
        setStatus('connected')
        setMessage('✅ Connected to backend!')
      } else {
        setStatus('error')
        setMessage('❌ Backend responded, but with an error.')
      }
    } catch (error) {
      setStatus('error')
      setMessage(`❌ Cannot reach backend. Is the Go server running on :8081? ${String(error)}`)
    }
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-dark-bg p-8">
      <h1 className="text-display-lg font-display text-neon-pink mb-4 text-outline">
        TARES
      </h1>
      
      <p className="text-xl text-neon-cyan mb-8 max-w-md text-center">
        Real-time multiplayer word scramble. Instant. Brutal. Beautiful.
      </p>

      <button
        onClick={handleTestConnection}
        disabled={status === 'connecting'}
        className={`px-8 py-4 text-lg font-bold rounded-lg transition-all mb-6 ${
          status === 'connected'
            ? 'bg-neon-lime text-dark-bg'
            : status === 'error'
            ? 'bg-red-500 text-white'
            : 'bg-neon-pink text-white hover:bg-opacity-90'
        }`}
      >
        {status === 'connecting' ? '⏳ Testing...' : '🧪 Test Backend Connection'}
      </button>

      {message && (
        <p className={`text-center max-w-md ${status === 'connected' ? 'text-neon-lime' : 'text-red-400'}`}>
          {message}
        </p>
      )}

      <div className="mt-12 text-center text-sm text-gray-400">
        <p>Dev server: http://localhost:5173</p>
        <p>Go backend: http://localhost:8081</p>
      </div>
    </div>
  )
}

export default App
```

**What this does:**
- Renders a vibrant welcome screen with neon colors and oversized text
- Has a button to test the connection to the Go backend
- Shows status messages (connected, error, connecting)
- **This is your first test**: If the button works and says "✅ Connected", your dev environment is working.

---

### Step 10: Create `web-client/.gitignore`

**File:** `web-client/.gitignore`

**Reason:** Tell Git which files to ignore (node_modules, build output, local env vars).

```
# Dependencies
node_modules
/.pnp
.pnp.js

# Testing
/coverage

# Production
/dist
/build

# Vite
.vite

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode
.idea
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db
```

---

### Step 11: Update root `Makefile`

**File:** `Makefile` (in the repo root, update existing)

**Reason:** Add targets to build and run both server and client from one command. This makes local development seamless.

```makefile
.PHONY: help install dev build clean lint test

help:
	@echo "Tares: Full-Stack Development"
	@echo ""
	@echo "Commands:"
	@echo "  make install        Install dependencies for server and client"
	@echo "  make dev            Run server and client in parallel (requires tmux)"
	@echo "  make dev-server     Run only the Go server"
	@echo "  make dev-client     Run only the React client"
	@echo "  make build          Build server and client for production"
	@echo "  make build-server   Build only the Go server"
	@echo "  make build-client   Build only the React client"
	@echo "  make clean          Remove build artifacts"
	@echo "  make lint           Lint server and client code"
	@echo "  make test           Run tests for server and client"

# Install dependencies
install:
	@echo "📦 Installing Go dependencies..."
	go mod download
	@echo "📦 Installing Node dependencies..."
	cd web-client && npm install

# Development: Run server and client in parallel
dev:
	@echo "🚀 Starting full-stack dev environment..."
	@echo "Server: http://localhost:8081"
	@echo "Client: http://localhost:5173"
	@command -v tmux >/dev/null 2>&1 || { echo "tmux is required for 'make dev'. Install it or use 'make dev-server' + 'make dev-client' in separate terminals."; exit 1; }
	tmux new-session -d -s tares -x 240 -y 50
	tmux send-keys -t tares "make dev-server" Enter
	tmux split-window -t tares -h
	tmux send-keys -t tares "make dev-client" Enter
	tmux select-layout -t tares even-horizontal
	tmux attach-session -t tares

dev-server:
	@echo "🎮 Starting Go server..."
	cd server && go run .

dev-client:
	@echo "⚛️  Starting React dev server..."
	cd web-client && npm run dev

# Build for production
build: build-server build-client
	@echo "✅ Build complete. Server binary at ./server && Client bundle at ./web-client/dist"

build-server:
	@echo "🔨 Building Go server..."
	cd server && go build -o ../tares-server .

build-client:
	@echo "🔨 Building React client..."
	cd web-client && npm run build

# Clean
clean:
	@echo "🧹 Cleaning build artifacts..."
	rm -f tares-server
	rm -rf web-client/dist
	rm -rf web-client/node_modules
	cd server && go clean

# Linting
lint:
	@echo "🔍 Linting Go code..."
	cd server && go fmt ./...
	cd server && go vet ./...
	@echo "🔍 Linting TypeScript..."
	cd web-client && npm run lint

# Testing
test:
	@echo "🧪 Running Go tests..."
	cd server && go test ./... -v
	@echo "🧪 Running Node tests..."
	cd web-client && npm test -- --run 2>/dev/null || echo "(No test suite configured yet)"
```

**What this gives you:**
- `make install` – Installs both Go and Node dependencies
- `make dev` – Starts server and client in parallel with tmux (fancy!)
- `make dev-server` / `make dev-client` – Start each separately in different terminals
- `make build` – Production builds for both
- `make clean`, `make lint`, `make test` – Maintenance commands

---

### Step 12: Create `docs/01-web-client-setup/index.md`

**File:** `docs/01-web-client-setup/index.md`

**Reason:** Document this foundation. Future developers (or you in 6 months) read this to understand the architecture, why we made these choices, and how to extend it.

```markdown
# Stage 1: Web Client Setup & Architecture Foundation

## Overview

Bootstrapped a production-grade React + Vite + TypeScript frontend for Tares. This is the foundation—all features depend on it.

## Architecture

\`\`\`mermaid
graph TD
    A["Browser: http://localhost:5173<br/>(Vite Dev Server)"]
    B["React App<br/>(src/App.tsx)"]
    C["Component Tree<br/>(src/components/)"]
    D["Custom Hooks<br/>(src/hooks/)"]
    E["State Machine<br/>(useReducer + Context)"]
    F["Services<br/>(api.ts, websocket.ts)"]
    G["Go Backend<br/>http://localhost:8081"]
    H["WebSocket Server<br/>/ws/rooms"]
    
    A --> B
    B --> C
    C --> D
    D --> E
    D --> F
    F --> G
    F --> H
\`\`\`

## File Structure

\`\`\`
web-client/
├── public/                    # Static assets (favicon, etc.)
├── src/
│   ├── components/           # Reusable React components
│   │   ├── layout/          # Shared layout wrapper
│   │   ├── game/            # Game-specific UI (board, score, timer)
│   │   └── auth/            # Login/signup forms
│   ├── hooks/               # Custom React hooks
│   │   ├── useGameSocket.ts # WebSocket connection & state sync
│   │   └── useAnimation.ts  # GSAP animation orchestration
│   ├── state/               # React state management
│   │   ├── reducers/        # Action handlers
│   │   └── context/         # Context providers
│   ├── services/            # Decoupled logic (API, WebSocket)
│   │   ├── api.ts          # HTTP client for auth
│   │   └── websocket.ts    # WebSocket client
│   ├── types/              # TypeScript interfaces
│   │   ├── api.ts          # Backend response types
│   │   ├── game.ts         # Game state types
│   │   └── messages.ts     # WebSocket message types
│   ├── App.tsx             # Root component
│   ├── index.css           # Global styles
│   └── main.tsx            # React entry point
├── index.html              # HTML entry point
├── package.json            # Node dependencies
├── tsconfig.json           # TypeScript config
├── vite.config.ts          # Vite build config
├── tailwind.config.js      # Tailwind theme
└── .gitignore

docs/
└── 01-web-client-setup/    # This file
\`\`\`

## Key Decisions

### Why Vite, not Create React App?

- **Speed:** Vite rebuilds in <100ms. CRA rebuilds in 3-5 seconds.
- **ES modules:** Vite uses native ESM dev mode (no bundling, instant HMR).
- **Smaller config:** One `vite.config.ts` vs CRA's hidden webpack.
- **Web Socket proxy:** Built-in, so dev server talks to Go backend without CORS hassle.

### Why TypeScript strict mode?

- **Compile-time errors:** WebSocket message type mismatches caught before runtime.
- **Refactoring safety:** Change a state type, TypeScript finds all 47 places that need updating.
- **IDE intellisense:** Autocomplete for props, hooks, services.

### Why no Redux/Zustand?

- **React 18 primitives are enough:** `useReducer` + `Context` handle most state.
- **Fewer dependencies:** Smaller bundle, less to learn.
- **Explicit:** State flow is visible in component code, not hidden in a store.
- **If we hit complexity limits:** XState integrates with React hooks, still keep the architecture clean.

### Why GSAP, not Framer Motion?

- **Performance:** GSAP uses native transforms, requestAnimationFrame. No re-renders during motion.
- **Physics-based:** Elastic easing, momentum, spring tweens feel organic.
- **Callback hooks:** `onStart`, `onComplete` let us sync animations with game events.
- **Scalability:** Hundreds of simultaneous tweens without performance cliff.

### Why Tailwind, not CSS modules?

- **Speed:** Write CSS in HTML via utility classes, no jumping between files.
- **Consistency:** Custom color palette (neon pink, cyan, lime) ensures visual unity.
- **No unused CSS:** Tailwind tree-shakes unused utilities in production.
- **Theme control:** Change one color, entire app updates.

## Deployment Architecture (Future)

\`\`\`mermaid
graph LR
    A["Client<br/>S3 + CloudFront<br/>CDN"]
    B["Backend API<br/>ECS/GKE<br/>Auto-scaling"]
    C["PostgreSQL<br/>Managed RDS"]
    D["WebSocket Gateway<br/>Auto-scaling"]
    
    A -->|HTTPS| B
    B -->|TCP| D
    D -->|Gossip/Raft| B
    B --> C
    D --> C
\`\`\`

For now, we're local only. But the separation (server in one folder, client in another) makes this deployment natural later.

## Next Steps

1. Run `make install` and `make dev` to boot the full stack locally.
2. Open http://localhost:5173 and click the "Test Backend Connection" button.
3. If it says "✅ Connected to backend!", you're ready for Stage 2 (Authentication).
4. If it fails, verify the Go server is running on :8081.
\`\`\`

---

## Run it

**Prerequisites:**
- Node.js 18+ (`node --version`)
- npm (`npm --version`)
- Go 1.20+ (for the backend)
- PostgreSQL running (set up from the root `docker-compose.yaml`)

**Steps:**

1. **Install dependencies:**
   ```bash
   make install
   ```

2. **Start the full-stack dev environment:**
   ```bash
   make dev
   ```
   
   This opens two terminals side-by-side (via tmux):
   - Left: Go server on http://localhost:8081
   - Right: React client on http://localhost:5173
   
   If you don't have tmux, run these in separate terminals:
   ```bash
   # Terminal 1
   make dev-server
   
   # Terminal 2
   make dev-client
   ```

3. **Open your browser:**
   ```
   http://localhost:5173
   ```

4. **Click "Test Backend Connection":**
   - If it says ✅, you're wired up.
   - If it says ❌, the Go server isn't running or isn't on :8081.

**Expected output:**
```
🚀 Starting full-stack dev environment...
Server: http://localhost:8081
Client: http://localhost:5173

Server terminal shows:
[GIN] 2026/01/15 10:30:45 | 200 | 125ms | GET /api/health

Client terminal shows:
VITE v5.0.8  ready in 245 ms
➜  Local: http://localhost:5173/
```

---

## The demo: now break it

Here are exercises to test what you've built:

### Exercise 1: Verify TypeScript is strict
**What to do:** Open `src/App.tsx` and change the `status` type:
```typescript
const [status, setStatus] = useState<'idle' | 'connecting'>('idle')
//                                  ^ remove 'connected' and 'error'
```

**Expected:** TypeScript compiler (or your IDE) immediately complains: "Type 'connected' is not assignable to type 'idle' | 'connecting'".

**Why it matters:** This catches bugs before they reach the browser. Without strict types, this bug lives in production.

### Exercise 2: Test the dev server rebuild
**What to do:**
1. Open `src/App.tsx`
2. Change the title from `TARES` to `TARES 2.0`
3. Save the file

**Expected:** Browser refreshes instantly (HMR). Title updates without a full page reload.

**Why it matters:** This feedback loop (edit → see instantly) is essential. If this is slow, development is painful.

### Exercise 3: Verify the Tailwind build
**What to do:** Open DevTools (F12) and inspect the `<h1>` element.

**Expected:** It has classes like `text-display-lg`, `font-display`, `text-neon-pink`, `text-outline`.

**Why it matters:** These are Tailwind utilities. If they're not rendering (text looks broken), the Tailwind build failed.

### Exercise 4: Kill the backend, test graceful failure
**What to do:**
1. Stop the Go server (`Ctrl-C` in the server terminal)
2. Click "Test Backend Connection" again

**Expected:** Error message says "Cannot reach backend. Is the Go server running on :8081?"

**Why it matters:** The client handles network errors gracefully. No white-screen-of-death.

---

## In production

This foundation is production-ready:

1. **Build:** `make build-client` outputs a minified, tree-shaken bundle to `web-client/dist/`.
2. **Deploy:** Copy `dist/` to S3 or your static host. Serve via CloudFront or any CDN.
3. **Backend:** The Go server serves the API. Frontend calls it via HTTPS (proxy rules change in production).
4. **Type safety:** TypeScript compilation is part of the build pipeline. Bad types fail the build.

Every feature you add from here on uses this infrastructure. Components go in `src/components/`, hooks in `src/hooks/`, types in `src/types/`. The architecture keeps everything modular.

---

## Files Created

- `web-client/package.json`
- `web-client/tsconfig.json`
- `web-client/vite.config.ts`
- `web-client/tailwind.config.js`
- `web-client/index.html`
- `web-client/src/main.tsx`
- `web-client/src/App.tsx`
- `web-client/src/index.css`
- `web-client/.gitignore`
- `Makefile` (updated)
- `docs/01-web-client-setup/index.md` (this file)

---

## Testing Checklist

- [ ] `make install` completes without errors
- [ ] `make dev-server` boots the Go server on :8081
- [ ] `make dev-client` boots Vite on :5173
- [ ] Browser loads http://localhost:5173 without errors
- [ ] "Test Backend Connection" button returns ✅
- [ ] Editing `src/App.tsx` triggers HMR (hot reload)
- [ ] TypeScript catches type errors in real-time (IDE or `npm run type-check`)
- [ ] Production build: `npm run build` creates `dist/` with no errors

---
```

---

## Run it

You now have the complete setup. Execute in order:

**Step 1: Create all files as specified above**

Go through files 1–12 in order, creating them in your repo with the exact code blocks shown.

**Step 2: Install dependencies**

```bash
make install
```

This installs Go and Node packages. Should take 1–2 minutes.

**Step 3: Start the dev environment**

```bash
make dev
```

You'll see two terminals: left (server), right (client). Both should boot without errors.

**Step 4: Open the browser**

```
http://localhost:5173
```

Click "Test Backend Connection". If it says ✅, you're done with Stage 1.

---

## The demo: now break it

Try these to verify everything is wired:

### Test 1: HMR (Hot Module Reload)
1. Open `src/App.tsx`
2. Change `TARES` to `TARES 🚀`
3. Save

**Expected:** Browser updates instantly, no full reload.

### Test 2: TypeScript Strict Mode
1. Open `src/App.tsx`
2. Change `const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle')` to `useState<'idle'>('idle')`
3. Try to run `make build`

**Expected:** Build fails with TypeScript error.

### Test 3: Backend Connection
1. Stop the Go server (`Ctrl-C` in server terminal)
2. Click "Test Backend Connection"

**Expected:** Error message appears.

### Test 4: Production Build
```bash
cd web-client && npm run build
```

**Expected:** `web-client/dist/` folder appears with `index.html`, `assets/`, etc.

---

## In production

This foundation is solid. You can:

1. **Deploy static:** Copy `web-client/dist/` to S3 + CloudFront
2. **Deploy backend:** Go binary + PostgreSQL
3. **Wire HTTPS:** Update proxy rules in production
4. **Scale:** This architecture supports thousands of concurrent WebSocket connections

Every feature after this builds on this base. Components, hooks, types—all follow the structure we've created.

---

## ✅ Stage 1 Complete

You now have:
- ✅ Vite + React + TypeScript dev environment
- ✅ Tailwind CSS with custom Gen-Z aesthetic
- ✅ GSAP ready for animations
- ✅ Full-stack local dev (`make dev`)
- ✅ TypeScript strict mode (catches bugs early)
- ✅ Documentation folder structure
- ✅ Backend connection tested

**Next stage:** Authentication (login/signup). This is when state management and HTTP calls come alive.
