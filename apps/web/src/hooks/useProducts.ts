import { useQuery } from '@tanstack/react-query';
import { productsApi } from '../services/api';

export function useProducts(
  page: number = 1,
  limit: number = 20,
  search?: string,
  serviceId?: number,
  isActive?: boolean,
  locationId?: number
) {
  return useQuery({
    queryKey: [
      'products',
      page,
      limit,
      search,
      serviceId,
      isActive,
      locationId,
    ],
    queryFn: () =>
      productsApi.getAll(page, limit, search, serviceId, isActive, locationId),
  });
}

export function useProduct(id: number) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.getById(id),
    enabled: !!id,
  });
}

export function useProductsByService(serviceId: number) {
  return useQuery({
    queryKey: ['products', 'service', serviceId],
    queryFn: () => productsApi.getByService(serviceId),
    enabled: !!serviceId,
  });
}

export function useProductStats(id: number) {
  return useQuery({
    queryKey: ['product', 'stats', id],
    queryFn: () => productsApi.getStats(id),
    enabled: !!id,
  });
}
