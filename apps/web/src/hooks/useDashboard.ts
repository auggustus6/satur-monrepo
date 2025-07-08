import { useQuery } from '@tanstack/react-query';
import { adminApi, usersApi, servicesApi } from '../services/api';
import type {
  DashboardStats,
  FinancialReport,
  TopService,
  TopSupplier,
  ReportsFilters,
} from '../types/api';

// Hook para estatísticas do dashboard (apenas para admins)
export function useDashboardStats(enabled: boolean = true) {
  return useQuery<DashboardStats>({
    queryKey: ['dashboard', 'stats'],
    queryFn: adminApi.getDashboardStats,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutos
    enabled,
  });
}

// Hook para top serviços
export function useTopServices(limit?: number) {
  return useQuery<TopService[]>({
    queryKey: ['dashboard', 'top-services', limit],
    queryFn: () => adminApi.getTopServices(limit),
  });
}

// Hook para top fornecedores
export function useTopSuppliers(limit?: number) {
  return useQuery<TopSupplier[]>({
    queryKey: ['dashboard', 'top-suppliers', limit],
    queryFn: () => adminApi.getTopSuppliers(limit),
  });
}

// Hook para contagem de usuários por role (para agências e fornecedores)
export function useUsersByRole(role: string) {
  return useQuery({
    queryKey: ['users', 'by-role', role],
    queryFn: () => usersApi.getUsersByRole(role),
    enabled: !!role,
  });
}

// Hook para contagem total de serviços
export function useServicesCount() {
  return useQuery({
    queryKey: ['services', 'count'],
    queryFn: async () => {
      const response = await servicesApi.getAllLegacy();
      return response.length;
    },
  });
}

// Hook para contagem total de usuários (apenas para admins)
export function useUsersCount(enabled: boolean = true) {
  return useQuery({
    queryKey: ['users', 'count'],
    queryFn: async () => {
      const response = await usersApi.getAll();
      return response.total;
    },
    enabled,
  });
}

// Hook para relatórios financeiros
export function useFinancialReport(filters?: ReportsFilters) {
  return useQuery<FinancialReport>({
    queryKey: ['reports', 'financial', filters],
    queryFn: () => adminApi.getFinancialReports(filters),
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}
