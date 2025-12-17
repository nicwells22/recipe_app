import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Clock, Users, ChefHat, Heart, Edit, Trash2, Printer, Play,
  ArrowLeft, Timer, Upload, FolderPlus, Folder, X
} from 'lucide-react';
import { useRecipe, useDeleteRecipe, useToggleFavorite, useUploadRecipeImage, useAddToFolder, useRemoveFromFolder } from '@/hooks/useRecipes';
import { useFolderTree } from '@/hooks/useFolders';
import FolderTree from '@/components/folders/FolderTree';
import CookingMode from '@/components/recipes/CookingMode';
import { Button, Spinner, Modal } from '@/components/ui';
import { cn, formatTime, getDifficultyColor, getImageUrl } from '@/lib/utils';

export default function RecipeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showCookingMode, setShowCookingMode] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);

  const { data: recipe, isLoading, error } = useRecipe(id ? Number(id) : undefined);
  const { data: folderTree } = useFolderTree();
  const deleteRecipe = useDeleteRecipe();
  const toggleFavorite = useToggleFavorite();
  const uploadImage = useUploadRecipeImage();
  const addToFolder = useAddToFolder();
  const removeFromFolder = useRemoveFromFolder();

  const handleDelete = () => {
    if (recipe) {
      deleteRecipe.mutate(recipe.id, {
        onSuccess: () => navigate('/recipes'),
      });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && recipe) {
      uploadImage.mutate({ id: recipe.id, file });
    }
  };

  const handlePrint = () => {
    window.print();
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
          The recipe you're looking for doesn't exist or has been deleted.
        </p>
        <Link to="/recipes">
          <Button>Back to Recipes</Button>
        </Link>
      </div>
    );
  }

  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 no-print">
          <Link
            to="/recipes"
            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-primary-500"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to recipes
          </Link>
        </div>

        <article className="card overflow-hidden">
          <div className="relative aspect-video bg-gray-100 dark:bg-gray-700">
            {recipe.image_url ? (
              <img
                src={getImageUrl(recipe.image_url)}
                alt={recipe.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ChefHat className="h-16 w-16 text-gray-300 dark:text-gray-600" />
              </div>
            )}
            <div className="absolute top-4 right-4 flex gap-2 no-print">
              <label className="p-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm cursor-pointer hover:bg-white dark:hover:bg-gray-800 transition-colors">
                <Upload className="h-5 w-5" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
              <button
                onClick={() => toggleFavorite.mutate(recipe.id)}
                className={cn(
                  'p-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm transition-colors',
                  recipe.is_favorite ? 'text-accent-400' : 'text-gray-400 hover:text-accent-400'
                )}
              >
                <Heart className={cn('h-5 w-5', recipe.is_favorite && 'fill-current')} />
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{recipe.title}</h1>
                {recipe.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {recipe.tags.map((tag) => (
                      <Link
                        key={tag.id}
                        to={`/recipes?tag=${tag.name}`}
                        className="text-sm px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        #{tag.name}
                      </Link>
                    ))}
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-2">
                  {recipe.folders && recipe.folders.map((folder) => (
                    <span
                      key={folder.id}
                      className="inline-flex items-center gap-1 text-sm px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full"
                    >
                      <Folder className="h-3 w-3" />
                      {folder.name}
                      <button
                        onClick={() => removeFromFolder.mutate({ recipeId: recipe.id, folderId: folder.id })}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  <button
                    onClick={() => setShowFolderModal(true)}
                    className="inline-flex items-center gap-1 text-sm px-2 py-1 border border-dashed border-gray-300 dark:border-gray-600 rounded-full hover:border-primary-500 hover:text-primary-500"
                  >
                    <FolderPlus className="h-3 w-3" />
                    Add to folder
                  </button>
                </div>
              </div>
              <div className="flex gap-2 no-print">
                <Button variant="outline" size="sm" onClick={handlePrint}>
                  <Printer className="h-4 w-4 mr-1" />
                  Print
                </Button>
                <Link to={`/recipes/${recipe.id}/edit`}>
                  <Button variant="secondary" size="sm">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </Link>
                <Button variant="danger" size="sm" onClick={() => setShowDeleteModal(true)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {recipe.description && (
              <p className="text-gray-600 dark:text-gray-400 mb-6">{recipe.description}</p>
            )}

            <div className="flex flex-wrap gap-4 mb-6 text-sm">
              {recipe.prep_time && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span>Prep: {formatTime(recipe.prep_time)}</span>
                </div>
              )}
              {recipe.cook_time && (
                <div className="flex items-center gap-1">
                  <Timer className="h-4 w-4 text-gray-400" />
                  <span>Cook: {formatTime(recipe.cook_time)}</span>
                </div>
              )}
              {totalTime > 0 && (
                <div className="flex items-center gap-1 font-medium">
                  <Clock className="h-4 w-4 text-primary-500" />
                  <span>Total: {formatTime(totalTime)}</span>
                </div>
              )}
              {recipe.servings && (
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span>{recipe.servings} servings</span>
                </div>
              )}
              {recipe.difficulty && (
                <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium capitalize', getDifficultyColor(recipe.difficulty))}>
                  {recipe.difficulty}
                </span>
              )}
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-1">
                <h2 className="text-xl font-semibold mb-4">Ingredients</h2>
                <ul className="space-y-2">
                  {recipe.ingredients.map((ing) => (
                    <li key={ing.id} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2 shrink-0" />
                      <span>
                        {ing.quantity && <strong>{ing.quantity}</strong>}
                        {ing.unit && ` ${ing.unit}`}
                        {' '}{ing.name}
                        {ing.notes && <span className="text-gray-500 text-sm"> ({ing.notes})</span>}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Instructions</h2>
                  {recipe.instructions.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCookingMode(true)}
                      className="no-print"
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Cooking Mode
                    </Button>
                  )}
                </div>
                <ol className="space-y-4">
                  {recipe.instructions.map((inst, idx) => (
                    <li key={inst.id} className="flex gap-4">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-medium shrink-0">
                        {idx + 1}
                      </span>
                      <div className="flex-1 pt-1">
                        <p>{inst.content}</p>
                        {inst.timer_minutes && (
                          <span className="inline-flex items-center gap-1 mt-2 text-sm text-primary-500">
                            <Timer className="h-4 w-4" />
                            {inst.timer_minutes} min
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </article>
      </div>

      {showCookingMode && (
        <CookingMode
          instructions={recipe.instructions}
          recipeName={recipe.title}
          onClose={() => setShowCookingMode(false)}
        />
      )}

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Recipe"
      >
        <p className="mb-6">
          Are you sure you want to delete "{recipe.title}"? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            isLoading={deleteRecipe.isPending}
          >
            Delete
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={showFolderModal}
        onClose={() => setShowFolderModal(false)}
        title="Add to Folder"
      >
        <div className="max-h-80 overflow-y-auto">
          <FolderTree
            folders={folderTree || []}
            selectedFolderIds={recipe.folders?.map(f => f.id) || []}
            onSelect={(folder) => {
              if (!recipe.folders?.some(f => f.id === folder.id)) {
                addToFolder.mutate({ recipeId: recipe.id, folderId: folder.id });
                setShowFolderModal(false);
              }
            }}
            showRecipeCount
          />
        </div>
        <div className="flex justify-end mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="secondary" onClick={() => setShowFolderModal(false)}>
            Close
          </Button>
        </div>
      </Modal>
    </>
  );
}
