#!/bin/bash

# HumanDNS Monitoring Setup Script
set -e

echo "🚀 Setting up HumanDNS monitoring stack..."

# Create necessary directories
mkdir -p monitoring/grafana/provisioning/{datasources,dashboards}
mkdir -p monitoring/rules
mkdir -p monitoring/grafana/dashboards

# Set proper permissions
chmod +x scripts/setup-monitoring.sh

# Start monitoring stack
echo "📊 Starting monitoring services..."
cd monitoring
docker-compose -f docker-compose.monitoring.yml up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 30

# Check if services are running
echo "🔍 Checking service status..."
docker-compose -f docker-compose.monitoring.yml ps

echo "✅ Monitoring stack is ready!"
echo ""
echo "📈 Access URLs:"
echo "  - Grafana: http://localhost:3001 (admin/admin)"
echo "  - Prometheus: http://localhost:9090"
echo "  - cAdvisor: http://localhost:8080"
echo ""
echo "🔧 Next steps:"
echo "  1. Import the HumanDNS dashboard in Grafana"
echo "  2. Configure additional metrics as needed"
