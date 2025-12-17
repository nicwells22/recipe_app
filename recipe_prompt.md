Create a modern, responsive recipe web application using React with TypeScript, TailwindCSS for styling, and React Router for navigation. The app should have the following features:

1. **Responsive Design**
   - Mobile-first approach with breakpoints for tablets and desktops
   - Collapsible navigation menu for mobile
   - Responsive image loading
   - Touch-friendly UI elements

2. **Core Features**
   - Homepage with recent recipes and navigation to all recipes
   - Recipe search (name or contents or description)
   - Recipe detail view with:
     - High-quality food image
     - Prep/cook time
     - Ingredient list with quantities
     - Step-by-step instructions
   - Save favorite recipes
   - Organize recipes into groups/folders/subfolders
   - Add more recipes

3. **Frontend**
   - Use React functional components with hooks
   - Implement proper TypeScript interfaces/types
   - Use React Context or Redux for state management
   - Implement responsive image loading with lazy loading
   - Include proper accessibility features (ARIA labels, keyboard navigation)
   - Add loading states and error boundaries

4. **Backend (FastAPI)**
- RESTful API using FastAPI with Python 3.9+
- SQLite for the database
- JWT-based authentication
- Image upload and storage (local)
- Input validation using Pydantic models
- Rate limiting and security headers
- CORS configuration
- Unit tests with pytest

5. **Additional Full-Stack Features**
  1. **User Authentication**
     - Email/password login and registration
     - Password reset functionality
     - Protected routes
     - User profile management
  2. **Data Management**
     - CRUD operations for recipes
     - Image upload and management
     - Data validation on both client and server
     - Efficient data fetching with React Query
  3. **API Integration**
     - Axios for API calls
     - Request/response interceptors
     - Error handling and logging
     - Loading states and optimistic updates

4. **UI/UX Considerations**
   - Clean, minimalist design with good typography
   - Visual recipe cards with images
   - Step-by-step cooking mode with timers
   - Dark/light mode toggle
   - Print-friendly recipe view

Please provide the complete source code structure, including all necessary components, styles, and configuration files. Include detailed comments explaining the code structure and any important implementation details. The code should follow best practices for performance, security, and maintainability.