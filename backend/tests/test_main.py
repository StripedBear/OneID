# Tests for main application endpoints
import pytest
from fastapi.testclient import TestClient

def test_health_endpoint(client: TestClient):
    """Test health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "human-dns"
    assert data["version"] == "0.1.0"

def test_cors_headers(client: TestClient):
    """Test CORS headers are present."""
    response = client.options("/health")
    assert response.status_code == 200
    assert "access-control-allow-origin" in response.headers

def test_api_docs_endpoint(client: TestClient):
    """Test API documentation is accessible."""
    response = client.get("/docs")
    assert response.status_code == 200

def test_openapi_schema(client: TestClient):
    """Test OpenAPI schema is accessible."""
    response = client.get("/openapi.json")
    assert response.status_code == 200
    data = response.json()
    assert "openapi" in data
    assert data["info"]["title"] == "HumanDNS API"
