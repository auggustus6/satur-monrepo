import {
  ArrowLeft,
  Edit
} from 'lucide-react';
import { Button } from '@satur/ui';
import { DeleteUserDialog } from '../dialogs/DeleteUserDialog';
import { ApproveUserDialog } from '../dialogs/ApproveUserDialog';
import type { User } from '../../types/api';

interface UserDetailsHeaderProps {
  user: User;
  isEditing: boolean;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onApprovalToggle: (id: number, isApproved: boolean) => void;
  isDeleting?: boolean;
  isTogglingApproval?: boolean;
}

export function UserDetailsHeader({
  user,
  isEditing,
  onBack,
  onEdit,
  onDelete,
  onApprovalToggle,
  isDeleting = false,
  isTogglingApproval = false,
}: UserDetailsHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Detalhes do Usuário</h1>
      </div>

      <div className="flex items-center gap-2">
        {user.role === 'SUPPLIER' && (
          <ApproveUserDialog
            user={user}
            onConfirm={onApprovalToggle}
            isApproving={isTogglingApproval}
            variant="button"
          />
        )}

        <Button
          onClick={onEdit}
          className="bg-blue-700 hover:bg-blue-800 text-white"
        >
          <Edit className="w-4 h-4 mr-2" />
          {isEditing ? 'Cancelar' : 'Editar'}
        </Button>

        <DeleteUserDialog
          user={user}
          onConfirm={onDelete}
          isDeleting={isDeleting}
        />
      </div>
    </div>
  );
}
