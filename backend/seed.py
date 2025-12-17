"""
Seed script to populate the database with sample data.
Run with: python seed.py
"""

import sys
import os

# Add the parent directory to the path so we can import app modules
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, SessionLocal, Base
from app.models import User, Recipe, Ingredient, Instruction, Folder, Tag



def seed_database():
    """Seed the database with sample data."""
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Check if data already exists
        existing_user = db.query(User).filter(User.email == "user@app.local").first()
        if existing_user:
            print("Database already seeded. Skipping...")
            return
        
        print("Seeding database...")
        
        # Create default user (same as app uses)
        demo_user = User(
            email="user@app.local",
            username="user",
            hashed_password=""
        )
        db.add(demo_user)
        db.flush()
        
        print(f"Created user: {demo_user.email}")
        
        # Create folders
        folders_data = [
            {"name": "Breakfast", "description": "Morning meals and brunch recipes"},
            {"name": "Lunch", "description": "Midday meals and light dishes"},
            {"name": "Dinner", "description": "Evening meals and main courses"},
            {"name": "Desserts", "description": "Sweet treats and baked goods"},
            {"name": "Quick & Easy", "description": "Recipes under 30 minutes"},
        ]
        
        folders = {}
        for folder_data in folders_data:
            folder = Folder(owner_id=demo_user.id, **folder_data)
            db.add(folder)
            db.flush()
            folders[folder_data["name"]] = folder
            print(f"Created folder: {folder.name}")
        
        # Create tags
        tags_data = ["vegetarian", "vegan", "gluten-free", "dairy-free", "healthy", 
                     "comfort-food", "italian", "mexican", "asian", "american"]
        
        tags = {}
        for tag_name in tags_data:
            tag = Tag(name=tag_name)
            db.add(tag)
            db.flush()
            tags[tag_name] = tag
        
        print(f"Created {len(tags)} tags")
        
        # Create recipes
        recipes_data = [
            {
                "title": "Classic Pancakes",
                "description": "Fluffy, golden pancakes perfect for a weekend breakfast. Serve with maple syrup and fresh berries.",
                "prep_time": 10,
                "cook_time": 15,
                "servings": 4,
                "difficulty": "easy",
                "ingredients": [
                    {"name": "all-purpose flour", "quantity": "1.5", "unit": "cups"},
                    {"name": "milk", "quantity": "1.25", "unit": "cups"},
                    {"name": "egg", "quantity": "1", "unit": "large"},
                    {"name": "butter", "quantity": "3", "unit": "tbsp", "notes": "melted"},
                    {"name": "sugar", "quantity": "2", "unit": "tbsp"},
                    {"name": "baking powder", "quantity": "1.5", "unit": "tsp"},
                    {"name": "salt", "quantity": "0.5", "unit": "tsp"},
                ],
                "instructions": [
                    {"content": "In a large bowl, whisk together flour, sugar, baking powder, and salt."},
                    {"content": "In another bowl, beat the egg, then add milk and melted butter."},
                    {"content": "Pour wet ingredients into dry ingredients and stir until just combined. Don't overmix - some lumps are okay."},
                    {"content": "Heat a non-stick pan or griddle over medium heat. Lightly grease with butter.", "timer_minutes": 2},
                    {"content": "Pour 1/4 cup batter for each pancake. Cook until bubbles form on surface.", "timer_minutes": 2},
                    {"content": "Flip and cook until golden brown on the other side.", "timer_minutes": 1},
                ],
                "tags": ["comfort-food", "american"],
                "folder": "Breakfast",
            },
            {
                "title": "Spaghetti Carbonara",
                "description": "Authentic Italian pasta with crispy pancetta, eggs, and Pecorino Romano cheese. Rich, creamy, and absolutely delicious.",
                "prep_time": 15,
                "cook_time": 20,
                "servings": 4,
                "difficulty": "medium",
                "ingredients": [
                    {"name": "spaghetti", "quantity": "400", "unit": "g"},
                    {"name": "pancetta or guanciale", "quantity": "200", "unit": "g", "notes": "diced"},
                    {"name": "eggs", "quantity": "4", "unit": "large"},
                    {"name": "Pecorino Romano", "quantity": "100", "unit": "g", "notes": "finely grated"},
                    {"name": "Parmesan", "quantity": "50", "unit": "g", "notes": "finely grated"},
                    {"name": "black pepper", "quantity": "2", "unit": "tsp", "notes": "freshly ground"},
                    {"name": "salt", "quantity": "", "unit": "", "notes": "for pasta water"},
                ],
                "instructions": [
                    {"content": "Bring a large pot of salted water to boil. Cook spaghetti according to package directions until al dente.", "timer_minutes": 10},
                    {"content": "While pasta cooks, whisk eggs with grated cheeses and black pepper in a bowl."},
                    {"content": "Cook pancetta in a large skillet over medium heat until crispy.", "timer_minutes": 8},
                    {"content": "Reserve 1 cup pasta water, then drain pasta."},
                    {"content": "Remove skillet from heat. Add hot pasta to pancetta and toss."},
                    {"content": "Quickly pour egg mixture over pasta, tossing constantly. The residual heat will cook the eggs into a creamy sauce."},
                    {"content": "Add pasta water a little at a time if needed to loosen the sauce. Serve immediately with extra cheese and pepper."},
                ],
                "tags": ["italian", "comfort-food"],
                "folder": "Dinner",
            },
            {
                "title": "Chicken Stir-Fry",
                "description": "Quick and healthy chicken stir-fry with colorful vegetables in a savory sauce. Ready in under 30 minutes!",
                "prep_time": 15,
                "cook_time": 10,
                "servings": 4,
                "difficulty": "easy",
                "ingredients": [
                    {"name": "chicken breast", "quantity": "500", "unit": "g", "notes": "sliced thin"},
                    {"name": "broccoli florets", "quantity": "2", "unit": "cups"},
                    {"name": "bell peppers", "quantity": "2", "unit": "medium", "notes": "sliced"},
                    {"name": "carrots", "quantity": "2", "unit": "medium", "notes": "julienned"},
                    {"name": "soy sauce", "quantity": "3", "unit": "tbsp"},
                    {"name": "sesame oil", "quantity": "1", "unit": "tbsp"},
                    {"name": "garlic", "quantity": "3", "unit": "cloves", "notes": "minced"},
                    {"name": "ginger", "quantity": "1", "unit": "tbsp", "notes": "minced"},
                    {"name": "vegetable oil", "quantity": "2", "unit": "tbsp"},
                    {"name": "cornstarch", "quantity": "1", "unit": "tbsp"},
                ],
                "instructions": [
                    {"content": "Mix soy sauce, sesame oil, and cornstarch in a small bowl. Set aside."},
                    {"content": "Heat vegetable oil in a wok or large skillet over high heat."},
                    {"content": "Add chicken and stir-fry until cooked through. Remove and set aside.", "timer_minutes": 4},
                    {"content": "Add more oil if needed. Stir-fry garlic and ginger for 30 seconds."},
                    {"content": "Add vegetables and stir-fry until crisp-tender.", "timer_minutes": 4},
                    {"content": "Return chicken to wok. Pour sauce over and toss until everything is coated and sauce thickens.", "timer_minutes": 1},
                    {"content": "Serve immediately over steamed rice."},
                ],
                "tags": ["asian", "healthy", "quick & easy"],
                "folder": "Quick & Easy",
            },
            {
                "title": "Chocolate Chip Cookies",
                "description": "Soft and chewy chocolate chip cookies with crispy edges. A timeless classic that everyone loves!",
                "prep_time": 15,
                "cook_time": 12,
                "servings": 24,
                "difficulty": "easy",
                "ingredients": [
                    {"name": "all-purpose flour", "quantity": "2.25", "unit": "cups"},
                    {"name": "butter", "quantity": "1", "unit": "cup", "notes": "softened"},
                    {"name": "granulated sugar", "quantity": "0.75", "unit": "cup"},
                    {"name": "brown sugar", "quantity": "0.75", "unit": "cup", "notes": "packed"},
                    {"name": "eggs", "quantity": "2", "unit": "large"},
                    {"name": "vanilla extract", "quantity": "1", "unit": "tsp"},
                    {"name": "baking soda", "quantity": "1", "unit": "tsp"},
                    {"name": "salt", "quantity": "1", "unit": "tsp"},
                    {"name": "chocolate chips", "quantity": "2", "unit": "cups"},
                ],
                "instructions": [
                    {"content": "Preheat oven to 375°F (190°C)."},
                    {"content": "Cream together butter and both sugars until light and fluffy.", "timer_minutes": 3},
                    {"content": "Beat in eggs one at a time, then add vanilla."},
                    {"content": "In a separate bowl, whisk flour, baking soda, and salt."},
                    {"content": "Gradually add dry ingredients to wet ingredients, mixing until just combined."},
                    {"content": "Fold in chocolate chips."},
                    {"content": "Drop rounded tablespoons of dough onto ungreased baking sheets."},
                    {"content": "Bake until edges are golden but centers look slightly underdone.", "timer_minutes": 10},
                    {"content": "Let cool on baking sheet for 5 minutes before transferring to wire rack.", "timer_minutes": 5},
                ],
                "tags": ["comfort-food", "american"],
                "folder": "Desserts",
            },
            {
                "title": "Greek Salad",
                "description": "Fresh and vibrant Mediterranean salad with crisp vegetables, olives, and creamy feta cheese.",
                "prep_time": 15,
                "cook_time": 0,
                "servings": 4,
                "difficulty": "easy",
                "ingredients": [
                    {"name": "cucumber", "quantity": "1", "unit": "large", "notes": "diced"},
                    {"name": "tomatoes", "quantity": "4", "unit": "medium", "notes": "cut into wedges"},
                    {"name": "red onion", "quantity": "0.5", "unit": "medium", "notes": "thinly sliced"},
                    {"name": "green bell pepper", "quantity": "1", "unit": "medium", "notes": "diced"},
                    {"name": "Kalamata olives", "quantity": "0.5", "unit": "cup"},
                    {"name": "feta cheese", "quantity": "200", "unit": "g", "notes": "cubed or crumbled"},
                    {"name": "extra virgin olive oil", "quantity": "4", "unit": "tbsp"},
                    {"name": "red wine vinegar", "quantity": "2", "unit": "tbsp"},
                    {"name": "dried oregano", "quantity": "1", "unit": "tsp"},
                    {"name": "salt and pepper", "quantity": "", "unit": "", "notes": "to taste"},
                ],
                "instructions": [
                    {"content": "Combine cucumber, tomatoes, red onion, bell pepper, and olives in a large bowl."},
                    {"content": "Whisk together olive oil, red wine vinegar, oregano, salt, and pepper."},
                    {"content": "Pour dressing over vegetables and toss gently."},
                    {"content": "Top with feta cheese. Serve immediately or refrigerate for up to 2 hours."},
                ],
                "tags": ["vegetarian", "healthy", "gluten-free"],
                "folder": "Lunch",
            },
            {
                "title": "Beef Tacos",
                "description": "Flavorful seasoned ground beef tacos with all your favorite toppings. Perfect for Taco Tuesday!",
                "prep_time": 10,
                "cook_time": 15,
                "servings": 6,
                "difficulty": "easy",
                "ingredients": [
                    {"name": "ground beef", "quantity": "500", "unit": "g"},
                    {"name": "taco seasoning", "quantity": "2", "unit": "tbsp"},
                    {"name": "water", "quantity": "0.5", "unit": "cup"},
                    {"name": "taco shells", "quantity": "12", "unit": "pieces"},
                    {"name": "lettuce", "quantity": "2", "unit": "cups", "notes": "shredded"},
                    {"name": "tomatoes", "quantity": "2", "unit": "medium", "notes": "diced"},
                    {"name": "cheddar cheese", "quantity": "1", "unit": "cup", "notes": "shredded"},
                    {"name": "sour cream", "quantity": "0.5", "unit": "cup"},
                    {"name": "salsa", "quantity": "0.5", "unit": "cup"},
                ],
                "instructions": [
                    {"content": "Brown ground beef in a large skillet over medium-high heat, breaking it up as it cooks.", "timer_minutes": 7},
                    {"content": "Drain excess fat from the pan."},
                    {"content": "Add taco seasoning and water. Stir to combine.", "timer_minutes": 5},
                    {"content": "Simmer until sauce thickens and coats the meat."},
                    {"content": "Warm taco shells according to package directions."},
                    {"content": "Fill shells with seasoned beef and top with lettuce, tomatoes, cheese, sour cream, and salsa."},
                ],
                "tags": ["mexican", "comfort-food"],
                "folder": "Dinner",
            },
        ]
        
        for recipe_data in recipes_data:
            # Create recipe
            recipe = Recipe(
                owner_id=demo_user.id,
                title=recipe_data["title"],
                description=recipe_data["description"],
                prep_time=recipe_data["prep_time"],
                cook_time=recipe_data["cook_time"],
                servings=recipe_data["servings"],
                difficulty=recipe_data["difficulty"],
            )
            db.add(recipe)
            db.flush()
            
            # Add ingredients
            for i, ing_data in enumerate(recipe_data["ingredients"]):
                ingredient = Ingredient(
                    recipe_id=recipe.id,
                    name=ing_data["name"],
                    quantity=float(ing_data["quantity"]) if ing_data.get("quantity") else None,
                    unit=ing_data.get("unit"),
                    notes=ing_data.get("notes"),
                )
                db.add(ingredient)
            
            # Add instructions
            for i, inst_data in enumerate(recipe_data["instructions"]):
                instruction = Instruction(
                    recipe_id=recipe.id,
                    step_number=i + 1,
                    content=inst_data["content"],
                    timer_minutes=inst_data.get("timer_minutes"),
                )
                db.add(instruction)
            
            # Add tags
            for tag_name in recipe_data.get("tags", []):
                if tag_name in tags:
                    recipe.tags.append(tags[tag_name])
            
            # Add to folder
            folder_name = recipe_data.get("folder")
            if folder_name and folder_name in folders:
                recipe.folders.append(folders[folder_name])
            
            print(f"Created recipe: {recipe.title}")
        
        db.commit()
        print("\n✅ Database seeded successfully!")
        print("\nThe app is ready to use - no login required!")
        
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
