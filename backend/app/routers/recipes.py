from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from typing import Optional, List
import os
import uuid
from PIL import Image

from ..database import get_db
from ..models import Recipe, Ingredient, Instruction, Folder, Tag, Favorite, User
from ..schemas import (
    RecipeCreate, RecipeUpdate, RecipeResponse, RecipeListResponse,
    PaginatedResponse, MessageResponse
)
from ..config import settings

# Get or create a default user for the app (no auth needed)
def get_default_user(db: Session = Depends(get_db)) -> User:
    user = db.query(User).first()
    if not user:
        user = User(email="user@app.local", username="user", hashed_password="")
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

router = APIRouter(prefix="/api/recipes", tags=["Recipes"])

def get_or_create_tag(db: Session, tag_name: str) -> Tag:
    tag = db.query(Tag).filter(Tag.name == tag_name.lower()).first()
    if not tag:
        tag = Tag(name=tag_name.lower())
        db.add(tag)
        db.flush()
    return tag

def check_favorite(db: Session, recipe_id: int, user_id: int) -> bool:
    return db.query(Favorite).filter(
        Favorite.recipe_id == recipe_id,
        Favorite.user_id == user_id
    ).first() is not None

@router.get("", response_model=PaginatedResponse)
async def get_recipes(
    page: int = Query(1, ge=1),
    per_page: int = Query(12, ge=1, le=50),
    search: Optional[str] = None,
    folder_id: Optional[int] = None,
    tag: Optional[str] = None,
    difficulty: Optional[str] = None,
    favorites_only: bool = False,
    current_user: User = Depends(get_default_user),
    db: Session = Depends(get_db)
):
    query = db.query(Recipe).filter(Recipe.owner_id == current_user.id)
    
    # Search filter
    if search:
        search_term = f"%{search}%"
        query = query.outerjoin(Recipe.ingredients).filter(
            or_(
                Recipe.title.ilike(search_term),
                Recipe.description.ilike(search_term),
                Ingredient.name.ilike(search_term)
            )
        ).distinct()
    
    # Folder filter
    if folder_id:
        query = query.join(Recipe.folders).filter(Folder.id == folder_id)
    
    # Tag filter
    if tag:
        query = query.join(Recipe.tags).filter(Tag.name == tag.lower())
    
    # Difficulty filter
    if difficulty:
        query = query.filter(Recipe.difficulty == difficulty)
    
    # Favorites filter
    if favorites_only:
        query = query.join(Recipe.favorites).filter(Favorite.user_id == current_user.id)
    
    # Get total count
    total = query.count()
    
    # Pagination
    offset = (page - 1) * per_page
    recipes = query.order_by(Recipe.created_at.desc()).offset(offset).limit(per_page).all()
    
    # Add favorite status
    items = []
    for recipe in recipes:
        recipe_dict = {
            "id": recipe.id,
            "title": recipe.title,
            "description": recipe.description,
            "image_url": recipe.image_url,
            "prep_time": recipe.prep_time,
            "cook_time": recipe.cook_time,
            "difficulty": recipe.difficulty,
            "created_at": recipe.created_at,
            "is_favorite": check_favorite(db, recipe.id, current_user.id)
        }
        items.append(recipe_dict)
    
    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        per_page=per_page,
        pages=(total + per_page - 1) // per_page
    )

@router.get("/recent", response_model=List[RecipeListResponse])
async def get_recent_recipes(
    limit: int = Query(6, ge=1, le=20),
    current_user: User = Depends(get_default_user),
    db: Session = Depends(get_db)
):
    recipes = db.query(Recipe).filter(
        Recipe.owner_id == current_user.id
    ).order_by(Recipe.created_at.desc()).limit(limit).all()
    
    items = []
    for recipe in recipes:
        items.append(RecipeListResponse(
            id=recipe.id,
            title=recipe.title,
            description=recipe.description,
            image_url=recipe.image_url,
            prep_time=recipe.prep_time,
            cook_time=recipe.cook_time,
            difficulty=recipe.difficulty,
            created_at=recipe.created_at,
            is_favorite=check_favorite(db, recipe.id, current_user.id)
        ))
    
    return items

@router.get("/{recipe_id}", response_model=RecipeResponse)
async def get_recipe(
    recipe_id: int,
    current_user: User = Depends(get_default_user),
    db: Session = Depends(get_db)
):
    recipe = db.query(Recipe).options(
        joinedload(Recipe.ingredients),
        joinedload(Recipe.instructions),
        joinedload(Recipe.tags),
        joinedload(Recipe.folders)
    ).filter(Recipe.id == recipe_id, Recipe.owner_id == current_user.id).first()
    
    if not recipe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recipe not found"
        )
    
    response = RecipeResponse(
        id=recipe.id,
        title=recipe.title,
        description=recipe.description,
        image_url=recipe.image_url,
        prep_time=recipe.prep_time,
        cook_time=recipe.cook_time,
        servings=recipe.servings,
        difficulty=recipe.difficulty,
        created_at=recipe.created_at,
        updated_at=recipe.updated_at,
        owner_id=recipe.owner_id,
        ingredients=[ing for ing in recipe.ingredients],
        instructions=sorted(recipe.instructions, key=lambda x: x.step_number),
        tags=[tag for tag in recipe.tags],
        folders=[folder for folder in recipe.folders],
        is_favorite=check_favorite(db, recipe.id, current_user.id)
    )
    
    return response

