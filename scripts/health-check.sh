#!/bin/bash

# HumanDNS Health Check Script
set -e

echo "🏥 Running HumanDNS health checks..."

# Configuration
BACKEND_URL=${BACKEND_URL:-"http://localhost:8000"}
FRONTEND_URL=${FRONTEND_URL:-"http://localhost:3000"}
TIMEOUT=10

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check HTTP endpoint
check_endpoint() {
    local url=$1
    local name=$2
    local expected_status=${3:-200}
    
    echo -n "Checking $name... "
    
    if response=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$url" 2>/dev/null); then
        if [ "$response" = "$expected_status" ]; then
            echo -e "${GREEN}✓ OK${NC} (HTTP $response)"
            return 0
        else
            echo -e "${RED}✗ FAILED${NC} (HTTP $response, expected $expected_status)"
            return 1
        fi
    else
        echo -e "${RED}✗ FAILED${NC} (Connection timeout or error)"
        return 1
    fi
}

# Function to check database connectivity
check_database() {
    echo -n "Checking database... "
    
    # Try to connect to database (adjust connection string as needed)
    if python3 -c "
import psycopg2
import os
try:
    conn = psycopg2.connect(os.getenv('DATABASE_URL', 'postgresql://humandns:humandns_dev@localhost:5432/humandns'))
    conn.close()
    print('✓ OK')
    exit(0)
except Exception as e:
    print('✗ FAILED:', str(e))
    exit(1)
" 2>/dev/null; then
        echo -e "${GREEN}✓ OK${NC}"
        return 0
    else
        echo -e "${RED}✗ FAILED${NC}"
        return 1
    fi
}

# Run health checks
echo "🔍 Checking service endpoints..."
echo ""

# Check backend health
if check_endpoint "$BACKEND_URL/health" "Backend Health"; then
    BACKEND_OK=true
else
    BACKEND_OK=false
fi

# Check frontend
if check_endpoint "$FRONTEND_URL" "Frontend"; then
    FRONTEND_OK=true
else
    FRONTEND_OK=false
fi

# Check API documentation
if check_endpoint "$BACKEND_URL/docs" "API Documentation"; then
    API_DOCS_OK=true
else
    API_DOCS_OK=false
fi

# Check database (if DATABASE_URL is set)
if [ -n "$DATABASE_URL" ]; then
    if check_database; then
        DATABASE_OK=true
    else
        DATABASE_OK=false
    fi
else
    echo "Skipping database check (DATABASE_URL not set)"
    DATABASE_OK=true
fi

echo ""
echo "📊 Health Check Summary:"
echo "========================"

if [ "$BACKEND_OK" = true ]; then
    echo -e "Backend: ${GREEN}✓ Healthy${NC}"
else
    echo -e "Backend: ${RED}✗ Unhealthy${NC}"
fi

if [ "$FRONTEND_OK" = true ]; then
    echo -e "Frontend: ${GREEN}✓ Healthy${NC}"
else
    echo -e "Frontend: ${RED}✗ Unhealthy${NC}"
fi

if [ "$API_DOCS_OK" = true ]; then
    echo -e "API Docs: ${GREEN}✓ Available${NC}"
else
    echo -e "API Docs: ${RED}✗ Unavailable${NC}"
fi

if [ "$DATABASE_OK" = true ]; then
    echo -e "Database: ${GREEN}✓ Connected${NC}"
else
    echo -e "Database: ${RED}✗ Disconnected${NC}"
fi

echo ""

# Overall status
if [ "$BACKEND_OK" = true ] && [ "$FRONTEND_OK" = true ] && [ "$API_DOCS_OK" = true ] && [ "$DATABASE_OK" = true ]; then
    echo -e "${GREEN}🎉 All services are healthy!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some services are unhealthy. Please check the logs.${NC}"
    exit 1
fi
