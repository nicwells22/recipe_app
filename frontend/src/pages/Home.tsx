import { Link } from 'react-router-dom';
import { ChefHat, ArrowRight, Folder, Heart, Search } from 'lucide-react';
import { useRecentRecipes } from '@/hooks/useRecipes';
import { useAuth } from '@/hooks/useAuth';
import RecipeCard from '@/components/recipes/RecipeCard';
import { Button, Spinner } from '@/components/ui';

export default function Home() {
  const { isAuthenticated } = useAuth();
  const { data: recentRecipes, isLoading } = useRecentRecipes(6);

  if (!isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col">
        <section className="flex-1 flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800 px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <ChefHat className="h-20 w-20 mx-auto text-primary-500 mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
              Your Personal Recipe Collection
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              Organize, discover, and cook your favorite recipes. Save family traditions, explore new cuisines, and never lose a recipe again.
            </p>
            <div className="flex justify-center">
              <Link to="/login">
                <Button size="lg">Get Started</Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 px-4 bg-white dark:bg-gray-800">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-12">Everything you need to manage your recipes</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="w-14 h-14 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Search className="h-7 w-7 text-primary-500" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Quick Search</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Find any recipe instantly by name, ingredient, or description.
                </p>
              </div>
              <div className="text-center p-6">
                <div className="w-14 h-14 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Folder className="h-7 w-7 text-primary-500" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Organize with Folders</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Create folders and subfolders to keep your recipes perfectly organized.
                </p>
              </div>
              <div className="text-center p-6">
                <div className="w-14 h-14 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-7 w-7 text-primary-500" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Save Favorites</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Mark your go-to recipes as favorites for quick access anytime.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Recent Recipes</h2>
          <Link to="/recipes" className="text-primary-500 hover:text-primary-600 flex items-center gap-1">
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : recentRecipes && recentRecipes.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 card">
            <ChefHat className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No recipes yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Start building your recipe collection!
            </p>
            <Link to="/recipes/new">
              <Button>Add Your First Recipe</Button>
            </Link>
          </div>
        )}
      </section>

      <section className="grid md:grid-cols-2 gap-6">
        <Link
          to="/recipes?favorites_only=true"
          className="card p-6 hover:shadow-md transition-shadow flex items-center gap-4"
        >
          <div className="w-12 h-12 bg-accent-100 dark:bg-accent-900/30 rounded-xl flex items-center justify-center">
            <Heart className="h-6 w-6 text-accent-400" />
          </div>
          <div>
            <h3 className="font-semibold">Favorites</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Quick access to your favorite recipes</p>
          </div>
        </Link>
        <Link
          to="/folders"
          className="card p-6 hover:shadow-md transition-shadow flex items-center gap-4"
        >
          <div className="w-12 h-12 bg-secondary-100 dark:bg-secondary-900/30 rounded-xl flex items-center justify-center">
            <Folder className="h-6 w-6 text-secondary-400" />
          </div>
          <div>
            <h3 className="font-semibold">Folders</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Browse recipes by category</p>
          </div>
        </Link>
      </section>
    </div>
  );
}
