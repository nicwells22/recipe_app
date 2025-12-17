from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models import Folder, User
from ..schemas import FolderCreate, FolderUpdate, FolderResponse, FolderTreeResponse, MessageResponse
# No auth needed - use default user
def get_default_user(db: Session) -> User:
    user = db.query(User).first()
    if not user:
        user = User(email="user@app.local", username="user", hashed_password="")
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

router = APIRouter(prefix="/api/folders", tags=["Folders"])

def build_folder_tree(folders: List[Folder], parent_id=None) -> List[FolderTreeResponse]:
    tree = []
    for folder in folders:
        if folder.parent_id == parent_id:
            children = build_folder_tree(folders, folder.id)
            tree.append(FolderTreeResponse(
                id=folder.id,
                name=folder.name,
                description=folder.description,
                parent_id=folder.parent_id,
                owner_id=folder.owner_id,
                created_at=folder.created_at,
                recipe_count=len(folder.recipes),
                children=children
            ))
    return tree

@router.get("", response_model=List[FolderResponse])
async def get_folders(
    db: Session = Depends(get_db)
):
    current_user = get_default_user(db)
    folders = db.query(Folder).filter(Folder.owner_id == current_user.id).all()
    
    return [FolderResponse(
        id=f.id,
        name=f.name,
        description=f.description,
        parent_id=f.parent_id,
        owner_id=f.owner_id,
        created_at=f.created_at,
        recipe_count=len(f.recipes)
    ) for f in folders]

@router.get("/tree", response_model=List[FolderTreeResponse])
async def get_folder_tree(
    db: Session = Depends(get_db)
):
    current_user = get_default_user(db)
    folders = db.query(Folder).filter(Folder.owner_id == current_user.id).all()
    return build_folder_tree(folders)

@router.get("/{folder_id}", response_model=FolderResponse)
async def get_folder(
    folder_id: int,
    db: Session = Depends(get_db)
):
    current_user = get_default_user(db)
    folder = db.query(Folder).filter(
        Folder.id == folder_id,
        Folder.owner_id == current_user.id
    ).first()
    
    if not folder:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Folder not found"
        )
    
    return FolderResponse(
        id=folder.id,
        name=folder.name,
        description=folder.description,
        parent_id=folder.parent_id,
        owner_id=folder.owner_id,
        created_at=folder.created_at,
        recipe_count=len(folder.recipes)
    )

@router.post("", response_model=FolderResponse, status_code=status.HTTP_201_CREATED)
async def create_folder(
    folder_data: FolderCreate,
    db: Session = Depends(get_db)
):
    current_user = get_default_user(db)
    # Validate parent folder if provided
    if folder_data.parent_id:
        parent = db.query(Folder).filter(
            Folder.id == folder_data.parent_id,
            Folder.owner_id == current_user.id
        ).first()
        if not parent:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Parent folder not found"
            )
    
    folder = Folder(
        name=folder_data.name,
        description=folder_data.description,
        parent_id=folder_data.parent_id,
        owner_id=current_user.id
    )
    db.add(folder)
    db.commit()
    db.refresh(folder)
    
    return FolderResponse(
        id=folder.id,
        name=folder.name,
        description=folder.description,
        parent_id=folder.parent_id,
        owner_id=folder.owner_id,
        created_at=folder.created_at,
        recipe_count=0
    )

@router.put("/{folder_id}", response_model=FolderResponse)
async def update_folder(
    folder_id: int,
    folder_data: FolderUpdate,
    db: Session = Depends(get_db)
):
    current_user = get_default_user(db)
    folder = db.query(Folder).filter(
        Folder.id == folder_id,
        Folder.owner_id == current_user.id
    ).first()
    
    if not folder:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Folder not found"
        )
    
    if folder_data.name is not None:
        folder.name = folder_data.name
    if folder_data.description is not None:
        folder.description = folder_data.description
    if folder_data.parent_id is not None:
        # Prevent circular reference
        if folder_data.parent_id == folder_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Folder cannot be its own parent"
            )
        if folder_data.parent_id != 0:
            parent = db.query(Folder).filter(
                Folder.id == folder_data.parent_id,
                Folder.owner_id == current_user.id
            ).first()
            if not parent:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Parent folder not found"
                )
        folder.parent_id = folder_data.parent_id if folder_data.parent_id != 0 else None
    
    db.commit()
    db.refresh(folder)
    
    return FolderResponse(
        id=folder.id,
        name=folder.name,
        description=folder.description,
        parent_id=folder.parent_id,
        owner_id=folder.owner_id,
        created_at=folder.created_at,
        recipe_count=len(folder.recipes)
    )

@router.delete("/{folder_id}", response_model=MessageResponse)
async def delete_folder(
    folder_id: int,
    db: Session = Depends(get_db)
):
    current_user = get_default_user(db)
    folder = db.query(Folder).filter(
        Folder.id == folder_id,
        Folder.owner_id == current_user.id
    ).first()
    
    if not folder:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Folder not found"
        )
    
    # Move child folders to parent
    for child in folder.children:
        child.parent_id = folder.parent_id
    
    db.delete(folder)
    db.commit()
    
    return MessageResponse(message="Folder deleted successfully")
