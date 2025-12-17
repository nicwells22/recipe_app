# Recipe App

A modern, full-stack recipe management application built with React, TypeScript, TailwindCSS, and FastAPI. Features a calming "Fresh & Natural" theme with sage green, olive, and terracotta colors.

## Features

- **Recipe Management**: Create, read, update, delete recipes with images
- **Search & Filter**: Search by name, ingredients, or description; filter by folder, tag, difficulty
- **Favorites**: Mark recipes as favorites for quick access
- **Folders**: Organize recipes into hierarchical folders and subfolders with expandable tree view
- **Assign to Folders**: Add recipes to folders directly from the recipe detail page
- **Cooking Mode**: Step-by-step cooking view with built-in timers
- **Dark/Light Mode**: Toggle between themes (light, dark, or system)
- **Print-Friendly**: Print recipes with clean formatting
- **Responsive Design**: Mobile-first approach, works on all devices

## Theme

The app uses a **Fresh & Natural** color palette:
- **Primary (Sage Green)**: `#6B8E7F` - Buttons, links, highlights
- **Secondary (Olive)**: `#8FAF8B` - Folders, medium difficulty
- **Accent (Terracotta)**: `#C97A5A` - Favorites, ratings, hard difficulty
- **Background (Off-White)**: `#F7F6F3` - Page background
- **Text (Charcoal)**: `#2E2E2E` - Body text

## Tech Stack

### Frontend
- React 18 with TypeScript
- TailwindCSS for styling
- React Router for navigation
- React Query for data fetching
- Zustand for state management
- React Hook Form for forms
- Lucide React for icons

### Backend
- FastAPI (Python 3.9+)
- SQLite database
- Pydantic for validation
- SQLAlchemy ORM

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.9+
- pip

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the server
python run.py
```

The API will be available at `http://localhost:8000`. API docs at `http://localhost:8000/docs`.

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

The app will be available at `http://localhost:5173`.

## Project Structure

```
recipe_app/
├── backend/
│   ├── app/
│   │   ├── routers/         # API endpoints (recipes, folders)
│   │   ├── models.py        # SQLAlchemy models
│   │   ├── schemas.py       # Pydantic schemas
│   │   ├── config.py        # Configuration
│   │   ├── database.py      # Database setup
│   │   └── main.py          # FastAPI app
│   ├── uploads/             # Recipe images
│   ├── seed.py              # Database seeder with sample recipes
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/      # React components (ui, layout, recipes, folders)
│   │   ├── hooks/           # Custom hooks (useRecipes, useFolders)
│   │   ├── lib/             # Utilities and API client
│   │   ├── pages/           # Page components
│   │   ├── stores/          # Zustand stores (theme)
│   │   └── types/           # TypeScript types
│   ├── public/
│   └── package.json
└── README.md
```

## API Endpoints

### Recipes
- `GET /api/recipes` - List recipes (with pagination, search, filters)
- `GET /api/recipes/recent` - Get recent recipes
- `GET /api/recipes/{id}` - Get recipe details
- `POST /api/recipes` - Create recipe
- `PUT /api/recipes/{id}` - Update recipe
- `DELETE /api/recipes/{id}` - Delete recipe
- `POST /api/recipes/{id}/image` - Upload recipe image
- `POST /api/recipes/{id}/favorite` - Toggle favorite
- `POST /api/recipes/{id}/folders/{folder_id}` - Add recipe to folder
- `DELETE /api/recipes/{id}/folders/{folder_id}` - Remove recipe from folder
- `GET /api/recipes/tags/all` - Get all tags

### Folders
- `GET /api/folders` - List folders
- `GET /api/folders/tree` - Get folder tree
- `POST /api/folders` - Create folder
- `PUT /api/folders/{id}` - Update folder
- `DELETE /api/folders/{id}` - Delete folder

## Seeding the Database

To populate the database with sample recipes:

```bash
cd backend
python seed.py
```

This creates a default user and adds sample recipes across various categories.

## License

MIT
