import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ChefHat } from 'lucide-react';
import { useRecipe, useUpdateRecipe } from '@/hooks/useRecipes';
import RecipeForm from '@/components/recipes/RecipeForm';
import { Button, Spinner } from '@/components/ui';
import type { RecipeCreateInput } from '@/types';

export default function RecipeEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: recipe, isLoading, error } = useRecipe(id ? Number(id) : undefined);
  const updateRecipe = useUpdateRecipe();

  const handleSubmit = (data: RecipeCreateInput) => {
    if (recipe) {
      updateRecipe.mutate(
        { id: recipe.id, data },
        { onSuccess: () => navigate(`/recipes/${recipe.id}`) }
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <ChefHat className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Recipe not found</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          The recipe you're trying to edit doesn't exist.
        </p>
        <Link to="/recipes">
          <Button>Back to Recipes</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-primary-500 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back
      </button>

      <h1 className="text-2xl font-bold mb-6">Edit Recipe</h1>

      <RecipeForm
        defaultValues={{
          title: recipe.title,
          description: recipe.description || '',
          prep_time: recipe.prep_time || undefined,
          cook_time: recipe.cook_time || undefined,
          servings: recipe.servings || undefined,
          difficulty: recipe.difficulty || undefined,
          ingredients: recipe.ingredients.map((i) => ({
            name: i.name,
            quantity: i.quantity || undefined,
            unit: i.unit || '',
            notes: i.notes || '',
          })),
          instructions: recipe.instructions.map((i) => ({
            step_number: i.step_number,
            content: i.content,
            timer_minutes: i.timer_minutes || undefined,
          })),
          tags: recipe.tags.map((t) => t.name),
          folder_ids: [],
        }}
        onSubmit={handleSubmit}
        isLoading={updateRecipe.isPending}
        submitLabel="Save Changes"
      />
    </div>
  );
}
