"""
Per-user database management.
Each user gets their own SQLite database for storing recipes, folders, etc.
"""
import os
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Table, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.sql import func
from .config import settings

# Base for per-user databases (recipes, folders, etc.)
UserDataBase = declarative_base()

# Directory for user databases
USER_DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "user_data")
os.makedirs(USER_DATA_DIR, exist_ok=True)

# Association tables for per-user database
recipe_folder_association = Table(
    'recipe_folder_association',
    UserDataBase.metadata,
    Column('recipe_id', Integer, ForeignKey('recipes.id', ondelete='CASCADE')),
    Column('folder_id', Integer, ForeignKey('folders.id', ondelete='CASCADE'))
)

recipe_tag_association = Table(
    'recipe_tag_association',
    UserDataBase.metadata,
    Column('recipe_id', Integer, ForeignKey('recipes.id', ondelete='CASCADE')),
    Column('tag_id', Integer, ForeignKey('tags.id', ondelete='CASCADE'))
)


class Recipe(UserDataBase):
    __tablename__ = "recipes"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text)
    image_url = Column(String(500))
    prep_time = Column(Integer)
    cook_time = Column(Integer)
    servings = Column(Integer)
    difficulty = Column(String(50))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    ingredients = relationship("Ingredient", back_populates="recipe", cascade="all, delete-orphan")
    instructions = relationship("Instruction", back_populates="recipe", cascade="all, delete-orphan", order_by="Instruction.step_number")
    folders = relationship("Folder", secondary=recipe_folder_association, back_populates="recipes")
    tags = relationship("Tag", secondary=recipe_tag_association, back_populates="recipes")
    favorites = relationship("Favorite", back_populates="recipe", cascade="all, delete-orphan")


class Ingredient(UserDataBase):
    __tablename__ = "ingredients"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    quantity = Column(Float)
    unit = Column(String(50))
    notes = Column(String(255))
    recipe_id = Column(Integer, ForeignKey("recipes.id", ondelete="CASCADE"))
    
    recipe = relationship("Recipe", back_populates="ingredients")


class Instruction(UserDataBase):
    __tablename__ = "instructions"
    
    id = Column(Integer, primary_key=True, index=True)
    step_number = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    timer_minutes = Column(Integer)
    recipe_id = Column(Integer, ForeignKey("recipes.id", ondelete="CASCADE"))
    
    recipe = relationship("Recipe", back_populates="instructions")


class Folder(UserDataBase):
    __tablename__ = "folders"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    parent_id = Column(Integer, ForeignKey("folders.id", ondelete="CASCADE"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    parent = relationship("Folder", remote_side=[id], backref="children")
    recipes = relationship("Recipe", secondary=recipe_folder_association, back_populates="folders")


class Tag(UserDataBase):
    __tablename__ = "tags"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    
    recipes = relationship("Recipe", secondary=recipe_tag_association, back_populates="tags")


class Favorite(UserDataBase):
    __tablename__ = "favorites"
    
    id = Column(Integer, primary_key=True, index=True)
    recipe_id = Column(Integer, ForeignKey("recipes.id", ondelete="CASCADE"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    recipe = relationship("Recipe", back_populates="favorites")


# Cache for user database sessions
_user_engines = {}
_user_sessions = {}


def get_user_db_path(username: str) -> str:
    """Get the path to a user's database file."""
    return os.path.join(USER_DATA_DIR, f"{username}.db")


def get_user_upload_dir(username: str) -> str:
    """Get the path to a user's upload directory."""
    user_upload_dir = os.path.join(settings.UPLOAD_DIR, username)
    os.makedirs(user_upload_dir, exist_ok=True)
    return user_upload_dir


def get_user_engine(username: str):
    """Get or create a database engine for a user."""
    if username not in _user_engines:
        db_path = get_user_db_path(username)
        engine = create_engine(
            f"sqlite:///{db_path}",
            connect_args={"check_same_thread": False}
        )
        UserDataBase.metadata.create_all(bind=engine)
        _user_engines[username] = engine
    return _user_engines[username]


def get_user_session_factory(username: str):
    """Get or create a session factory for a user."""
    if username not in _user_sessions:
        engine = get_user_engine(username)
        _user_sessions[username] = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    return _user_sessions[username]


def get_user_db(username: str):
    """Get a database session for a specific user."""
    SessionLocal = get_user_session_factory(username)
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_user_database(username: str):
    """Create a new database for a user."""
    engine = get_user_engine(username)
    UserDataBase.metadata.create_all(bind=engine)
    # Also create their upload directory
    get_user_upload_dir(username)
    return True


def delete_user_database(username: str):
    """Delete a user's database and uploads."""
    import shutil
    
    # Close any open connections
    if username in _user_engines:
        _user_engines[username].dispose()
        del _user_engines[username]
    if username in _user_sessions:
        del _user_sessions[username]
    
    # Delete database file
    db_path = get_user_db_path(username)
    if os.path.exists(db_path):
        os.remove(db_path)
    
    # Delete upload directory
    upload_dir = os.path.join(settings.UPLOAD_DIR, username)
    if os.path.exists(upload_dir):
        shutil.rmtree(upload_dir)
    
    return True
