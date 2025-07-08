import { Modal, Button } from '@satur/ui';
import { AlertTriangle } from 'lucide-react';
import type { Location } from '../../types/api';

interface DeleteLocationModalProps {
  location: Location;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function DeleteLocationModal({
  location,
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: DeleteLocationModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirmar Exclusão" size="sm">
      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-red-600">
          <AlertTriangle className="h-6 w-6" />
          <span className="font-medium">Atenção!</span>
        </div>

        <div className="text-gray-700">
          <p>
            Tem certeza que deseja excluir a localização{' '}
            <strong>{location.city} - {location.state}</strong>?
          </p>
          <p className="mt-2 text-sm text-gray-600">
            Esta ação não pode ser desfeita e pode afetar usuários e serviços
            associados a esta localização.
          </p>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isLoading ? 'Excluindo...' : 'Excluir Localização'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
