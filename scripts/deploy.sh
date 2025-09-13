#!/bin/bash

# HumanDNS Deployment Script
set -e

echo "🚀 Starting HumanDNS deployment..."

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Parse command line arguments
ENVIRONMENT=${1:-staging}
PLATFORM=${2:-docker}

echo "📋 Deployment configuration:"
echo "  Environment: $ENVIRONMENT"
echo "  Platform: $PLATFORM"

case $PLATFORM in
    "docker")
        echo "🐳 Deploying with Docker..."
        docker-compose down
        docker-compose build
        docker-compose up -d
        echo "✅ Docker deployment completed!"
        ;;
    
    "vercel")
        echo "▲ Deploying frontend to Vercel..."
        cd frontend
        vercel --prod
        cd ..
        echo "✅ Vercel deployment completed!"
        ;;
    
    "render")
        echo "🎨 Deploying to Render..."
        # Render will automatically deploy from GitHub
        echo "✅ Render deployment initiated!"
        ;;
    
    "fly")
        echo "🪰 Deploying to Fly.io..."
        cd backend
        fly deploy
        cd ..
        echo "✅ Fly.io deployment completed!"
        ;;
    
    "railway")
        echo "🚂 Deploying to Railway..."
        railway up
        echo "✅ Railway deployment completed!"
        ;;
    
    *)
        echo "❌ Unknown platform: $PLATFORM"
        echo "Available platforms: docker, vercel, render, fly, railway"
        exit 1
        ;;
esac

echo "🎉 Deployment completed successfully!"
echo ""
echo "📊 Next steps:"
echo "  1. Check service health"
echo "  2. Monitor logs"
echo "  3. Run smoke tests"
echo "  4. Update monitoring dashboards"

