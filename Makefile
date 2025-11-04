# =============================================================================
# TerraPeak - Unified Makefile
# =============================================================================
# Complete build and deployment automation for TerraPeak project
# - Backend (Go) and Frontend (Next.js) operations
# - Docker containerization and deployment
# - Development and production workflows
# =============================================================================

.PHONY: help build test test-unit test-integration test-coverage clean fmt lint vet deps run docker-build docker-run
.PHONY: web-build web-dev web-test web-lint web-clean web-docker-build web-docker-run web-docker-stop
.PHONY: all-build all-test all-clean all-docker-build all-docker-run all-docker-stop
.PHONY: dev-setup status quick-test watch-test

# Default target
help: ## Show this help message
	@echo "TerraPeak - Unified Build System"
	@echo "================================"
	@echo ""
	@echo "Registry (Go) Commands:"
	@echo "  make build              Build the TerraPeak binary"
	@echo "  make test               Run all tests"
	@echo "  make run                Run TerraPeak server"
	@echo "  make docker-build       Build registry Docker image"
	@echo ""
	@echo "Web (Next.js) Commands:"
	@echo "  make web-build          Build Next.js application"
	@echo "  make web-dev            Start Next.js dev server"
	@echo "  make web-docker-build   Build web Docker image"
	@echo "  make web-docker-run     Run web container"
	@echo ""
	@echo "Unified Commands:"
	@echo "  make all-build          Build both registry and web"
	@echo "  make all-test           Test both registry and web"
	@echo "  make all-docker-build   Build all Docker images"
	@echo "  make all-docker-run     Run all services"
	@echo ""
	@echo "For detailed help on specific sections:"
	@echo "  make help-registry      Show registry-specific commands"
	@echo "  make help-web           Show web-specific commands"
	@echo "  make help-docker        Show Docker-specific commands"

# Build targets
build: ## Build the TerraPeak binary
	@echo "🔨 Building TerraPeak..."
	cd registry && go build -ldflags="-s -w" -o terrapeak .
	@echo "✅ Build complete: registry/terrapeak"

build-linux: ## Build for Linux (useful for Docker)
	@echo "🔨 Building TerraPeak for Linux..."
	cd registry && GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o terrapeak-linux .
	@echo "✅ Linux build complete: registry/terrapeak-linux"

# Test targets
test: test-unit test-integration ## Run all tests

test-unit: ## Run unit tests only
	@echo "🧪 Running unit tests..."
	cd registry && go test -v -race ./...

test-integration: ## Run integration tests
	@echo "🧪 Running integration tests..."
	cd registry && go test -v -tags=integration ./...

test-coverage: ## Run tests with coverage report
	@echo "🧪 Running tests with coverage..."
	cd registry && go test -v -race -coverprofile=coverage.out ./...
	cd registry && go tool cover -html=coverage.out -o coverage.html
	@echo "📊 Coverage report generated: registry/coverage.html"

test-benchmark: ## Run benchmark tests
	@echo "🏃 Running benchmark tests..."
	cd registry && go test -bench=. -benchmem ./...

# Code quality targets
fmt: ## Format Go code
	@echo "🎨 Formatting code..."
	cd registry && go fmt ./...

vet: ## Run go vet
	@echo "🔍 Running go vet..."
	cd registry && go vet ./...

lint: ## Run golangci-lint (requires golangci-lint to be installed)
	@echo "🔍 Running linter..."
	cd registry && golangci-lint run ./...

# Dependency management
deps: ## Download and tidy dependencies
	@echo "📦 Managing dependencies..."
	cd registry && go mod download
	cd registry && go mod tidy

deps-update: ## Update all dependencies
	@echo "📦 Updating dependencies..."
	cd registry && go get -u ./...
	cd registry && go mod tidy

# Development targets
run: ## Run TerraPeak with default config
	@echo "🚀 Starting TerraPeak..."
	cd registry && ./terrapeak -c .cfg.default.yml

run-dev: build ## Build and run TerraPeak
	@echo "🚀 Building and starting TerraPeak..."
	cd registry && ./terrapeak -c .cfg.default.yml

# Docker targets
docker-build: ## Build Docker image
	@echo "🐳 Building Docker image..."
	docker build -t ghcr.io/aliharirian/terrapeak-registry:latest registry/

docker-run: ## Run TerraPeak in Docker container
	@echo "🐳 Running TerraPeak in Docker..."
	docker run -p 8081:8081 -v $(PWD)/cfg.yml:/app/cfg.yml:ro ghcr.io/aliharirian/terrapeak-registry:latest

