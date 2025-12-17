import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { Button, Input, Select } from '@/components/ui';
import type { RecipeCreateInput, IngredientInput, InstructionInput } from '@/types';

interface RecipeFormProps {
  defaultValues?: Partial<RecipeCreateInput>;
  onSubmit: (data: RecipeCreateInput) => void;
  isLoading?: boolean;
  submitLabel?: string;
}

export default function RecipeForm({
  defaultValues,
  onSubmit,
  isLoading,
  submitLabel = 'Save Recipe',
}: RecipeFormProps) {
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(defaultValues?.tags || []);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RecipeCreateInput>({
    defaultValues: {
      title: '',
      description: '',
      prep_time: undefined,
      cook_time: undefined,
      servings: undefined,
      difficulty: undefined,
      ingredients: [{ name: '', quantity: undefined, unit: '', notes: '' }],
      instructions: [{ step_number: 1, content: '', timer_minutes: undefined }],
      tags: [],
      folder_ids: [],
      ...defaultValues,
    },
  });

  const {
    fields: ingredientFields,
    append: appendIngredient,
    remove: removeIngredient,
  } = useFieldArray({ control, name: 'ingredients' });

  const {
    fields: instructionFields,
    append: appendInstruction,
    remove: removeInstruction,
  } = useFieldArray({ control, name: 'instructions' });

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = tagInput.trim().toLowerCase();
      if (tag && !tags.includes(tag)) {
        setTags([...tags, tag]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleFormSubmit = (data: RecipeCreateInput) => {
    onSubmit({
      ...data,
      tags,
      ingredients: data.ingredients.filter((i) => i.name.trim()),
      instructions: data.instructions
        .filter((i) => i.content.trim())
        .map((i, idx) => ({ ...i, step_number: idx + 1 })),
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      <section className="card p-6">
        <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Input
              id="title"
              label="Recipe Title *"
              placeholder="Enter recipe title"
              {...register('title', { required: 'Title is required' })}
              error={errors.title?.message}
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="description" className="label">Description</label>
            <textarea
              id="description"
              rows={3}
              className="input"
              placeholder="Describe your recipe..."
              {...register('description')}
            />
          </div>
          <Input
            id="prep_time"
            label="Prep Time (minutes)"
            type="number"
            min={0}
            {...register('prep_time', { valueAsNumber: true })}
          />
          <Input
            id="cook_time"
            label="Cook Time (minutes)"
            type="number"
            min={0}
            {...register('cook_time', { valueAsNumber: true })}
          />
          <Input
            id="servings"
            label="Servings"
            type="number"
            min={1}
            {...register('servings', { valueAsNumber: true })}
          />
          <Select
            id="difficulty"
            label="Difficulty"
            {...register('difficulty')}
            options={[
              { value: '', label: 'Select difficulty' },
              { value: 'easy', label: 'Easy' },
              { value: 'medium', label: 'Medium' },
              { value: 'hard', label: 'Hard' },
            ]}
          />
        </div>
      </section>

      <section className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Ingredients</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendIngredient({ name: '', quantity: undefined, unit: '', notes: '' })}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
        <div className="space-y-3">
          {ingredientFields.map((field, index) => (
            <div key={field.id} className="flex items-start gap-2">
              <GripVertical className="h-5 w-5 mt-2.5 text-gray-400 cursor-move" />
              <div className="flex-1 grid gap-2 sm:grid-cols-4">
                <Input
                  placeholder="Ingredient name"
                  {...register(`ingredients.${index}.name`)}
                />
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Qty"
                  {...register(`ingredients.${index}.quantity`, { valueAsNumber: true })}
                />
                <Input
                  placeholder="Unit (cups, tbsp...)"
                  {...register(`ingredients.${index}.unit`)}
                />
                <Input
                  placeholder="Notes (optional)"
                  {...register(`ingredients.${index}.notes`)}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeIngredient(index)}
                disabled={ingredientFields.length === 1}
                aria-label="Remove ingredient"
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ))}
        </div>
      </section>

      <section className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Instructions</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              appendInstruction({
                step_number: instructionFields.length + 1,
                content: '',
                timer_minutes: undefined,
              })
            }
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Step
          </Button>
        </div>
        <div className="space-y-4">
          {instructionFields.map((field, index) => (
            <div key={field.id} className="flex items-start gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-medium text-sm shrink-0 mt-1">
                {index + 1}
              </div>
              <div className="flex-1 space-y-2">
                <textarea
                  rows={2}
                  className="input"
                  placeholder={`Step ${index + 1} instructions...`}
                  {...register(`instructions.${index}.content`)}
                />
                <Input
                  type="number"
                  min={0}
                  placeholder="Timer (minutes, optional)"
                  className="max-w-xs"
                  {...register(`instructions.${index}.timer_minutes`, { valueAsNumber: true })}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeInstruction(index)}
                disabled={instructionFields.length === 1}
                aria-label="Remove step"
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ))}
        </div>
      </section>

      <section className="card p-6">
        <h2 className="text-lg font-semibold mb-4">Tags</h2>
        <div className="space-y-3">
          <Input
            placeholder="Type a tag and press Enter"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
          />
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-primary-900 dark:hover:text-primary-100"
                    aria-label={`Remove ${tag} tag`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="flex justify-end gap-4">
        <Button type="submit" isLoading={isLoading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
