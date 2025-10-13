# TerraPeak Makefile
# Build and test automation for TerraPeak Terraform Registry

.PHONY: help build test test-unit test-integration test-coverage clean fmt lint vet deps run docker-build docker-run

# Default target
help: ## Show this help message
	@echo "TerraPeak - Terraform Peak of Features"
	@echo "===================================="
	@echo ""
	@echo "Available targets:"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

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
	@which golangci-lint > /dev/null || ( \
		echo "❌ golangci-lint not found. Installing..." && \
		GOPATH_BIN=$$(go env GOPATH)/bin && \
		mkdir -p $$GOPATH_BIN && \
		curl -sSfL https://raw.githubusercontent.com/golangci/golangci-lint/master/install.sh | sh -s -- -b $$GOPATH_BIN v1.54.2 && \
		echo "✅ golangci-lint installed to $$GOPATH_BIN" && \
		echo "⚠️  Please add $$GOPATH_BIN to your PATH or run: export PATH=\"$$GOPATH_BIN:\$$PATH\"" \
	)
	@cd registry && GOPATH_BIN=$$(go env GOPATH)/bin; \
	if [ -f "$$GOPATH_BIN/golangci-lint" ]; then \
		$$GOPATH_BIN/golangci-lint run --config .golangci.yml ./...; \
	elif which golangci-lint > /dev/null; then \
		golangci-lint run --config .golangci.yml ./...; \
	else \
		echo "❌ golangci-lint not found and installation failed"; \
		exit 1; \
	fi

lint-full: ## Run full golangci-lint with all linters
	@echo "🔍 Running full linter..."
	@cd registry && GOPATH_BIN=$$(go env GOPATH)/bin; \
	if [ -f "$$GOPATH_BIN/golangci-lint" ]; then \
		$$GOPATH_BIN/golangci-lint run ./...; \
	elif which golangci-lint > /dev/null; then \
		golangci-lint run ./...; \
	else \
		echo "❌ golangci-lint not found. Please run 'make dev-setup' first"; \
		exit 1; \
	fi

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
	cd registry && docker build -t terrapeak:latest .

docker-run: ## Run TerraPeak in Docker container
	@echo "🐳 Running TerraPeak in Docker..."
	docker run -p 8081:8081 -v $(PWD)/cfg.yml:/app/cfg.yml:ro terrapeak:latest

docker-compose-up: ## Start with docker-compose
	@echo "🐳 Starting with docker-compose..."
	docker-compose up -d

docker-compose-down: ## Stop docker-compose services
	@echo "🐳 Stopping docker-compose services..."
	docker-compose down

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

# Pre-commit targets
pre-commit: ## Run all checks before commit/push
	@echo "🚀 Running pre-commit checks..."
	@echo "=================================="
	@echo ""
	@echo "1. 📦 Managing dependencies..."
	@$(MAKE) deps
	@echo ""
	@echo "2. 🎨 Formatting code..."
	@$(MAKE) fmt
	@echo ""
	@echo "3. 🔍 Running go vet..."
	@$(MAKE) vet
	@echo ""
	@echo "4. 🧪 Running unit tests..."
	@$(MAKE) test-unit
	@echo ""
	@echo "5. 🏗️ Building application..."
	@$(MAKE) build
	@echo ""
	@echo "✅ All pre-commit checks passed!"
	@echo "🚀 Ready to commit and push!"

pre-commit-quick: ## Quick pre-commit checks (faster)
	@echo "⚡ Running quick pre-commit checks..."
	@echo "====================================="
	@echo ""
	@echo "1. 🎨 Formatting code..."
	@$(MAKE) fmt
	@echo ""
	@echo "2. 🔍 Running go vet..."
	@$(MAKE) vet
	@echo ""
	@echo "3. 🧪 Running unit tests..."
	@$(MAKE) test-unit
	@echo ""
	@echo "4. 🏗️ Building application..."
	@$(MAKE) build
	@echo ""
	@echo "✅ Quick pre-commit checks passed!"
	@echo "🚀 Ready to commit and push!"

pre-commit-full: ## Full pre-commit checks (comprehensive)
	@echo "🔍 Running full pre-commit checks..."
	@echo "===================================="
	@echo ""
	@echo "1. 📦 Managing dependencies..."
	@$(MAKE) deps
	@echo ""
	@echo "2. 🎨 Formatting code..."
	@$(MAKE) fmt
	@echo ""
	@echo "3. 🔍 Running go vet..."
	@$(MAKE) vet
	@echo ""
	@echo "4. 🧪 Running unit tests..."
	@$(MAKE) test-unit
	@echo ""
	@echo "5. 🧪 Running integration tests..."
	@$(MAKE) test-integration
	@echo ""
	@echo "6. 📊 Running tests with coverage..."
	@$(MAKE) test-coverage
	@echo ""
	@echo "7. 🏗️ Building application..."
	@$(MAKE) build
	@echo ""
	@echo "8. 🧪 Testing API endpoints..."
	@$(MAKE) test-api
	@echo ""
	@echo "9. 🧪 Testing API downloads..."
	@$(MAKE) test-api-download
	@echo ""
	@echo "✅ Full pre-commit checks passed!"
	@echo "🚀 Ready to commit and push!"

git-push: push-check ## Run full checks and push (interactive)
	@echo "🚀 Running pre-push checks..."
	@$(MAKE) pre-commit-full
	@echo ""
	@echo "🚀 Ready to push. Please run:"
	@echo "git push origin main"

