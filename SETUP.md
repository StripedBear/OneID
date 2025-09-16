# HumanDNS Setup Guide

This guide will help you set up HumanDNS for development, testing, and production.

##  Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)
- Git

### 1. Clone Repository
```bash
git clone https://github.com/StripedBear/OneID.git
cd humandns
```

### 2. Environment Setup
```bash
# Copy environment files
cp backend/env.example backend/.env
cp frontend/env.example frontend/.env

# Edit environment files with your configuration
nano backend/.env
nano frontend/.env
```

### 3. Start with Docker
```bash
# Build and start all services
make build
make up

# Or use docker-compose directly
docker-compose up -d
```

### 4. Run Database Migrations
```bash
docker-compose exec backend alembic upgrade head
```

### 5. Access Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs
- Database: localhost:5432

##  Development Setup

### Backend Development
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Start development server
uvicorn app.main:app --reload
```

### Frontend Development
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Database Setup
```bash
# Using Docker (recommended)
docker-compose up postgres -d

# Or install PostgreSQL locally
# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib

# macOS
brew install postgresql

# Windows
# Download from https://www.postgresql.org/download/windows/
```

## 🔧 Configuration

### Backend Configuration (.env)
```bash
# Database
DATABASE_URL=postgresql+psycopg://humandns:humandns_dev@localhost:5432/humandns

# Security
SECRET_KEY=your-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# CORS
CORS_ORIGINS=["http://localhost:3000","https://your-frontend-domain.com"]

# Application
PROJECT_NAME=HumanDNS API
API_V1_PREFIX=/api/v1

# File Upload
MAX_FILE_SIZE=5242880
ALLOWED_EXTENSIONS=jpg,jpeg,png,webp
```

### Frontend Configuration (.env)
```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# Application
NEXT_PUBLIC_APP_NAME=HumanDNS
NEXT_PUBLIC_APP_VERSION=0.1.0

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_PWA=true

# External Services
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Testing Setup

### Run Tests
```bash
# All tests
make test

# Backend tests
cd backend
pytest
pytest --cov=app  # With coverage

# Frontend tests
cd frontend
npm test
npm run test:coverage  # With coverage
```

### Test Database
```bash
# Create test database
createdb humandns_test

# Set test environment
export DATABASE_URL=postgresql+psycopg://user:password@localhost:5432/humandns_test

# Run tests
pytest
```

## Monitoring Setup

### Start Monitoring Stack
```bash
cd monitoring
docker-compose -f docker-compose.monitoring.yml up -d
```

### Access Monitoring
- **Grafana**: http://localhost:3001 (admin/admin)
- **Prometheus**: http://localhost:9090

### Configure Monitoring
1. Start monitoring stack: `docker-compose -f docker-compose.monitoring.yml up -d`
2. Access Grafana at http://localhost:3001
3. Import dashboards as needed

## 🚀 Production Setup

### Environment Variables
Set production environment variables on your hosting platform:

#### Backend
```bash
DATABASE_URL=postgresql+psycopg://user:password@host:5432/dbname
SECRET_KEY=your-production-secret-key
CORS_ORIGINS=["https://your-frontend-domain.com"]
```

#### Frontend
```bash
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
NEXT_PUBLIC_APP_NAME=HumanDNS
```

### Database Setup
1. Create production database
2. Run migrations: `alembic upgrade head`
3. Set up database backups
4. Configure connection pooling

### Security Configuration
1. Use strong SECRET_KEY values
2. Enable HTTPS everywhere
3. Set up proper CORS policies
4. Configure rate limiting
5. Set up monitoring and alerting
