import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { locationsApi } from '../services/api';
import type { CreateLocationDto, UpdateLocationDto } from '../types/api';

export function useLocations() {
  return useQuery({
    queryKey: ['locations'],
    queryFn: locationsApi.getAll,
  });
}

export function useLocation(id: number) {
  return useQuery({
    queryKey: ['locations', id],
    queryFn: () => locationsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateLocation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateLocationDto) => locationsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
    },
  });
}

export function useUpdateLocation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateLocationDto }) => 
      locationsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      queryClient.invalidateQueries({ queryKey: ['locations', id] });
    },
  });
}

export function useDeleteLocation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => locationsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
    },
  });
}
