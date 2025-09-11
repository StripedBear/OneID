# Tests for authentication endpoints
import pytest
from fastapi.testclient import TestClient

def test_register_user(client: TestClient, test_user_data):
    """Test user registration."""
    response = client.post("/api/v1/auth/register", json=test_user_data)
    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert data["username"] == test_user_data["username"]
    assert data["email"] == test_user_data["email"]
    assert "password" not in data  # Password should not be returned

def test_register_duplicate_user(client: TestClient, test_user_data):
    """Test registration with duplicate username."""
    # First registration
    client.post("/api/v1/auth/register", json=test_user_data)
    
    # Second registration with same username
    response = client.post("/api/v1/auth/register", json=test_user_data)
    assert response.status_code == 400

def test_login_user(client: TestClient, test_user_data):
    """Test user login."""
    # Register user first
    client.post("/api/v1/auth/register", json=test_user_data)
    
    # Login
    login_data = {
        "username": test_user_data["username"],
        "password": test_user_data["password"]
    }
    response = client.post("/api/v1/auth/login", data=login_data)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_login_invalid_credentials(client: TestClient):
    """Test login with invalid credentials."""
    login_data = {
        "username": "nonexistent",
        "password": "wrongpassword"
    }
    response = client.post("/api/v1/auth/login", data=login_data)
    assert response.status_code == 401

def test_get_current_user(client: TestClient, test_user_data):
    """Test getting current user with valid token."""
    # Register and login
    client.post("/api/v1/auth/register", json=test_user_data)
    login_response = client.post("/api/v1/auth/login", data={
        "username": test_user_data["username"],
        "password": test_user_data["password"]
    })
    token = login_response.json()["access_token"]
    
    # Get current user
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/api/v1/auth/me", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == test_user_data["username"]

def test_get_current_user_invalid_token(client: TestClient):
    """Test getting current user with invalid token."""
    headers = {"Authorization": "Bearer invalid_token"}
    response = client.get("/api/v1/auth/me", headers=headers)
    assert response.status_code == 401
