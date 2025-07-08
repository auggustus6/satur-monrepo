import { ConfirmationDialog } from './ConfirmationDialog';
import { Button } from '@satur/ui';
import { Trash2 } from 'lucide-react';
import type { Payment } from '../../types/api';

interface DeletePaymentDialogProps {
  payment: Payment;
  onConfirm: () => void;
  isDeleting?: boolean;
  variant?: 'default' | 'icon-only';
}

export function DeletePaymentDialog({
  payment,
  onConfirm,
  isDeleting = false,
  variant = 'default'
}: DeletePaymentDialogProps) {
  const trigger = variant === 'icon-only' ? (
    <Button
      size="sm"
      variant="outline"
      disabled={isDeleting}
      className="text-red-600 hover:text-red-700"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  ) : (
    <Button
      variant="outline"
      disabled={isDeleting}
      className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
    >
      <Trash2 className="w-4 h-4 mr-2" />
      Deletar
    </Button>
  );

  return (
    <ConfirmationDialog
      title="Confirmar Exclusão"
      description={
        <>
          Tem certeza que deseja excluir o pagamento <strong>#{payment.id}</strong>?
          <br />
          <span className="text-sm text-gray-500 mt-2 block">
            <strong>Descrição:</strong> {payment.description}
          </span>
          <span className="text-sm text-gray-500 block">
            Esta ação não pode ser desfeita.
          </span>
        </>
      }
      confirmText={isDeleting ? 'Excluindo...' : 'Sim, excluir'}
      cancelText="Cancelar"
      onConfirm={onConfirm}
      isLoading={isDeleting}
      variant="destructive"
      trigger={trigger}
    />
  );
}
