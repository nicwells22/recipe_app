from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..models import User
from ..user_database import Folder
from ..schemas import FolderCreate, FolderUpdate, FolderResponse, FolderTreeResponse, MessageResponse
from ..auth import get_current_user, get_current_user_db

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
                created_at=folder.created_at,
                recipe_count=len(folder.recipes),
                children=children
            ))
    return tree

@router.get("", response_model=List[FolderResponse])
async def get_folders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_current_user_db)
):
    folders = db.query(Folder).all()
    
    return [FolderResponse(
        id=f.id,
        name=f.name,
        description=f.description,
        parent_id=f.parent_id,
        created_at=f.created_at,
        recipe_count=len(f.recipes)
    ) for f in folders]

@router.get("/tree", response_model=List[FolderTreeResponse])
async def get_folder_tree(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_current_user_db)
):
    folders = db.query(Folder).all()
    return build_folder_tree(folders)

@router.get("/{folder_id}", response_model=FolderResponse)
async def get_folder(
    folder_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_current_user_db)
):
    folder = db.query(Folder).filter(Folder.id == folder_id).first()
    
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
        created_at=folder.created_at,
        recipe_count=len(folder.recipes)
    )

@router.post("", response_model=FolderResponse, status_code=status.HTTP_201_CREATED)
async def create_folder(
    folder_data: FolderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_current_user_db)
):
    # Validate parent folder if provided
    if folder_data.parent_id:
        parent = db.query(Folder).filter(Folder.id == folder_data.parent_id).first()
        if not parent:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Parent folder not found"
            )
    
    folder = Folder(
        name=folder_data.name,
        description=folder_data.description,
        parent_id=folder_data.parent_id
    )
    db.add(folder)
    db.commit()
    db.refresh(folder)
    
    return FolderResponse(
        id=folder.id,
        name=folder.name,
        description=folder.description,
        parent_id=folder.parent_id,
        created_at=folder.created_at,
        recipe_count=0
    )

@router.put("/{folder_id}", response_model=FolderResponse)
async def update_folder(
    folder_id: int,
    folder_data: FolderUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_current_user_db)
):
    folder = db.query(Folder).filter(Folder.id == folder_id).first()
    
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
            parent = db.query(Folder).filter(Folder.id == folder_data.parent_id).first()
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
        created_at=folder.created_at,
        recipe_count=len(folder.recipes)
    )

@router.delete("/{folder_id}", response_model=MessageResponse)
async def delete_folder(
    folder_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_current_user_db)
):
    folder = db.query(Folder).filter(Folder.id == folder_id).first()
    
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
