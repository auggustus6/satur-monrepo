import { ConfirmationDialog } from './ConfirmationDialog';
import { Button } from '@satur/ui';
import { Eye, Trash2 } from 'lucide-react';
import type { Service } from '../../types/api';

interface DeleteServiceDialogProps {
  service: Service;
  onConfirm: () => void;
  isDeleting?: boolean;
  variant?: 'default' | 'icon-only';
}

export function DeleteServiceDialog({
  service,
  onConfirm,
  isDeleting = false,
  variant = 'default'
}: DeleteServiceDialogProps) {
  const trigger = variant === 'icon-only' ? (
    <Button
      size="sm"
      variant="outline"
      disabled={isDeleting}
      className="text-blue-600 hover:text-blue-700"
    >
      <Eye className="h-4 w-4" />
    </Button>
  ) : (
    <Button
      variant="outline"
      disabled={isDeleting}
      className="text-blue-600 hover:text-blue-700 border-blue-300 hover:border-blue-400"
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
          Tem certeza que deseja excluir o serviço <strong>{service.name}</strong>?
          <br />
          <span className="text-sm text-gray-500 mt-2 block">
            Esta ação não pode ser desfeita. Todos os dados relacionados a este serviço serão permanentemente removidos.
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
