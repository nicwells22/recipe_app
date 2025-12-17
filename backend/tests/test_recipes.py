import pytest

def test_create_recipe(client, auth_headers):
    response = client.post(
        "/api/recipes",
        json={
            "title": "Test Recipe",
            "description": "A delicious test recipe",
            "prep_time": 15,
            "cook_time": 30,
            "servings": 4,
            "difficulty": "easy",
            "ingredients": [
                {"name": "Flour", "quantity": 2, "unit": "cups"},
                {"name": "Sugar", "quantity": 1, "unit": "cup"}
            ],
            "instructions": [
                {"step_number": 1, "content": "Mix dry ingredients"},
                {"step_number": 2, "content": "Bake at 350F", "timer_minutes": 30}
            ],
            "tags": ["dessert", "baking"]
        },
        headers=auth_headers
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Test Recipe"
    assert len(data["ingredients"]) == 2
    assert len(data["instructions"]) == 2
    assert len(data["tags"]) == 2

def test_get_recipes(client, auth_headers):
    # Create a recipe first
    client.post(
        "/api/recipes",
        json={"title": "Recipe 1", "description": "First recipe"},
        headers=auth_headers
    )
    
    response = client.get("/api/recipes", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert data["total"] >= 1

def test_get_recipe_by_id(client, auth_headers):
    # Create a recipe
    create_response = client.post(
        "/api/recipes",
        json={"title": "Get Test Recipe"},
        headers=auth_headers
    )
    recipe_id = create_response.json()["id"]
    
    response = client.get(f"/api/recipes/{recipe_id}", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["title"] == "Get Test Recipe"

def test_update_recipe(client, auth_headers):
    # Create a recipe
    create_response = client.post(
        "/api/recipes",
        json={"title": "Original Title"},
        headers=auth_headers
    )
    recipe_id = create_response.json()["id"]
    
    # Update it
    response = client.put(
        f"/api/recipes/{recipe_id}",
        json={"title": "Updated Title", "description": "New description"},
        headers=auth_headers
    )
    assert response.status_code == 200
    assert response.json()["title"] == "Updated Title"

def test_delete_recipe(client, auth_headers):
    # Create a recipe
    create_response = client.post(
        "/api/recipes",
        json={"title": "To Delete"},
        headers=auth_headers
    )
    recipe_id = create_response.json()["id"]
    
    # Delete it
    response = client.delete(f"/api/recipes/{recipe_id}", headers=auth_headers)
    assert response.status_code == 200
    
    # Verify it's gone
    get_response = client.get(f"/api/recipes/{recipe_id}", headers=auth_headers)
    assert get_response.status_code == 404

def test_toggle_favorite(client, auth_headers):
    # Create a recipe
    create_response = client.post(
        "/api/recipes",
        json={"title": "Favorite Test"},
        headers=auth_headers
    )
    recipe_id = create_response.json()["id"]
    
    # Add to favorites
    response = client.post(f"/api/recipes/{recipe_id}/favorite", headers=auth_headers)
    assert response.status_code == 200
    assert "added" in response.json()["message"]
    
    # Remove from favorites
    response = client.post(f"/api/recipes/{recipe_id}/favorite", headers=auth_headers)
    assert response.status_code == 200
    assert "removed" in response.json()["message"]

def test_search_recipes(client, auth_headers):
    # Create recipes
    client.post(
        "/api/recipes",
        json={"title": "Chocolate Cake", "description": "Rich chocolate"},
        headers=auth_headers
    )
    client.post(
        "/api/recipes",
        json={"title": "Vanilla Ice Cream"},
        headers=auth_headers
    )
    
    # Search
    response = client.get("/api/recipes?search=chocolate", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
