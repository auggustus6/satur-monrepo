import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { servicesApi } from '../services/api';
import type { CreateServiceDto, UpdateServiceDto } from '../types/api';

export function useServices(
  page: number = 1,
  limit: number = 20,
  search?: string,
  locationId?: number
) {
  return useQuery({
    queryKey: ['services', page, limit, search, locationId],
    queryFn: () => servicesApi.getAll(page, limit, search, locationId),
  });
}

export function useServicesLegacy() {
  return useQuery({
    queryKey: ['services', 'all'],
    queryFn: servicesApi.getAllLegacy,
  });
}

export function useService(id: number) {
  return useQuery({
    queryKey: ['services', id],
    queryFn: () => servicesApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateServiceDto) => servicesApi.create(data),
    onSuccess: () => {
      toast.success('Serviço criado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
    onError: (error) => {
      // Error handling is done in components using useErrorHandler
      console.error('Error creating service:', error);
    },
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateServiceDto }) =>
      servicesApi.update(id, data),
    onSuccess: (_, { id }) => {
      toast.success('Serviço atualizado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: ['services', id] });
    },
    onError: (error) => {
      // Error handling is done in components using useErrorHandler
      console.error('Error updating service:', error);
    },
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => servicesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
}

export function usePopularServices() {
  return useQuery({
    queryKey: ['services', 'popular'],
    queryFn: () => servicesApi.getPopular(),
  });
}