@router.post("", response_model=RecipeResponse, status_code=status.HTTP_201_CREATED)
async def create_recipe(
    recipe_data: RecipeCreate,
    current_user: User = Depends(get_default_user),
    db: Session = Depends(get_db)
):
    # Create recipe
    recipe = Recipe(
        title=recipe_data.title,
        description=recipe_data.description,
        prep_time=recipe_data.prep_time,
        cook_time=recipe_data.cook_time,
        servings=recipe_data.servings,
        difficulty=recipe_data.difficulty,
        owner_id=current_user.id
    )
    db.add(recipe)
    db.flush()
    
    # Add ingredients
    for ing_data in recipe_data.ingredients:
        ingredient = Ingredient(
            name=ing_data.name,
            quantity=ing_data.quantity,
            unit=ing_data.unit,
            notes=ing_data.notes,
            recipe_id=recipe.id
        )
        db.add(ingredient)
    
    # Add instructions
    for inst_data in recipe_data.instructions:
        instruction = Instruction(
            step_number=inst_data.step_number,
            content=inst_data.content,
            timer_minutes=inst_data.timer_minutes,
            recipe_id=recipe.id
        )
        db.add(instruction)
    
    # Add tags
    for tag_name in recipe_data.tags:
        tag = get_or_create_tag(db, tag_name)
        recipe.tags.append(tag)
    
    # Add to folders
    for folder_id in recipe_data.folder_ids:
        folder = db.query(Folder).filter(
            Folder.id == folder_id,
            Folder.owner_id == current_user.id
        ).first()
        if folder:
            recipe.folders.append(folder)
    
    db.commit()
    db.refresh(recipe)
    
    return await get_recipe(recipe.id, current_user, db)

@router.put("/{recipe_id}", response_model=RecipeResponse)
async def update_recipe(
    recipe_id: int,
    recipe_data: RecipeUpdate,
    current_user: User = Depends(get_default_user),
    db: Session = Depends(get_db)
):
    recipe = db.query(Recipe).filter(
        Recipe.id == recipe_id,
        Recipe.owner_id == current_user.id
    ).first()
    
    if not recipe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recipe not found"
        )
    
    # Update basic fields
    if recipe_data.title is not None:
        recipe.title = recipe_data.title
    if recipe_data.description is not None:
        recipe.description = recipe_data.description
    if recipe_data.prep_time is not None:
        recipe.prep_time = recipe_data.prep_time
    if recipe_data.cook_time is not None:
        recipe.cook_time = recipe_data.cook_time
    if recipe_data.servings is not None:
        recipe.servings = recipe_data.servings
    if recipe_data.difficulty is not None:
        recipe.difficulty = recipe_data.difficulty
    
    # Update ingredients
    if recipe_data.ingredients is not None:
        db.query(Ingredient).filter(Ingredient.recipe_id == recipe_id).delete()
        for ing_data in recipe_data.ingredients:
            ingredient = Ingredient(
                name=ing_data.name,
                quantity=ing_data.quantity,
                unit=ing_data.unit,
                notes=ing_data.notes,
                recipe_id=recipe.id
            )
            db.add(ingredient)
    
    # Update instructions
    if recipe_data.instructions is not None:
        db.query(Instruction).filter(Instruction.recipe_id == recipe_id).delete()
        for inst_data in recipe_data.instructions:
            instruction = Instruction(
                step_number=inst_data.step_number,
                content=inst_data.content,
                timer_minutes=inst_data.timer_minutes,
                recipe_id=recipe.id
            )
            db.add(instruction)
    
    # Update tags
    if recipe_data.tags is not None:
        recipe.tags.clear()
        for tag_name in recipe_data.tags:
            tag = get_or_create_tag(db, tag_name)
            recipe.tags.append(tag)
    
    # Update folders
    if recipe_data.folder_ids is not None:
        recipe.folders.clear()
        for folder_id in recipe_data.folder_ids:
            folder = db.query(Folder).filter(
                Folder.id == folder_id,
                Folder.owner_id == current_user.id
            ).first()
            if folder:
                recipe.folders.append(folder)
    
    db.commit()
    
    return await get_recipe(recipe_id, current_user, db)