docker-compose-up: ## Start all services with docker-compose
	@echo "🐳 Starting all TerraPeak services..."
	docker-compose up -d

docker-compose-down: ## Stop all docker-compose services
	@echo "🐳 Stopping all TerraPeak services..."
	docker-compose down

docker-compose-logs: ## Show docker-compose logs
	@echo "📋 Showing docker-compose logs..."
	docker-compose logs -f

docker-compose-build: ## Build all services with docker-compose
	@echo "🏗️  Building all TerraPeak services..."
	docker-compose build

docker-compose-restart: ## Restart all services
	@echo "🔄 Restarting all TerraPeak services..."
	docker-compose restart

# Service-specific docker-compose commands
docker-compose-registry: ## Start only registry service
	@echo "🐳 Starting registry service..."
	docker-compose up -d registry

docker-compose-web: ## Start only web service
	@echo "🐳 Starting web service..."
	docker-compose up -d web

docker-compose-minio: ## Start only MinIO service
	@echo "🐳 Starting MinIO service..."
	docker-compose up -d minio

# Cleanup targets
clean: ## Clean build artifacts and test files
	@echo "🧹 Cleaning up..."
	cd registry && rm -f terrapeak terrapeak-linux
	cd registry && rm -f coverage.out coverage.html
	cd registry && rm -rf ./registry/ # Test storage directory
	@echo "✅ Cleanup complete"

clean-all: clean ## Clean everything including dependencies
	cd registry && go clean -modcache
	docker system prune -f

# Installation targets
install: build ## Install TerraPeak binary to $GOPATH/bin
	@echo "📦 Installing TerraPeak..."
	cd registry && go install .

# Release targets
release-check: test lint vet ## Run all checks for release
	@echo "🔍 Running release checks..."
	@echo "✅ All release checks passed"

# CI/CD targets
ci: deps fmt vet lint test-coverage ## Run CI pipeline
	@echo "🤖 CI pipeline complete"

# Quick targets for common workflows
quick-test: fmt vet test-unit ## Quick test cycle (format, vet, unit tests)

dev-setup: deps ## Setup development environment
	@echo "🔧 Setting up development environment..."
	@echo "Installing golangci-lint..."
	@which golangci-lint > /dev/null || curl -sSfL https://raw.githubusercontent.com/golangci/golangci-lint/master/install.sh | sh -s -- -b $(go env GOPATH)/bin v1.54.2
	@echo "✅ Development environment ready"

# Watch mode (requires entr)
watch-test: ## Watch files and run tests on change (requires 'entr')
	find registry -name "*.go" | entr -c make test-unit

# =============================================================================
# Web (Next.js) Commands
# =============================================================================

# Web build targets
web-build: ## Build Next.js application for production
	@echo "🏗️  Building Next.js application..."
	cd web && yarn build
	@echo "✅ Web build complete!"

web-dev: ## Start Next.js development server
	@echo "🚀 Starting Next.js dev server..."
	cd web && yarn dev

web-test: ## Run Next.js tests
	@echo "🧪 Running Next.js tests..."
	cd web && yarn test

web-lint: ## Lint Next.js code
	@echo "🔍 Linting Next.js code..."
	cd web && yarn lint

web-clean: ## Clean Next.js build artifacts
	@echo "🧹 Cleaning Next.js build artifacts..."
	cd web && rm -rf .next out node_modules/.cache
	@echo "✅ Web cleanup complete!"

# Web Docker commands
web-docker-build: ## Build web Docker image
	@echo "🐳 Building web Docker image..."
	cd web && docker build -t ghcr.io/aliharirian/terrapeak-web:latest .
	@echo "✅ Web Docker image built!"

web-docker-run: web-docker-build ## Run web container
	@echo "🚀 Starting web container..."
	cd web && docker run -d --name terrapeak-web -p 3000:3000 --restart unless-stopped ghcr.io/aliharirian/terrapeak-web:latest
	@echo "✅ Web container started on http://localhost:3000"

web-docker-stop: ## Stop web container
	@echo "⏸️  Stopping web container..."
	-docker stop terrapeak-web
	-docker rm terrapeak-web
	@echo "✅ Web container stopped"

web-docker-logs: ## Show web container logs
	@echo "📋 Showing web container logs..."
	docker logs -f terrapeak-web

web-docker-shell: ## Open shell in web container
	@echo "🐚 Opening shell in web container..."
	docker exec -it terrapeak-web /bin/sh

web-docker-health: ## Check web container health
	@echo "🏥 Checking web container health..."
	@docker inspect --format='{{.State.Health.Status}}' terrapeak-web 2>/dev/null || echo "Container not running"
	@curl -s http://localhost:3000/api/health | python3 -m json.tool || echo "Health endpoint not responding"

