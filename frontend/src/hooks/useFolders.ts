import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api, { handleApiError } from '@/lib/api';
import type { Folder } from '@/types';

export function useFolders() {
  return useQuery({
    queryKey: ['folders'],
    queryFn: async () => {
      const response = await api.get<Folder[]>('/folders');
      return response.data;
    },
  });
}

export function useFolderTree() {
  return useQuery({
    queryKey: ['folders', 'tree'],
    queryFn: async () => {
      const response = await api.get<Folder[]>('/folders/tree');
      return response.data;
    },
  });
}

export function useCreateFolder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { name: string; description?: string; parent_id?: number }) => {
      const response = await api.post<Folder>('/folders', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      toast.success('Folder created!');
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });
}

export function useUpdateFolder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: { name?: string; description?: string; parent_id?: number } }) => {
      const response = await api.put<Folder>(`/folders/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      toast.success('Folder updated!');
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });
}

export function useDeleteFolder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/folders/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      toast.success('Folder deleted');
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });
}
