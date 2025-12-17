import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, Plus, ChefHat, X } from 'lucide-react';
import { useRecipes, useTags } from '@/hooks/useRecipes';
import { useFolders } from '@/hooks/useFolders';
import RecipeCard from '@/components/recipes/RecipeCard';
import { Button, Input, Select, Spinner } from '@/components/ui';
import type { RecipeFilters } from '@/types';

export default function Recipes() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState<RecipeFilters>({
    search: searchParams.get('search') || '',
    folder_id: searchParams.get('folder_id') ? Number(searchParams.get('folder_id')) : undefined,
    tag: searchParams.get('tag') || undefined,
    difficulty: searchParams.get('difficulty') || undefined,
    favorites_only: searchParams.get('favorites_only') === 'true',
    page: 1,
    per_page: 12,
  });

  const { data, isLoading } = useRecipes(filters);
  const { data: tags } = useTags();
  const { data: folders } = useFolders();

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.folder_id) params.set('folder_id', String(filters.folder_id));
    if (filters.tag) params.set('tag', filters.tag);
    if (filters.difficulty) params.set('difficulty', filters.difficulty);
    if (filters.favorites_only) params.set('favorites_only', 'true');
    setSearchParams(params);
  }, [filters, setSearchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ ...filters, page: 1 });
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      folder_id: undefined,
      tag: undefined,
      difficulty: undefined,
      favorites_only: false,
      page: 1,
      per_page: 12,
    });
  };

  const hasActiveFilters = filters.folder_id || filters.tag || filters.difficulty || filters.favorites_only;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">
          {filters.favorites_only ? 'Favorite Recipes' : 'All Recipes'}
        </h1>
        <Link to="/recipes/new">
          <Button>
            <Plus className="h-4 w-4 mr-1" />
            New Recipe
          </Button>
        </Link>
      </div>

      <div className="card p-4 mb-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="search"
              placeholder="Search recipes by name, ingredient, or description..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="input pl-10"
            />
          </div>
          <Button type="submit">Search</Button>
          <Button
            type="button"
            variant={showFilters ? 'primary' : 'secondary'}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
          </Button>
        </form>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Select
                label="Folder"
                value={filters.folder_id?.toString() || ''}
                onChange={(e) => setFilters({ ...filters, folder_id: e.target.value ? Number(e.target.value) : undefined, page: 1 })}
                options={[
                  { value: '', label: 'All folders' },
                  ...(folders?.map((f) => ({ value: f.id.toString(), label: f.name })) || []),
                ]}
              />
              <Select
                label="Tag"
                value={filters.tag || ''}
                onChange={(e) => setFilters({ ...filters, tag: e.target.value || undefined, page: 1 })}
                options={[
                  { value: '', label: 'All tags' },
                  ...(tags?.map((t) => ({ value: t, label: t })) || []),
                ]}
              />
              <Select
                label="Difficulty"
                value={filters.difficulty || ''}
                onChange={(e) => setFilters({ ...filters, difficulty: e.target.value || undefined, page: 1 })}
                options={[
                  { value: '', label: 'Any difficulty' },
                  { value: 'easy', label: 'Easy' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'hard', label: 'Hard' },
                ]}
              />
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.favorites_only}
                    onChange={(e) => setFilters({ ...filters, favorites_only: e.target.checked, page: 1 })}
                    className="rounded border-gray-300"
                  />
                  <span>Favorites only</span>
                </label>
              </div>
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 text-sm text-primary-500 hover:text-primary-600 flex items-center gap-1"
              >
                <X className="h-4 w-4" />
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : data && data.items.length > 0 ? (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data.items.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>

          {data.pages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <Button
                variant="secondary"
                disabled={filters.page === 1}
                onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
              >
                Previous
              </Button>
              <span className="flex items-center px-4 text-sm text-gray-600 dark:text-gray-400">
                Page {filters.page} of {data.pages}
              </span>
              <Button
                variant="secondary"
                disabled={filters.page === data.pages}
                onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
              >
                Next
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 card">
          <ChefHat className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">No recipes found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {filters.search || hasActiveFilters
              ? 'Try adjusting your search or filters'
              : 'Start by adding your first recipe!'}
          </p>
          {!filters.search && !hasActiveFilters && (
            <Link to="/recipes/new">
              <Button>Add Recipe</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
