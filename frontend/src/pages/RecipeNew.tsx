import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useCreateRecipe } from '@/hooks/useRecipes';
import RecipeForm from '@/components/recipes/RecipeForm';
import type { RecipeCreateInput } from '@/types';

export default function RecipeNew() {
  const navigate = useNavigate();
  const createRecipe = useCreateRecipe();

  const handleSubmit = (data: RecipeCreateInput) => {
    createRecipe.mutate(data, {
      onSuccess: (recipe) => navigate(`/recipes/${recipe.id}`),
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-primary-500 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back
      </button>

      <h1 className="text-2xl font-bold mb-6">Create New Recipe</h1>

      <RecipeForm
        onSubmit={handleSubmit}
        isLoading={createRecipe.isPending}
        submitLabel="Create Recipe"
      />
    </div>
  );
}
