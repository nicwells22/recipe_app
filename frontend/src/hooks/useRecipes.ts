import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api, { handleApiError } from '@/lib/api';
import type { Recipe, RecipeListItem, RecipeCreateInput, RecipeFilters, PaginatedResponse } from '@/types';

export function useRecipes(filters: RecipeFilters = {}) {
  return useQuery({
    queryKey: ['recipes', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.folder_id) params.append('folder_id', String(filters.folder_id));
      if (filters.tag) params.append('tag', filters.tag);
      if (filters.difficulty) params.append('difficulty', filters.difficulty);
      if (filters.favorites_only) params.append('favorites_only', 'true');
      if (filters.page) params.append('page', String(filters.page));
      if (filters.per_page) params.append('per_page', String(filters.per_page));
      
      const response = await api.get<PaginatedResponse<RecipeListItem>>(`/recipes?${params}`);
      return response.data;
    },
  });
}

export function useRecentRecipes(limit = 6) {
  return useQuery({
    queryKey: ['recipes', 'recent', limit],
    queryFn: async () => {
      const response = await api.get<RecipeListItem[]>(`/recipes/recent?limit=${limit}`);
      return response.data;
    },
  });
}

export function useRecipe(id: number | undefined) {
  return useQuery({
    queryKey: ['recipe', id],
    queryFn: async () => {
      const response = await api.get<Recipe>(`/recipes/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateRecipe() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: RecipeCreateInput) => {
      const response = await api.post<Recipe>('/recipes', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      toast.success('Recipe created!');
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });
}

export function useUpdateRecipe() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<RecipeCreateInput> }) => {
      const response = await api.put<Recipe>(`/recipes/${id}`, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      queryClient.invalidateQueries({ queryKey: ['recipe', data.id] });
      toast.success('Recipe updated!');
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });
}

export function useDeleteRecipe() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/recipes/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      toast.success('Recipe deleted');
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.post<{ message: string }>(`/recipes/${id}/favorite`);
      return { id, message: response.data.message };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      queryClient.invalidateQueries({ queryKey: ['recipe', data.id] });
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });
}

export function useUploadRecipeImage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, file }: { id: number; file: File }) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post<Recipe>(`/recipes/${id}/image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      queryClient.invalidateQueries({ queryKey: ['recipe', data.id] });
      toast.success('Image uploaded!');
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });
}

export function useTags() {
  return useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const response = await api.get<string[]>('/recipes/tags/all');
      return response.data;
    },
  });
}

export function useAddToFolder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ recipeId, folderId }: { recipeId: number; folderId: number }) => {
      const response = await api.post<{ message: string }>(`/recipes/${recipeId}/folders/${folderId}`);
      return { recipeId, message: response.data.message };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      queryClient.invalidateQueries({ queryKey: ['recipe', data.recipeId] });
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });
}

export function useRemoveFromFolder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ recipeId, folderId }: { recipeId: number; folderId: number }) => {
      const response = await api.delete<{ message: string }>(`/recipes/${recipeId}/folders/${folderId}`);
      return { recipeId, message: response.data.message };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      queryClient.invalidateQueries({ queryKey: ['recipe', data.recipeId] });
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });
}
