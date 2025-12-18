export interface User {
  id: number;
  email: string;
  username: string;
  role: 'admin' | 'user';
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

export interface Ingredient {
  id: number;
  name: string;
  quantity: number | null;
  unit: string | null;
  notes: string | null;
}

export interface Instruction {
  id: number;
  step_number: number;
  content: string;
  timer_minutes: number | null;
}

export interface Tag {
  id: number;
  name: string;
}

export interface Recipe {
  id: number;
  title: string;
  description: string | null;
  image_url: string | null;
  prep_time: number | null;
  cook_time: number | null;
  servings: number | null;
  difficulty: 'easy' | 'medium' | 'hard' | null;
  created_at: string;
  updated_at: string | null;
  ingredients: Ingredient[];
  instructions: Instruction[];
  tags: Tag[];
  folders?: Folder[];
  is_favorite: boolean;
}

export interface RecipeListItem {
  id: number;
  title: string;
  description: string | null;
  image_url: string | null;
  prep_time: number | null;
  cook_time: number | null;
  difficulty: 'easy' | 'medium' | 'hard' | null;
  created_at: string;
  is_favorite: boolean;
}

export interface Folder {
  id: number;
  name: string;
  description: string | null;
  parent_id: number | null;
  created_at: string;
  recipe_count: number;
  children?: Folder[];
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface RecipeCreateInput {
  title: string;
  description?: string;
  prep_time?: number;
  cook_time?: number;
  servings?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  ingredients: IngredientInput[];
  instructions: InstructionInput[];
  tags: string[];
  folder_ids: number[];
}

export interface IngredientInput {
  name: string;
  quantity?: number;
  unit?: string;
  notes?: string;
}

export interface InstructionInput {
  step_number: number;
  content: string;
  timer_minutes?: number;
}

export interface RecipeFilters {
  search?: string;
  folder_id?: number;
  tag?: string;
  difficulty?: string;
  favorites_only?: boolean;
  page?: number;
  per_page?: number;
}