@router.delete("/{recipe_id}", response_model=MessageResponse)
async def delete_recipe(
    recipe_id: int,
    current_user: User = Depends(get_default_user),
    db: Session = Depends(get_db)
):
    recipe = db.query(Recipe).filter(
        Recipe.id == recipe_id,
        Recipe.owner_id == current_user.id
    ).first()
    
    if not recipe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recipe not found"
        )
    
    # Delete image if exists
    if recipe.image_url:
        image_path = os.path.join(settings.UPLOAD_DIR, os.path.basename(recipe.image_url))
        if os.path.exists(image_path):
            os.remove(image_path)
    
    db.delete(recipe)
    db.commit()
    
    return MessageResponse(message="Recipe deleted successfully")

@router.post("/{recipe_id}/image", response_model=RecipeResponse)
async def upload_recipe_image(
    recipe_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_default_user),
    db: Session = Depends(get_db)
):
    recipe = db.query(Recipe).filter(
        Recipe.id == recipe_id,
        Recipe.owner_id == current_user.id
    ).first()
    
    if not recipe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recipe not found"
        )
    
    # Validate file extension
    ext = file.filename.split(".")[-1].lower()
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not allowed. Allowed types: {settings.ALLOWED_EXTENSIONS}"
        )
    
    # Read and validate file size
    contents = await file.read()
    if len(contents) > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum size: {settings.MAX_UPLOAD_SIZE // (1024*1024)}MB"
        )
    
    # Delete old image if exists
    if recipe.image_url:
        old_path = os.path.join(settings.UPLOAD_DIR, os.path.basename(recipe.image_url))
        if os.path.exists(old_path):
            os.remove(old_path)
    
    # Save new image
    filename = f"{uuid.uuid4()}.{ext}"
    filepath = os.path.join(settings.UPLOAD_DIR, filename)
    
    with open(filepath, "wb") as f:
        f.write(contents)
    
    # Optionally resize image
    try:
        with Image.open(filepath) as img:
            if img.width > 1200 or img.height > 1200:
                img.thumbnail((1200, 1200), Image.Resampling.LANCZOS)
                img.save(filepath, quality=85, optimize=True)
    except Exception:
        pass  # Keep original if resize fails
    
    recipe.image_url = f"/uploads/{filename}"
    db.commit()
    
    return await get_recipe(recipe_id, current_user, db)

@router.post("/{recipe_id}/favorite", response_model=MessageResponse)
async def toggle_favorite(
    recipe_id: int,
    current_user: User = Depends(get_default_user),
    db: Session = Depends(get_db)
):
    recipe = db.query(Recipe).filter(
        Recipe.id == recipe_id,
        Recipe.owner_id == current_user.id
    ).first()
    
    if not recipe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recipe not found"
        )
    
    existing = db.query(Favorite).filter(
        Favorite.recipe_id == recipe_id,
        Favorite.user_id == current_user.id
    ).first()
    
    if existing:
        db.delete(existing)
        db.commit()
        return MessageResponse(message="Recipe removed from favorites")
    else:
        favorite = Favorite(recipe_id=recipe_id, user_id=current_user.id)
        db.add(favorite)
        db.commit()
        return MessageResponse(message="Recipe added to favorites")

@router.post("/{recipe_id}/folders/{folder_id}", response_model=MessageResponse)
async def add_recipe_to_folder(
    recipe_id: int,
    folder_id: int,
    current_user: User = Depends(get_default_user),
    db: Session = Depends(get_db)
):
    recipe = db.query(Recipe).filter(
        Recipe.id == recipe_id,
        Recipe.owner_id == current_user.id
    ).first()
    
    if not recipe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recipe not found"
        )
    
    folder = db.query(Folder).filter(
        Folder.id == folder_id,
        Folder.owner_id == current_user.id
    ).first()
    
    if not folder:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Folder not found"
        )
    
    if folder not in recipe.folders:
        recipe.folders.append(folder)
        db.commit()
        return MessageResponse(message=f"Recipe added to {folder.name}")
    
    return MessageResponse(message=f"Recipe already in {folder.name}")

@router.delete("/{recipe_id}/folders/{folder_id}", response_model=MessageResponse)
async def remove_recipe_from_folder(
    recipe_id: int,
    folder_id: int,
    current_user: User = Depends(get_default_user),
    db: Session = Depends(get_db)
):
    recipe = db.query(Recipe).filter(
        Recipe.id == recipe_id,
        Recipe.owner_id == current_user.id
    ).first()
    
    if not recipe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recipe not found"
        )
    
    folder = db.query(Folder).filter(
        Folder.id == folder_id,
        Folder.owner_id == current_user.id
    ).first()
    
    if not folder:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Folder not found"
        )
    
    if folder in recipe.folders:
        recipe.folders.remove(folder)
        db.commit()
        return MessageResponse(message=f"Recipe removed from {folder.name}")
    
    return MessageResponse(message=f"Recipe not in {folder.name}")

@router.get("/tags/all", response_model=List[str])
async def get_all_tags(
    current_user: User = Depends(get_default_user),
    db: Session = Depends(get_db)
):
    tags = db.query(Tag).join(Tag.recipes).filter(
        Recipe.owner_id == current_user.id
    ).distinct().all()
    
    return [tag.name for tag in tags]
