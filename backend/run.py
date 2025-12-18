"""
Run the Recipe App backend server.

Environment Variables for Production:
- DEBUG: Set to "false" for production
- ADMIN_EMAIL: Initial admin email (default: admin@recipe.app)
- ADMIN_USERNAME: Initial admin username (default: admin)
- ADMIN_PASSWORD: Initial admin password (REQUIRED in production)
- SECRET_KEY: JWT secret key (REQUIRED - change from default)
"""
import os
import uvicorn

if __name__ == "__main__":
    # Check if running in production mode
    debug = os.getenv("DEBUG", "true").lower() in ("true", "1", "yes")
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=debug,  # Only enable reload in development
        workers=1 if debug else int(os.getenv("WORKERS", 1))
    )
