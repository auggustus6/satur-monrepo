import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { paymentsApi } from '../services/api';
import type {
  CreatePaymentDto,
  UpdatePaymentDto,
  MarkPaidDto,
} from '../services/api';

export function usePayments(
  page: number = 1,
  limit: number = 20,
  filters?: {
    status?: string;
    agencyId?: number;
    supplierId?: number;
    dateFrom?: string;
    dateTo?: string;
  }
) {
  return useQuery({
    queryKey: ['payments', page, limit, filters],
    queryFn: () => paymentsApi.getAll(page, limit, filters),
  });
}

export function usePayment(id: number) {
  return useQuery({
    queryKey: ['payments', id],
    queryFn: () => paymentsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePaymentDto) => paymentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast.success('Pagamento criado com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao criar pagamento');
    },
  });
}

export function useUpdatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePaymentDto }) =>
      paymentsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast.success('Pagamento atualizado com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao atualizar pagamento');
    },
  });
}

export function useMarkPaymentAsPaid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: MarkPaidDto }) =>
      paymentsApi.markAsPaid(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast.success('Pagamento marcado como pago!');
    },
    onError: () => {
      toast.error('Erro ao marcar pagamento como pago');
    },
  });
}

export function useDeletePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => paymentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast.success('Pagamento excluído com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao excluir pagamento');
    },
  });
}

export function useSearchUsers(
  search?: string,
  limit?: number,
  ignoreUserType?: string
) {
  return useQuery({
    queryKey: ['payments', 'search-users', search, limit, ignoreUserType],
    queryFn: () => paymentsApi.searchUsers(search, limit, ignoreUserType),
    enabled: !!search,
  });
}