# =============================================================================
# Unified Commands
# =============================================================================

all-build: build web-build ## Build both registry and web
	@echo "✅ All builds complete!"

all-test: test web-test ## Test both registry and web
	@echo "✅ All tests complete!"

all-clean: clean web-clean ## Clean both registry and web
	@echo "✅ All cleanup complete!"

all-docker-build: docker-build web-docker-build ## Build all Docker images
	@echo "✅ All Docker images built!"

all-docker-run: docker-compose-up ## Run all Docker containers
	@echo "✅ All services started!"

all-docker-stop: docker-compose-down ## Stop all Docker containers
	@echo "✅ All services stopped!"

# =============================================================================
# Help Commands
# =============================================================================

help-registry: ## Show registry-specific commands
	@echo "Registry (Go) Commands:"
	@echo "======================="
	@echo "  make build              Build the TerraPeak binary"
	@echo "  make build-linux        Build for Linux"
	@echo "  make test               Run all tests"
	@echo "  make test-unit          Run unit tests only"
	@echo "  make test-integration   Run integration tests"
	@echo "  make test-coverage      Run tests with coverage"
	@echo "  make test-benchmark     Run benchmark tests"
	@echo "  make fmt                Format Go code"
	@echo "  make vet                Run go vet"
	@echo "  make lint               Run golangci-lint"
	@echo "  make deps               Download and tidy dependencies"
	@echo "  make run                Run TerraPeak server"
	@echo "  make docker-build       Build registry Docker image"
	@echo "  make docker-run         Run registry in Docker"

help-web: ## Show web-specific commands
	@echo "Web (Next.js) Commands:"
	@echo "======================"
	@echo "  make web-build          Build Next.js application"
	@echo "  make web-dev            Start Next.js dev server"
	@echo "  make web-test           Run Next.js tests"
	@echo "  make web-lint            Lint Next.js code"
	@echo "  make web-clean           Clean Next.js build artifacts"
	@echo "  make web-docker-build   Build web Docker image"
	@echo "  make web-docker-run     Run web container"
	@echo "  make web-docker-stop    Stop web container"
	@echo "  make web-docker-logs    Show web container logs"
	@echo "  make web-docker-shell   Open shell in web container"
	@echo "  make web-docker-health  Check web container health"

help-docker: ## Show Docker-specific commands
	@echo "Docker Commands:"
	@echo "================"
	@echo "  make docker-build       Build registry Docker image"
	@echo "  make docker-run         Run registry in Docker"
	@echo "  make docker-compose-up  Start all services with docker-compose"
	@echo "  make docker-compose-down Stop all docker-compose services"
	@echo "  make docker-compose-build Build all services"
	@echo "  make docker-compose-logs Show all service logs"
	@echo "  make docker-compose-registry Start only registry service"
	@echo "  make docker-compose-web Start only web service"
	@echo "  make docker-compose-minio Start only MinIO service"
	@echo "  make web-docker-build   Build web Docker image"
	@echo "  make web-docker-run     Run web container"
	@echo "  make all-docker-build   Build all Docker images"
	@echo "  make all-docker-run     Run all services"
	@echo "  make all-docker-stop    Stop all services"

# Status check
status: ## Check project status
	@echo "📊 TerraPeak Status"
	@echo "=================="
	@echo "Go version: $(shell go version)"
	@echo "Node version: $(shell node --version 2>/dev/null || echo 'Node.js not installed')"
	@echo "Yarn version: $(shell yarn --version 2>/dev/null || echo 'Yarn not installed')"
	@echo "Docker version: $(shell docker --version 2>/dev/null || echo 'Docker not installed')"
	@echo "Git branch: $(shell git branch --show-current 2>/dev/null || echo 'not a git repo')"
	@echo "Git status: $(shell git status --porcelain 2>/dev/null | wc -l | xargs) files changed"
	@echo "Registry dependencies: $(shell cd registry && go list -m all | wc -l | xargs) modules"
	@echo "Web dependencies: $(shell cd web && yarn list --depth=0 2>/dev/null | wc -l | xargs) packages"
	@echo "Registry test files: $(shell find registry -name "*_test.go" | wc -l | xargs) files"
	@echo "Registry source files: $(shell find registry -name "*.go" -not -name "*_test.go" | wc -l | xargs) files"
	@echo "Web source files: $(shell find web -name "*.tsx" -o -name "*.ts" -o -name "*.js" -o -name "*.jsx" | wc -l | xargs) files"
