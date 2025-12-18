from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=100)

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = Field(None, min_length=3, max_length=100)

class UserResponse(UserBase):
    id: int
    role: str
    is_active: bool
    is_verified: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class AdminUserCreate(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=100)
    password: str = Field(..., min_length=8)
    role: str = Field(default="user", pattern="^(admin|user)$")

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class PasswordReset(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8)

class PasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8)

# Token schemas
class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class TokenRefresh(BaseModel):
    refresh_token: str

# Ingredient schemas
class IngredientBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    quantity: Optional[float] = None
    unit: Optional[str] = Field(None, max_length=50)
    notes: Optional[str] = Field(None, max_length=255)

class IngredientCreate(IngredientBase):
    pass

class IngredientResponse(IngredientBase):
    id: int
    
    class Config:
        from_attributes = True

# Instruction schemas
class InstructionBase(BaseModel):
    step_number: int = Field(..., ge=1)
    content: str = Field(..., min_length=1)
    timer_minutes: Optional[int] = Field(None, ge=0)

class InstructionCreate(InstructionBase):
    pass

class InstructionResponse(InstructionBase):
    id: int
    
    class Config:
        from_attributes = True

# Tag schemas
class TagBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)

class TagCreate(TagBase):
    pass

class TagResponse(TagBase):
    id: int
    
    class Config:
        from_attributes = True

# Recipe schemas
class RecipeBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    prep_time: Optional[int] = Field(None, ge=0)
    cook_time: Optional[int] = Field(None, ge=0)
    servings: Optional[int] = Field(None, ge=1)
    difficulty: Optional[str] = Field(None, pattern="^(easy|medium|hard)$")

class RecipeCreate(RecipeBase):
    ingredients: List[IngredientCreate] = []
    instructions: List[InstructionCreate] = []
    tags: List[str] = []
    folder_ids: List[int] = []

class RecipeUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    prep_time: Optional[int] = Field(None, ge=0)
    cook_time: Optional[int] = Field(None, ge=0)
    servings: Optional[int] = Field(None, ge=1)
    difficulty: Optional[str] = Field(None, pattern="^(easy|medium|hard)$")
    ingredients: Optional[List[IngredientCreate]] = None
    instructions: Optional[List[InstructionCreate]] = None
    tags: Optional[List[str]] = None
    folder_ids: Optional[List[int]] = None

class FolderBasicResponse(BaseModel):
    id: int
    name: str
    
    class Config:
        from_attributes = True

class RecipeResponse(RecipeBase):
    id: int
    image_url: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]
    ingredients: List[IngredientResponse]
    instructions: List[InstructionResponse]
    tags: List[TagResponse]
    folders: List[FolderBasicResponse] = []
    is_favorite: bool = False
    
    class Config:
        from_attributes = True

class RecipeListResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    image_url: Optional[str]
    prep_time: Optional[int]
    cook_time: Optional[int]
    difficulty: Optional[str]
    created_at: datetime
    is_favorite: bool = False
    
    class Config:
        from_attributes = True

# Folder schemas
class FolderBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None

class FolderCreate(FolderBase):
    parent_id: Optional[int] = None

class FolderUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    parent_id: Optional[int] = None

class FolderResponse(FolderBase):
    id: int
    parent_id: Optional[int]
    created_at: datetime
    recipe_count: int = 0
    
    class Config:
        from_attributes = True

class FolderTreeResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    parent_id: Optional[int]
    created_at: datetime
    recipe_count: int = 0
    children: List["FolderTreeResponse"] = []
    
    class Config:
        from_attributes = True

# Pagination
class PaginatedResponse(BaseModel):
    items: List
    total: int
    page: int
    per_page: int
    pages: int

# Message response
class MessageResponse(BaseModel):
    message: str
