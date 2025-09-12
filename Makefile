# OneID Development Commands

.PHONY: help build up down logs clean test lint format

# Default target
help:
	@echo "HumanDNS Development Commands:"
	@echo "  make build     - Build all Docker containers"
	@echo "  make up        - Start all services"
	@echo "  make down      - Stop all services"
	@echo "  make logs      - Show logs from all services"
	@echo "  make clean     - Remove all containers and volumes"
	@echo "  make test      - Run tests"
	@echo "  make lint      - Run linters"
	@echo "  make format    - Format code"

# Build all containers
build:
	docker-compose build

# Start all services
up:
	docker-compose up -d

# Stop all services
down:
	docker-compose down

# Show logs
logs:
	docker-compose logs -f

# Clean up containers and volumes
clean:
	docker-compose down -v --remove-orphans
	docker system prune -f

# Run tests
test:
	docker-compose exec backend python -m pytest
	docker-compose exec frontend npm test

# Run linters
lint:
	docker-compose exec backend black --check app/
	docker-compose exec frontend npm run lint

# Format code
format:
	docker-compose exec backend python -m black app/
	docker-compose exec frontend npm run format

# Development setup
dev-setup:
	@echo "Setting up development environment..."
	cp backend/env.example backend/.env
	cp frontend/env.example frontend/.env
	@echo "Please update .env files with your configuration"