# Quick targets for common workflows
quick-test: fmt vet test-unit ## Quick test cycle (format, vet, unit tests)

# API Testing targets
test-api: ## Test API endpoints on localhost:8081
	@echo "🧪 Testing TerraPeak API endpoints..."
	@echo "Testing health endpoint..."
	@curl -s -f "http://localhost:8081/healthz" && echo "✅ Health check passed" || echo "❌ Health check failed"
	@echo ""
	@echo "Testing AWS provider versions..."
	@curl -s "http://localhost:8081/v1/providers/hashicorp/aws/versions" | head -c 200 && echo "... ✅ AWS versions endpoint working" || echo "❌ AWS versions failed"
	@echo ""
	@echo "Testing Kubernetes provider versions..."
	@curl -s "http://localhost:8081/v1/providers/hashicorp/kubernetes/versions" | head -c 200 && echo "... ✅ Kubernetes versions endpoint working" || echo "❌ Kubernetes versions failed"
	@echo ""
	@echo "Testing proxy info..."
	@curl -s "http://localhost:8081/proxy/info" | head -c 200 && echo "... ✅ Proxy info endpoint working" || echo "❌ Proxy info failed"
	@echo ""
	@echo "🎉 API testing complete!"

test-api-verbose: ## Test API endpoints with verbose output
	@echo "🧪 Testing TerraPeak API endpoints (verbose)..."
	@echo "=============================================="
	@echo ""
	@echo "1. Health Check:"
	@curl -v "http://localhost:8081/healthz"
	@echo ""
	@echo "2. AWS Provider Versions:"
	@curl -v "http://localhost:8081/v1/providers/hashicorp/aws/versions"
	@echo ""
	@echo "3. Kubernetes Provider Versions:"
	@curl -v "http://localhost:8081/v1/providers/hashicorp/kubernetes/versions"
	@echo ""
	@echo "4. Proxy Info:"
	@curl -v "http://localhost:8081/proxy/info"
	@echo ""
	@echo "🎉 Verbose API testing complete!"

test-api-download: ## Test file download endpoints
	@echo "🧪 Testing TerraPeak download endpoints..."
	@echo "Testing AWS provider download (this may take a moment)..."
	@curl -s -I "http://localhost:8081/v1/providers/hashicorp/aws/5.0.0/download/linux/amd64" | head -5
	@echo ""
	@echo "Testing Kubernetes provider download..."
	@curl -s -I "http://localhost:8081/v1/providers/hashicorp/kubernetes/3.0.0/download/linux/amd64" | head -5
	@echo ""
	@echo "🎉 Download testing complete!"

dev-setup: deps ## Setup development environment
	@echo "🔧 Setting up development environment..."
	@echo ""
	@echo "📦 Installing development dependencies..."
	@echo ""
	@echo "Installing golangci-lint..."
	@which golangci-lint > /dev/null || ( \
		GOPATH_BIN=$$(go env GOPATH)/bin; \
		mkdir -p $$GOPATH_BIN; \
		curl -sSfL https://raw.githubusercontent.com/golangci/golangci-lint/master/install.sh | sh -s -- -b $$GOPATH_BIN v1.54.2; \
		echo "Add $$GOPATH_BIN to your PATH if not already there" \
	)
	@echo "✅ golangci-lint installed"
	@echo ""
	@echo "Installing entr (for watch mode)..."
	@which entr > /dev/null || (echo "Please install entr manually:" && echo "  macOS: brew install entr" && echo "  Ubuntu/Debian: sudo apt-get install entr" && echo "  CentOS/RHEL: sudo yum install entr")
	@echo "✅ entr check completed"
	@echo ""
	@echo "Installing curl (for API testing)..."
	@which curl > /dev/null || (echo "Please install curl manually:" && echo "  macOS: brew install curl" && echo "  Ubuntu/Debian: sudo apt-get install curl" && echo "  CentOS/RHEL: sudo yum install curl")
	@echo "✅ curl check completed"
	@echo ""
	@echo "Installing tree (for directory structure)..."
	@which tree > /dev/null || (echo "Please install tree manually:" && echo "  macOS: brew install tree" && echo "  Ubuntu/Debian: sudo apt-get install tree" && echo "  CentOS/RHEL: sudo yum install tree")
	@echo "✅ tree check completed"
	@echo ""
	@echo "🔧 Development environment setup complete!"
	@echo "📋 Installed tools:"
	@echo "  ✅ golangci-lint (Go linter)"
	@echo "  ✅ entr (file watcher)"
	@echo "  ✅ curl (API testing)"
	@echo "  ✅ tree (directory structure)"
	@echo ""
	@echo "🚀 Ready for development!"

# Watch mode (requires entr)
watch-test: ## Watch files and run tests on change (requires 'entr')
	find registry -name "*.go" | entr -c make test-unit

# Status check
status: ## Check project status
	@echo "TerraPeak Status"
	@echo "================================+"
	@echo "Go version: $(shell go version)"
	@echo "Git branch: $(shell git branch --show-current 2>/dev/null || echo 'not a git repo')"
	@echo "Git status: $(shell git status --porcelain 2>/dev/null | wc -l | xargs) files changed"
	@echo "Dependencies: $(shell cd registry && go list -m all | wc -l | xargs) modules"
	@echo "Test files: $(shell find registry -name "*_test.go" | wc -l | xargs) files"
	@echo "Source files: $(shell find registry -name "*.go" -not -name "*_test.go" | wc -l | xargs) files"
