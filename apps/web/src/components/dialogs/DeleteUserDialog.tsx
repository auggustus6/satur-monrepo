import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@satur/ui';
import { Button } from '@satur/ui';
import { Trash2 } from 'lucide-react';
import type { User } from '../../types/api';

interface DeleteUserDialogProps {
  user: User;
  onConfirm: () => void;
  isDeleting?: boolean;
  variant?: 'default' | 'icon-only';
}

export function DeleteUserDialog({ user, onConfirm, isDeleting = false, variant = 'default' }: DeleteUserDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {variant === 'icon-only' ? (
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
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir o usuário <strong>{user.name}</strong>?
            <br />
            <span className="text-sm text-gray-500 mt-2 block">
              Esta ação não pode ser desfeita. Todos os dados relacionados a este usuário serão permanentemente removidos.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? 'Excluindo...' : 'Sim, excluir'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
