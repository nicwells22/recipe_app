import pytest

def test_register_user(client):
    response = client.post(
        "/api/auth/register",
        json={
            "email": "newuser@example.com",
            "username": "newuser",
            "password": "securepassword123"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "newuser@example.com"
    assert data["username"] == "newuser"
    assert "id" in data

def test_register_duplicate_email(client, test_user):
    response = client.post(
        "/api/auth/register",
        json={
            "email": "test@example.com",
            "username": "anotheruser",
            "password": "securepassword123"
        }
    )
    assert response.status_code == 400
    assert "already registered" in response.json()["detail"]

def test_login_success(client, test_user):
    response = client.post(
        "/api/auth/login",
        data={"username": "test@example.com", "password": "testpassword123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"

def test_login_wrong_password(client, test_user):
    response = client.post(
        "/api/auth/login",
        data={"username": "test@example.com", "password": "wrongpassword"}
    )
    assert response.status_code == 401

def test_get_current_user(client, auth_headers):
    response = client.get("/api/auth/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"

def test_refresh_token(client, test_user):
    # First login
    login_response = client.post(
        "/api/auth/login",
        data={"username": "test@example.com", "password": "testpassword123"}
    )
    refresh_token = login_response.json()["refresh_token"]
    
    # Refresh
    response = client.post(
        "/api/auth/refresh",
        json={"refresh_token": refresh_token}
    )
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_change_password(client, auth_headers):
    response = client.post(
        "/api/auth/change-password",
        json={
            "current_password": "testpassword123",
            "new_password": "newpassword456"
        },
        headers=auth_headers
    )
    assert response.status_code == 200
    
    # Try login with new password
    login_response = client.post(
        "/api/auth/login",
        data={"username": "test@example.com", "password": "newpassword456"}
    )
    assert login_response.status_code == 200
