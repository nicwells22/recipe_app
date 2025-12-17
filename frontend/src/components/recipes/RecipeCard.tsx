import { Link } from 'react-router-dom';
import { Clock, Heart, ChefHat } from 'lucide-react';
import { cn, formatTime, getDifficultyColor, getImageUrl } from '@/lib/utils';
import { useToggleFavorite } from '@/hooks/useRecipes';
import type { RecipeListItem } from '@/types';

interface RecipeCardProps {
  recipe: RecipeListItem;
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  const toggleFavorite = useToggleFavorite();
  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite.mutate(recipe.id);
  };

  return (
    <Link
      to={`/recipes/${recipe.id}`}
      className="card group overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="relative aspect-video bg-gray-100 dark:bg-gray-700 overflow-hidden">
        {recipe.image_url ? (
          <img
            src={getImageUrl(recipe.image_url)}
            alt={recipe.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ChefHat className="h-12 w-12 text-gray-300 dark:text-gray-600" />
          </div>
        )}
        <button
          onClick={handleFavoriteClick}
          className={cn(
            'absolute top-2 right-2 p-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm transition-colors',
            recipe.is_favorite ? 'text-accent-400' : 'text-gray-400 hover:text-accent-400'
          )}
          aria-label={recipe.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart className={cn('h-5 w-5', recipe.is_favorite && 'fill-current')} />
        </button>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1 line-clamp-1 group-hover:text-primary-500 transition-colors">
          {recipe.title}
        </h3>
        {recipe.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
            {recipe.description}
          </p>
        )}
        <div className="flex items-center gap-3 text-sm">
          {totalTime > 0 && (
            <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
              <Clock className="h-4 w-4" />
              {formatTime(totalTime)}
            </span>
          )}
          {recipe.difficulty && (
            <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium capitalize', getDifficultyColor(recipe.difficulty))}>
              {recipe.difficulty}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
