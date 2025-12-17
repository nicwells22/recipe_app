import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Sun, Moon, ChefHat, Search, Plus } from 'lucide-react';
import { useThemeStore } from '@/stores/themeStore';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { theme, setTheme } = useThemeStore();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/recipes?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsMenuOpen(false);
    }
  };

  const toggleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  const getThemeIcon = () => {
    if (theme === 'dark') return <Moon className="h-5 w-5" />;
    if (theme === 'light') return <Sun className="h-5 w-5" />;
    return <Sun className="h-5 w-5 opacity-50" />;
  };

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 text-primary-500 hover:text-primary-600">
            <ChefHat className="h-8 w-8" />
            <span className="text-xl font-bold hidden sm:block">Recipe App</span>
          </Link>

          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="search"
                placeholder="Search recipes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-10"
                aria-label="Search recipes"
              />
            </div>
          </form>

          <nav className="hidden md:flex items-center gap-4">
            <Link to="/recipes" className="text-gray-600 dark:text-gray-300 hover:text-primary-500">
              Recipes
            </Link>
            <Link to="/folders" className="text-gray-600 dark:text-gray-300 hover:text-primary-500">
              Folders
            </Link>
            <Link to="/recipes/new">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                New Recipe
              </Button>
            </Link>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Toggle theme"
            >
              {getThemeIcon()}
            </button>
          </nav>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <div
        className={cn(
          'md:hidden border-t border-gray-200 dark:border-gray-700 transition-all overflow-hidden',
          isMenuOpen ? 'max-h-96' : 'max-h-0'
        )}
      >
        <div className="px-4 py-4 space-y-4">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="search"
                placeholder="Search recipes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-10"
              />
            </div>
          </form>

          <nav className="flex flex-col gap-2">
            <Link
              to="/recipes"
              className="px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setIsMenuOpen(false)}
            >
              Recipes
            </Link>
            <Link
              to="/folders"
              className="px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setIsMenuOpen(false)}
            >
              Folders
            </Link>
            <Link
              to="/recipes/new"
              className="px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setIsMenuOpen(false)}
            >
              New Recipe
            </Link>
            <div className="flex items-center justify-between px-4 py-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Theme</span>
              <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                {getThemeIcon()}
              </button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
