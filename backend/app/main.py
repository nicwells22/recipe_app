from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import os

from .config import settings
from .database import engine, Base, SessionLocal
from .models import User
from .auth import get_password_hash
from .user_database import create_user_database
from .routers import auth, users, recipes, folders

# Create database tables
Base.metadata.create_all(bind=engine)

# Create default admin user if no users exist
def create_default_admin():
    db = SessionLocal()
    try:
        if db.query(User).count() == 0:
            admin = User(
                email="admin@recipe.app",
                username="admin",
                hashed_password=get_password_hash("admin123"),
                role="admin",
                is_active=True,
                is_verified=True
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)
            # Create admin's personal database
            create_user_database(admin.username)
            print("Default admin user created: admin@recipe.app / admin123")
    finally:
        db.close()

create_default_admin()

# Rate limiter
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title=settings.APP_NAME,
    description="A modern recipe management API",
    version="1.0.0"
)

# Rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security headers middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response

# Mount static files for uploads
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(recipes.router)
app.include_router(folders.router)

@app.get("/")
async def root():
    return {"message": "Welcome to Recipe App API", "docs": "/docs"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
