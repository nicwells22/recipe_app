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

# Create initial admin user if no users exist (uses environment variables in production)
def create_initial_admin():
    """
    Creates an initial admin user on first startup.
    
    In production, set these environment variables:
    - ADMIN_EMAIL: Admin email address
    - ADMIN_USERNAME: Admin username  
    - ADMIN_PASSWORD: Admin password (REQUIRED - app won't create admin without it)
    
    In development, falls back to defaults if ADMIN_PASSWORD is not set.
    """
    db = SessionLocal()
    try:
        if db.query(User).count() == 0:
            # Get credentials from environment/settings
            admin_email = settings.ADMIN_EMAIL
            admin_username = settings.ADMIN_USERNAME
            admin_password = settings.ADMIN_PASSWORD
            
            # In production, require password to be set via environment
            if not admin_password:
                if settings.DEBUG:
                    # Development fallback
                    admin_password = "admin123"
                    print("=" * 60)
                    print("⚠️  WARNING: Using default admin password (DEBUG mode only)")
                    print("=" * 60)
                else:
                    print("=" * 60)
                    print("❌ ERROR: ADMIN_PASSWORD environment variable not set!")
                    print("   Set ADMIN_PASSWORD to create the initial admin user.")
                    print("=" * 60)
                    return
            
            admin = User(
                email=admin_email,
                username=admin_username,
                hashed_password=get_password_hash(admin_password),
                role="admin",
                is_active=True,
                is_verified=True
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)
            
            # Create admin's personal database and upload directory
            create_user_database(admin.username)
            
            print("=" * 60)
            print("✅ Initial admin user created successfully!")
            print(f"   Email: {admin_email}")
            print(f"   Username: {admin_username}")
            print("   ⚠️  Please change the password after first login!")
            print("=" * 60)
    except Exception as e:
        print(f"Error creating initial admin: {e}")
        db.rollback()
    finally:
        db.close()

create_initial_admin()

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

# CORS - parse comma-separated origins from environment variable
cors_origins = [origin.strip() for origin in settings.CORS_ORIGINS.split(",") if origin.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
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
