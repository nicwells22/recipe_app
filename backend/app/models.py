from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Table, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

# Association table for recipe-folder many-to-many relationship
recipe_folder_association = Table(
    'recipe_folder_association',
    Base.metadata,
    Column('recipe_id', Integer, ForeignKey('recipes.id', ondelete='CASCADE')),
    Column('folder_id', Integer, ForeignKey('folders.id', ondelete='CASCADE'))
)

# Association table for recipe tags
recipe_tag_association = Table(
    'recipe_tag_association',
    Base.metadata,
    Column('recipe_id', Integer, ForeignKey('recipes.id', ondelete='CASCADE')),
    Column('tag_id', Integer, ForeignKey('tags.id', ondelete='CASCADE'))
)

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    reset_token = Column(String(255), nullable=True)
    reset_token_expires = Column(DateTime(timezone=True), nullable=True)
    
    recipes = relationship("Recipe", back_populates="owner", cascade="all, delete-orphan")
    folders = relationship("Folder", back_populates="owner", cascade="all, delete-orphan")
    favorites = relationship("Favorite", back_populates="user", cascade="all, delete-orphan")

class Recipe(Base):
    __tablename__ = "recipes"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text)
    image_url = Column(String(500))
    prep_time = Column(Integer)  # in minutes
    cook_time = Column(Integer)  # in minutes
    servings = Column(Integer)
    difficulty = Column(String(50))  # easy, medium, hard
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    
    owner = relationship("User", back_populates="recipes")
    ingredients = relationship("Ingredient", back_populates="recipe", cascade="all, delete-orphan")
    instructions = relationship("Instruction", back_populates="recipe", cascade="all, delete-orphan", order_by="Instruction.step_number")
    folders = relationship("Folder", secondary=recipe_folder_association, back_populates="recipes")
    tags = relationship("Tag", secondary=recipe_tag_association, back_populates="recipes")
    favorites = relationship("Favorite", back_populates="recipe", cascade="all, delete-orphan")

class Ingredient(Base):
    __tablename__ = "ingredients"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    quantity = Column(Float)
    unit = Column(String(50))
    notes = Column(String(255))
    recipe_id = Column(Integer, ForeignKey("recipes.id", ondelete="CASCADE"))
    
    recipe = relationship("Recipe", back_populates="ingredients")

class Instruction(Base):
    __tablename__ = "instructions"
    
    id = Column(Integer, primary_key=True, index=True)
    step_number = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    timer_minutes = Column(Integer)  # Optional timer for this step
    recipe_id = Column(Integer, ForeignKey("recipes.id", ondelete="CASCADE"))
    
    recipe = relationship("Recipe", back_populates="instructions")

class Folder(Base):
    __tablename__ = "folders"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    parent_id = Column(Integer, ForeignKey("folders.id", ondelete="CASCADE"), nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    owner = relationship("User", back_populates="folders")
    parent = relationship("Folder", remote_side=[id], backref="children")
    recipes = relationship("Recipe", secondary=recipe_folder_association, back_populates="folders")

class Tag(Base):
    __tablename__ = "tags"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    
    recipes = relationship("Recipe", secondary=recipe_tag_association, back_populates="tags")

class Favorite(Base):
    __tablename__ = "favorites"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    recipe_id = Column(Integer, ForeignKey("recipes.id", ondelete="CASCADE"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="favorites")
    recipe = relationship("Recipe", back_populates="favorites")
