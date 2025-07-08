
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { productsApi } from '../../services/api';
import type { Product } from '../../types/api';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@satur/ui';
import { formatToBRL } from 'brazilian-values';

interface DeleteProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onDeleteSuccess?: () => void;
}

export function DeleteProductModal({ open, onOpenChange, product, onDeleteSuccess }: DeleteProductModalProps) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (productId: number) => productsApi.delete(productId),
    onSuccess: () => {
      toast.success('Produto excluído com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      onOpenChange(false);
      if (onDeleteSuccess) {
        onDeleteSuccess();
      }
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Erro ao excluir produto. Tente novamente.';
      toast.error(errorMessage);
    },
  });

  const handleDelete = () => {
    if (product) {
      deleteMutation.mutate(product.id);
    }
  };

  if (!product) return null;

  const formatPrice = (price: number, currency: string) => {
    if (currency === 'BRL') {
      return formatToBRL(price / 100);
    }
    return `${currency} ${(price / 100).toFixed(2)}`;
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Tem certeza que deseja excluir o produto <strong>"{product.name}"</strong>?
            </p>
            <div className="bg-gray-50 p-3 rounded-lg space-y-1 text-sm">
              <p><strong>Preço:</strong> {formatPrice(product.price, product.currency)}</p>
              {product.service && (
                <p><strong>Serviço:</strong> {product.service.name}</p>
              )}
              {product.description && (
                <p><strong>Descrição:</strong> {product.description}</p>
              )}
            </div>
            <p className="text-red-600 font-medium">
              Esta ação não pode ser desfeita. O produto será removido permanentemente do sistema.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {deleteMutation.isPending ? 'Excluindo...' : 'Excluir Produto'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
