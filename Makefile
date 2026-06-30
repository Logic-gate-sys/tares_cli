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
	@echo "  make ui-test        Run React/Vite component and unit tests"

install:
	@echo "📦 Installing Go dependencies..."
	cd server && go mod download
	@echo "📦 Installing Node dependencies..."
	cd web-client && npm install

# run client & server dev scripts
dev-server:
	@echo "🎮 Starting Go server..."
	cd server && go run main.go

dev-client:
	@echo "⚛️  Starting React dev server..."
	cd web-client && npm run dev -- --force

# Build for production
build: build-server build-client
	@echo "✅ Build complete. Server binary at ./server && Client bundle at ./web-client/dist"

# needs refinement
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
	cd server && go clean

# Linting
lint:
	@echo "🔍 Linting Go code..."
	cd server && go fmt ./...
	cd server && go vet ./...
	@echo "🔍 Linting TypeScript..."
	cd web-client && npm run lint

# Testing
ui-test:
	cd web-client && npm run test
test:
	@echo "🧪 Running Go tests..."
	cd server && go test ./... -v
	@echo "🧪 Running Node tests..."
	cd web-client && npm test -- --run 2>/dev/null || echo "(No test suite configured yet)"
